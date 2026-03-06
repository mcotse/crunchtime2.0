# Crunch Time — App Specification

## Overview

Crunch Time is a mobile-first friend group fund management app. It allows friend groups to pool money through challenges (accountability bets with financial stakes), track shared expenses, manage event logistics (RSVPs, availability scheduling), and run group polls for decision-making. The app is built around a "Crunch Fund" — a shared pool funded by fines from failed challenges — which can be spent on group activities.

The design is a dark-mode-first PWA with a premium, restrained aesthetic using a custom "EQX" design system. It features 5 main tabs (Home, Activity, Events, Splits, Settings), numerous bottom sheet modals, and rich animations via Framer Motion.

## Screens

### Home Tab
- **Route:** /home (tab: `home`)
- **States:**
  - Populated: Shows hero balance with counting animation, stat cards, and 3 most recent transactions
  - Empty: "No transactions yet" message in place of transaction list
  - Animated entrance: Every element staggers in with opacity/y entrance animations (delays 0s–0.64s)
  - Counting animation: Hero balance animates from $0 to target over 1.2s
- **Components used:** CountingBalance (internal), TransactionIconChip (internal), Button
- **Data requirements:**
  - `crunchFundBalance` (derived from transactions)
  - `totalFinesCollected` (sum of paid fines)
  - `totalChallengeSpend` (sum of challenge-funded expenses)
  - `pendingFinesCount`
  - `transactions` (sorted, sliced to 3 most recent)
  - `members` (for name/avatar lookup)
  - `groupName`
- **Interactions:**
  - "Add Transaction" button -> opens AddTransactionSheet
  - Tap transaction row -> opens TransactionDetailSheet
  - "View all activity" -> switches to Activity tab
- **Animations:**
  - Hero gradient background (CSS fixed, `--eqx-hero-gradient`)
  - Counting balance (framer-motion animate() + useMotionValue)
  - Staggered fade-in for all sections (0s to 0.64s delays)
  - Active press states: `active:opacity-[0.88]`
- **Navigation:** Activity tab (via "View all"), AddTransactionSheet, TransactionDetailSheet, NotificationsSheet

### Activity Tab (Feed)
- **Route:** /activity (tab: `feed`)
- **States:**
  - Populated: Two sections — "Needs Attention" and "Recent" (grouped by date buckets)
  - All Caught Up: Green CheckCircle + "You're all caught up" when no attention items
  - Search Active: Flat search results view replacing two-section layout
  - Search No Results: "No results for '{query}'"
  - Empty: Only "Needs Attention" label with "all caught up" message
- **Components used:** FeedEntryRow (internal), TypeIconChip (internal), SectionLabel
- **Data requirements:**
  - `transactions` (all, for building feed entries)
  - `members` (name lookup)
  - `events` (for RSVP group entries)
  - `challenges` (for lookup)
  - `currentUserId` (for "Needs Attention" filtering)
- **Interactions:**
  - Search bar with clear button (filters by title, case-insensitive)
  - Tap feed entry -> opens TransactionDetailSheet or EventDetailSheet
- **Animations:**
  - Search/normal crossfade (AnimatePresence mode="wait")
  - Staggered feed rows (opacity + y, 30ms stagger, 250ms cap)
  - Clear button scale animation
- **Navigation:** TransactionDetailSheet, EventDetailSheet
- **Business Logic — "Needs Attention":**
  - Fine with `fineStatus === 'pending'`
  - RSVP group for event where currentUser has NOT RSVP'd
- **Feed Entry Types:**
  - `fine`: FlameIcon (coral), "{Name} . $X fine" or "{Name} settled a $X fine"
  - `expense`: DollarSignIcon (mint), "{Name} split {desc} . $X"
  - `challenge_expense`: TrophyIcon (orange), "{Name} logged {desc} . $X"
  - `rsvp_group`: CalendarIcon (mint), "{Name(s)} RSVP'd to {event}"

### Events Tab
- **Route:** /events (tab: `events`)
- **States:** 4 sub-modes via segmented control
- **Components used:** UpcomingModeSection, AvailabilityModeSection, PollsModeSection, ChallengesModeSection, segmented control
- **Data requirements:** events, availability, members, challenges, polls, transactions
- **Interactions:**
  - 4-segment control: Schedule, Events, Polls, Challenges
  - "New Event" button (Events mode only)
  - "New Poll" button (Polls mode only)
- **Animations:** Segment switching with AnimatePresence mode="wait", button fade-in with scale
- **Navigation:** CreateEventSheet, EventDetailSheet, PollDetailSheet, ChallengeDetailSheet

