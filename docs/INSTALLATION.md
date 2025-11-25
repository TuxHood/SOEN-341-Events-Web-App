# Installation & Local Development

This guide covers a straightforward local setup for the project (backend Django API + frontend React/Vite).
It shows platform-specific steps for Windows (PowerShell) and macOS/Linux (bash), how to run the helper scripts,
how to generate sample data and where to look for common problems.

## Prerequisites

- Git
- Node.js (LTS) and `npm` (Node 18+ recommended)
- Python 3.11+ (3.12 recommended)
- A terminal: PowerShell on Windows, Bash on macOS/Linux

## Repository

Clone the repo and open it in your IDE:

```powershell
git clone https://github.com/TuxHood/SOEN-341-Events-Web-App
cd SOEN-341-Events-Web-App
code .
```

## Backend (Django)

The backend project lives in `backend/collegeEventsWeb`.

### Windows (PowerShell)

```powershell
cd backend\collegeEventsWeb
python -m venv .venv            # create venv if missing
.\.venv\Scripts\Activate.ps1  # activate the venv for this session
python -m pip install --upgrade pip setuptools wheel
cd ..
pip install -r requirements.txt
## More docs

Some related topics have their own focused documentation. See the files below for details:

- `docs/GENERATE_SAMPLE_DATA.md` — Sample-data generator usage and options.
- `docs/RUN_TESTS.md` — How to run the backend test suite.
- `docs/HELPER_SCRIPTS.md` — Details about helper scripts for starting backend/frontend and usage examples.
- `docs/TROUBLESHOOTING.md` — Troubleshooting tips and common fixes.
- `docs/NOTES.md` — Project notes and suggested next steps for development.

Adjust paths and commands to your local environment as needed.
source .venv/bin/activate
cd ../..
python ./scripts/generate_sample_data.py --venues 4 --events-per-venue 5 --students 50 --organizers 4 --registrations-per-event 10
```

## Run tests

PowerShell:
```powershell
cd backend\collegeEventsWeb
.\.venv\Scripts\Activate.ps1
python manage.py test
```

Bash:
```bash
cd backend/collegeEventsWeb
source .venv/bin/activate
python manage.py test
```

## Helper scripts

- `scripts/start-backend.ps1` / `scripts/start-backend.sh` — start backend (create venv, install deps, migrate, runserver)
- `scripts/start-frontend.ps1` / `scripts/start-frontend.sh` — start frontend (ensure node modules, install optional packages, run dev server)
- `scripts/generate_sample_data.py` — generate sample data (also documented in `docs/GENERATE_SAMPLE_DATA.txt`)

## Troubleshooting

- **venv activation fails on Windows**: allow activation for the session
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
  . .\.venv\Scripts\Activate.ps1
  ```

- **`UNIQUE constraint failed: users.email` when re-running the generator**:
  - Cause: generator uses deterministic emails (student1@example.com, etc.). Re-running will try to recreate them.
  - Quick fixes:
    - Delete the local DB and re-run migrations (dev-only, destructive):
python manage.py migrate --noinput
python manage.py createsuperuser --email you@example.com
      ```powershell
      Remove-Item backend\collegeEventsWeb\db.sqlite3 -Force
      cd backend\collegeEventsWeb
      .\.venv\Scripts\Activate.ps1
      python manage.py migrate --noinput
      ```
      or (bash):
      ```bash
      rm backend/collegeEventsWeb/db.sqlite3
      cd backend/collegeEventsWeb
      source .venv/bin/activate
      python manage.py migrate --noinput
      ```
    - Run the generator with different counts or edit `scripts/generate_sample_data.py` to skip existing users (idempotent mode).

- **Node/Vite native binding errors** (rare):
  - Remove `node_modules` and `package-lock.json` then reinstall:
    ```bash
    rm -rf frontend/node_modules frontend/package-lock.json
    cd frontend
    npm install
    ```

## Notes and next steps

- If you want the generator converted to a Django management command or made idempotent by default I can update `scripts/generate_sample_data.py` for you.
- I can also add a `docs/DEV_NOTES.md` describing ways to run both servers together (tmux, VS Code compound launch, etc.).

---

Adjust paths and commands to your local environment as needed.
