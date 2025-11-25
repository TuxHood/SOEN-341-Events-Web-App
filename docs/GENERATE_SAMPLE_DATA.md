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

## Troubleshooting

### 1) `UNIQUE constraint failed: users.email`

Cause: The generator uses deterministic email addresses (e.g. `student1@example.com`, `organizer1@example.com`).
Rerunning the script against an existing DB will attempt to recreate the same users and trigger the unique constraint.

Fixes:

- Destructive (simple): delete the local sqlite DB and re-run migrations, then re-run the generator.

  PowerShell:

  ```powershell
  Remove-Item backend\collegeEventsWeb\db.sqlite3 -Force
  cd backend\collegeEventsWeb
  .\.venv\Scripts\Activate.ps1
  python manage.py migrate --noinput
  ```

  Bash:

  ```bash
  rm backend/collegeEventsWeb/db.sqlite3
  cd backend/collegeEventsWeb
  source .venv/bin/activate
  python manage.py migrate --noinput
  ```

- Non-destructive: run the generator with different counts or edit the script to skip creating users that already exist (idempotent behavior). See below.

### Suggested idempotency patch (example)

To make the script safe to re-run, check for existing users before creating them. Example snippet:

```python
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email=email).exists():
    User.objects.create_user(...)
else:
    # update or skip
    continue
```

The project already contains a small idempotency improvement: the generator now skips existing users and prints a message when it does so. If you want the script to also update existing records (e.g., set `is_approved_organizer`), that can be added.

## Converting to a Django management command

If you'd rather run `python manage.py generate_sample_data ...` I can convert the script into a Django management command. That integrates the tool cleanly with Django and avoids needing to run from the repo root.

## Next steps

- Commit this file (`docs/GENERATE_SAMPLE_DATA.md`) to the repository (I can do that for you).
- Make further idempotent improvements (update existing users instead of skipping).
- Convert to a `manage.py` command if you prefer.

If you want, I can implement any of the next steps and push the change.

---

End of guide
