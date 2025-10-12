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

Write-Host "Starting Vite dev server"
npm run dev
