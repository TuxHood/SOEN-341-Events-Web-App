# Helper scripts

This file documents the helper scripts included in the repository and how to use them.

- `scripts/start-backend.ps1` / `scripts/start-backend.sh` — Start the backend server. These helpers will create/upgrade the virtual environment, install dependencies, run migrations and start Django's development server.
- `scripts/start-frontend.ps1` / `scripts/start-frontend.sh` — Start the frontend dev server. These helpers ensure `node_modules` exists, install optional packages (like `recharts`, `axios`, `jsqr`) if missing and start the Vite dev server.
- `scripts/generate_sample_data.py` — Populate the dev database with sample venues, events, organizers, students and registrations. See `docs/GENERATE_SAMPLE_DATA.md` for full usage and options.

Usage examples

PowerShell (repo root):

```powershell
.\scripts\start-backend.ps1
.\scripts\start-frontend.ps1
```

Bash (repo root):

```bash
chmod +x ./scripts/start-backend.sh ./scripts/start-frontend.sh
./scripts/start-backend.sh
./scripts/start-frontend.sh
```

Notes

- The scripts are intended for developer convenience and may re-run installs or migrations. They are safe for local development but not intended for production use.
- On Windows, PowerShell scripts quote paths carefully; if you run into execution policy restrictions, use `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned`.
