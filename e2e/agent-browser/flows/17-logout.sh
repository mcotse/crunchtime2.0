#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Logout"

login_as "Alex"

test_logout_button() {
  it "shows Log Out button in Settings"
  go_to_tab "Settings"
  if assert_text_visible "Log Out"; then
    pass
  else
    fail "Log Out button not visible"
  fi
}
run_test test_logout_button

test_logout_redirects() {
  it "clicking Log Out shows login page"
  click_text "Log Out"
  $AB wait 3000
  wait_for_network
  if assert_text_visible "Crunch Time" && assert_text_visible "Send Magic Link"; then
    pass
  else
    fail "Did not return to login page after logout"
  fi
}
run_test test_logout_redirects

test_cannot_access_after_logout() {
  it "cannot access app after logout"
  $AB reload
  $AB wait 3000
  wait_for_network
  if assert_text_visible "Crunch Time" && assert_text_visible "Send Magic Link"; then
    pass
  else
    fail "App accessible after logout"
  fi
}
run_test test_cannot_access_after_logout

summary
