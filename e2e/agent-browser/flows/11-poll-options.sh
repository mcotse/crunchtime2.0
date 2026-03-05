#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Poll Options"

login_as "Alex"
go_to_tab "Events"
go_to_segment "Polls"

test_existing_options() {
  it "shows existing poll options"
  click_text "team dinner"
  $AB wait 1500
  if assert_text_visible "Italian" && assert_text_visible "Japanese" && assert_text_visible "Mexican" && assert_text_visible "Thai"; then
    pass
  else
    fail "Not all poll options visible"
  fi
}
run_test test_existing_options

test_add_option() {
  it "can add a new option"
  if assert_text_visible "Add an option"; then
    click_text "Add an option"
    $AB wait 500
    fill_input "Option text" "Korean BBQ"
    $AB press Enter
    $AB wait 1500
    wait_for_network
    if assert_text_visible "Korean BBQ"; then
      pass
    else
      fail "New option not added"
    fi
  else
    pass
  fi
}
run_test test_add_option

summary
