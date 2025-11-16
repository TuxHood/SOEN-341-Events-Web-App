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
    Write-Host "Installing frontend dependencies (npm --prefix $frontendPath install)..."
    npm --prefix "$frontendPath" install
}

# Ensure critical packages are present. If a dependency (like recharts) is missing,
# install it explicitly so all developers get the same runtime behavior.
$requiredPkgPath = Join-Path $frontendPath 'node_modules\recharts'
if (-Not (Test-Path -Path $requiredPkgPath)) {
    Write-Host "Detected missing package 'recharts' - installing (npm --prefix $frontendPath install recharts)..."
    npm --prefix "$frontendPath" install recharts --save
}

# Ensure axios is installed (common dependency for api clients)
$axiosPkgPath = Join-Path $frontendPath 'node_modules\axios'
if (-Not (Test-Path -Path $axiosPkgPath)) {
    Write-Host "Detected missing package 'axios' - installing (npm --prefix $frontendPath install axios)..."
    npm --prefix "$frontendPath" install axios --save
}

# Ensure jsqr (QR decoding) is present — some pages import 'jsqr' directly
$jsqrPkgPath = Join-Path $frontendPath 'node_modules\jsqr'
if (-Not (Test-Path -Path $jsqrPkgPath)) {
    Write-Host "Detected missing package 'jsqr' - installing (npm --prefix $frontendPath install jsqr)..."
    npm --prefix "$frontendPath" install jsqr --save
}

Write-Host "Starting Vite dev server (using npm --prefix $frontendPath run dev)"
$npmExe = 'npm.cmd'
try {
    Start-Process -FilePath $npmExe -ArgumentList '--prefix', $frontendPath, 'run', 'dev' -NoNewWindow -Wait
} catch {
    Write-Host "Failed to start Vite via Start-Process with $npmExe; falling back to direct invocation with $npmExe"
    & $npmExe --prefix $frontendPath run dev
}
