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
# Ensure we're in the project directory
Set-Location -Path $projectDir

# Create virtual environment in backend if missing
if (-Not (Test-Path -Path '.venv')) {
    Write-Host "Creating virtual environment in $projectDir ..."
    python -m venv .venv
}

$venvPython = Join-Path $projectDir '.venv\Scripts\python.exe'

if (-Not (Test-Path -Path $venvPython)) {
    Write-Host "Warning: virtualenv python not found at $venvPython; trying system python."
    $venvPython = "python"
}

Write-Host "Upgrading pip and installing requirements using: $venvPython"
& $venvPython -m pip install --upgrade pip setuptools wheel

# Ensure python-dotenv is available (some settings load it explicitly)
try {
    & $venvPython -m pip install python-dotenv
} catch {
    Write-Host "Failed to install python-dotenv via pip. You may need to install it manually."
}

# Prefer a requirements.txt located inside the selected project directory. If missing,
# fall back to the backend/requirements.txt so the team's centralized requirements are used.
$requirementsPath = Join-Path $projectDir 'requirements.txt'
if (-not (Test-Path -Path $requirementsPath)) {
    $fallback = Join-Path $backendPath 'requirements.txt'
    if (Test-Path -Path $fallback) {
        Write-Host ("No requirements.txt in {0} - using {1} instead." -f $projectDir, $fallback)
        $requirementsPath = $fallback
    }
}

if (Test-Path -Path $requirementsPath) {
    Write-Host "Installing packages from $requirementsPath using $venvPython -m pip"
    & $venvPython -m pip install -r $requirementsPath
} else {
    Write-Host "No requirements.txt found; installing minimal backend dependencies..."
    # Install minimal dependencies expected by the project so Django can start
    & $venvPython -m pip install django==5.2.7 djangorestframework django-cors-headers djangorestframework-simplejwt python-dotenv
}

Set-Location -Path $projectDir

Write-Host "Applying migrations (if any)..."
& $venvPython manage.py makemigrations
& $venvPython manage.py migrate --noinput

Write-Host "Starting Django dev server on 8000 (project: $projectDir)"
& $venvPython manage.py runserver 8000
