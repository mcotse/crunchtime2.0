#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Transaction Detail"

login_as "Alex"

test_open_transaction_detail() {
  it "opens a transaction detail from home"
  go_to_tab "Home"
  $AB wait 1000
  click_text "Team Dinner"
  $AB wait 1500
  if assert_text_visible "Pool Expense" || assert_text_visible "Direct Split" || assert_text_visible "Fine"; then
    pass
  else
    fail "Transaction detail did not show type badge"
  fi
}
run_test test_open_transaction_detail

test_detail_shows_description() {
  it "shows transaction description and amount"
  if assert_text_visible "Team Dinner" && assert_text_visible "180"; then
    pass
  else
    fail "Description or amount not visible"
  fi
}
run_test test_detail_shows_description

test_detail_shows_splits() {
  it "shows split section"
  if assert_text_visible "SPLIT"; then
    pass
  else
    fail "Split section not visible"
  fi
}
run_test test_detail_shows_splits

test_split_editor() {
  it "opens split editor"
  click_text "Edit"
  $AB wait 1000
  if assert_text_visible "Equal" || assert_text_visible "Custom" || assert_text_visible "Save Split"; then
    pass
  else
    fail "Split editor did not open"
  fi
  $AB press Escape
  $AB wait 500
}
run_test test_split_editor

summary
