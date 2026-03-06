# Crunch Time - Design Walkthrough Transcript

> **Note:** This transcript is from a verbal walkthrough of the Magic Patterns design. It is INCOMPLETE — the conversation was cut short. Use it as supplementary context alongside the actual design files from Magic Patterns MCP, which are the authoritative source.

## Transcript

This is the Crunch Time app. When you enter, you enter on the first tab for the homepage.

Up top, you'll see the Crunch Fund — the total amount. The minimum hits 0 because the fund will never be below zero.

After that there's a CTA to "Add Transaction." When you click it, it opens up a new card to add transactions. You can say whether it's an **expense** or a **fine**:

### Expense Flow
- Who paid for it
- How you want to split:
  - Pay from the fund
  - Pay directly out of pocket

### Fine Flow
- Select the challenge (that ended up here)
- Select who is getting fined
- The amount
- Status: paid or unpaid
- Comments (e.g., "someone only got 4 instead of 6 abs")

### Recent Transactions
Below the CTA, it shows the 3 most recent transactions. Clicking on a transaction opens a transaction card showing what happened in that transaction.

There's a "View All Activity" button that takes you to the Activity tab (also the 2nd tab on the bottom).

### Activity Tab
More like a news feed — shows all recent events.

At the very top: a **search bar** to search for transactions.

There's a **notification/priority section** that shows up if there's anything priority, like someone owing a fine.

**Priority items include:**
- Unpaid transactions
- Open, ongoing polls that someone needs to respond to
- Upcoming RSVP events that they did not RSVP to
- (Priority ordering: recency-based, potentially more criteria TBD)

### Events Tab
"This is where all the features live."
- Schedule feature mentioned
- (Transcript cut off here — full details in Magic Patterns design)

## Known Features (mentioned but not fully described)
- Challenges system (tied to fines)
- Polls
- RSVP events
- Schedule
