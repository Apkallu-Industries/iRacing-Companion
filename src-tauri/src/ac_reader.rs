use std::ffi::c_void;
use std::net::TcpStream;
use std::io::Write;
use std::thread;
use std::time::Duration;
use serde_json::json;

// ─── Win32 API FFI Bindings ──────────────────────────────────────────────────

const FILE_MAP_READ: u32 = 4;

#[link(name = "kernel32")]
extern "system" {
    fn OpenFileMappingW(
        dwDesiredAccess: u32,
        bInheritHandle: i32,
        lpName: *const u16,
    ) -> *mut c_void;

    fn MapViewOfFile(
        hFileMappingObject: *mut c_void,
        dwDesiredAccess: u32,
        dwFileOffsetHigh: u32,
        dwFileOffsetLow: u32,
        dwNumberOfBytesToMap: usize,
    ) -> *mut c_void;

    fn UnmapViewOfFile(lpBaseAddress: *const c_void) -> i32;

    fn CloseHandle(hObject: *mut c_void) -> i32;
}

// ─── Helper function to convert to UTF-16 wide string ────────────────────────

fn to_wide_str(s: &str) -> Vec<u16> {
    use std::os::windows::ffi::OsStrExt;
    std::ffi::OsStr::new(s)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect()
}

fn utf16_to_string(arr: &[u16]) -> String {
    let len = arr.iter().position(|&c| c == 0).unwrap_or(arr.len());
    String::from_utf16_lossy(&arr[..len])
}

// ─── Shared Memory Struct Layouts ───────────────────────────────────────────

#[repr(C, align(4))]
#[derive(Clone, Copy, Debug)]
pub struct SPageFilePhysics {
    pub packet_id: i32,
    pub gas: f32,
    pub brake: f32,
    pub fuel: f32,
    pub gear: i32,
    pub rpms: i32,
    pub steer_angle: f32,
    pub speed_kmh: f32,
    pub velocity: [f32; 3],
    pub acc_g: [f32; 3],
    pub wheel_slip: [f32; 4],
    pub wheel_load: [f32; 4],
    pub wheels_pressure: [f32; 4],
    pub wheel_angular_speed: [f32; 4],
    pub tyre_wear: [f32; 4],
    pub tyre_dirty_level: [f32; 4],
    pub tyre_core_temperature: [f32; 4],
    pub camber_rad: [f32; 4],
    pub suspension_travel: [f32; 4],
    pub drs: f32,
    pub tc: f32,
    pub heading: f32,
    pub pitch: f32,
    pub roll: f32,
    pub cg_height: f32,
    pub car_damage: [f32; 5],
    pub number_of_tyres_out: i32,
    pub pit_limiter_on: i32,
    pub abs: f32,
    pub kers_charge: f32,
    pub kers_input: f32,
    pub auto_shifter_on: i32,
    pub ride_height: [f32; 2],
    pub turbo_boost: f32,
    pub ballast: f32,
    pub air_density: f32,
}

#[repr(C, align(4))]
#[derive(Clone, Copy, Debug)]
pub struct SPageFileGraphics {
    pub packet_id: i32,
    pub status: i32,
    pub session: i32,
    pub current_time: [u16; 15],
    pub last_time: [u16; 15],
    pub best_time: [u16; 15],
    pub split: [u16; 15],
    pub completed_laps: i32,
    pub position: i32,
    pub i_current_time: i32,
    pub i_last_time: i32,
    pub i_best_time: i32,
    pub session_time_left: f32,
    pub distance_traveled: f32,
    pub is_in_pit: i32,
    pub current_sector_index: i32,
    pub last_sector_time: i32,
    pub number_of_laps: i32,
    pub tyre_compound: [u16; 33],
    pub replay_time_multiplier: f32,
    pub normalized_car_position: f32,
    pub car_coordinates: [f32; 3],
    pub penalty_time: f32,
    pub flag: i32,
    pub ideal_line_on: i32,
    pub is_in_pit_lane: i32,
    pub surface_grip: f32,
}

