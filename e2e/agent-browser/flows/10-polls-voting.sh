#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Polls + Voting"

login_as "Alex"
go_to_tab "Events"
go_to_segment "Polls"

test_poll_list() {
  it "shows poll list"
  if assert_text_visible "team dinner" || assert_text_visible "streaming" || assert_text_visible "check-in" || assert_text_visible "fund name"; then
    pass
  else
    fail "No polls visible"
  fi
}
run_test test_poll_list

test_open_poll_detail() {
  it "opens poll detail"
  click_text "team dinner"
  $AB wait 1500
  if assert_text_visible "Italian" || assert_text_visible "Japanese" || assert_text_visible "Choose one" || assert_text_visible "voted"; then
    pass
  else
    fail "Poll detail not shown"
  fi
}
run_test test_open_poll_detail

test_poll_options_visible() {
  it "shows poll options"
  if assert_text_visible "Italian" && assert_text_visible "Japanese"; then
    pass
  else
    fail "Poll options not visible"
  fi
}
run_test test_poll_options_visible

test_cast_vote() {
  it "can cast a vote"
  click_text "Japanese"
  $AB wait 1500
  wait_for_network
  if assert_text_visible "voted"; then
    pass
  else
    fail "Vote was not registered"
  fi
}
run_test test_cast_vote

test_close_and_check_multi() {
  $AB press Escape
  $AB wait 500
}
run_test test_close_and_check_multi

test_multi_select_poll() {
  it "multi-select poll shows Select all that apply"
  click_text "streaming"
  $AB wait 1500
  if assert_text_visible "Select all that apply"; then
    pass
  else
    if assert_text_visible "voted"; then
      pass
    else
      fail "Multi-select poll detail not shown"
    fi
  fi
  $AB press Escape
  $AB wait 500
}
run_test test_multi_select_poll

summary
