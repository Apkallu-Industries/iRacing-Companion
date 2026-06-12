mod ac_reader;
use serde_json::Value;

#[tauri::command]
fn get_runtime_manifest() -> Value {
    serde_json::json!({
        "hostname": "workstation",
        "platform": "windows",
        "cpuModel": "Unknown CPU",
        "totalMemoryGb": 16,
        "bridgeStatus": "running",
        "dbStatus": "connected"
    })
}

#[tauri::command]
fn get_monitor_layout() -> Value {
    serde_json::json!([])
}

#[tauri::command]
fn open_instrument_window(app: tauri::AppHandle, r#type: String, url: String) -> Result<(), String> {
    println!("[Tauri] Opening instrument window: {} at {}", r#type, url);
    let label = format!("instrument_{}", r#type);
    
    let target_url = if url.starts_with("http") {
        let parsed_url: tauri::Url = url.parse().map_err(|e| format!("{:?}", e))?;
        tauri::WebviewUrl::External(parsed_url)
    } else {
        tauri::WebviewUrl::App(url.into())
    };

    tauri::WebviewWindowBuilder::new(&app, &label, target_url)
        .title(format!("Pit Wall Instrument - {}", r#type))
        .inner_size(600.0, 400.0)
        .build()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_bridge_status() -> String {
    "running".to_string()
}

#[tauri::command]
fn restart_bridge() {
    println!("[Tauri] Restarting bridge...");
}

#[tauri::command]
fn ensure_mongodb() {
    println!("[Tauri] Ensuring MongoDB is running...");
}

#[tauri::command]
fn refresh_ai_mode() -> String {
    "cloud".to_string()
}

#[tauri::command]
fn get_app_info() -> Value {
    serde_json::json!({
        "version": "1.2.23-tauri-alpha",
        "isDev": true,
        "platform": "windows",
        "dashboardUrl": "http://localhost:8080"
    })
}

#[tauri::command]
fn supervisor_get_status() -> Value {
    serde_json::json!({ "status": "active" })
}

#[tauri::command]
fn supervisor_get_active_session() -> Value {
    Value::Null
}

#[tauri::command]
fn supervisor_get_sessions() -> Value {
    serde_json::json!([])
}

#[tauri::command]
#[allow(non_snake_case)]
fn supervisor_start_session(sessionId: String, _meta: Value) -> Value {
    serde_json::json!({ "ok": true, "sessionId": sessionId })
}

#[tauri::command]
#[allow(non_snake_case)]
fn supervisor_stop_session(sessionId: String) -> Value {
    serde_json::json!({ "ok": true, "sessionId": sessionId })
}

#[tauri::command]
fn supervisor_get_telemetry_schema() -> Value {
    serde_json::json!({})
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Start the native background Assetto Corsa memory mapping loop
      ac_reader::start_ac_reader_thread();

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      get_runtime_manifest,
      get_monitor_layout,
      open_instrument_window,
      get_bridge_status,
      restart_bridge,
      ensure_mongodb,
      refresh_ai_mode,
      get_app_info,
      supervisor_get_status,
      supervisor_get_active_session,
      supervisor_get_sessions,
      supervisor_start_session,
      supervisor_stop_session,
      supervisor_get_telemetry_schema
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