#### Events > Schedule (Availability Mode)
- **States:**
  - Calendar grid with colored availability dots
  - Best Dates ranking section (top 3, expandable to 10)
  - Empty best dates: "No availability yet"
- **Interactions:**
  - Tap calendar cell -> toggle own availability
  - Long press (500ms) -> open DayDetailSheet
  - Tap best date row -> expand member detail
  - "Create Event" in expanded best date
  - Prev/next month navigation
- **Animations:** Month transition, progress bar animation, staggered cell entrance

#### Events > Events (Upcoming Mode)
- **States:**
  - Empty: Calendar icon + "Nothing planned yet"
  - Populated: EventDateChipCards with inline RSVP
  - History section (collapsible): past + archived events as EventListItems
- **Interactions:**
  - Tap event card -> EventDetailSheet
  - Inline RSVP buttons on cards
  - History expand/collapse

#### Events > Polls (Polls Mode)
- **States:**
  - Empty: Inbox icon + "No open polls"
  - Populated: PollCards for active polls
  - History section (collapsible): closed + archived polls
- **Interactions:**
  - Tap poll card -> PollDetailSheet
  - Inline voting on PollCards
  - History expand/collapse

#### Events > Challenges (Challenges Mode)
- **States:**
  - Empty: "No active challenges"
  - Populated: ChallengeCards for active challenges
  - History section (collapsible): completed challenges as compact rows
- **Interactions:**
  - Tap challenge card -> ChallengeDetailSheet
  - History expand/collapse

### Splits Tab
- **Route:** /splits (tab: `splits`)
- **States:**
  - Transactions sub-tab (default): stat header + date-grouped transaction list
  - Balances sub-tab: Crunch Fund total + Fund Activity list
- **Components used:** SegmentButton (internal), TransactionDetailSheet, AddTransactionSheet
- **Data requirements:**
  - Mock `SplitTransaction[]` (hardcoded in prototype)
  - Mock `FundActivityItem[]` (hardcoded in prototype)
- **Interactions:**
  - Segmented control: Transactions / Balances
  - "+ Add Expense" button -> AddTransactionSheet
  - Tap transaction row -> TransactionDetailSheet
  - Tap fund activity row -> TransactionDetailSheet
- **Animations:** Sub-tab crossfade, staggered row entrance
- **Navigation:** TransactionDetailSheet, AddTransactionSheet
- **Note:** Currently uses hardcoded mock data internally rather than props

### Settings Tab
- **Route:** /settings (tab: `settings`)
- **States:**
  - Default: All accordion sections collapsed
  - Member selected: Detail panel expanded with phone/email
  - Various accordion states: Install, Group Name editing, Notifications, Changelog
  - Admin vs non-admin: Admin section hidden for non-admins
- **Components used:** Toggle button, accordion sections
- **Data requirements:** members, groupName, isDark, isAdmin
- **Interactions:**
  - Dark/light mode toggle
  - Member avatar horizontal scroll + tap to select/deselect
  - "Install Crunch Time" accordion (4 PWA steps)
  - Admin: Group name inline edit (Enter/Escape)
  - Admin: Broadcast notification textarea + Send button
  - Admin: Changelog accordion
  - Log Out button (visual only, no handler)
- **Animations:** Accordion expand/collapse (220-240ms), chevron rotation, member detail fade
- **Navigation:** None (terminal screen)

### AddTransactionSheet
- **Route:** Modal (z-index: 50-51)
- **States:**
  - Expense tab: amount, description, paid-by, split-among, funding source (direct/fund)
  - Fine tab: challenge selector, fined member, amount, status toggle, optional note
  - Fund section expanded: shows challenge pool balance + overage preview
  - Note collapsed/expanded (Fine form)
- **Components used:** HeroAmountInput, PillToggle, CompactMemberSelector, MemberChecklist, MemberRadioList, SectionLabel
- **Data requirements:** members, challenges (active), transactions (for pool balance calc)
- **Interactions:**
  - Expense/Fine pill toggle
  - Hero amount input (decimal-filtered)
  - Paid-by selector (collapsible)
  - Split-among multi-select with Select All
  - Funding source toggle (direct/from fund) — only shown if active challenges exist
  - Challenge pills, fine status toggle (unpaid/paid)
  - Note expansion
  - "Add Expense" / "Add Fine" CTA
