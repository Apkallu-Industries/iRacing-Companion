@echo off
title Pit Wall Workstation Setup
echo ===================================================
echo             Pit Wall Workstation Setup
echo ===================================================
echo.
echo Running automated bootstrapper...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\bootstrap.ps1"
echo.
echo Press any key to close setup...
pause >nul
