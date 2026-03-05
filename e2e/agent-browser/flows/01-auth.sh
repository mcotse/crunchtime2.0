#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Auth Flow"

test_login_renders() {
  it "shows login page with Crunch Time heading"
  setup
  if assert_text_visible "Crunch Time" && assert_text_visible "Sign in to your group fund"; then
    pass
  else
    fail "Login page did not render expected text"
  fi
}
run_test test_login_renders

test_login_alex() {
  it "logs in as Alex and shows main app"
  login_as "Alex"
  if assert_text_visible "Home" && assert_text_visible "Activity"; then
    pass
  else
    fail "Main app tabs not visible after login"
  fi
}
run_test test_login_alex

test_login_sarah() {
  it "logs in as Sarah (different member)"
  login_as "Sarah"
  if assert_text_visible "Home" && assert_text_visible "Settings"; then
    pass
  else
    fail "Could not log in as Sarah"
  fi
}
run_test test_login_sarah

test_unauthenticated() {
  it "shows login page when not authenticated"
  $AB close 2>/dev/null || true
  setup
  if assert_text_visible "Crunch Time" && assert_text_visible "Send Magic Link"; then
    pass
  else
    fail "Login page not shown for unauthenticated user"
  fi
}
run_test test_unauthenticated

summary