- **Animations:** Sheet slide-up (0.32s), tab crossfade, fund section expand, scrim fade
- **Business Logic:**
  - Pool balance = getCrunchFundBalance(transactions, challengeId)
  - Overage preview when amount > pool balance
  - Fine amount auto-populates from selected challenge's fineAmount
  - Eligible members filtered by challenge participantIds

### TransactionDetailSheet
- **Route:** Modal (z-index: 68-70)
- **States:**
  - Fine Pending: Coral "Pending" badge, admin "Mark paid" button
  - Fine Paid: Mint "Paid" badge, amount in mint
  - Expense Direct Split: No pool coverage section
  - Expense Pool: Pool coverage breakdown (fully covered vs overage)
  - Has splits: Per-person breakdown
  - Has linked event: Tappable event row
  - Has edit history: Chronological edit list
- **Data requirements:** transaction, members, events, challenges, transactions (for pool calc)
- **Interactions:**
  - Close button, scrim dismiss
  - Linked event row -> EventDetailSheet
  - "Mark paid" (admin) -> marks fine paid
  - "Edit" split link -> SplitEditorSheet
- **Navigation:** EventDetailSheet, SplitEditorSheet

### SplitEditorSheet
- **Route:** Modal (z-index: 78-80, highest)
- **States:**
  - Equal mode: All included members get equal share (read-only display)
  - Custom mode: Editable numeric input per member
  - Balanced: Mint progress bar, Save enabled
  - Over-allocated: Coral bar, "$X.XX over", Save disabled
  - Under-allocated: Orange bar, "$X.XX remaining", Save disabled
- **Data requirements:** transaction, event (for RSVP-based initialization), members
- **Interactions:**
  - Equal/Custom mode toggle
  - Member toggle checkboxes (payer always checked)
  - Custom amount inputs
  - "Save Split" button (disabled when unbalanced)
- **Business Logic:**
  - Initialize from existing splits, event RSVPs, or payer-only
  - Balance validation: diff < $0.02 is considered balanced

### EventDetailSheet
- **Route:** Modal (spring animation, drag-to-dismiss)
- **States:**
  - Future event: RSVP pills active, "More options" for guests/proxy
  - Past event: Static RSVP display, Expenses section visible
  - Attendees collapsed/expanded (2-column grid)
  - Comments section with local state
