#!/usr/bin/env bash
set -euo pipefail

# macOS/Linux backend launcher mirroring the Windows PowerShell version
# Usage: ./scripts/start-backend.sh [optional-project-root]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${1:-}"
if [[ -z "${PROJECT_ROOT}" ]]; then
  PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi

BACKEND_PATH="${PROJECT_ROOT}/backend"
API_PROJECT_PATH="${BACKEND_PATH}/collegeEventsWeb"
if [[ -d "${API_PROJECT_PATH}" ]]; then
  PROJECT_DIR="${API_PROJECT_PATH}"
else
  PROJECT_DIR="${BACKEND_PATH}"
fi
cd "${PROJECT_DIR}"

# Create virtual environment if missing
if [[ ! -d ".venv" ]]; then
  echo "Creating virtual environment in ${PROJECT_DIR} ..."
  if command -v python3 >/dev/null 2>&1; then PY=python3; else PY=python; fi
  "${PY}" -m venv .venv
fi

VENV_PY="${PROJECT_DIR}/.venv/bin/python"
if [[ ! -x "${VENV_PY}" ]]; then
  echo "Warning: virtualenv python not found at ${VENV_PY}; trying system python."
  if command -v python3 >/dev/null 2>&1; then VENV_PY=python3; else VENV_PY=python; fi
fi

echo "Upgrading pip and installing requirements using: ${VENV_PY}"
"${VENV_PY}" -m pip install --upgrade pip setuptools wheel || true
"${VENV_PY}" -m pip install python-dotenv || true

# Prefer requirements.txt within the selected project; otherwise fallback to backend/requirements.txt
REQUIREMENTS_PATH="${PROJECT_DIR}/requirements.txt"
if [[ ! -f "${REQUIREMENTS_PATH}" ]]; then
  FALLBACK="${BACKEND_PATH}/requirements.txt"
  if [[ -f "${FALLBACK}" ]]; then
    echo "No requirements.txt in ${PROJECT_DIR} - using ${FALLBACK} instead."
    REQUIREMENTS_PATH="${FALLBACK}"
  fi
fi

if [[ -f "${REQUIREMENTS_PATH}" ]]; then
  echo "Installing packages from ${REQUIREMENTS_PATH} using ${VENV_PY} -m pip"
  "${VENV_PY}" -m pip install -r "${REQUIREMENTS_PATH}"
else
  echo "No requirements.txt found; installing minimal backend dependencies..."
  "${VENV_PY}" -m pip install "django==5.2.7" djangorestframework django-cors-headers djangorestframework-simplejwt python-dotenv
fi

# Check for model changes without writing, then conditionally run makemigrations
set +e
"${VENV_PY}" manage.py makemigrations --check --dry-run
RC=$?
set -e
if [[ ${RC} -eq 1 ]]; then
  echo "Model changes detected -> generating migrations..."
  "${VENV_PY}" manage.py makemigrations
else
  echo "No model changes detected. Skipping makemigrations."
fi

echo "Applying migrations (if any)..."
"${VENV_PY}" manage.py migrate --noinput

echo "Starting Django dev server on 8000 (project: ${PROJECT_DIR})"
exec "${VENV_PY}" manage.py runserver 8000
