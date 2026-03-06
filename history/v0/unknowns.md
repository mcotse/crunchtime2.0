# Unknowns & Questions

## Critical (blocks implementation)

- [ ] **Authentication provider**: What auth method should be used? (Supabase Auth with magic link? OAuth? Email/password?) The design has no login/signup screens.
- [ ] **Multi-group support**: The design shows a single group context. Should the app support multiple groups per user, or is it always one group? This affects the entire data model and routing.
- [ ] **Real-time requirements**: Should transactions, RSVPs, poll votes, and availability updates be real-time (Supabase Realtime subscriptions) or polling/refresh-based?
- [ ] **CalendarTab import**: `BudgetApp.tsx` imports a `CalendarTab` component that doesn't exist in the file listing. Was this removed intentionally? The Events tab's Schedule mode seems to replace it.
- [ ] **SplitsTab data source**: The SplitsTab currently uses entirely hardcoded mock data internally (not props). Should it wire into the same transactions/members data as the rest of the app, or is it a separate feature?
- [ ] **Notification bell wiring**: The `onOpenNotifications` and `hasUnread` props are passed to FeedTab but never used in its rendering. Should the Activity tab header have a notification bell like other tabs?

## Important (affects quality)

- [ ] **Challenge creation flow**: There is no UI for creating new challenges. The ChallengeDetailSheet has "Join Challenge" but no "Create Challenge" sheet exists. Should challenges be created from polls, or is a separate creation flow needed?
- [ ] **Event comments persistence**: EventDetailSheet comments are local state (not saved). Same for ChallengeDetailSheet comments (seeded from mock data). Should comments be persisted to the database?
- [ ] **Transaction edit flow**: TransactionDetailSheet shows edit history but there's no "Edit Transaction" sheet. Can users edit existing transactions, or is the history from a future feature?
- [ ] **Proxy RSVP behavior**: When a user RSVPs on behalf of another member (proxyFor), does the proxied member see this in their own view? Can they override it?
- [ ] **Fine collection mechanism**: How are fines actually collected? The app tracks paid/unpaid status, but is there a payment integration, or is it honor-system with admin confirmation?
- [ ] **Overage debt (member.balance)**: The Member type has a `balance` field for overage debt, but it's initialized to 0 for all members and never updated in the prototype. What's the intended flow for tracking and settling overage debts?
- [ ] **Maps link behavior**: `locationMapsQuery` on events enables a tappable maps link. Should this open Apple Maps, Google Maps, or use a universal link?
- [ ] **Push notifications**: The Settings admin can "broadcast" a notification via textarea, but there's no push notification infrastructure. Is this intended for future implementation, or should it be a simulated feature?
- [ ] **Poll-to-Challenge pipeline**: Challenge has `createdFromPollId` and `linkedPollId`. The PollDetailSheet has "Create Event from winner" but no "Create Challenge from poll" flow. Is the challenge creation from polls a separate workflow?

## Nice to Know (can default if no answer)

- [ ] **Member invite flow**: How do new members join a group? There's no invite UI in the design. Default: assume members are pre-seeded or invited via external link.
- [ ] **Currency**: The app appears USD-only. Should other currencies be supported? Default: USD only.
- [ ] **Time zone handling**: Poll expiration uses PST explicitly (`T23:59:59-08:00`). Should the app handle multiple time zones? Default: use user's local timezone for display, store UTC.
- [ ] **Offline support**: As a PWA (install instructions in Settings), should the app work offline? Default: online-only with graceful error states.
- [ ] **Image/photo support**: No image upload is visible in the design. Should events or transactions support photo attachments? Default: no.
- [ ] **Member profile editing**: Settings shows member details (phone, email) but no edit UI. Can members edit their own profile? Default: admin-managed.
- [ ] **Expense categories**: The Transaction type has an optional `category` field with emoji mappings (Food, Housing, Entertainment, etc.) but it's only used in TransactionDetailSheet display. Should the AddTransactionSheet have a category picker? Default: no, keep it simple.
- [ ] **Event capacity/limits**: No capacity limits visible in the design. Should events support a max attendee count? Default: no limit.
- [ ] **Pagination**: The Activity feed and transaction lists load all data. Should pagination or infinite scroll be implemented for large groups? Default: load all, optimize later if needed.
- [ ] **Search scope**: Activity feed search only filters by title. Should it also search by member name, amount, or date? Default: title-only to match the prototype.
- [ ] **Accessibility**: The design uses aria-label and aria-current on the TabBar. What level of accessibility compliance is targeted? Default: basic ARIA attributes matching the prototype.
- [ ] **Desktop/tablet layout**: The app is max-w-md (mobile-first). Should there be responsive layouts for larger screens? Default: centered mobile layout on all viewports.