- **Data requirements:** event, members, transactions, currentUserId, isAdmin
- **Interactions:**
  - 3 RSVP pills (Going/Maybe/Can't go) with whileTap scale
  - Guest count stepper (+/-)
  - Proxy RSVP member chips
  - Attendees row expand/collapse
  - Edit button (creator/admin) -> CreateEventSheet edit mode
  - Archive/Delete buttons (admin)
  - Expenses button (past events) -> AddTransactionSheet
  - Comment input + send
  - Drag-to-dismiss (120px offset or 500px/s velocity)
- **Navigation:** CreateEventSheet (edit), AddTransactionSheet

### CreateEventSheet
- **Route:** Modal (z-index standard)
- **States:**
  - Create mode: "New Event" title, "Create Event" CTA
  - Edit mode: "Edit Event" title, "Save Changes" CTA (when initialEvent provided)
  - Emoji picker collapsed/expanded (7 quick-pick emojis)
  - Calendar picker collapsed/expanded
  - Transaction picker collapsed/expanded
- **Data requirements:** transactions (for linking), currentUserId
- **Interactions:**
  - Emoji badge (OS emoji keyboard) + quick-pick row
  - Title input (auto-emoji based on keywords)
  - CalendarPicker (inline)
  - Time input (flexible parsing: "7pm", "10:30", "1430")
  - AM/PM toggle
  - Location input + maps link toggle
  - Description textarea
  - Transaction linking with search
- **Validation:** Title and date required
- **Auto-Emoji Keywords:** dinner/party/gym/movie/coffee/home/travel

### PollDetailSheet
- **Route:** Modal (spring animation, drag-to-dismiss)
- **States:**
  - Open poll: Green "Open" pill, options clickable, add option available
  - Closed poll: Gray "Closed" pill, options disabled
  - Archived: Same as closed, archive button becomes "Unarchive"
  - Single winner (closed): Winner banner with trophy + "Create Event" button
  - Multi-select vs single-select voting
  - Add option input (expandable)
  - Comments section
- **Data requirements:** poll, members, currentUserId, isAdmin
- **Interactions:**
  - Vote on options (single/multi-select)
  - Add option (if allowed)
  - Archive/Unarchive (creator or admin)
  - Delete (admin only, coral button)
  - "Create Event" from winner
  - Comment input + send, delete own comments
  - Drag-to-dismiss
- **Navigation:** CreateEventSheet (via "Create Event from winner")

### CreatePollSheet
- **Route:** Modal
- **States:**
  - Empty form, validation errors, unsaved changes dialog
  - Minimum 2 options (delete buttons hidden at 2)
  - Settings toggles: "Members can add options" (default ON), "Allow multiple selections" (default OFF)
- **Data requirements:** currentUserId
- **Interactions:**
  - Question input (auto-focused)
  - Dynamic option list (add/remove)
  - Settings toggles
  - Optional expiration date (closes at 11:59:59 PM PST)
  - "Create Poll" with validation
  - Unsaved changes confirmation dialog

### ChallengeDetailSheet
- **Route:** Modal
- **States:**
  - Active: Mint "Active" pill, progress bar, stakes row, "Join" unavailable
  - Upcoming: Orange "Upcoming" pill, "+ Join Challenge" CTA (if not participant)
  - Completed: Tertiary "Completed" pill, outcome pills (passed/collected)
  - Linked poll row (conditional)
  - Comments thread with seeded sample comments
- **Data requirements:** challenge, members, transactions, polls, currentUserId
- **Interactions:**
  - Linked poll -> navigates to Polls tab
  - "+ Join Challenge" (upcoming, non-participant)
  - Comment input + send
- **Navigation:** Polls tab (via linked poll)

### NotificationsSheet
- **Route:** Modal (z-index: 58-60)
- **States:**
  - No pending fines: Green CheckCircle + "No outstanding fines"
  - Has pending fines: List with admin "Paid" action buttons
  - No upcoming events: Calendar icon + "No upcoming events"
  - Has upcoming events: Up to 3 upcoming events
- **Data requirements:** transactions, members, challenges, events, currentUserId, isAdmin
- **Interactions:**
  - Admin: "Paid" button per pending fine
  - Close button
- **Note:** Events are display-only (not tappable)

### DayDetailSheet
- **Route:** Modal
- **States:**
  - Future date: Availability toggle, event list, member chips
  - Past date: "Past date — view only", toggle disabled
  - Overflow members (>6): "+N more" chip
- **Data requirements:** dateStr, availability, members, events, currentUserId
- **Interactions:**
  - Availability toggle (future dates only)
  - Tap event card -> EventDetailSheet
- **Navigation:** EventDetailSheet

### CalendarPicker
- **Route:** Inline component (used within CreateEventSheet)
- **States:** No selection, date selected, today highlight, overflow days
- **Interactions:** Prev/next month navigation, day cell tap

## Shared Components

### TabBar
- **Props:** `activeTab: string`, `onTabChange: (tab: string) => void`
- **Tabs:** home, feed (Activity), events, splits, settings
- **Icons:** HomeIcon, ClockIcon, CalendarIcon, CreditCardIcon, SettingsIcon
- **Active indicator:** Top bar (28px wide, primary color) + primary-colored icon/label
- **Usage:** Fixed bottom bar on all screens

### Button
- **Props:** Extends `ButtonHTMLAttributes` with `variant` and `size`
- **Variants:** primary (filled), secondary (outlined primary), outline (hairline), ghost (transparent), danger (coral outline)
- **Sizes:** sm (36px), md (44px), lg (56px), icon (44x44)
- **Usage:** All CTAs throughout the app

### Input
- **Props:** Extends `InputHTMLAttributes` with `label`, `error`, `inputRef`
- **States:** Default, focused (primary border), error (coral border + message)
- **Style:** Underline-only (bottom border), transparent background
- **Usage:** CreatePollSheet, settings forms

### SectionLabel
- **Props:** `children: ReactNode`, `error?: boolean`
- **States:** Default (secondary color), error (coral)
- **Style:** 13px, uppercase, tracking-widest
- **Usage:** Throughout all forms and list sections

### AvatarStack
- **Props:** `memberIds: string[]`, `members: Member[]`, `max?: number` (default 5)
- **Style:** 20x20px circles, -6px overlap, overflow "+N" badge
- **Usage:** EventListItem, ChallengeCard, EventDetailSheet

### EventOverflowMenu
- **Props:** `event: GroupEvent`, `onArchive`, `onUnarchive`
- **Behavior:** Three-dot menu with click-outside dismiss, single Archive/Unarchive item
- **Usage:** EventListItem

### EventDateChipCard
- **Props:** event, members, currentUserId, index, onOpen, onArchive, onUnarchive, onRsvp
- **Features:** Date chip (month+day), inline RSVP buttons, event metadata
- **Usage:** UpcomingModeSection

### EventListItem
- **Props:** event, members, currentUserId, index, onOpen, onArchive, onUnarchive, muted
- **Features:** Compact card with RSVP status pill, avatar stack, overflow menu
- **Usage:** UpcomingModeSection (history), past/archived events

### ChallengeCard
- **Props:** challenge, members, transactions, currentUserId, index, onOpen, muted
- **Features:** Progress bar, participant avatars with fine dots, stake pill
- **Usage:** ChallengesModeSection

### PollCard
- **Props:** poll, members, currentUserId, onTap, onVote, index, isHistory
- **Features:** Top 3 options with progress bars, inline voting, status pill, expiry label
- **Usage:** PollsModeSection, PollsTab

### tintHelper
- **Exports:** `tintBg(color, darkPct, lightPct, base?)`, `tintRgba(r, g, b, darkAlpha, lightAlpha)`
- **Purpose:** Theme-aware semi-transparent color generation using CSS `color-mix()` and `rgba()`
- **Usage:** Throughout for tinted backgrounds/borders on status pills, icon chips, RSVP buttons

## Design System

### Colors/Tokens (CSS Custom Properties)
**Dark mode (default):**
| Token | Value | Usage |
|-------|-------|-------|
| `--eqx-base` | #0A0A0A | Page background |
| `--eqx-surface` | #121212 | Card/sheet backgrounds |
| `--eqx-raised` | #1A1A1A | Elevated surface (inputs, badges) |
| `--eqx-primary` | #F5F6F6 | Primary text, primary fills |
| `--eqx-secondary` | #A8A8A8 | Secondary text, labels |
| `--eqx-tertiary` | #6E6E6E | Muted/placeholder text, icons |
| `--eqx-hairline` | #2A2A2A | Borders, dividers |
| `--eqx-mint` | #84EFB6 | Positive/confirmed (going, paid, available) |
| `--eqx-coral` | #ED6A67 | Negative/danger (fines, unpaid, can't go) |
| `--eqx-orange` | #FE9E6D | Warning/neutral (maybe, challenges, upcoming) |
| `--eqx-periwinkle` | #7F8DE0 | Default avatar fallback |
| `--eqx-cyan` | #44C2DD | Accent (minimal usage) |
| `--eqx-hero-gradient` | linear-gradient(180deg, #5B310D 0%, #0A0A0A 55%) | Home hero background |

**Light mode** (`.light` class on html):
- Inverted base/primary, adjusted accent colors for contrast
- Hero gradient uses orange-tinted overlay

### Typography
- **Font:** DM Sans (Google Fonts), system fallbacks
- **Scale:** 10px (tab labels), 11px (section labels), 13px (captions/body), 14px (comments), 15px (body/buttons), 16px (large buttons/titles), 20px (sheet titles), 22px (event detail title), 28px (hero emoji), 48px (hero balance)
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Special:** `font-variant-numeric: tabular-nums` for currency alignment

### Spacing System
- Consistent use of Tailwind spacing: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `px-5` (20px), `px-6` (24px)
- Card padding: typically `p-4` (16px) or `p-5` (20px)
- Section spacing: `space-y-3` to `space-y-6`

### Border Radius
- Full pills: `rounded-full` (buttons, pills, avatars)
- Cards: `rounded-[20px]` to `rounded-[24px]`
- Inner elements: `rounded-[14px]`
- Sheets: `rounded-t-[28px]` to `rounded-t-[32px]`

### Animation System
- **Easing:** `cubic-bezier(0.2, 0.0, 0.0, 1.0)` — fast-in, slow-out (branded as "EQX easing")
- **Library:** Framer Motion for all explicit animations
- **Sheet transitions:** 320ms slide-up with EQX easing
- **Spring physics:** `damping: 32, stiffness: 320` (EventDetailSheet, PollDetailSheet)
- **Drag-to-dismiss:** 120px offset or 500px/s velocity threshold
- **Stagger pattern:** `index * 0.03–0.06`, capped at 200-250ms total
- **Press feedback:** `active:opacity-[0.88]` to `active:opacity-[0.92]` (CSS), `whileTap: { scale: 0.88–0.96 }` (Framer)
- **Global CSS transitions:** `color, background-color, border-color, opacity` at 200ms with EQX easing

### Component Library
- **UI Framework:** Custom components (not shadcn/MUI) with Tailwind CSS v3
- **Icons:** lucide-react (named with `Icon` suffix)
- **Animations:** Framer Motion (`motion`, `AnimatePresence`, `useDragControls`)
- **Theming:** CSS custom properties with class-based dark/light toggle

## Data Model (Inferred)

### Tables

#### `members`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `name` | text, NOT NULL | Full display name |
| `initials` | text | Two-letter avatar initials |
| `phone` | text | |
| `email` | text, UNIQUE | |
| `color` | text | Hex color for avatar |
| `balance` | numeric, DEFAULT 0 | Overage debt |
| `created_at` | timestamptz | |

#### `groups`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `name` | text, NOT NULL | Group display name (e.g., "Crunch Fund") |
| `created_by` | uuid, FK -> members | Admin/creator |
| `created_at` | timestamptz | |

#### `group_members`
| Field | Type | Notes |
|-------|------|-------|
| `group_id` | uuid, FK -> groups | |
| `member_id` | uuid, FK -> members | |
| `role` | text | 'admin' or 'member' |
| `joined_at` | timestamptz | |

#### `challenges`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `group_id` | uuid, FK -> groups | |
| `name` | text, NOT NULL | |
| `emoji` | text | Single emoji |
| `description` | text | |
| `start_date` | date | |
| `end_date` | date | |
| `fine_amount` | numeric, NOT NULL | Dollar amount per violation |
| `status` | text | 'active', 'upcoming', 'completed' |
| `created_from_poll_id` | uuid, FK -> polls, NULLABLE | |
| `created_at` | timestamptz | |

#### `challenge_participants`
| Field | Type | Notes |
|-------|------|-------|
| `challenge_id` | uuid, FK -> challenges | |
| `member_id` | uuid, FK -> members | |
| `joined_at` | timestamptz | |

#### `transactions`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `group_id` | uuid, FK -> groups | |
| `description` | text | |
| `amount` | numeric, NOT NULL | Always positive |
| `member_id` | uuid, FK -> members | Who paid/owes |
| `date` | timestamptz | |
| `type` | text, NOT NULL | 'fine' or 'expense' |
| `funding_source` | text | 'challenge' or 'direct' |
| `challenge_id` | uuid, FK -> challenges, NULLABLE | |
| `fine_status` | text | 'paid' or 'pending' (fines only) |
| `category` | text | 'Food', 'Entertainment', etc. |
| `split_locked` | boolean, DEFAULT false | |
| `created_at` | timestamptz | |

#### `transaction_splits`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `transaction_id` | uuid, FK -> transactions | |
| `member_id` | uuid, FK -> members | |
| `share` | numeric, NOT NULL | Dollar portion |
| `is_payer` | boolean, DEFAULT false | |
| `guest_shares` | integer, DEFAULT 0 | |

#### `transaction_attendees`
| Field | Type | Notes |
|-------|------|-------|
| `transaction_id` | uuid, FK -> transactions | |
| `member_id` | uuid, FK -> members | |

#### `transaction_edit_history`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `transaction_id` | uuid, FK -> transactions | |
| `edited_by` | uuid, FK -> members | |
| `edited_at` | timestamptz | |
| `change` | text | Description of change |

#### `events`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `group_id` | uuid, FK -> groups | |
| `title` | text, NOT NULL | |
| `description` | text | |
| `date_str` | date | |
| `time` | time | 24hr format |
| `location` | text | |
| `location_maps_query` | text | For maps link |
| `creator_id` | uuid, FK -> members | |
| `cover_emoji` | text | |
| `is_archived` | boolean, DEFAULT false | |
| `linked_transaction_id` | uuid, FK -> transactions, NULLABLE | |
| `created_at` | timestamptz | |

#### `event_rsvps`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `event_id` | uuid, FK -> events | |
| `member_id` | uuid, FK -> members | |
| `status` | text, NOT NULL | 'going', 'maybe', 'not_going' |
| `guest_count` | integer, DEFAULT 0 | |
| `updated_at` | timestamptz | |

#### `event_rsvp_proxies`
| Field | Type | Notes |
|-------|------|-------|
| `rsvp_id` | uuid, FK -> event_rsvps | |
| `proxy_member_id` | uuid, FK -> members | Member being RSVP'd on behalf of |

#### `event_expenses`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `event_id` | uuid, FK -> events | |
| `description` | text | |
| `amount` | numeric | |

#### `polls`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `group_id` | uuid, FK -> groups | |
| `title` | text, NOT NULL | |
| `creator_id` | uuid, FK -> members | |
| `expires_at` | timestamptz, NULLABLE | |
| `is_archived` | boolean, DEFAULT false | |
| `archived_at` | timestamptz, NULLABLE | |
| `allow_members_to_add_options` | boolean, DEFAULT true | |
| `allow_multi_select` | boolean, DEFAULT false | |
| `created_at` | timestamptz | |

#### `poll_options`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `poll_id` | uuid, FK -> polls | |
| `text` | text, NOT NULL | |
| `created_at` | timestamptz | |

#### `poll_votes`
| Field | Type | Notes |
|-------|------|-------|
| `poll_id` | uuid, FK -> polls | |
| `option_id` | uuid, FK -> poll_options | |
| `member_id` | uuid, FK -> members | |
| `voted_at` | timestamptz | |

#### `poll_comments`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `poll_id` | uuid, FK -> polls | |
| `member_id` | uuid, FK -> members | |
| `text` | text, NOT NULL | |
| `created_at` | timestamptz | |
| `edited_at` | timestamptz, NULLABLE | |

#### `calendar_availability`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid, PK | |
| `group_id` | uuid, FK -> groups | |
| `date` | date, NOT NULL | |
| `member_id` | uuid, FK -> members | |
| `created_at` | timestamptz | |

### Relationships
- Member belongs to many Groups (via group_members)
- Challenge belongs to Group, has many Participants (via challenge_participants)
- Transaction belongs to Group, Member; optionally linked to Challenge
- Transaction has many Splits, Attendees, EditHistory entries
- Event belongs to Group, Creator (Member); optionally linked to Transaction
- Event has many RSVPs, each RSVP may have Proxies
- Poll belongs to Group, Creator; has many Options, Comments
- PollOption has many Votes (member_id + option_id)
- CalendarAvailability links Members to dates within a Group
- Challenge can be linked to a Poll (created_from_poll_id)

## API Routes (Inferred)

### Transactions
- **GET /api/transactions** — List all transactions for a group
  - Query params: `group_id`, `search?`, `limit?`
  - Response: `Transaction[]` with member, challenge lookups
  - Used by: HomeTab, FeedTab, SplitsTab

- **POST /api/transactions** — Create a new transaction
  - Body: `{ type, description, amount, memberId, fundingSource?, challengeId?, fineStatus?, splits?, attendees? }`
  - Response: `Transaction`
  - Used by: AddTransactionSheet

- **PATCH /api/transactions/:id/splits** — Update transaction splits
  - Body: `{ splits: TransactionSplit[] }`
  - Response: `Transaction`
  - Used by: SplitEditorSheet

- **PATCH /api/transactions/:id/fine-status** — Mark fine as paid
  - Body: `{ fineStatus: 'paid' }`
  - Response: `Transaction`
  - Used by: NotificationsSheet, TransactionDetailSheet

### Events
- **GET /api/events** — List all events for a group
  - Response: `GroupEvent[]`
  - Used by: EventsTab, FeedTab, HomeTab

- **POST /api/events** — Create a new event
  - Body: `{ title, emoji, dateStr?, time?, location?, description?, linkedTransactionId? }`
  - Response: `GroupEvent`
  - Used by: CreateEventSheet

- **PUT /api/events/:id** — Update an event
  - Body: partial `GroupEvent` fields
  - Response: `GroupEvent`
  - Used by: CreateEventSheet (edit mode)

- **DELETE /api/events/:id** — Delete an event
  - Used by: EventDetailSheet

- **PATCH /api/events/:id/archive** — Archive/unarchive
  - Body: `{ isArchived: boolean }`
  - Used by: EventOverflowMenu, EventDetailSheet

- **POST /api/events/:id/rsvp** — Create or update RSVP
  - Body: `{ status, guestCount?, proxyFor? }`
  - Response: `EventRSVP`
  - Used by: EventDetailSheet, EventDateChipCard

### Polls
- **GET /api/polls** — List all polls for a group
  - Response: `Poll[]`
  - Used by: PollsTab, PollsModeSection

- **POST /api/polls** — Create a poll
  - Body: `{ title, options[], expiresAt?, allowMembersToAddOptions, allowMultiSelect }`
  - Response: `Poll`
  - Used by: CreatePollSheet

- **POST /api/polls/:id/vote** — Cast or update vote
  - Body: `{ optionIds: string[] }`
  - Used by: PollCard, PollDetailSheet

- **POST /api/polls/:id/options** — Add an option
  - Body: `{ text }`
  - Response: `PollOption`
  - Used by: PollDetailSheet

- **PATCH /api/polls/:id/archive** — Archive/unarchive
  - Body: `{ isArchived: boolean }`
  - Used by: PollDetailSheet

- **DELETE /api/polls/:id** — Delete a poll (admin)
  - Used by: PollDetailSheet

- **POST /api/polls/:id/comments** — Add comment
  - Body: `{ text }`
  - Used by: PollDetailSheet

- **DELETE /api/polls/:id/comments/:commentId** — Delete comment
  - Used by: PollDetailSheet

### Challenges
- **GET /api/challenges** — List challenges for a group
  - Response: `Challenge[]`
  - Used by: ChallengesModeSection, HomeTab

- **POST /api/challenges/:id/join** — Join an upcoming challenge
  - Used by: ChallengeDetailSheet

### Calendar Availability
- **GET /api/availability** — Get group availability for a date range
  - Query params: `group_id`, `start_date`, `end_date`
  - Response: `CalendarAvailability`
  - Used by: AvailabilityModeSection

- **POST /api/availability/toggle** — Toggle own availability for a date
  - Body: `{ date }`
  - Used by: AvailabilityModeSection, DayDetailSheet

### Settings
- **PATCH /api/groups/:id** — Update group name
  - Body: `{ name }`
  - Used by: SettingsTab

- **POST /api/groups/:id/broadcast** — Send broadcast notification
  - Body: `{ message }`
  - Used by: SettingsTab

## Authentication
- Single group context (no multi-group support visible in design)
- `currentUserId` passed as prop from root — implies auth session provides user identity
- `isAdmin` boolean controls admin-only features:
  - Mark fines as paid
  - Edit group name
  - Send broadcast notifications
  - Delete polls
  - Delete events
  - View changelog
- No login/signup screens in the design — auth is assumed handled externally
- Settings has a "Log Out" button (visual only, no handler wired)

## Business Rules

### Crunch Fund
- Fund balance = sum(paid fines) - sum(challenge-funded expenses)
- Fund balance minimum is $0 (displayed as $0 when negative)
- Each challenge has its own sub-pool (filterable by challengeId)

### Fines
- A fine is tied to a challenge and a member
- Fine amount defaults to the challenge's `fineAmount`
- Fine status: 'pending' or 'paid'
- Only admins can mark fines as paid
- Pending fines appear in "Needs Attention" on the Activity feed
- Pending fines appear in NotificationsSheet

### Expenses
- Two funding sources: 'direct' (split among members) or 'challenge' (from fund)
- Challenge-funded expenses draw from the challenge's pool
- If expense > pool balance, overage is split among attendees
- Splits can be Equal or Custom, must balance to total (within $0.02 tolerance)
- Payer is always included in split and cannot be unchecked

### Events
- Events can have: title, emoji, date, time, location (with optional maps link), description
- Events can be linked to a transaction
- RSVP statuses: going, maybe, not_going
- RSVP supports guest counts and proxy RSVPs (on behalf of other members)
- Events can be archived/unarchived
- Only admins can delete events
- Creator or admin can edit events
- Past events show an "Expenses" section
- Auto-emoji assignment based on title keywords

### Polls
- Polls have options, optional expiration date (closes at 11:59:59 PM PST)
- Single-select or multi-select voting
- Options can be added by members (if setting enabled)
- Expired polls are "Closed" — voting disabled
- Winning option (single, non-tie, closed) gets a winner banner with "Create Event" flow
- Polls can be archived/unarchived by creator or admin
- Only admins can delete polls
- Comments thread with relative timestamps

### Challenges
- Statuses: upcoming, active, completed
- Participants can join upcoming challenges
- Active challenges show progress bar (elapsed time / total duration)
- Completed challenges show pass/fail ratio and total fines collected
- Challenges can be linked to a poll (created from poll)
- Fined participants get a coral dot on their avatar in the challenge card

### Calendar Availability
- Members tap dates to toggle their availability
- Long-press opens day detail
- Past dates cannot be toggled
- "Best Dates" ranking shows dates with most availability
- Availability is displayed in the calendar with colored dots (mint = you're in, orange = others only)

### Notifications / Priority
- Notification bell shows unread dot when:
  - Pending fines exist
  - Upcoming events exist
- "Needs Attention" on Activity feed:
  - Pending fines
  - Events where current user hasn't RSVP'd
- Priority ordering: recency-based

### Z-Index Layering (Sheet Stacking)
| Sheet | Scrim z | Sheet z |
|-------|---------|---------|
| AddTransactionSheet | 50 | 51 |
| NotificationsSheet | 58 | 60 |
| TransactionDetailSheet | 68 | 70 |
| SplitEditorSheet | 78 | 80 |
| EventDetailSheet | Spring-based | Spring-based |
| PollDetailSheet | Spring-based | Spring-based |
