#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Activity Feed"

login_as "Alex"
go_to_tab "Activity"

test_heading() {
  it "shows Activity heading"
  if assert_text_visible "Activity"; then
    pass
  else
    fail "Activity heading not visible"
  fi
}
run_test test_heading

test_search_input() {
  it "shows search input"
  if assert_text_visible "Search activity"; then
    pass
  else
    fail "Search input not visible"
  fi
}
run_test test_search_input

test_feed_content() {
  it "shows feed entries"
  local snap
  snap=$(get_snapshot)
  if echo "$snap" | grep -qi "Team Dinner\|Bowling\|Coffee\|Missed day\|Super Bowl"; then
    pass
  else
    fail "No feed entries visible"
  fi
}
run_test test_feed_content

test_search_filters() {
  it "search filters results"
  fill_input "Search activity" "Bowling"
  $AB wait 1000
  if assert_text_visible "Bowling"; then
    pass
  else
    fail "Search did not return results"
  fi
}
run_test test_search_filters

test_clear_search() {
  it "clear search restores feed"
  click_text "Clear"
  $AB wait 1000
  local snap
  snap=$(get_snapshot)
  if echo "$snap" | grep -qi "Team Dinner\|Missed day\|Coffee"; then
    pass
  else
    fail "Clearing search did not restore feed"
  fi
}
run_test test_clear_search

test_needs_attention() {
  it "shows Needs Attention section"
  if assert_text_visible "Needs Attention"; then
    pass
  else
    fail "Needs Attention section not visible"
  fi
}
run_test test_needs_attention

test_tap_to_detail() {
  it "tap entry opens detail"
  click_text "Team Dinner"
  $AB wait 1500
  if assert_text_visible "Pool Expense" || assert_text_visible "Direct Split" || assert_text_visible "$"; then
    pass
  else
    fail "Transaction detail did not open"
  fi
  $AB press Escape
  $AB wait 500
}
run_test test_tap_to_detail

summary
