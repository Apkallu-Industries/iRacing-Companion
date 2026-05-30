# Pit Wall — Automated Workspace Bootstrapper
# scripts/bootstrap.ps1

$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue

if (-not $node -or -not $npm) {
    # Check if we are Administrator (required for silent MSI installations)
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "==========================================================" -ForegroundColor Yellow
        Write-Host "  Node.js and NPM not found. Silently installing..." -ForegroundColor Yellow
        Write-Host "==========================================================" -ForegroundColor Yellow
        Write-Host "Requesting Administrator privileges to run the Node.js installer..." -ForegroundColor Cyan
        
        Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
        exit
    }

    Write-Host "🌐 Downloading official Node.js target engine (v24.13.0) for Windows x64..." -ForegroundColor Yellow
    $msiUrl = "https://nodejs.org/dist/v24.13.0/node-v24.13.0-x64.msi"
    $msiPath = "$env:TEMP\node-installer.msi"

    # Download MSI silently
    Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath -UseBasicParsing

    Write-Host "📦 Installing Node.js v24.13.0. Please accept any security dialogs..." -ForegroundColor Yellow
    # Silent install via msiexec
    $process = Start-Process msiexec.exe -ArgumentList "/i `"$msiPath`" /quiet /norestart" -Wait -PassThru

    if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 3010) {
        Write-Host "✅ Node.js installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js installation failed with exit code $($process.ExitCode)." -ForegroundColor Red
        if (Test-Path $msiPath) { Remove-Item $msiPath -Force }
        exit 1
    }

    # Clean up MSI file
    if (Test-Path $msiPath) { Remove-Item $msiPath -Force }

    # Refresh current session's PATH environment variables so it immediately resolves NPM without a PC restart
    Write-Host "⚡ Refreshing system Environment PATH in active session..." -ForegroundColor Yellow
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# Verify Node & NPM are functional
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue

if (-not $node -or -not $npm) {
    Write-Host "❌ Failed to resolve Node.js or NPM in this console. Please restart your PC and run 'setup.bat' again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Verified Node.js: $(node -v)" -ForegroundColor Green
Write-Host "✅ Verified NPM: $(npm -v)" -ForegroundColor Green

# Navigate to root directory (one level up from scripts/) and install workspace
Write-Host "📦 Installing global workspace dependencies (React, Electron, Telemetry Bridge)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\.."
& npm install

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " 🎉 Pit Wall Workstation Setup Complete! " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "You can now run the developer workstation by double-clicking 'start-dev.bat' in the project root." -ForegroundColor Cyan
Write-Host "This will automatically spin up the web app, local telemetry bridge, and supervisions." -ForegroundColor Cyan
