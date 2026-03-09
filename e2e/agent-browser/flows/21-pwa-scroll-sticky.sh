#!/usr/bin/env bash
set -eo pipefail

# E2E: PWA scroll containment and sticky headers
# Tests:
#   1. Events title bar has a sticky-positioned parent wrapper
#   2. Events tab root does not use min-h-screen (breaks scroll containment)
#   3. Events sticky header stays at top after scrolling
#   4. No unnecessary scroll on Home, Splits, Settings tabs

AB="npx agent-browser"
BASE_URL="${BASE_URL:-http://localhost:3100}"
SUPABASE_API="${SUPABASE_API:-http://127.0.0.1:54331}"

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  SUPABASE_SERVICE_ROLE_KEY=$(supabase status --output json 2>/dev/null \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['SERVICE_ROLE_KEY'])" 2>/dev/null || true)
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
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); echo -e "\r    ✗ ${CURRENT_IT}  ← $1"; }

# -- Login --
echo ""
echo "  PWA scroll & sticky headers"

$AB close 2>/dev/null || true

EMAIL="alex@example.com"
RESPONSE=$(curl -s -X POST "${SUPABASE_API}/auth/v1/admin/generate_link" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"magiclink\",\"email\":\"${EMAIL}\",\"data\":{}}")

ACTION_LINK=$(echo "$RESPONSE" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('action_link') or d.get('properties',{}).get('action_link',''))" \
  2>/dev/null || echo "")
if [[ -z "$ACTION_LINK" ]]; then
  echo "ERROR: Could not generate magic link"
  exit 1
fi
ACTION_LINK=$(echo "$ACTION_LINK" | sed "s|redirect_to=[^&]*|redirect_to=${BASE_URL}|g")

$AB open "$ACTION_LINK" --timeout 30000
$AB wait --load networkidle --timeout 30000
$AB wait 3000
$AB wait --load networkidle --timeout 15000

# Set mobile viewport to simulate iPhone 15 Pro (393x852)
$AB set viewport 393 852
$AB wait 500

# Remove react-grab overlay if present (dev-only, blocks pointer events)
$AB eval "document.querySelectorAll('[data-react-grab]').forEach(el => el.remove())" 2>/dev/null || true
$AB wait 200

# -- Helpers --
click_tab() {
  local label="$1"
  $AB eval "(() => { \
    const btns = document.querySelectorAll('button[aria-label]'); \
    for (const b of btns) { if (b.getAttribute('aria-label') === '$label') { b.click(); return; } } \
  })()"
  $AB wait 800
}

# ═══════════════════════════════════════════════════════════════════
# TEST GROUP 1: Events tab structural checks
# ═══════════════════════════════════════════════════════════════════

click_tab "Events"

# 1a. The events title bar must have a sticky-positioned parent
it "Events title bar has a sticky parent"
POS=$($AB eval "(() => { \
  const el = document.querySelector('[data-testid=\"events-title-bar\"]'); \
  if (!el) return 0; \
  return getComputedStyle(el.parentElement).position === 'sticky' ? 1 : 0; \
})()" 2>/dev/null || echo "0")

if [[ "$POS" == "1" ]]; then
  pass
else
  fail "parent position='${POS}' (expected 'sticky')"
fi

# 1b. The events tab root must NOT use min-h-screen
it "Events tab root does not use min-h-screen"
HAS_MINH=$($AB eval "(() => { \
  const main = document.querySelector('main'); \
  const tabRoot = main.firstElementChild; \
  return tabRoot.classList.contains('min-h-screen'); \
})()" 2>/dev/null || echo "error")

if [[ "$HAS_MINH" == "false" ]]; then
  pass
else
  fail "tab root still has min-h-screen class"
fi

# ═══════════════════════════════════════════════════════════════════
# TEST GROUP 2: Events sticky header stays at top after scroll
# ═══════════════════════════════════════════════════════════════════

# Find the sticky header element (the parent of events-title-bar after fix)
# Inject a tall spacer to force overflow, scroll, then check position.

it "Events sticky header stays at top after scroll"

# Inject spacer, scroll, measure sticky header position
TOP=$($AB eval "(() => { \
  const main = document.querySelector('main'); \
  const tabRoot = main.firstElementChild; \
  const spacer = document.createElement('div'); \
  spacer.id = '__test_spacer'; \
  spacer.style.cssText = 'height:5000px;flex-shrink:0'; \
  tabRoot.appendChild(spacer); \
  main.scrollTo(0, 300); \
  void main.offsetHeight; \
  const titleBar = document.querySelector('[data-testid=\"events-title-bar\"]'); \
  const stickyHeader = titleBar.parentElement; \
  const top = Math.round(stickyHeader.getBoundingClientRect().top); \
  spacer.remove(); \
  main.scrollTo(0, 0); \
  return top; \
})()" 2>/dev/null || echo "-999")

if [[ "$TOP" =~ ^-?[0-9]+$ ]] && [[ "$TOP" -ge -5 ]]; then
  pass
else
  fail "header top=${TOP}px after scroll (expected >= -5)"
fi

# ═══════════════════════════════════════════════════════════════════
# TEST GROUP 3: No unnecessary scroll on short-content tabs
# ═══════════════════════════════════════════════════════════════════

for TAB in "Home" "Splits" "Settings"; do
  it "${TAB} tab has no unnecessary vertical scroll"

  click_tab "$TAB"

  EXCESS=$($AB eval "(() => { \
    const main = document.querySelector('main'); \
    return main.scrollHeight - main.clientHeight; \
  })()" 2>/dev/null || echo "999")

  # Allow up to 2px tolerance for sub-pixel rounding
  if [[ "$EXCESS" =~ ^-?[0-9]+$ ]] && [[ "$EXCESS" -le 2 ]]; then
    pass
  else
    fail "scroll excess=${EXCESS}px (expected <= 2)"
  fi
done

# -- Summary --
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo "  Results: ${PASS_COUNT} passed, ${FAIL_COUNT} failed (${TOTAL} total)"

$AB close 2>/dev/null || true
exit $FAIL_COUNT
