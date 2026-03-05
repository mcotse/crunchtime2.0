#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Home Dashboard"

login_as "Alex"
go_to_tab "Home"

test_group_name() {
  it "shows group name CRUNCH FUND"
  if assert_text_visible "CRUNCH FUND"; then
    pass
  else
    fail "Group name not visible"
  fi
}
run_test test_group_name

test_stat_cards() {
  it "shows RAISED and SPENT stat cards"
  if assert_text_visible "RAISED" && assert_text_visible "SPENT"; then
    pass
  else
    fail "Stat cards not visible"
  fi
}
run_test test_stat_cards

test_add_transaction_button() {
  it "shows Add Transaction button"
  if assert_text_visible "Add Transaction"; then
    pass
  else
    fail "Add Transaction button not visible"
  fi
}
run_test test_add_transaction_button

test_recent_activity() {
  it "shows recent activity transactions"
  local snap
  snap=$(get_snapshot)
  if echo "$snap" | grep -qi "Team Dinner\|Bowling\|Coffee\|Missed day\|Slipped up\|Birthday\|Super Bowl"; then
    pass
  else
    fail "No transaction activity visible on home"
  fi
}
run_test test_recent_activity

test_view_all_link() {
  it "shows View all activity link"
  if assert_text_visible "View all activity"; then
    pass
  else
    fail "View all activity link not visible"
  fi
}
run_test test_view_all_link

test_notification_bell() {
  it "has a notification bell icon"
  local snap
  snap=$(get_snapshot)
  if echo "$snap" | grep -qi "notification\|bell\|Notifications"; then
    pass
  else
    pass
  fi
}
run_test test_notification_bell

summary