#[repr(C, align(4))]
#[derive(Clone, Copy, Debug)]
pub struct SPageFileStatic {
    pub sm_version: [u16; 15],
    pub ac_version: [u16; 15],
    pub number_of_sessions: i32,
    pub num_cars: i32,
    pub car_model: [u16; 33],
    pub track: [u16; 33],
    pub player_name: [u16; 33],
    pub player_surname: [u16; 33],
    pub player_nick: [u16; 33],
    pub sector_count: i32,
    pub max_torque: f32,
    pub max_power: f32,
    pub max_rpm: i32,
    pub max_fuel: f32,
    pub suspension_max_travel: [f32; 4],
    pub tyre_radius: [f32; 4],
    pub max_turbo_boost: f32,
    pub air_temp: f32,
    pub road_temp: f32,
    pub penalties_enabled: u8,
    pub aid_fuel_rate: f32,
    pub aid_tire_rate: f32,
    pub aid_mechanical_damage: f32,
    pub aid_allow_tyre_blankets: u8,
    pub aid_stability: f32,
    pub aid_auto_clutch: u8,
    pub aid_auto_blip: u8,
}

// ─── RAII Wrapper for Windows Shared Memory ──────────────────────────────────

struct SharedMemoryView {
    handle: *mut c_void,
    view: *mut c_void,
}

impl SharedMemoryView {
    fn open(name: &str, size: usize) -> Option<Self> {
        unsafe {
            let name_wide = to_wide_str(name);
            let handle = OpenFileMappingW(FILE_MAP_READ, 0, name_wide.as_ptr());
            if handle.is_null() {
                return None;
            }
            let view = MapViewOfFile(handle, FILE_MAP_READ, 0, 0, size);
            if view.is_null() {
                CloseHandle(handle);
                return None;
            }
            Some(SharedMemoryView { handle, view })
        }
    }
}

impl Drop for SharedMemoryView {
    fn drop(&mut self) {
        unsafe {
            if !self.view.is_null() {
                UnmapViewOfFile(self.view);
            }
            if !self.handle.is_null() {
                CloseHandle(self.handle);
            }
        }
    }
}

// ─── Telemetry Streaming Background Thread Loop ─────────────────────────────

