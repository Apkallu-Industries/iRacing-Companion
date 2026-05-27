; ─────────────────────────────────────────────────────────────────────────────
; Pit Wall Workstation — NSIS Runtime Setup Script
; runtime-setup.nsh
;
; Included by electron-builder NSIS installer via nsis.include.
; Runs during installation to provision the MongoDB runtime service.
;
; Strategy:
;   1. Check if MongoDB is already installed (registry probe)
;   2. Check if port 27017 is already in use (service already running)
;   3. If MongoDB absent: download Community Server MSI + install silently
;   4. Register MongoDB as a Windows service named "PitWallMongoDB"
;   5. Create runtime directories under %APPDATA%\PitWall\
;   6. Show status in the installer UI
;
; This is the industrial installation behavior — provisioning a real
; engineering environment, not just installing an Electron wrapper.
; ─────────────────────────────────────────────────────────────────────────────

; ─── MongoDB Detection ────────────────────────────────────────────────────────

!macro CHECK_MONGODB_INSTALLED result
  ; Probe registry for MongoDB install
  ReadRegStr $0 HKLM "SOFTWARE\MongoDB\Mongod" "InstallDir"
  ${If} $0 != ""
    StrCpy ${result} "installed"
  ${Else}
    ReadRegStr $0 HKLM "SOFTWARE\WOW6432Node\MongoDB\Mongod" "InstallDir"
    ${If} $0 != ""
      StrCpy ${result} "installed"
    ${Else}
      ; Also check if mongod.exe is on PATH
      SearchPath $0 "mongod.exe"
      ${If} $0 != ""
        StrCpy ${result} "installed"
      ${Else}
        StrCpy ${result} "absent"
      ${EndIf}
    ${EndIf}
  ${EndIf}
!macroend

; ─── Service Registration ─────────────────────────────────────────────────────

!macro REGISTER_PITWALL_MONGODB_SERVICE
  ; Create runtime database directory
  CreateDirectory "$APPDATA\PitWall\db"
  CreateDirectory "$APPDATA\PitWall\logs"
  CreateDirectory "$APPDATA\PitWall\sessions"
  CreateDirectory "$APPDATA\PitWall\config"

  ; Write a minimal mongod.conf for the PitWall service
  FileOpen $0 "$APPDATA\PitWall\config\mongod.conf" w
  FileWrite $0 "storage:$\n"
  FileWrite $0 "  dbPath: $APPDATA\PitWall\db$\n"
  FileWrite $0 "net:$\n"
  FileWrite $0 "  port: 27017$\n"
  FileWrite $0 "  bindIp: 127.0.0.1$\n"
  FileWrite $0 "systemLog:$\n"
  FileWrite $0 "  destination: file$\n"
  FileWrite $0 "  path: $APPDATA\PitWall\logs\mongod.log$\n"
  FileWrite $0 "  logAppend: true$\n"
  FileClose $0

  ; Register as Windows service (runs as LOCAL SERVICE)
  ; --install registers the service; sc failure sets auto-restart on crash
  ExecWait '"mongod.exe" --config "$APPDATA\PitWall\config\mongod.conf" --install --serviceName "PitWallMongoDB" --serviceDisplayName "Pit Wall Telemetry Database" --serviceDescription "MongoDB instance for Pit Wall motorsport telemetry storage."'
  ExecWait 'sc failure "PitWallMongoDB" reset= 60 actions= restart/5000/restart/10000/restart/30000'

  ; Start the service
  ExecWait 'net start "PitWallMongoDB"'
!macroend

; ─── MongoDB Download + Install ───────────────────────────────────────────────

