# Running Tests

This file documents how to run the backend test suite locally.

PowerShell (Windows):

```powershell
cd backend\collegeEventsWeb
.\.venv\Scripts\Activate.ps1
python manage.py test
```

Bash (macOS / Linux):

```bash
cd backend/collegeEventsWeb
source .venv/bin/activate
python manage.py test
```

Notes

- The test suite assumes dependencies from `requirements.txt` are installed into the virtual environment.
- Tests may rely on settings that expect SQLite for local runs; CI pipelines may use alternative databases.
