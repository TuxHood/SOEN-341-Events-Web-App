param(
    [string]$ProjectRoot
)

if (-not $ProjectRoot) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $ProjectRoot = Resolve-Path (Join-Path $scriptDir "..")
}

$frontendPath = Join-Path $ProjectRoot 'frontend'
Set-Location -Path $frontendPath

# Use npm --prefix to avoid accidental execution in the repo root when called via wrappers
if (-Not (Test-Path -Path (Join-Path $frontendPath 'node_modules'))) {
    Write-Host ("Installing frontend dependencies (npm --prefix {0} install)..." -f $frontendPath)
    npm --prefix "$frontendPath" install
}

# Ensure critical packages are present. If a dependency (like recharts) is missing,
# install it explicitly so all developers get the same runtime behavior.
$requiredPkgPath = Join-Path $frontendPath 'node_modules\recharts'
if (-Not (Test-Path -Path $requiredPkgPath)) {
    Write-Host ("Detected missing package 'recharts' - installing (npm --prefix {0} install recharts)..." -f $frontendPath)
    npm --prefix "$frontendPath" install recharts --save
}

# Ensure axios is installed (common dependency for api clients)
$axiosPkgPath = Join-Path $frontendPath 'node_modules\axios'
if (-Not (Test-Path -Path $axiosPkgPath)) {
    Write-Host ("Detected missing package 'axios' - installing (npm --prefix {0} install axios)..." -f $frontendPath)
    npm --prefix "$frontendPath" install axios --save
}

# Ensure jsqr (QR decoding) is present — some pages import 'jsqr' directly
$jsqrPkgPath = Join-Path $frontendPath 'node_modules\jsqr'
if (-Not (Test-Path -Path $jsqrPkgPath)) {
    Write-Host ("Detected missing package 'jsqr' - installing (npm --prefix {0} install jsqr)..." -f $frontendPath)
    npm --prefix "$frontendPath" install jsqr --save
}

# --- Auto-repair for broken Rolldown/Vite native bindings ---
$rolldownBinding = Join-Path $frontendPath 'node_modules\@rolldown\binding-win32-x64-msvc'
if (-Not (Test-Path -Path $rolldownBinding)) {
    Write-Host "Detected missing rolldown native binding - performing clean reinstall..."

    Remove-Item -Recurse -Force (Join-Path $frontendPath 'node_modules')
    Remove-Item -Force (Join-Path $frontendPath 'package-lock.json') -ErrorAction SilentlyContinue

    npm --prefix "$frontendPath" install

    Write-Host "Reinstall complete. Continuing startup..."
}
$WriteHostStr = "Starting Vite dev server (using npm --prefix {0} run dev)"
Write-Host ($WriteHostStr -f $frontendPath)
$npmExe = 'npm.cmd'
try {
    Start-Process -FilePath $npmExe -ArgumentList '--prefix', $frontendPath, 'run', 'dev' -NoNewWindow -Wait
} catch {
    Write-Host ("Failed to start Vite via Start-Process with {0}; falling back to direct invocation with {0}" -f $npmExe)
    & $npmExe --prefix "$frontendPath" run dev
}