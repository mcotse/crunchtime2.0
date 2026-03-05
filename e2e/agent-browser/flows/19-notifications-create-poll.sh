#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Notifications + Create Poll"

login_as "Alex"
go_to_tab "Home"

test_open_notifications() {
  it "bell icon opens notifications sheet"
  local snap
  snap=$($AB snapshot)
  if echo "$snap" | grep -qi "bell\|notification"; then
    $AB find role button click --name "notifications" 2>/dev/null || \
    $AB find role button click --name "Notifications" 2>/dev/null || \
    click_text "Notifications" 2>/dev/null || true
    $AB wait 1500
  fi
  if assert_text_visible "Notifications" || assert_text_visible "PENDING FINES" || assert_text_visible "UPCOMING EVENTS"; then
    pass
  else
    fail "Notifications sheet did not open"
  fi
}
run_test test_open_notifications

test_pending_fines_section() {
  it "shows pending fines in notifications"
  if assert_text_visible "PENDING FINES"; then
    pass
  else
    fail "Pending fines section not visible"
  fi
}
run_test test_pending_fines_section

test_upcoming_events_section() {
  it "shows upcoming events in notifications"
  if assert_text_visible "UPCOMING EVENTS"; then
    pass
  else
    fail "Upcoming events section not visible"
  fi
  $AB press Escape
  $AB wait 500
}
run_test test_upcoming_events_section

test_open_create_poll() {
  it "opens create poll sheet"
  go_to_tab "Events"
  go_to_segment "Polls"
  click_text "+ New Poll"
  $AB wait 1000
  if assert_text_visible "Create Poll"; then
    pass
  else
    fail "Create poll sheet did not open"
  fi
}
run_test test_open_create_poll

test_poll_form_elements() {
  it "shows poll form with question, options, settings"
  if assert_text_visible "QUESTION" && assert_text_visible "OPTIONS" && assert_text_visible "SETTINGS"; then
    pass
  else
    fail "Poll form elements missing"
  fi
}
run_test test_poll_form_elements

test_fill_poll_form() {
  it "fills poll question and options"
  fill_input "Ask the group something..." "Where to eat Friday?"
  $AB wait 500
  fill_input "Option 1" "Pizza Place"
  $AB wait 300
  fill_input "Option 2" "Taco Shop"
  $AB wait 300
  if assert_text_visible "Pizza Place"; then
    pass
  else
    fail "Could not fill poll form"
  fi
}
run_test test_fill_poll_form

test_poll_toggles() {
  it "shows settings toggles"
  if assert_text_visible "Members can add options" && assert_text_visible "Allow multiple selections"; then
    pass
  else
    fail "Settings toggles not visible"
  fi
}
run_test test_poll_toggles

test_submit_poll() {
  it "submits the poll"
  click_text "Create Poll"
  $AB wait 2000
  wait_for_network
  if assert_text_visible "Where to eat Friday?" || assert_text_visible "Polls"; then
    pass
  else
    fail "Poll creation failed"
  fi
}
run_test test_submit_poll

summary
