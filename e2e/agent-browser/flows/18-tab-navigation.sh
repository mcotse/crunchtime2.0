#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Tab Navigation"

login_as "Alex"

test_home_tab() {
  it "Home tab shows dashboard"
  go_to_tab "Home"
  if assert_text_visible "CRUNCH FUND"; then
    pass
  else
    fail "Home tab content not visible"
  fi
}
run_test test_home_tab

test_activity_tab() {
  it "Activity tab shows feed"
  go_to_tab "Activity"
  if assert_text_visible "Activity" && assert_text_visible "Search activity"; then
    pass
  else
    fail "Activity tab content not visible"
  fi
}
run_test test_activity_tab

test_events_tab() {
  it "Events tab shows events"
  go_to_tab "Events"
  if assert_text_visible "Events" && (assert_text_visible "Schedule" || assert_text_visible "Polls" || assert_text_visible "Challenges"); then
    pass
  else
    fail "Events tab content not visible"
  fi
}
run_test test_events_tab

test_splits_tab() {
  it "Splits tab shows splits"
  go_to_tab "Splits"
  if assert_text_visible "Splits" && (assert_text_visible "Transactions" || assert_text_visible "Balances"); then
    pass
  else
    fail "Splits tab content not visible"
  fi
}
run_test test_splits_tab

test_settings_tab() {
  it "Settings tab shows settings"
  go_to_tab "Settings"
  if assert_text_visible "Settings" && assert_text_visible "Log Out"; then
    pass
  else
    fail "Settings tab content not visible"
  fi
}
run_test test_settings_tab

test_rapid_switching() {
  it "rapid tab switching works"
  go_to_tab "Home"
  go_to_tab "Events"
  go_to_tab "Splits"
  go_to_tab "Activity"
  go_to_tab "Settings"
  go_to_tab "Home"
  if assert_text_visible "CRUNCH FUND"; then
    pass
  else
    fail "Rapid switching broke the UI"
  fi
}
run_test test_rapid_switching

summary
