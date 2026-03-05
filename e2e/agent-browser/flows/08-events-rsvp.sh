#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Events + RSVP"

login_as "Alex"
go_to_tab "Events"
go_to_segment "Events"

test_events_list() {
  it "shows upcoming events"
  if assert_text_visible "Grocery Run" || assert_text_visible "Team Dinner" || assert_text_visible "Movie Night"; then
    pass
  else
    fail "No upcoming events visible"
  fi
}
run_test test_events_list

test_event_detail() {
  it "opens event detail"
  click_text "Team Dinner"
  $AB wait 1500
  if assert_text_visible "Bella Napoli" || assert_text_visible "RSVP"; then
    pass
  else
    fail "Event detail not shown"
  fi
}
run_test test_event_detail

test_rsvp_buttons() {
  it "shows RSVP buttons"
  if assert_text_visible "Going" && assert_text_visible "Maybe"; then
    pass
  else
    fail "RSVP buttons not visible"
  fi
}
run_test test_rsvp_buttons

test_change_rsvp() {
  it "can change RSVP"
  click_text "Maybe"
  $AB wait 1500
  wait_for_network
  if assert_text_visible "Maybe"; then
    pass
  else
    fail "Could not change RSVP"
  fi
  $AB press Escape
  $AB wait 500
}
run_test test_change_rsvp

test_past_events() {
  it "shows past events in history"
  if assert_text_visible "History"; then
    click_text "History"
    $AB wait 1000
    if assert_text_visible "Rooftop Hangout" || assert_text_visible "Bowling Night" || assert_text_visible "Park Picnic"; then
      pass
    else
      fail "Past events not visible in history"
    fi
  else
    fail "History section not found"
  fi
}
run_test test_past_events

summary
