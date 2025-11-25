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
```
## Launching the website
Use `docs/HELPER_SCRIPTS.md` for more details on how to launch the website.

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

## Notes and next steps

- If you want the generator converted to a Django management command or made idempotent by default I can update `scripts/generate_sample_data.py` for you.
- I can also add a `docs/DEV_NOTES.md` describing ways to run both servers together (tmux, VS Code compound launch, etc.).

---

Adjust paths and commands to your local environment as needed.
