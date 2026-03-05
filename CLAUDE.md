# Crunch Time 2.0

## Tech Stack
- React 18 + TypeScript + Tailwind CSS + Framer Motion
- Supabase (PostgreSQL, Auth, Realtime, RLS)
- TanStack React Query
- Vite

## Local Development
```bash
npm install
npx supabase start
npm run dev
```

- App: http://localhost:5173
- Supabase Studio: http://127.0.0.1:54333
- Mailpit (magic links): http://127.0.0.1:54334
- Login with any seeded email (e.g. alex@example.com)

## Key Directories
- `src/components/` — UI components (tabs, sheets, cards)
- `src/hooks/` — React Query hooks per domain
- `src/data/` — Types and mock data
- `src/lib/` — Supabase client, query client
- `supabase/migrations/` — SQL schema, RLS, triggers
- `supabase/seed.sql` — Sample data

## Supabase Notes
- Auth trigger function must use `public.members` (schema-qualified) — see migration 003
- RLS is enabled on all tables — policies in migration 002
- Config lives in `supabase/config.toml` — site_url must match Vite dev server port

## Release Protocol

When completing a feature or bugfix, BEFORE your final commit:

1. **Bump version** in `package.json`
   - Patch (1.0.2 -> 1.0.3): bug fixes, minor tweaks
   - Minor (1.0.2 -> 1.1.0): new features, new UI sections
   - Major (1.0.2 -> 2.0.0): breaking changes (rare)

2. **Add changelog entry** to `src/changelog.ts`
   - Add to the TOP of the array (newest first)
   - Format: `{ version: 'X.Y.Z', date: 'Mon DD', note: 'One-line summary' }`
   - Use the current date abbreviated (e.g. 'Mar 5', 'Jan 12')

3. **Commit message** should include the version: `release: vX.Y.Z — description`

Example:
```ts
// src/changelog.ts — add to TOP of array
{ version: '1.1.0', date: 'Mar 5', note: 'Auto-versioning in settings page' },
```

```bash
# package.json version bumped to 1.1.0
git add -A
git commit -m "release: v1.1.0 — auto-versioning in settings page"
```

The build system auto-injects version, git hash, and build date into the app. No other steps needed.
