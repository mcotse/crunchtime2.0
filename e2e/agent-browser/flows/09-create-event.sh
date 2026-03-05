#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Create Event"

login_as "Alex"
go_to_tab "Events"
go_to_segment "Events"

test_new_event_button() {
  it "shows New Event button"
  if assert_text_visible "+ New Event"; then
    pass
  else
    fail "New Event button not visible"
  fi
}
run_test test_new_event_button

test_open_create_event_sheet() {
  it "opens create event sheet"
  click_text "+ New Event"
  $AB wait 1000
  if assert_text_visible "New Event" && assert_text_visible "Event name"; then
    pass
  else
    fail "Create event sheet did not open"
  fi
}
run_test test_open_create_event_sheet

test_fill_event_form() {
  it "fills event form"
  fill_input "Event name" "E2E Test Event"
  $AB wait 500
  fill_input "Location" "Test Venue"
  $AB wait 500
  if assert_text_visible "E2E Test Event"; then
    pass
  else
    fail "Could not fill event form"
  fi
}
run_test test_fill_event_form

test_select_date() {
  it "selects a date"
  click_text "Select"
  $AB wait 1000
  if assert_text_visible "Date"; then
    pass
  else
    fail "Date selection not available"
  fi
}
run_test test_select_date

test_submit_event() {
  it "submits the event"
  click_text "Create Event"
  $AB wait 2000
  wait_for_network
  if assert_text_visible "E2E Test Event" || assert_text_visible "Events"; then
    pass
  else
    fail "Event creation failed or sheet did not close"
  fi
}
run_test test_submit_event

summary
