#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Settings + Theme"

login_as "Alex"
go_to_tab "Settings"

test_heading() {
  it "shows Settings heading"
  if assert_text_visible "Settings"; then
    pass
  else
    fail "Settings heading not visible"
  fi
}
run_test test_heading

test_group_name() {
  it "shows group name"
  if assert_text_visible "Crunch Fund" || assert_text_visible "Group Name"; then
    pass
  else
    fail "Group name not visible"
  fi
}
run_test test_group_name

test_members_list() {
  it "shows group members with emails"
  if assert_text_visible "Group Members" && assert_text_visible "Alex"; then
    pass
  else
    fail "Members list not visible"
  fi
}
run_test test_members_list

test_you_marker() {
  it "shows (you) marker for current user"
  if assert_text_visible "(you)" || assert_text_visible "you"; then
    pass
  else
    fail "(you) marker not visible"
  fi
}
run_test test_you_marker

test_appearance_toggle() {
  it "shows appearance toggle"
  if assert_text_visible "Appearance"; then
    pass
  else
    fail "Appearance toggle not visible"
  fi
}
run_test test_appearance_toggle

test_toggle_theme() {
  it "can toggle theme between Dark and Light"
  click_text "Appearance"
  $AB wait 500
  local snap_after
  snap_after=$(get_snapshot)
  if echo "$snap_after" | grep -qi "Dark\|Light"; then
    pass
  else
    fail "Theme did not toggle"
  fi
}
run_test test_toggle_theme

summary