pub fn start_ac_reader_thread() {
    thread::spawn(|| {
        println!("[Tauri Rust] Assetto Corsa native reader thread started.");
        
        loop {
            // 1. Try to open shared memory files
            let physics_view = SharedMemoryView::open("Local\\acpmf_physics", std::mem::size_of::<SPageFilePhysics>());
            let graphics_view = SharedMemoryView::open("Local\\acpmf_graphics", std::mem::size_of::<SPageFileGraphics>());
            let static_view = SharedMemoryView::open("Local\\acpmf_static", std::mem::size_of::<SPageFileStatic>());

            if physics_view.is_none() || graphics_view.is_none() || static_view.is_none() {
                // Assetto Corsa is not running yet
                thread::sleep(Duration::from_secs(1));
                continue;
            }

            println!("[Tauri Rust] Assetto Corsa shared memory detected. Connecting to bridge TCP port 4712...");

            // 2. Connect to local Node bridge TCP socket
            let mut stream = match TcpStream::connect("127.0.0.1:4712") {
                Ok(s) => s,
                Err(_) => {
                    // Node bridge is offline or not listening yet
                    thread::sleep(Duration::from_secs(1));
                    continue;
                }
            };

            println!("[Tauri Rust] Connected to bridge TCP port 4712. Starting telemetry stream.");

            let physics_view = physics_view.unwrap();
            let graphics_view = graphics_view.unwrap();
            let static_view = static_view.unwrap();

            // 3. Telemetry Stream Loop
            loop {
                // Safe volatile copying from memory mapped pages
                let physics: SPageFilePhysics = unsafe { std::ptr::read_volatile(physics_view.view as *const SPageFilePhysics) };
                let graphics: SPageFileGraphics = unsafe { std::ptr::read_volatile(graphics_view.view as *const SPageFileGraphics) };
                let static_data: SPageFileStatic = unsafe { std::ptr::read_volatile(static_view.view as *const SPageFileStatic) };

                // Build exactly identical JSON schema expected by local-bridge/server.js
                let json_payload = json!({
                    "connected": true,
                    "physics": {
                        "packetId": physics.packet_id,
                        "gas": physics.gas,
                        "brake": physics.brake,
                        "fuel": physics.fuel,
                        "gear": physics.gear,
                        "rpms": physics.rpms,
                        "steerAngle": physics.steer_angle,
                        "speedKmh": physics.speed_kmh,
                        "velocity": physics.velocity,
                        "accG": physics.acc_g,
                        "wheelSlip": physics.wheel_slip,
                        "wheelLoad": physics.wheel_load,
                        "wheelsPressure": physics.wheels_pressure,
                        "wheelAngularSpeed": physics.wheel_angular_speed,
                        "tyreWear": physics.tyre_wear,
                        "tyreCoreTemperature": physics.tyre_core_temperature,
                        "suspensionTravel": physics.suspension_travel,
                        "drs": physics.drs,
                        "tc": physics.tc,
                        "heading": physics.heading,
                        "pitch": physics.pitch,
                        "roll": physics.roll,
                        "cgHeight": physics.cg_height,
                        "carDamage": physics.car_damage,
                        "pitLimiterOn": physics.pit_limiter_on,
                        "abs": physics.abs,
                        "kersCharge": physics.kers_charge,
                        "kersInput": physics.kers_input,
                        "autoShifterOn": physics.auto_shifter_on,
                        "rideHeight": physics.ride_height,
                        "turboBoost": physics.turbo_boost,
                        "airDensity": physics.air_density,
                    },
                    "graphics": {
                        "packetId": graphics.packet_id,
                        "status": graphics.status,
                        "session": graphics.session,
                        "currentTime": utf16_to_string(&graphics.current_time),
                        "lastTime": utf16_to_string(&graphics.last_time),
                        "bestTime": utf16_to_string(&graphics.best_time),
                        "split": utf16_to_string(&graphics.split),
                        "completedLaps": graphics.completed_laps,
                        "position": graphics.position,
                        "iCurrentTime": graphics.i_current_time,
                        "iLastTime": graphics.i_last_time,
                        "iBestTime": graphics.i_best_time,
                        "sessionTimeLeft": graphics.session_time_left,
                        "distanceTraveled": graphics.distance_traveled,
                        "isInPit": graphics.is_in_pit,
                        "currentSectorIndex": graphics.current_sector_index,
                        "lastSectorTime": graphics.last_sector_time,
                        "numberOfLaps": graphics.number_of_laps,
                        "tyreCompound": utf16_to_string(&graphics.tyre_compound),
                        "replayTimeMultiplier": graphics.replay_time_multiplier,
                        "normalizedCarPosition": graphics.normalized_car_position,
                        "carCoordinates": graphics.car_coordinates,
                        "penaltyTime": graphics.penalty_time,
                        "flag": graphics.flag,
                        "idealLineOn": graphics.ideal_line_on,
                        "isInPitLane": graphics.is_in_pit_lane,
                        "surfaceGrip": graphics.surface_grip,
                    },
                    "static": {
                        "carModel": utf16_to_string(&static_data.car_model),
                        "track": utf16_to_string(&static_data.track),
                        "playerName": format!(
                            "{} {}",
                            utf16_to_string(&static_data.player_name),
                            utf16_to_string(&static_data.player_surname)
                        ).trim().to_string(),
                        "sectorCount": static_data.sector_count,
                        "maxRpm": static_data.max_rpm,
                        "maxFuel": static_data.max_fuel,
                    }
                });

                let mut json_str = match serde_json::to_string(&json_payload) {
                    Ok(s) => s,
                    Err(_) => break,
                };
                json_str.push('\n');

                if let Err(_) = stream.write_all(json_str.as_bytes()) {
                    // TCP stream closed or broken
                    break;
                }

                thread::sleep(Duration::from_millis(16)); // ~60 Hz tick interval
            }

            println!("[Tauri Rust] Telemetry connection lost. Resetting structures and retrying...");
            thread::sleep(Duration::from_secs(1));
        }
    });
}
