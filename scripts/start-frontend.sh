#!/usr/bin/env bash
set -euo pipefail

# macOS/Linux frontend launcher mirroring the Windows PowerShell version
# Usage: ./scripts/start-frontend.sh [optional-project-root]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${1:-}"
if [[ -z "${PROJECT_ROOT}" ]]; then
  PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi

FRONTEND_PATH="${PROJECT_ROOT}/frontend"
cd "${FRONTEND_PATH}"

if [[ ! -d node_modules ]]; then
  echo "Installing frontend dependencies (npm install)..."
  npm install
fi

# Ensure critical packages are present
if [[ ! -d "node_modules/recharts" ]]; then
  echo "Detected missing package 'recharts' - installing..."
  npm install recharts --save
fi

if [[ ! -d "node_modules/axios" ]]; then
  echo "Detected missing package 'axios' - installing..."
  npm install axios --save
fi

echo "Starting Vite dev server"
exec npm run dev
