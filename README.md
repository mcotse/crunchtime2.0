# Crunch Time 2.0

A mobile-first group fund management app for friend groups, teams, and clubs. Track shared expenses, split costs, manage fines from challenges, coordinate events, and run polls — all in one place.

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, RLS)
- **Data Fetching:** TanStack React Query with optimistic updates
- **Build:** Vite

## Features

- **Home Dashboard** — Fund balance, recent activity, quick actions
- **Transactions** — Add expenses and fines, split costs across members, edit history tracking
- **Challenges** — Group challenges with fines for non-completion
- **Events** — Create events, RSVP, availability calendar, location links
- **Polls** — Create polls with comments, multi-select support, vote tracking
- **Splits** — Per-member balance tracking with detailed split breakdowns
- **Auth** — Magic link login via Supabase, row-level security on all tables
- **Realtime** — Live updates across all connected clients

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
  components/    # UI components (tabs, sheets, cards)
  hooks/         # React Query hooks for each domain
  data/          # Type definitions and mock data
  lib/           # Supabase client, query client
  pages/         # Top-level pages (LoginPage, BudgetApp)
supabase/
  migrations/    # SQL schema, RLS policies, triggers
  seed.sql       # Sample data (12 members, transactions, events, polls)
  config.toml    # Local Supabase configuration
```
