#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Splits Balances"

login_as "Alex"
go_to_tab "Splits"
go_to_segment "Balances"

test_balances_view() {
  it "shows balances view"
  if assert_text_visible "CRUNCH FUND" && assert_text_visible "CONTRIBUTIONS"; then
    pass
  else
    fail "Balances view not shown"
  fi
}
run_test test_balances_view

test_member_names() {
  it "shows member names"
  if assert_text_visible "Alex" || assert_text_visible "Sarah" || assert_text_visible "Mike"; then
    pass
  else
    fail "Member names not visible"
  fi
}
run_test test_member_names

test_you_marker() {
  it "shows (you) marker for current user"
  if assert_text_visible "(you)" || assert_text_visible "you"; then
    pass
  else
    fail "(you) marker not visible"
  fi
}
run_test test_you_marker

test_fund_activity() {
  it "shows fund activity section"
  if assert_text_visible "FUND ACTIVITY"; then
    pass
  else
    fail "Fund activity section not visible"
  fi
}
run_test test_fund_activity

summary
