#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Add Fine"

login_as "Alex"
go_to_tab "Home"

test_open_fine_form() {
  it "opens transaction sheet and switches to Fine type"
  click_text "Add Transaction"
  $AB wait 1000
  click_exact_text "Fine"
  $AB wait 500
  if assert_text_visible "FINED MEMBER" && assert_text_visible "CHALLENGE"; then
    pass
  else
    fail "Fine form not shown"
  fi
}
run_test test_open_fine_form

test_select_challenge() {
  it "selects a challenge"
  click_text "CHALLENGE"
  $AB wait 500
  click_text "Six-Pack Challenge"
  $AB wait 500
  if assert_text_visible "Six-Pack Challenge"; then
    pass
  else
    fail "Could not select challenge"
  fi
}
run_test test_select_challenge

test_select_fined_member() {
  it "selects a fined member"
  click_text "FINED MEMBER"
  $AB wait 500
  click_text "David"
  $AB wait 500
  if assert_text_visible "David"; then
    pass
  else
    fail "Could not select fined member"
  fi
}
run_test test_select_fined_member

test_submit_fine() {
  it "submits the fine"
  click_text "Add Fine"
  $AB wait 2000
  wait_for_network
  if assert_text_visible "CRUNCH FUND" || assert_text_visible "Home"; then
    pass
  else
    fail "Fine sheet did not close after submission"
  fi
}
run_test test_submit_fine

summary
