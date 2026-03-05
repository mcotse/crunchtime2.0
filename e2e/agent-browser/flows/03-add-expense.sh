#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Add Expense"

login_as "Alex"
go_to_tab "Home"

test_open_add_transaction() {
  it "opens Add Transaction sheet"
  click_text "Add Transaction"
  $AB wait 1000
  if assert_text_visible "New Transaction"; then
    pass
  else
    fail "Add Transaction sheet did not open"
  fi
}
run_test test_open_add_transaction

test_default_type_expense() {
  it "defaults to Expense type"
  if assert_text_visible "DESCRIPTION" && assert_text_visible "PAID BY"; then
    pass
  else
    fail "Expense form not shown by default"
  fi
}
run_test test_default_type_expense

test_fill_expense_form() {
  it "fills description and amount"
  fill_input "What's it for?" "Test Lunch"
  $AB wait 500
  fill_input '$0.00' "25.00"
  $AB wait 500
  if assert_text_visible "Test Lunch"; then
    pass
  else
    fail "Could not fill expense form"
  fi
}
run_test test_fill_expense_form

test_select_payer() {
  it "selects a payer"
  click_text "Select member"
  $AB wait 500
  click_text "Alex"
  $AB wait 500
  if assert_text_visible "Alex"; then
    pass
  else
    fail "Could not select payer"
  fi
}
run_test test_select_payer

test_submit_expense() {
  it "submits the expense"
  click_text "Add Expense"
  $AB wait 2000
  wait_for_network
  if assert_text_visible "CRUNCH FUND" || assert_text_visible "Home"; then
    pass
  else
    fail "Sheet did not close after submission"
  fi
}
run_test test_submit_expense

test_expense_in_activity() {
  it "shows new expense in activity"
  $AB wait 1000
  if assert_text_visible "Test Lunch"; then
    pass
  else
    go_to_tab "Activity"
    $AB wait 1000
    if assert_text_visible "Test Lunch"; then
      pass
    else
      fail "New expense not found in activity"
    fi
  fi
}
run_test test_expense_in_activity

summary
