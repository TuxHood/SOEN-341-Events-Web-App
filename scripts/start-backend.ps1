param(
    [string]$ProjectRoot
)

# Compute project root as the parent of the scripts directory when not provided
if (-not $ProjectRoot) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $ProjectRoot = Resolve-Path (Join-Path $scriptDir "..")
}

# Prefer the full API project if present (backend/collegeEventsWeb), otherwise fall back to backend/
$backendPath = Join-Path $ProjectRoot 'backend'
$apiProjectPath = Join-Path $backendPath 'collegeEventsWeb'
if (Test-Path -Path $apiProjectPath) {
    $projectDir = $apiProjectPath
} else {
    $projectDir = $backendPath
}
Set-Location -Path $projectDir

# Create virtual environment in backend if missing
if (-Not (Test-Path -Path '.venv')) {
    Write-Host "Creating virtual environment in $projectDir ..."
    python -m venv .venv
}

$venvPython = Join-Path $projectDir '.venv\Scripts\python.exe'
$venvPip = Join-Path $projectDir '.venv\Scripts\pip.exe'

Write-Host "Activating virtual environment (in current session)..."
try {
    # Activate the venv inside the selected project directory so activation matches the venv used below
    & (Join-Path $projectDir '.venv\Scripts\Activate.ps1')
} catch {
    Write-Host "Activation script could not be sourced into this session; we'll call venv python directly."
}

Write-Host "Upgrading pip and installing requirements..."
& $venvPython -m pip install --upgrade pip setuptools wheel

# Ensure python-dotenv is available (some settings load it explicitly)
try {
    & $venvPip install python-dotenv
} catch {
    Write-Host "Failed to install python-dotenv via pip. You may need to install it manually."
}

if (Test-Path -Path (Join-Path $projectDir 'requirements.txt')) {
    & $venvPip install -r (Join-Path $projectDir 'requirements.txt')
} else {
    Write-Host "No requirements.txt found in $projectDir; installing minimal backend dependencies..."
    # Install minimal dependencies expected by the project so Django can start
    & $venvPip install django==5.2.7 djangorestframework django-cors-headers djangorestframework-simplejwt python-dotenv
}

Set-Location -Path $projectDir

Write-Host "Applying migrations (if any)..."
& $venvPython manage.py makemigrations
& $venvPython manage.py migrate --noinput

Write-Host "Starting Django dev server on 8000 (project: $projectDir)"
& $venvPython manage.py runserver 8000
