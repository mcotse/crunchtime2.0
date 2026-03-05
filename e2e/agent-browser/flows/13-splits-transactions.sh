#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../helpers.sh"

describe "Splits Transactions"

login_as "Alex"
go_to_tab "Splits"

test_heading() {
  it "shows Splits heading"
  if assert_text_visible "Splits"; then
    pass
  else
    fail "Splits heading not visible"
  fi
}
run_test test_heading

test_transactions_segment() {
  it "shows Transactions segment active"
  if assert_text_visible "Transactions" && assert_text_visible "TOTAL SPENT"; then
    pass
  else
    fail "Transactions segment not shown"
  fi
}
run_test test_transactions_segment

test_transaction_list() {
  it "shows transaction descriptions"
  if assert_text_visible "Team Dinner" || assert_text_visible "Bowling" || assert_text_visible "Coffee"; then
    pass
  else
    fail "Transaction descriptions not visible"
  fi
}
run_test test_transaction_list

test_tap_transaction_detail() {
  it "tap opens transaction detail"
  click_text "Team Dinner"
  $AB wait 1500
  if assert_text_visible "SPLIT" || assert_text_visible "Pool Expense" || assert_text_visible "180"; then
    pass
  else
    fail "Transaction detail did not open"
  fi
  $AB press Escape
  $AB wait 500
}
run_test test_tap_transaction_detail

summary
