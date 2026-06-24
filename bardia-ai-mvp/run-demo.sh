#!/usr/bin/env bash
set -e

PYTHON_BIN="${PYTHON_BIN:-python3}"

if ! "$PYTHON_BIN" -c "import pypdf, docx, pptx" >/dev/null 2>&1; then
  echo "Installing local document readers..."
  "$PYTHON_BIN" -m pip install -r backend/requirements.txt
fi

"$PYTHON_BIN" backend/server.py &
ENGINE_PID=$!

cleanup() {
  kill "$ENGINE_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

npm run dev
