#!/usr/bin/env bash
# Shared helpers for agent-browser E2E tests
# Source this file from every flow script: source "$(dirname "$0")/../helpers.sh"

set -euo pipefail

# -- Configuration --
AB="npx agent-browser"
BASE_URL="${BASE_URL:-http://localhost:3100}"
SUPABASE_API="${SUPABASE_API:-http://127.0.0.1:54331}"

# Get service_role key from supabase status (cached per session)
if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  SUPABASE_SERVICE_ROLE_KEY="$(supabase status --output json 2>/dev/null | grep -o '"service_role_key":"[^"]*"' | cut -d'"' -f4)"
  if [[ -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
    echo "ERROR: Could not get service_role_key from supabase status"
    exit 1
  fi
  export SUPABASE_SERVICE_ROLE_KEY
fi

# Email-to-name map for login
declare -A MEMBER_EMAILS=(
  [Alex]="alex@example.com"
  [Sarah]="sarah@example.com"
  [Mike]="mike@example.com"
  [Emily]="emily@example.com"
  [David]="david@example.com"
  [Jessica]="jessica@example.com"
  [Tom]="tom@example.com"
  [Lisa]="lisa@example.com"
  [Chris]="chris@example.com"
  [Anna]="anna@example.com"
  [James]="james@example.com"
  [Maria]="maria@example.com"
)

# -- Test Runner --
PASS_COUNT=0
FAIL_COUNT=0
FAILED_TESTS=()
CURRENT_DESCRIBE=""
CURRENT_IT=""

describe() {
  CURRENT_DESCRIBE="$1"
  echo ""
  echo -e "\033[1;36m  $1\033[0m"
}

it() {
  CURRENT_IT="$1"
  echo -n -e "    \033[0;33m○ $1\033[0m"
}

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo -e "\r    \033[0;32m✓ ${CURRENT_IT}\033[0m"
}

fail() {
  local msg="${1:-}"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FAILED_TESTS+=("${CURRENT_DESCRIBE} > ${CURRENT_IT}")
  echo -e "\r    \033[0;31m✗ ${CURRENT_IT}\033[0m"
  if [[ -n "$msg" ]]; then
    echo -e "      \033[0;31m$msg\033[0m"
  fi
}

run_test() {
  local fn="$1"
  if "$fn"; then
    :
  else
    if [[ -n "${CURRENT_IT:-}" ]]; then
      fail "Test function threw an error"
    fi
  fi
}

summary() {
  local total=$((PASS_COUNT + FAIL_COUNT))
  echo ""
  echo -e "\033[1m  Results: ${PASS_COUNT} passed, ${FAIL_COUNT} failed (${total} total)\033[0m"
  if [[ ${FAIL_COUNT} -gt 0 ]]; then
    echo -e "\033[0;31m  Failed tests:\033[0m"
    for t in "${FAILED_TESTS[@]}"; do
      echo -e "\033[0;31m    - $t\033[0m"
    done
  fi
  echo ""
  return $FAIL_COUNT
}

# -- Browser Lifecycle --
setup() {
  $AB close 2>/dev/null || true
  $AB open "$BASE_URL" --timeout 30000
  $AB wait --load networkidle --timeout 30000
}

teardown() {
  $AB close 2>/dev/null || true
}
trap teardown EXIT

# -- Authentication --
login_as() {
  local name="$1"
  local email="${MEMBER_EMAILS[$name]}"
  if [[ -z "$email" ]]; then
    echo "ERROR: Unknown member name: $name"
    return 1
  fi

  $AB close 2>/dev/null || true

  local response
  response=$(curl -s -X POST "${SUPABASE_API}/auth/v1/admin/generate_link" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"magiclink\",\"email\":\"${email}\",\"data\":{}}")

  local action_link
  action_link=$(echo "$response" | grep -o '"action_link":"[^"]*"' | cut -d'"' -f4)
  if [[ -z "$action_link" ]]; then
    echo "ERROR: Could not generate magic link for $email"
    echo "Response: $response"
    return 1
  fi

  action_link=$(echo "$action_link" | sed "s|redirect_to=[^&]*|redirect_to=${BASE_URL}|g")

  $AB open "$action_link" --timeout 30000
  $AB wait --load networkidle --timeout 30000
  $AB wait 2000
  $AB wait --load networkidle --timeout 15000

  local snap
  snap=$($AB snapshot 2>/dev/null || true)
  if echo "$snap" | grep -qi "Home\|Activity\|Events\|Splits\|Settings"; then
    return 0
  fi

  $AB wait 3000
  $AB wait --load networkidle --timeout 15000
  return 0
}

# -- Navigation --
go_to_tab() {
  local label="$1"
  $AB find text "$label" click --exact
  $AB wait --load networkidle --timeout 10000
  $AB wait 500
}

go_to_segment() {
  local label="$1"
  $AB find text "$label" click --exact
  $AB wait --load networkidle --timeout 10000
  $AB wait 500
}

open_url() {
  local path="$1"
  $AB open "${BASE_URL}${path}" --timeout 30000
  $AB wait --load networkidle --timeout 15000
}

# -- Interaction Helpers --
click_text() {
  local text="$1"
  $AB find text "$text" click
}

click_button() {
  local name="$1"
  $AB find role button click --name "$name"
}

click_exact_text() {
  local text="$1"
  $AB find text "$text" click --exact
}

fill_input() {
  local placeholder="$1"
  local value="$2"
  $AB find placeholder "$placeholder" fill "$value"
}

fill_label() {
  local label="$1"
  local value="$2"
  $AB find label "$label" fill "$value"
}

# -- Wait Helpers --
wait_for_text() {
  local text="$1"
  local timeout="${2:-10000}"
  $AB wait --text "$text" --timeout "$timeout"
}

wait_for_network() {
  $AB wait --load networkidle --timeout 15000
}

# -- Snapshot Helpers --
take_snapshot() {
  $AB snapshot
}

get_snapshot() {
  $AB snapshot 2>/dev/null
}

get_url() {
  $AB get url
}

get_page_text() {
  $AB snapshot 2>/dev/null
}

# -- Assertions --
assert_text_visible() {
  local text="$1"
  local snap
  snap=$(get_snapshot)
  if echo "$snap" | grep -qi "$text"; then
    return 0
  else
    return 1
  fi
}

assert_text_not_visible() {
  local text="$1"
  local snap
  snap=$(get_snapshot)
  if echo "$snap" | grep -qi "$text"; then
    return 1
  else
    return 0
  fi
}

assert_snapshot_contains() {
  local text="$1"
  local snap
  snap=$(get_snapshot)
  if echo "$snap" | grep -qi "$text"; then
    return 0
  else
    return 1
  fi
}

assert_url_contains() {
  local text="$1"
  local url
  url=$(get_url)
  if echo "$url" | grep -qi "$text"; then
    return 0
  else
    return 1
  fi
}
