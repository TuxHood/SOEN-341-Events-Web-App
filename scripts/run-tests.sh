#!/usr/bin/env bash
# Run backend Django tests (POSIX shell)
# Creates/activates .venv, installs backend requirements, runs migrations, and runs the integration test module
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
cd "$repo_root"

echo "Repository root: $repo_root"

# create venv if missing
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment .venv..."
  python3 -m venv .venv || python -m venv .venv
fi

# shellcheck source=/dev/null
if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
else
  echo "Could not find venv activate script; continuing with system python"
fi

# Install backend requirements if present
REQ="backend/requirements.txt"
if [ -f "$REQ" ]; then
  echo "Installing backend requirements from $REQ"
  pip install -r "$REQ" || true
else
  echo "No backend requirements file found at $REQ — skipping pip install"
fi

 # Run migrations and tests using the Django manage.py inside backend/collegeEventsWeb.
 # Export PYTHONPATH so test module `backend.tests` (located at repo-root/backend/tests) is importable.
 export PYTHONPATH="$repo_root"
 pushd "$repo_root/backend/collegeEventsWeb" >/dev/null
 echo "Applying migrations (cwd=backend/collegeEventsWeb)"
 python manage.py migrate

 echo "Running integration tests: backend.tests.test_integration"
 python manage.py test backend.tests.test_integration -v 2
 popd >/dev/null

echo "Tests finished"
