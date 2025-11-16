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

if [[ ! -d "${FRONTEND_PATH}/node_modules" ]]; then
  echo "Installing frontend dependencies (npm --prefix ${FRONTEND_PATH} install)..."
  npm --prefix "${FRONTEND_PATH}" install
fi

# Ensure critical packages are present (recharts, axios, jsqr)
if [[ ! -d "${FRONTEND_PATH}/node_modules/recharts" ]]; then
  echo "Detected missing package 'recharts' - installing..."
  npm --prefix "${FRONTEND_PATH}" install recharts --save
fi

if [[ ! -d "${FRONTEND_PATH}/node_modules/axios" ]]; then
  echo "Detected missing package 'axios' - installing..."
  npm --prefix "${FRONTEND_PATH}" install axios --save
fi

if [[ ! -d "${FRONTEND_PATH}/node_modules/jsqr" ]]; then
  echo "Detected missing package 'jsqr' - installing..."
  npm --prefix "${FRONTEND_PATH}" install jsqr --save
fi

echo "Starting Vite dev server (npm --prefix ${FRONTEND_PATH} run dev)"
exec npm --prefix "${FRONTEND_PATH}" run dev
