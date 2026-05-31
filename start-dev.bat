@echo off
title Pit Wall Workstation Dev Runner
echo ===================================================
echo             Pit Wall Workstation Dev
echo ===================================================
echo.
echo Starting local Vite dev server in background...
start cmd /k "title Vite Dev Server && npm run dev"
echo.
echo Waiting a moment for Vite server to boot...
timeout /t 3 /nobreak >nul
echo.
echo Launching workstation developer shell...
npm run desktop:dev
