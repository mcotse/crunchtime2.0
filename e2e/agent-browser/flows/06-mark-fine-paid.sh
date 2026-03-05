#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Mark Fine Paid"

login_as "Alex"

test_find_pending_fine() {
  it "finds a pending fine in Activity > Needs Attention"
  go_to_tab "Activity"
  $AB wait 1000
  if assert_text_visible "Needs Attention"; then
    pass
  else
    fail "Needs Attention section not visible"
  fi
}
run_test test_find_pending_fine

test_open_pending_fine() {
  it "opens the pending fine detail"
  click_text "Missed day 8"
  $AB wait 1500
  if assert_text_visible "Pending" && assert_text_visible "Fine"; then
    pass
  else
    fail "Pending fine detail not shown"
  fi
}
run_test test_open_pending_fine

test_mark_paid() {
  it "clicks Mark paid and verifies status changes"
  click_text "Mark paid"
  $AB wait 2000
  wait_for_network
  if assert_text_visible "Paid"; then
    pass
  else
    fail "Fine status did not change to Paid"
  fi
}
run_test test_mark_paid

summary
