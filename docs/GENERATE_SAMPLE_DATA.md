# Generate sample data — quick guide

## Purpose

This guide explains how to run the project's sample-data generator (`scripts/generate_sample_data.py`) on
both PowerShell (Windows) and Bash (macOS / Linux). It includes examples, flags, and troubleshooting tips
for common issues (for example the `UNIQUE constraint failed: users.email` error when re-running the script).

## Where

- Script: `scripts/generate_sample_data.py` (run from the repository root)
- This guide: `docs/GENERATE_SAMPLE_DATA.md`

## Prerequisites

- Python 3.11+ (3.12 recommended)
- A backend virtual environment (recommended location: `backend/collegeEventsWeb/.venv`)
- Project migrations applied (`python manage.py migrate`)

## Recommended workflow (run from repo root)

The generator imports the Django project and writes directly to the project's database (typically
`backend/collegeEventsWeb/db.sqlite3` for local development). Run it from the repo root so imports resolve correctly.

### PowerShell (Windows)

1. Open PowerShell and change to the repo root.
2. Activate the backend venv and run the generator:

```powershell
cd backend\collegeEventsWeb
.\.venv\Scripts\Activate.ps1
cd ..\..
# run the generator from the repo root
python .\scripts\generate_sample_data.py --venues 4 --events-per-venue 5 --students 50 --organizers 4 --registrations-per-event 10
```

Notes:
- If venv activation is blocked for the session, allow it temporarily:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
. .\.venv\Scripts\Activate.ps1
```

### Bash / macOS / Linux

1. Open a terminal and change to the repo root.
2. Activate the backend venv and run the generator:

```bash
cd backend/collegeEventsWeb
source .venv/bin/activate
cd ../..
python ./scripts/generate_sample_data.py --venues 4 --events-per-venue 5 --students 50 --organizers 4 --registrations-per-event 10
```

### Running without activating the venv

If you prefer to call the venv python executable directly (CI or non-interactive runs):

PowerShell:
```powershell
.\backend\collegeEventsWeb\.venv\Scripts\python.exe .\scripts\generate_sample_data.py --venues 2
```

Bash:
```bash
backend/collegeEventsWeb/.venv/bin/python3 ./scripts/generate_sample_data.py --venues 2
```

## Generator flags (examples)

- `--venues N` — create N venues
- `--events-per-venue M` — create M events per venue
- `--students K` — create K student users
- `--organizers O` — create O organizer users
- `--registrations-per-event R` — register R students per event

Example (small):

```bash
python ./scripts/generate_sample_data.py --venues 2 --events-per-venue 3 --students 20 --organizers 3 --registrations-per-event 6
```
