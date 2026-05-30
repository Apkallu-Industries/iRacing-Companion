using System;
using System.IO;
using System.IO.MemoryMappedFiles;
using System.Runtime.InteropServices;
using System.Threading;
using System.Globalization;
using System.Text;

namespace AssettoCorsaReader
{
    [StructLayout(LayoutKind.Sequential, Pack = 4, CharSet = CharSet.Unicode)]
    public struct SPageFilePhysics
    {
        public int packetId;
        public float gas;
        public float brake;
        public float fuel;
        public int gear;
        public int rpms;
        public float steerAngle;
        public float speedKmh;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 3)]
        public float[] velocity;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 3)]
        public float[] accG;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] wheelSlip;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] wheelLoad;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] wheelsPressure;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] wheelAngularSpeed;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] tyreWear;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] tyreDirtyLevel;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] tyreCoreTemperature;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] camberRAD;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] suspensionTravel;
        public float drs;
        public float tc;
        public float heading;
        public float pitch;
        public float roll;
        public float cgHeight;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 5)]
        public float[] carDamage;
        public int numberOfTyresOut;
        public int pitLimiterOn;
        public float abs;
        public float kersCharge;
        public float kersInput;
        public int autoShifterOn;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 2)]
        public float[] rideHeight;
        public float turboBoost;
        public float ballast;
        public float airDensity;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 4, CharSet = CharSet.Unicode)]
    public struct SPageFileGraphics
    {
        public int packetId;
        public int status;
        public int session;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 15)]
        public string currentTime;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 15)]
        public string lastTime;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 15)]
        public string bestTime;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 15)]
        public string split;
        public int completedLaps;
        public int position;
        public int iCurrentTime;
        public int iLastTime;
        public int iBestTime;
        public float sessionTimeLeft;
        public float distanceTraveled;
        public int isInPit;
        public int currentSectorIndex;
        public int lastSectorTime;
        public int numberOfLaps;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 33)]
        public string tyreCompound;
        public float replayTimeMultiplier;
        public float normalizedCarPosition;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 3)]
        public float[] carCoordinates;
        public float penaltyTime;
        public int flag;
        public int idealLineOn;
        public int isInPitLane;
        public float surfaceGrip;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 4, CharSet = CharSet.Unicode)]
    public struct SPageFileStatic
    {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 15)]
        public string smVersion;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 15)]
        public string acVersion;
        public int numberOfSessions;
        public int numCars;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 33)]
        public string carModel;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 33)]
        public string track;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 33)]
        public string playerName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 33)]
        public string playerSurname;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 33)]
        public string playerNick;
        public int sectorCount;
        public float maxTorque;
        public float maxPower;
        public int maxRpm;
        public float maxFuel;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] suspensionMaxTravel;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public float[] tyreRadius;
        public float maxTurboBoost;
        public float airTemp;
        public float roadTemp;
        [MarshalAs(UnmanagedType.U1)]
        public bool penaltiesEnabled;
        public float aidFuelRate;
        public float aidTireRate;
        public float aidMechanicalDamage;
        [MarshalAs(UnmanagedType.U1)]
        public bool aidAllowTyreBlankets;
        public float aidStability;
        [MarshalAs(UnmanagedType.U1)]
        public bool aidAutoClutch;
        [MarshalAs(UnmanagedType.U1)]
        public bool aidAutoBlip;
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;

            int hz = 60;
            if (args.Length > 0)
            {
                int customHz;
                if (int.TryParse(args[0], out customHz))
                {
                    hz = customHz;
                }
            }
            int sleepMs = 1000 / hz;

            MemoryMappedFile mmfPhysics = null;
            MemoryMappedFile mmfGraphics = null;
            MemoryMappedFile mmfStatic = null;

            MemoryMappedViewAccessor accessorPhysics = null;
            MemoryMappedViewAccessor accessorGraphics = null;
            MemoryMappedViewAccessor accessorStatic = null;

            bool isConnected = false;

            while (true)
            {
                try
                {
                    if (!isConnected)
                    {
                        mmfPhysics = MemoryMappedFile.OpenExisting("Local\\acpmf_physics", MemoryMappedFileRights.Read);
                        mmfGraphics = MemoryMappedFile.OpenExisting("Local\\acpmf_graphics", MemoryMappedFileRights.Read);
                        mmfStatic = MemoryMappedFile.OpenExisting("Local\\acpmf_static", MemoryMappedFileRights.Read);

                        accessorPhysics = mmfPhysics.CreateViewAccessor(0, 0, MemoryMappedFileAccess.Read);
                        accessorGraphics = mmfGraphics.CreateViewAccessor(0, 0, MemoryMappedFileAccess.Read);
                        accessorStatic = mmfStatic.CreateViewAccessor(0, 0, MemoryMappedFileAccess.Read);

                        isConnected = true;
                        Console.Error.WriteLine("[ac-reader] Connected to Assetto Corsa shared memory.");
                    }

                    SPageFilePhysics physics = ReadStruct<SPageFilePhysics>(accessorPhysics);
                    SPageFileGraphics graphics = ReadStruct<SPageFileGraphics>(accessorGraphics);
                    SPageFileStatic staticData = ReadStruct<SPageFileStatic>(accessorStatic);

                    string json = BuildJson(physics, graphics, staticData);
                    Console.WriteLine(json);
                }
                catch (Exception ex)
                {
                    if (isConnected)
                    {
                        Console.Error.WriteLine("[ac-reader] Disconnected: " + ex.Message);
                        isConnected = false;
                    }

                    DisposeAccessors(ref accessorPhysics, ref accessorGraphics, ref accessorStatic);
                    DisposeFiles(ref mmfPhysics, ref mmfGraphics, ref mmfStatic);

                    Console.WriteLine("{\"connected\":false}");

                    Thread.Sleep(1000);
                    continue;
                }

                Thread.Sleep(sleepMs);
            }
        }

        static T ReadStruct<T>(MemoryMappedViewAccessor accessor) where T : struct
        {
            int size = Marshal.SizeOf(typeof(T));
            byte[] buffer = new byte[size];
            accessor.ReadArray(0, buffer, 0, buffer.Length);
            GCHandle handle = GCHandle.Alloc(buffer, GCHandleType.Pinned);
            try
            {
                return (T)Marshal.PtrToStructure(handle.AddrOfPinnedObject(), typeof(T));
            }
            finally
            {
                handle.Free();
            }
        }

        static void DisposeAccessors(ref MemoryMappedViewAccessor a, ref MemoryMappedViewAccessor b, ref MemoryMappedViewAccessor c)
        {
            if (a != null) { try { a.Dispose(); } catch {} a = null; }
            if (b != null) { try { b.Dispose(); } catch {} b = null; }
            if (c != null) { try { c.Dispose(); } catch {} c = null; }
        }

        static void DisposeFiles(ref MemoryMappedFile a, ref MemoryMappedFile b, ref MemoryMappedFile c)
        {
            if (a != null) { try { a.Dispose(); } catch {} a = null; }
            if (b != null) { try { b.Dispose(); } catch {} b = null; }
            if (c != null) { try { c.Dispose(); } catch {} c = null; }
        }

        static string BuildJson(SPageFilePhysics p, SPageFileGraphics g, SPageFileStatic s)
        {
            var inv = CultureInfo.InvariantCulture;

            float vel0 = p.velocity != null && p.velocity.Length > 0 ? p.velocity[0] : 0f;
            float vel1 = p.velocity != null && p.velocity.Length > 1 ? p.velocity[1] : 0f;
            float vel2 = p.velocity != null && p.velocity.Length > 2 ? p.velocity[2] : 0f;

            float acc0 = p.accG != null && p.accG.Length > 0 ? p.accG[0] : 0f;
            float acc1 = p.accG != null && p.accG.Length > 1 ? p.accG[1] : 0f;
            float acc2 = p.accG != null && p.accG.Length > 2 ? p.accG[2] : 0f;

            float slip0 = p.wheelSlip != null && p.wheelSlip.Length > 0 ? p.wheelSlip[0] : 0f;
            float slip1 = p.wheelSlip != null && p.wheelSlip.Length > 1 ? p.wheelSlip[1] : 0f;
            float slip2 = p.wheelSlip != null && p.wheelSlip.Length > 2 ? p.wheelSlip[2] : 0f;
            float slip3 = p.wheelSlip != null && p.wheelSlip.Length > 3 ? p.wheelSlip[3] : 0f;

            float load0 = p.wheelLoad != null && p.wheelLoad.Length > 0 ? p.wheelLoad[0] : 0f;
            float load1 = p.wheelLoad != null && p.wheelLoad.Length > 1 ? p.wheelLoad[1] : 0f;
            float load2 = p.wheelLoad != null && p.wheelLoad.Length > 2 ? p.wheelLoad[2] : 0f;
            float load3 = p.wheelLoad != null && p.wheelLoad.Length > 3 ? p.wheelLoad[3] : 0f;

            float pres0 = p.wheelsPressure != null && p.wheelsPressure.Length > 0 ? p.wheelsPressure[0] : 0f;
            float pres1 = p.wheelsPressure != null && p.wheelsPressure.Length > 1 ? p.wheelsPressure[1] : 0f;
            float pres2 = p.wheelsPressure != null && p.wheelsPressure.Length > 2 ? p.wheelsPressure[2] : 0f;
            float pres3 = p.wheelsPressure != null && p.wheelsPressure.Length > 3 ? p.wheelsPressure[3] : 0f;

            float wear0 = p.tyreWear != null && p.tyreWear.Length > 0 ? p.tyreWear[0] : 0f;
            float wear1 = p.tyreWear != null && p.tyreWear.Length > 1 ? p.tyreWear[1] : 0f;
            float wear2 = p.tyreWear != null && p.tyreWear.Length > 2 ? p.tyreWear[2] : 0f;
            float wear3 = p.tyreWear != null && p.tyreWear.Length > 3 ? p.tyreWear[3] : 0f;

            float temp0 = p.tyreCoreTemperature != null && p.tyreCoreTemperature.Length > 0 ? p.tyreCoreTemperature[0] : 0f;
            float temp1 = p.tyreCoreTemperature != null && p.tyreCoreTemperature.Length > 1 ? p.tyreCoreTemperature[1] : 0f;
            float temp2 = p.tyreCoreTemperature != null && p.tyreCoreTemperature.Length > 2 ? p.tyreCoreTemperature[2] : 0f;
            float temp3 = p.tyreCoreTemperature != null && p.tyreCoreTemperature.Length > 3 ? p.tyreCoreTemperature[3] : 0f;

            float susp0 = p.suspensionTravel != null && p.suspensionTravel.Length > 0 ? p.suspensionTravel[0] : 0f;
            float susp1 = p.suspensionTravel != null && p.suspensionTravel.Length > 1 ? p.suspensionTravel[1] : 0f;
            float susp2 = p.suspensionTravel != null && p.suspensionTravel.Length > 2 ? p.suspensionTravel[2] : 0f;
            float susp3 = p.suspensionTravel != null && p.suspensionTravel.Length > 3 ? p.suspensionTravel[3] : 0f;

            float coord0 = g.carCoordinates != null && g.carCoordinates.Length > 0 ? g.carCoordinates[0] : 0f;
            float coord1 = g.carCoordinates != null && g.carCoordinates.Length > 1 ? g.carCoordinates[1] : 0f;
            float coord2 = g.carCoordinates != null && g.carCoordinates.Length > 2 ? g.carCoordinates[2] : 0f;

            float dmg0 = p.carDamage != null && p.carDamage.Length > 0 ? p.carDamage[0] : 0f;
            float dmg1 = p.carDamage != null && p.carDamage.Length > 1 ? p.carDamage[1] : 0f;
            float dmg2 = p.carDamage != null && p.carDamage.Length > 2 ? p.carDamage[2] : 0f;
            float dmg3 = p.carDamage != null && p.carDamage.Length > 3 ? p.carDamage[3] : 0f;
            float dmg4 = p.carDamage != null && p.carDamage.Length > 4 ? p.carDamage[4] : 0f;

            float rh0 = p.rideHeight != null && p.rideHeight.Length > 0 ? p.rideHeight[0] : 0f;
            float rh1 = p.rideHeight != null && p.rideHeight.Length > 1 ? p.rideHeight[1] : 0f;

            string carModelClean = EscapeJsonString(s.carModel);
            string trackClean = EscapeJsonString(s.track);
            string playerNameClean = EscapeJsonString(s.playerName + " " + s.playerSurname).Trim();

            return string.Format(inv,
                "{{" +
                "\"connected\":true," +
                "\"physics\":{{" +
                  "\"packetId\":{0}," +
                  "\"gas\":{1}," +
                  "\"brake\":{2}," +
                  "\"fuel\":{3}," +
                  "\"gear\":{4}," +
                  "\"rpms\":{5}," +
                  "\"steerAngle\":{6}," +
                  "\"speedKmh\":{7}," +
                  "\"velocity\":[{8},{9},{10}]," +
                  "\"accG\":[{11},{12},{13}]," +
                  "\"wheelSlip\":[{14},{15},{16},{17}]," +
                  "\"wheelLoad\":[{18},{19},{20},{21}]," +
                  "\"wheelsPressure\":[{22},{23},{24},{25}]," +
                  "\"wheelAngularSpeed\":[{26},{27},{28},{29}]," +
                  "\"tyreWear\":[{30},{31},{32},{33}]," +
                  "\"tyreCoreTemperature\":[{34},{35},{36},{37}]," +
                  "\"suspensionTravel\":[{38},{39},{40},{41}]," +
                  "\"drs\":{42}," +
                  "\"tc\":{43}," +
                  "\"heading\":{44}," +
                  "\"pitch\":{45}," +
                  "\"roll\":{46}," +
                  "\"cgHeight\":{47}," +
                  "\"carDamage\":[{48},{49},{50},{51},{52}]," +
                  "\"pitLimiterOn\":{53}," +
                  "\"abs\":{54}," +
                  "\"kersCharge\":{55}," +
                  "\"kersInput\":{56}," +
                  "\"autoShifterOn\":{57}," +
                  "\"rideHeight\":[{58},{59}]," +
                  "\"turboBoost\":{60}," +
                  "\"airDensity\":{61}" +
                "}}," +
                "\"graphics\":{{" +
                  "\"packetId\":{62}," +
                  "\"status\":{63}," +
                  "\"session\":{64}," +
                  "\"currentTime\":\"{65}\"," +
                  "\"lastTime\":\"{66}\"," +
                  "\"bestTime\":\"{67}\"," +
                  "\"split\":\"{68}\"," +
                  "\"completedLaps\":{69}," +
                  "\"position\":{70}," +
                  "\"iCurrentTime\":{71}," +
                  "\"iLastTime\":{72}," +
                  "\"iBestTime\":{73}," +
                  "\"sessionTimeLeft\":{74}," +
                  "\"distanceTraveled\":{75}," +
                  "\"isInPit\":{76}," +
                  "\"currentSectorIndex\":{77}," +
                  "\"lastSectorTime\":{78}," +
                  "\"numberOfLaps\":{79}," +
                  "\"tyreCompound\":\"{80}\"," +
                  "\"replayTimeMultiplier\":{81}," +
                  "\"normalizedCarPosition\":{82}," +
                  "\"carCoordinates\":[{83},{84},{85}]," +
                  "\"penaltyTime\":{86}," +
                  "\"flag\":{87}," +
                  "\"idealLineOn\":{88}," +
                  "\"isInPitLane\":{89}," +
                  "\"surfaceGrip\":{90}" +
                "}}," +
                "\"static\":{{" +
                  "\"carModel\":\"{91}\"," +
                  "\"track\":\"{92}\"," +
                  "\"playerName\":\"{93}\"," +
                  "\"sectorCount\":{94}," +
                  "\"maxRpm\":{95}," +
                  "\"maxFuel\":{96}" +
                "}}" +
                "}}",
                p.packetId,                                      // 0
                p.gas.ToString(inv),                             // 1
                p.brake.ToString(inv),                           // 2
                p.fuel.ToString(inv),                            // 3
                p.gear,                                          // 4
                p.rpms,                                          // 5
                p.steerAngle.ToString(inv),                      // 6
                p.speedKmh.ToString(inv),                        // 7
                vel0.ToString(inv), vel1.ToString(inv), vel2.ToString(inv), // 8, 9, 10
                acc0.ToString(inv), acc1.ToString(inv), acc2.ToString(inv), // 11, 12, 13
                slip0.ToString(inv), slip1.ToString(inv), slip2.ToString(inv), slip3.ToString(inv), // 14, 15, 16, 17
                load0.ToString(inv), load1.ToString(inv), load2.ToString(inv), load3.ToString(inv), // 18, 19, 20, 21
                pres0.ToString(inv), pres1.ToString(inv), pres2.ToString(inv), pres3.ToString(inv), // 22, 23, 24, 25
                p.wheelAngularSpeed != null && p.wheelAngularSpeed.Length > 0 ? p.wheelAngularSpeed[0].ToString(inv) : "0",
                p.wheelAngularSpeed != null && p.wheelAngularSpeed.Length > 1 ? p.wheelAngularSpeed[1].ToString(inv) : "0",
                p.wheelAngularSpeed != null && p.wheelAngularSpeed.Length > 2 ? p.wheelAngularSpeed[2].ToString(inv) : "0",
                p.wheelAngularSpeed != null && p.wheelAngularSpeed.Length > 3 ? p.wheelAngularSpeed[3].ToString(inv) : "0", // 26, 27, 28, 29
                wear0.ToString(inv), wear1.ToString(inv), wear2.ToString(inv), wear3.ToString(inv), // 30, 31, 32, 33
                temp0.ToString(inv), temp1.ToString(inv), temp2.ToString(inv), temp3.ToString(inv), // 34, 35, 36, 37
                susp0.ToString(inv), susp1.ToString(inv), susp2.ToString(inv), susp3.ToString(inv), // 38, 39, 40, 41
                p.drs.ToString(inv),                             // 42
                p.tc.ToString(inv),                              // 43
                p.heading.ToString(inv),                         // 44
                p.pitch.ToString(inv),                           // 45
                p.roll.ToString(inv),                            // 46
                p.cgHeight.ToString(inv),                        // 47
                dmg0.ToString(inv), dmg1.ToString(inv), dmg2.ToString(inv), dmg3.ToString(inv), dmg4.ToString(inv), // 48, 49, 50, 51, 52
                p.pitLimiterOn,                                  // 53
                p.abs.ToString(inv),                             // 54
                p.kersCharge.ToString(inv),                      // 55
                p.kersInput.ToString(inv),                       // 56
                p.autoShifterOn,                                 // 57
                rh0.ToString(inv), rh1.ToString(inv),            // 58, 59
                p.turboBoost.ToString(inv),                      // 60
                p.airDensity.ToString(inv),                      // 61
                g.packetId,                                      // 62
                g.status,                                        // 63
                g.session,                                       // 64
                EscapeJsonString(g.currentTime),                 // 65
                EscapeJsonString(g.lastTime),                    // 66
                EscapeJsonString(g.bestTime),                    // 67
                EscapeJsonString(g.split),                       // 68
                g.completedLaps,                                 // 69
                g.position,                                      // 70
                g.iCurrentTime,                                  // 71
                g.iLastTime,                                     // 72
                g.iBestTime,                                     // 73
                g.sessionTimeLeft.ToString(inv),                 // 74
                g.distanceTraveled.ToString(inv),                // 75
                g.isInPit,                                       // 76
                g.currentSectorIndex,                            // 77
                g.lastSectorTime,                                // 78
                g.numberOfLaps,                                  // 79
                EscapeJsonString(g.tyreCompound),                // 80
                g.replayTimeMultiplier.ToString(inv),            // 81
                g.normalizedCarPosition.ToString(inv),            // 82
                coord0.ToString(inv), coord1.ToString(inv), coord2.ToString(inv), // 83, 84, 85
                g.penaltyTime.ToString(inv),                     // 86
                g.flag,                                          // 87
                g.idealLineOn,                                   // 88
                g.isInPitLane,                                   // 89
                g.surfaceGrip.ToString(inv),                     // 90
                carModelClean,                                   // 91
                trackClean,                                      // 92
                playerNameClean,                                 // 93
                s.sectorCount,                                   // 94
                s.maxRpm,                                        // 95
                s.maxFuel.ToString(inv)                          // 96
            );
        }

        static string EscapeJsonString(string str)
        {
            if (string.IsNullOrEmpty(str)) return string.Empty;
            return str.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r").Replace("\t", "\\t");
        }
    }
}
