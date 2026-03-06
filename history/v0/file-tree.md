# Proposed File Structure

```
src/
  app/                              # Next.js App Router
    layout.tsx                      # Root layout (providers, fonts, theme)
    (tabs)/                         # Tab-based layout group
      layout.tsx                    # Tab layout with TabBar
      home/
        page.tsx                    # Home Tab
      activity/
        page.tsx                    # Activity/Feed Tab
      events/
        page.tsx                    # Events Tab (4-mode segmented)
      splits/
        page.tsx                    # Splits Tab
      settings/
        page.tsx                    # Settings Tab
    login/
      page.tsx                      # Login page (TBD based on auth choice)

  components/
    ui/                             # Design system primitives
      Button.tsx
      Input.tsx
      SectionLabel.tsx
      PillToggle.tsx
      SegmentedControl.tsx

    layout/                         # Structural components
      TabBar.tsx
      BottomSheet.tsx               # Base bottom sheet (scrim, slide-up, drag handle)
      AppShell.tsx                  # Max-width wrapper, theme class

    shared/                         # Reusable domain components
      AvatarStack.tsx
      MemberAvatar.tsx
      MemberSelector.tsx            # CompactMemberSelector + MemberChecklist + MemberRadioList
      TransactionIconChip.tsx
      FeedEntryRow.tsx
      CountingBalance.tsx
      CalendarPicker.tsx
      EventOverflowMenu.tsx

    sheets/                         # Bottom sheet modals
      AddTransactionSheet.tsx
      TransactionDetailSheet.tsx
      SplitEditorSheet.tsx
      EventDetailSheet.tsx
      CreateEventSheet.tsx
      DayDetailSheet.tsx
      PollDetailSheet.tsx
      CreatePollSheet.tsx
      ChallengeDetailSheet.tsx
      NotificationsSheet.tsx

    home/                           # Home tab specific
      HeroSection.tsx
      StatCards.tsx
      RecentTransactions.tsx

    activity/                       # Activity tab specific
      FeedSection.tsx
      SearchBar.tsx

    events/                         # Events tab sub-modes
      UpcomingModeSection.tsx
      AvailabilityModeSection.tsx
      PollsModeSection.tsx
      ChallengesModeSection.tsx
      AvailabilityCell.tsx
      BestDatesSection.tsx
      EventDateChipCard.tsx
      EventListItem.tsx
      ChallengeCard.tsx
      PollCard.tsx

    settings/                       # Settings tab specific
      AppearanceToggle.tsx
      MemberDirectory.tsx
      AdminSection.tsx
      InstallInstructions.tsx

  lib/
    supabase/
      client.ts                     # Browser Supabase client
      server.ts                     # Server Supabase client
      middleware.ts                 # Auth middleware
    queries/
      transactions.ts               # Transaction CRUD + derived calculations
      events.ts                     # Event CRUD + RSVP operations
      polls.ts                      # Poll CRUD + voting + comments
      challenges.ts                 # Challenge queries + join
      availability.ts               # Calendar availability toggle + best slots
      members.ts                    # Member queries
    hooks/
      useTransactions.ts            # React Query hook for transactions
      useEvents.ts                  # React Query hook for events
      usePolls.ts                   # React Query hook for polls
      useChallenges.ts              # React Query hook for challenges
      useAvailability.ts            # React Query hook for calendar availability
      useMembers.ts                 # React Query hook for members
      useCurrentUser.ts             # Auth/user context hook
      useCrunchFund.ts              # Derived fund balance hook
    utils/
      tintHelper.ts                 # Theme-aware tint color helpers
      formatters.ts                 # Currency, date, time, relative timestamp formatters
      eventFormHelpers.ts           # Auto-emoji, time parsing, calendar math
      constants.ts                  # EQX easing, transition configs, emoji options

  types/
    index.ts                        # Barrel export
    member.ts                       # Member, GroupMember types
    transaction.ts                  # Transaction, TransactionSplit types
    event.ts                        # GroupEvent, EventRSVP types
    poll.ts                         # Poll, PollOption, PollComment types
    challenge.ts                    # Challenge types
    calendar.ts                     # CalendarAvailability, DayAvailability types

supabase/
  config.toml                       # Supabase local config
  migrations/
    00001_create_members.sql
    00002_create_groups.sql
    00003_create_challenges.sql
    00004_create_transactions.sql
    00005_create_events.sql
    00006_create_polls.sql
    00007_create_calendar_availability.sql
    00008_create_rls_policies.sql
  seed.sql                          # Seed data (12 members, 3 challenges, 15 transactions, 8 events, 6 polls)

public/
  manifest.json                     # PWA manifest
  icons/                            # PWA icons

tests/
  components/
    ui/
      Button.test.tsx
      Input.test.tsx
    shared/
      AvatarStack.test.tsx
    sheets/
      AddTransactionSheet.test.tsx
  lib/
    utils/
      formatters.test.ts
      tintHelper.test.ts
      eventFormHelpers.test.ts
  setup.ts                          # Test setup (vitest)
```

## Key Architectural Decisions

1. **Next.js App Router** with route groups `(tabs)` for the tab-based navigation
2. **Supabase** for database, auth, and real-time subscriptions
3. **React Query** (via hooks) for server state management with optimistic updates
4. **Framer Motion** for all animations (sheets, staggered lists, drag-to-dismiss)
5. **CSS custom properties** for the EQX design system tokens (dark/light via class toggle)
6. **Tailwind CSS v3** for utility-first styling
7. **Component colocation**: Screen-specific components live in their feature folder, shared components in `shared/`
8. **Bottom sheets as a pattern**: All modals are bottom sheets with consistent slide-up + scrim behavior, extracted into a base `BottomSheet` component
9. **Type-safe data layer**: TypeScript types in `types/` match Supabase schema, queries return typed results
