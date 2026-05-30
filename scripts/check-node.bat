@echo off
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found on PATH.
  echo Install Node.js LTS (v24.x): https://nodejs.org/
  echo Or install nvm-windows: https://github.com/coreybutler/nvm-windows/releases
  exit /b 1
)
node -v
where npm >nul 2>nul
if errorlevel 1 (
  echo npm not found. Ensure Node.js installer added npm to your PATH.
  exit /b 1
)
npm -v
echo OK
