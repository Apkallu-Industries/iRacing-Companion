@echo off
title Pit Wall Workstation Dev Runner
cls
echo ===================================================
echo       Pit Wall Workstation Dev Launcher (Tauri)
echo ===================================================
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