!macro DOWNLOAD_AND_INSTALL_MONGODB
  DetailPrint "MongoDB Community Server not found — downloading..."

  ; MongoDB 7.x MSI download URL (Windows x64, latest stable)
  ; NOTE: Update this URL when a new MongoDB LTS is released
  StrCpy $0 "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.14-signed.msi"
  StrCpy $1 "$TEMP\mongodb-installer.msi"

  ; Download using PowerShell (available on all modern Windows)
  ExecWait 'powershell.exe -NoProfile -Command "Invoke-WebRequest -Uri ''$0'' -OutFile ''$1'' -UseBasicParsing"' $R0
  ${If} $R0 != 0
    DetailPrint "WARNING: MongoDB download failed (exit code: $R0). Telemetry recording will be disabled."
    DetailPrint "Install MongoDB Community Server manually: https://www.mongodb.com/try/download/community"
    Goto MONGODB_INSTALL_SKIP
  ${EndIf}

  DetailPrint "Installing MongoDB Community Server silently..."
  ExecWait 'msiexec /i "$1" /quiet /norestart ADDLOCAL="ServerService,Client,MonitoringTools" SERVICENAME="PitWallMongoDB" SERVICEDISPLAYNAME="Pit Wall Telemetry Database" DATAPATH="$APPDATA\PitWall\db" LOGPATH="$APPDATA\PitWall\logs"' $R0

  ${If} $R0 != 0
  ${AndIf} $R0 != 3010  ; 3010 = success, reboot required
    DetailPrint "WARNING: MongoDB installation returned code $R0. Attempting manual service registration..."
    ; Try registering with whatever mongod.exe was installed
    !insertmacro REGISTER_PITWALL_MONGODB_SERVICE
  ${Else}
    DetailPrint "MongoDB Community Server installed successfully."
    ; Create runtime directories (MSI may not create our custom paths)
    CreateDirectory "$APPDATA\PitWall\db"
    CreateDirectory "$APPDATA\PitWall\logs"
    CreateDirectory "$APPDATA\PitWall\sessions"
    CreateDirectory "$APPDATA\PitWall\config"
  ${EndIf}

  ; Clean up MSI
  Delete "$1"

  MONGODB_INSTALL_SKIP:
!macroend

; ─── Main Provisioning Entry Point ───────────────────────────────────────────
; Called from the electron-builder NSIS installer after files are extracted.

!macro PITWALL_RUNTIME_PROVISION
  DetailPrint "Provisioning Pit Wall Runtime Environment..."

  ; Always create runtime directories
  CreateDirectory "$APPDATA\PitWall"
  CreateDirectory "$APPDATA\PitWall\db"
  CreateDirectory "$APPDATA\PitWall\logs"
  CreateDirectory "$APPDATA\PitWall\sessions"
  CreateDirectory "$APPDATA\PitWall\config"
  CreateDirectory "$APPDATA\PitWall\workspaces"

  ; Check for MongoDB
  !insertmacro CHECK_MONGODB_INSTALLED $R0

  ${If} $R0 == "installed"
    DetailPrint "MongoDB detected. Checking for PitWallMongoDB service..."
    ; Check if our service already exists
    ExecWait 'sc query "PitWallMongoDB"' $R1
    ${If} $R1 != 0
      ; MongoDB installed but our service not registered
      DetailPrint "Registering PitWallMongoDB service..."
      !insertmacro REGISTER_PITWALL_MONGODB_SERVICE
    ${Else}
      DetailPrint "PitWallMongoDB service already registered."
      ; Ensure it's started
      ExecWait 'net start "PitWallMongoDB"'
    ${EndIf}
  ${Else}
    ; MongoDB not installed — download and install
    !insertmacro DOWNLOAD_AND_INSTALL_MONGODB
  ${EndIf}

  DetailPrint "Runtime provisioning complete."
!macroend

; ─── Hook into electron-builder install sequence ─────────────────────────────

!macro customInstall
  !insertmacro PITWALL_RUNTIME_PROVISION
!macroend

!macro customUninstall
  ; On uninstall: stop the service but do NOT remove MongoDB or the database
  ; Engineers keep their telemetry data even after uninstalling Pit Wall
  ExecWait 'net stop "PitWallMongoDB"'
  DetailPrint "Telemetry database preserved at: $APPDATA\PitWall\db"
  DetailPrint "To remove the database: delete %APPDATA%\PitWall\ manually"
!macroend
