#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PORT=3100
BASE_URL="http://localhost:${PORT}"
export BASE_URL

echo ""
echo "======================================"
echo "  Agent-Browser E2E Test Suite"
echo "======================================"
echo ""

# -- Check prerequisites --
if ! command -v supabase &>/dev/null; then
  echo "ERROR: supabase CLI not found. Install it first."
  exit 1
fi

if ! command -v npx &>/dev/null; then
  echo "ERROR: npx not found. Install Node.js first."
  exit 1
fi

# -- Reset database (skip in CI where supabase start already gives a fresh DB) --
cd "$PROJECT_ROOT"
if [[ -z "${CI:-}" ]]; then
  echo "-> Resetting Supabase database..."
  supabase db reset
  echo "  Done"
else
  echo "-> CI detected — skipping db reset (supabase start already applied migrations and seed)"
fi

# -- Start dev server if needed --
DEV_PID=""
if curl -s "http://localhost:${PORT}" >/dev/null 2>&1; then
  echo "-> Dev server already running on port ${PORT}"
else
  echo "-> Starting dev server on port ${PORT}..."
  npm run dev -- --port "$PORT" &
  DEV_PID=$!

  WAITED=0
  while ! curl -s "http://localhost:${PORT}" >/dev/null 2>&1; do
    if [[ $WAITED -ge 120 ]]; then
      echo "ERROR: Dev server did not start within 120s"
      kill "$DEV_PID" 2>/dev/null || true
      exit 1
    fi
    sleep 2
    WAITED=$((WAITED + 2))
  done
  echo "  Dev server ready (waited ${WAITED}s)"
fi

cleanup() {
  npx agent-browser close 2>/dev/null || true
  if [[ -n "$DEV_PID" ]]; then
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# -- Run test flows --
TOTAL_PASS=0
TOTAL_FAIL=0
FAILED_FLOWS=()
FLOW_FILES=("$SCRIPT_DIR"/flows/*.sh)

if [[ ${#FLOW_FILES[@]} -eq 0 ]] || [[ ! -f "${FLOW_FILES[0]}" ]]; then
  echo "ERROR: No flow files found in $SCRIPT_DIR/flows/"
  exit 1
fi

echo ""
echo "-> Running ${#FLOW_FILES[@]} test flow(s)..."
echo ""

for flow in "${FLOW_FILES[@]}"; do
  flow_name="$(basename "$flow" .sh)"
  echo "------------------------------------"
  echo "  Flow: $flow_name"
  echo "------------------------------------"

  npx agent-browser close 2>/dev/null || true

  set +e
  bash "$flow"
  flow_exit=$?
  set -e

  if [[ $flow_exit -gt 0 ]]; then
    TOTAL_FAIL=$((TOTAL_FAIL + flow_exit))
    FAILED_FLOWS+=("$flow_name")
  fi
done

# -- Final summary --
echo ""
echo "======================================"
echo "  Final Summary"
echo "======================================"
echo ""

if [[ ${#FAILED_FLOWS[@]} -gt 0 ]]; then
  echo -e "\033[0;31m  FAILED flows:\033[0m"
  for f in "${FAILED_FLOWS[@]}"; do
    echo -e "\033[0;31m    - $f\033[0m"
  done
  echo ""
  exit 1
else
  echo -e "\033[0;32m  All flows passed!\033[0m"
  echo ""
  exit 0
fi
