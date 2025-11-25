# Troubleshooting

This document contains common issues and fixes encountered when setting up or running the project locally.

## venv activation fails on Windows
Allow activation for the session:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
. .\.venv\Scripts\Activate.ps1
```

## `UNIQUE constraint failed: users.email` when re-running the generator

- **Cause:** the sample-data generator creates deterministic emails (student1@example.com, organizer1@example.com, …). Rerunning it against an existing DB will try to recreate those users and fail.
- **Quick fixes:**
  - Delete the local DB and re-run migrations (dev-only, destructive):

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

  - Run the generator with different counts so it won't collide with existing users.
  - Inspect and remove specific conflicting users using the Django admin or `manage.py shell`.

## Node / Vite native binding or install errors

- If you see errors about native bindings or binary modules, it can help to remove `node_modules` and `package-lock.json` and reinstall:

```bash
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend
npm install
```

If you continue to see platform-specific native binding errors, ensure your Node.js version matches the project's supported versions and try a clean reinstall.

## Other
- If a script fails due to quoting or path issues on Windows PowerShell, ensure paths are quoted and the PowerShell execution policy allows script execution for the session.
