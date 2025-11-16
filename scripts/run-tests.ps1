# Run backend Django tests (PowerShell)
# Creates/activates .venv, installs backend requirements, runs migrations, and runs the integration test module
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
Set-Location $repoRoot

Write-Host "Repository root: $repoRoot"

# Ensure Python venv exists
$activatePath = Join-Path $repoRoot '.venv\Scripts\Activate.ps1'
if (-not (Test-Path $activatePath)) {
    Write-Host 'Creating virtual environment .venv...'
    python -m venv .venv
}

# Activate venv (dot-source the activate script if present)
Write-Host 'Activating virtual environment'
if (Test-Path '.\.venv\Scripts\Activate.ps1') {
    . .\.venv\Scripts\Activate.ps1
} else {
    Write-Host 'Activate script not found; continuing with system Python'
}

# Install backend requirements if requirements file exists
$req = 'backend\requirements.txt'
if (Test-Path $req) {
    Write-Host "Installing backend requirements from $req"
    pip install -r $req
} else {
    Write-Host "No backend requirements file found at $req - skipping pip install"
}

# Run migrations and tests using the Django manage.py inside backend/collegeEventsWeb.
# Set PYTHONPATH so test module `backend.tests` (located at repo-root/backend/tests) is importable.
$env:PYTHONPATH = "$repoRoot"
Push-Location -Path "$repoRoot\backend\collegeEventsWeb"
try {
    Write-Host "Applying migrations (cwd=backend/collegeEventsWeb)"
    python manage.py migrate

    Write-Host "Running integration tests: backend.tests.test_integration"
    python manage.py test backend.tests.test_integration -v 2
} finally {
    Pop-Location
}

Write-Host "Tests finished"
