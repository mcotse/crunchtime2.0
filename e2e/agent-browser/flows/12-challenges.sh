#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Challenges"

login_as "Alex"
go_to_tab "Events"
go_to_segment "Challenges"

test_active_challenge() {
  it "shows active challenge"
  if assert_text_visible "Six-Pack Challenge"; then
    pass
  else
    fail "Active challenge not visible"
  fi
}
run_test test_active_challenge

test_upcoming_challenge() {
  it "shows upcoming challenge"
  if assert_text_visible "Early Bird Challenge"; then
    pass
  else
    fail "Upcoming challenge not visible"
  fi
}
run_test test_upcoming_challenge

test_open_challenge_detail() {
  it "opens challenge detail"
  click_text "Six-Pack Challenge"
  $AB wait 1500
  if assert_text_visible "Active" && (assert_text_visible "40" || assert_text_visible "If you fail"); then
    pass
  else
    fail "Challenge detail not shown"
  fi
}
run_test test_open_challenge_detail

test_participants() {
  it "shows participants"
  if assert_text_visible "participating"; then
    pass
  else
    fail "Participants section not visible"
  fi
}
run_test test_participants

test_comments_section() {
  it "shows comments section"
  if assert_text_visible "COMMENTS" || assert_text_visible "Add a comment"; then
    pass
  else
    fail "Comments section not visible"
  fi
  $AB press Escape
  $AB wait 500
}
run_test test_comments_section

test_completed_challenge() {
  it "shows completed challenge in history"
  if assert_text_visible "History"; then
    click_text "History"
    $AB wait 1000
    if assert_text_visible "No-Spend November"; then
      pass
    else
      fail "Completed challenge not in history"
    fi
  else
    fail "History section not visible"
  fi
}
run_test test_completed_challenge

summary
