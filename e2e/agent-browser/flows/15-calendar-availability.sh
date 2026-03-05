#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Calendar Availability"

login_as "Alex"
go_to_tab "Events"
go_to_segment "Schedule"

test_calendar_visible() {
  it "shows calendar grid"
  if assert_text_visible "S" && assert_text_visible "M" && assert_text_visible "T"; then
    pass
  else
    fail "Calendar grid not visible"
  fi
}
run_test test_calendar_visible

test_best_dates() {
  it "shows best dates section"
  if assert_text_visible "BEST DATES THIS MONTH" || assert_text_visible "free"; then
    pass
  else
    fail "Best dates section not visible"
  fi
}
run_test test_best_dates

test_tap_date_opens_detail() {
  it "tap date opens day detail sheet"
  click_text "15"
  $AB wait 1500
  if assert_text_visible "Available this day" || assert_text_visible "available" || assert_text_visible "EVENTS"; then
    pass
  else
    fail "Day detail sheet did not open"
  fi
}
run_test test_tap_date_opens_detail

test_availability_toggle() {
  it "shows availability toggle"
  if assert_text_visible "Available this day" || assert_text_visible "available"; then
    pass
  else
    fail "Availability toggle not visible"
  fi
  $AB press Escape
  $AB wait 500
}
run_test test_availability_toggle

summary
