try {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) {
        Write-Host "Node.js not found on PATH." -ForegroundColor Red
        Write-Host "Install Node.js (v24.x) or use nvm-windows and then re-open your terminal." -ForegroundColor Yellow
        Write-Host "Node downloads: https://nodejs.org/" -ForegroundColor Cyan
        Write-Host "nvm-windows: https://github.com/coreybutler/nvm-windows/releases" -ForegroundColor Cyan
        exit 1
    }
    $v = (& node -v)
    Write-Host "Node: $v"
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $npm) {
        Write-Host "npm not found. Ensure Node.js installer added npm to your PATH." -ForegroundColor Red
        exit 1
    }
    $nv = (& npm -v)
    Write-Host "npm: $nv"
    # show recommended engine if present
    $pkgPath = Join-Path (Get-Location) "package.json"
    if (Test-Path $pkgPath) {
        try {
            $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
            if ($pkg.engines -and $pkg.engines.node) {
                Write-Host "Recommended Node engine: $($pkg.engines.node)" -ForegroundColor Green
            }
        } catch {
            # ignore
        }
    }
    exit 0
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
