param(
    [string]$ProjectRoot
)

# Compute project root as the parent of the scripts directory when not provided
if (-not $ProjectRoot) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $ProjectRoot = Resolve-Path (Join-Path $scriptDir "..")
}

$backendPath = Join-Path $ProjectRoot 'backend'
Set-Location -Path $backendPath

# Create virtual environment in backend if missing
if (-Not (Test-Path -Path '.venv')) {
    Write-Host "Creating virtual environment in $backendPath ..."
    python -m venv .venv
}

$venvPython = Join-Path $backendPath '.venv\Scripts\python.exe'
$venvPip = Join-Path $backendPath '.venv\Scripts\pip.exe'

Write-Host "Activating virtual environment (in current session)..."
try {
    & (Join-Path $backendPath '.venv\Scripts\Activate.ps1')
} catch {
    Write-Host "Activation script could not be sourced into this session; we'll call venv python directly."
}

Write-Host "Upgrading pip and installing requirements..."
& $venvPython -m pip install --upgrade pip setuptools wheel
if (Test-Path -Path (Join-Path $backendPath 'requirements.txt')) {
    & $venvPip install -r (Join-Path $backendPath 'requirements.txt')
} else {
    Write-Host "No requirements.txt found in $backendPath; skipping pip install -r requirements.txt"
}

$manageCwd = Join-Path $backendPath 'collegeEventsWeb'
Set-Location -Path $manageCwd

Write-Host "Applying migrations (if any)..."
& $venvPython manage.py makemigrations
& $venvPython manage.py migrate --noinput

Write-Host "Starting Django dev server on 8000"
& $venvPython manage.py runserver 8000
