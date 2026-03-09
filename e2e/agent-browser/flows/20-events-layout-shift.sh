#!/usr/bin/env bash
set -eo pipefail

# Inline config (avoid helpers.sh associative-array issue with bash 3.2)
AB="npx agent-browser"
BASE_URL="${BASE_URL:-http://localhost:3100}"
SUPABASE_API="${SUPABASE_API:-http://127.0.0.1:54331}"

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  SUPABASE_SERVICE_ROLE_KEY=$(supabase status --output json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['SERVICE_ROLE_KEY'])" 2>/dev/null || true)
  if [[ -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
    echo "ERROR: Could not get SERVICE_ROLE_KEY"
    exit 1
  fi
  export SUPABASE_SERVICE_ROLE_KEY
fi

# -- Mini test runner --
PASS_COUNT=0
FAIL_COUNT=0
CURRENT_IT=""

it() { CURRENT_IT="$1"; echo -n "    ○ $1"; }
pass() { PASS_COUNT=$((PASS_COUNT + 1)); echo -e "\r    ✓ ${CURRENT_IT}"; }
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); echo -e "\r    ✗ ${CURRENT_IT}"; echo "      $1"; }

# -- Login --
echo ""
echo "  Events tab layout shift"

$AB close 2>/dev/null || true

EMAIL="alex@example.com"
RESPONSE=$(curl -s -X POST "${SUPABASE_API}/auth/v1/admin/generate_link" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"magiclink\",\"email\":\"${EMAIL}\",\"data\":{}}")

ACTION_LINK=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('action_link') or d.get('properties',{}).get('action_link',''))" 2>/dev/null || echo "")
if [[ -z "$ACTION_LINK" ]]; then
  echo "ERROR: Could not generate magic link"
  exit 1
fi
ACTION_LINK=$(echo "$ACTION_LINK" | sed "s|redirect_to=[^&]*|redirect_to=${BASE_URL}|g")

$AB open "$ACTION_LINK" --timeout 30000
$AB wait --load networkidle --timeout 30000
$AB wait 3000
$AB wait --load networkidle --timeout 15000

# We should land on the Events tab by default (it's the home tab)
# Navigate to Events tab via label in bottom nav
$AB find label "Events" click
$AB wait 500

# -- Helpers --
click_segment() {
  local label="$1"
  # Use the segment track (rounded-full parent with segment-track bg) to scope the click
  $AB eval "document.querySelector('[data-testid=\"events-title-bar\"]').parentElement.querySelectorAll('button').forEach(b => { if(b.textContent.trim()==='$label') b.click() })"
  $AB wait 500
}

get_title_bar_height() {
  $AB eval "Math.round(document.querySelector('[data-testid=\"events-title-bar\"]').getBoundingClientRect().height)" 2>/dev/null
}

# -- Measure heights across all 4 segments --
click_segment "Events"
EVENTS_HEIGHT=$(get_title_bar_height)

click_segment "Schedule"
SCHEDULE_HEIGHT=$(get_title_bar_height)

click_segment "Polls"
POLLS_HEIGHT=$(get_title_bar_height)

click_segment "Challenges"
CHALLENGES_HEIGHT=$(get_title_bar_height)

echo "  Heights: Events=$EVENTS_HEIGHT Schedule=$SCHEDULE_HEIGHT Polls=$POLLS_HEIGHT Challenges=$CHALLENGES_HEIGHT"

it "title bar height is consistent across all segments"
if [[ "$EVENTS_HEIGHT" == "$SCHEDULE_HEIGHT" && \
      "$EVENTS_HEIGHT" == "$POLLS_HEIGHT" && \
      "$EVENTS_HEIGHT" == "$CHALLENGES_HEIGHT" ]]; then
  pass
else
  fail "Heights differ: Events=$EVENTS_HEIGHT Schedule=$SCHEDULE_HEIGHT Polls=$POLLS_HEIGHT Challenges=$CHALLENGES_HEIGHT"
fi

# -- Summary --
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo "  Results: ${PASS_COUNT} passed, ${FAIL_COUNT} failed (${TOTAL} total)"

$AB close 2>/dev/null || true
exit $FAIL_COUNT
