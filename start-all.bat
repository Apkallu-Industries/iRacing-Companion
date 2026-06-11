@echo off
title Pit Wall Workstation Dev Runner
cls
echo ===================================================
echo       Pit Wall Multi-Shell Dev Launcher
echo ===================================================
echo.
echo Please select a frontend environment to launch:
echo.
echo  [1] Launch with Tauri (Fast UI/UX, Lightweight)
echo  [2] Launch with Electron (Legacy)
echo  [3] Exit
echo.
set /p choice="Enter option [1-3]: "

if "%choice%"=="1" goto run_tauri
if "%choice%"=="2" goto run_electron
if "%choice%"=="3" goto end
echo Invalid option, exiting.
goto end

:run_tauri
echo.
echo [Tauri] Starting local Vite dev server in background...
start cmd /k "title Vite Dev Server && npm run dev"
echo [Tauri] Starting Local Telemetry Bridge in background...
start cmd /k "title Local Telemetry Bridge && cd local-bridge && node server.js"
echo.
echo Waiting a moment for services to initialize...
timeout /t 4 /nobreak >nul
echo.
echo [Tauri] Launching Tauri Developer Shell...
npm run tauri:dev
goto end

:run_electron
echo.
echo [Electron] Starting local Vite dev server in background...
start cmd /k "title Vite Dev Server && npm run dev"
echo.
echo Waiting a moment for Vite server to boot...
timeout /t 3 /nobreak >nul
echo.
echo [Electron] Launching Electron Developer Shell (bridge auto-spawned)...
npm run desktop:dev
goto end

:end
echo.
echo Workstation session closed.
pause >nul
