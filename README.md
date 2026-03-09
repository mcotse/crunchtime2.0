# Crunch Time 2.0

A mobile-first group fund management app for friend groups, teams, and clubs. Track shared expenses, split costs, manage fines from challenges, coordinate events, and run polls — all in one place.

**Current version:** 1.2.4

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, RLS)
- **Data Fetching:** TanStack React Query with optimistic updates
- **Haptics:** web-haptics for tactile feedback
- **Build:** Vite

## Features

- **Home Dashboard** — Fund balance with animated count-up, recent activity, quick actions
- **Activity Feed** — Filterable feed with staggered row animations, search with crossfade transitions
- **Transactions** — Add expenses and fines, split costs across members, edit history tracking
- **Challenges** — Group challenges with fines for non-completion, propose via polls
- **Events** — Create events, RSVP, availability calendar, location links, archive/unarchive
- **Polls** — Create polls with comments, multi-select support, vote tracking
- **Splits** — Per-member balance tracking with staggered row animations, fund activity detail
- **Settings** — Group management, dark/light mode, notifications, changelog with auto-versioning
- **Auth** — Password login via Supabase, row-level security on all tables
- **Realtime** — Live updates across all connected clients
- **Haptic Feedback** — Tactile feedback on interactions via web-haptics
- **PWA Support** — Installable with safe-area support for notched devices

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (for local Supabase)

### Setup

```bash
# Install dependencies
npm install

# Start local Supabase (runs PostgreSQL, Auth, Realtime, etc.)
npx supabase start

# Create .env.local with the keys from supabase start output
cat > .env.local << EOF
VITE_SUPABASE_URL=http://127.0.0.1:54331
VITE_SUPABASE_ANON_KEY=<your-publishable-key>
EOF

# Start dev server
npm run dev
```

### Local Dev URLs

| Service | URL |
|---------|-----|
| App | http://localhost:5173 |
| Supabase Studio | http://127.0.0.1:54333 |
| Mailpit (magic link emails) | http://127.0.0.1:54334 |

### Testing Locally

Use any seeded email (e.g. `alex@example.com`) to log in. Magic link emails appear in Mailpit.

## Project Structure

```
src/
  components/       # UI components (tabs, sheets, cards)
    events/         # Events sub-tab components (upcoming, availability, polls, challenges)
  hooks/            # React Query hooks for each domain
  data/             # Type definitions and mock data
  lib/              # Supabase client, query client
  pages/            # Top-level pages (LoginPage, BudgetApp)
supabase/
  migrations/       # SQL schema, RLS policies, triggers
  seed.sql          # Sample data (12 members, transactions, events, polls)
  config.toml       # Local Supabase configuration
```

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 1.2.4 | Mar 8 | Restore staggered row animations on Activity and Splits tabs |
| 1.2.3 | Mar 8 | Fix layout shift when switching between Events sub-tabs |
| 1.2.2 | Mar 8 | Add scroll fade hint to group members section |
| 1.2.1 | Mar 6 | Fix tab animations and count-up regression |
| 1.2.0 | Mar 6 | Add haptic feedback across the app via web-haptics |
| 1.1.2 | Mar 5 | Fix flash of not-a-member screen on sign-in, switch to password auth |
| 1.1.1 | Mar 5 | Wire sign-out button, fix auth config and page title |
| 1.1.0 | Mar 5 | Auto-versioning in settings page |
| 1.0.2 | Oct 27 | Light mode contrast improvements |
| 1.0.1 | Oct 14 | Calendar availability grid |
| 1.0.0 | Sep 30 | Initial release |
