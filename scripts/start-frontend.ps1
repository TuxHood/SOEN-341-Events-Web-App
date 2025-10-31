param(
    [string]$ProjectRoot
)

if (-not $ProjectRoot) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $ProjectRoot = Resolve-Path (Join-Path $scriptDir "..")
}

$frontendPath = Join-Path $ProjectRoot 'frontend'
Set-Location -Path $frontendPath

if (-Not (Test-Path -Path 'node_modules')) {
    Write-Host "Installing frontend dependencies (npm install)..."
    npm install
}

# Ensure critical packages are present. If a dependency (like recharts) is missing,
# install it explicitly so all developers get the same runtime behavior.
$requiredPkgPath = Join-Path 'node_modules' 'recharts'
if (-Not (Test-Path -Path $requiredPkgPath)) {
    Write-Host "Detected missing package 'recharts' - installing..."
    npm install recharts --save
}

Write-Host "Starting Vite dev server"
npm run dev
