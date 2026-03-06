# Auto-Versioning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Version, build hash, and build date auto-update in the Settings page at build time; agents bump version + changelog as part of their finishing workflow via CLAUDE.md instructions.

**Architecture:** `package.json` is the version source of truth. `src/changelog.ts` holds release history. Vite injects version, git short hash, and build date as compile-time constants. SettingsTab reads these instead of hardcoded values. CLAUDE.md documents the release protocol so agents follow it naturally.

**Tech Stack:** Vite `define`, TypeScript, git rev-parse

---

### Task 1: Create `src/changelog.ts`

**Files:**
- Create: `src/changelog.ts`

**Step 1: Create the changelog module**

```ts
export interface ChangelogEntry {
  version: string
  date: string
  note: string
}

export const CHANGELOG: ChangelogEntry[] = [
  { version: '1.0.2', date: 'Oct 27', note: 'Light mode contrast improvements' },
  { version: '1.0.1', date: 'Oct 14', note: 'Calendar availability grid' },
  { version: '1.0.0', date: 'Sep 30', note: 'Initial release' },
]
```

**Step 2: Commit**

```bash
git add src/changelog.ts
git commit -m "feat: extract changelog to dedicated module"
```

---

### Task 2: Set up Vite build-time injection

**Files:**
- Modify: `vite.config.ts` (entire file — 7 lines currently)
- Modify: `src/vite-env.d.ts` (1 line currently — add type declarations)

**Step 1: Update `vite.config.ts`**

Replace the entire file with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

let gitHash = 'dev'
try {
  gitHash = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  // not in a git repo (e.g. CI without .git)
}

const buildDate = new Date().toISOString().slice(0, 10)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_HASH__: JSON.stringify(gitHash),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
})
```

**Step 2: Add type declarations to `src/vite-env.d.ts`**

Replace the entire file with:

```ts
/// <reference types="vite/client" />

declare const __APP_VERSION__: string
declare const __BUILD_HASH__: string
declare const __BUILD_DATE__: string
```

**Step 3: Verify it works**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds without errors.

**Step 4: Commit**

```bash
git add vite.config.ts src/vite-env.d.ts
git commit -m "feat: inject version, git hash, and build date at build time"
```

---

### Task 3: Bump `package.json` version

**Files:**
- Modify: `package.json:2` (change version field)

**Step 1: Update version**

Change line 3 from:
```json
  "version": "0.0.1",
```
to:
```json
  "version": "1.0.2",
```

This syncs `package.json` with the current displayed version.

**Step 2: Commit**

```bash
git add package.json
git commit -m "chore: sync package.json version to 1.0.2"
```

---

### Task 4: Update SettingsTab to use injected values

**Files:**
- Modify: `src/components/SettingsTab.tsx:1-26` (imports and CHANGELOG removal)
- Modify: `src/components/SettingsTab.tsx:485` (hardcoded `v1.0.2`)
- Modify: `src/components/SettingsTab.tsx:566` (hardcoded footer)

**Step 1: Replace the CHANGELOG import**

At the top of `SettingsTab.tsx`, add the import (after the existing imports, before the interface):

```ts
import { CHANGELOG } from '../changelog';
```

Then delete the hardcoded `CHANGELOG` array (lines 14-26):

```ts
// DELETE THIS ENTIRE BLOCK:
const CHANGELOG = [{
  version: '1.0.2',
  date: 'Oct 27',
  note: 'Light mode contrast improvements'
}, {
  version: '1.0.1',
  date: 'Oct 14',
  note: 'Calendar availability grid'
}, {
  version: '1.0.0',
  date: 'Sep 30',
  note: 'Initial release'
}];
```

**Step 2: Replace hardcoded version badge**

On the line that reads `v1.0.2` (around line 485), change:

```tsx
                  v1.0.2
```

to:

```tsx
                  v{__APP_VERSION__}
```

**Step 3: Replace hardcoded footer**

On the line that reads `Version 1.0.2 · Build 2023.10.27` (around line 566), change:

```tsx
          Version 1.0.2 · Build 2023.10.27
```

to:

```tsx
          v{__APP_VERSION__} · {__BUILD_HASH__} · {__BUILD_DATE__}
```

**Step 4: Verify the dev server renders correctly**

Run: `npm run dev`
Open: http://localhost:5173, navigate to Settings tab.
Expected: Footer shows something like `v1.0.2 · a3f7c2d · 2026-03-05`
Expected: Changelog badge shows `v1.0.2`
Expected: Changelog entries render from the imported module.

**Step 5: Commit**

```bash
git add src/components/SettingsTab.tsx
git commit -m "feat: wire SettingsTab to build-time version and changelog module"
```

---

### Task 5: Create CLAUDE.md with release protocol

**Files:**
- Create: `CLAUDE.md` (project root)

**Step 1: Create the file**

```markdown
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
   - Patch (1.0.2 → 1.0.3): bug fixes, minor tweaks
   - Minor (1.0.2 → 1.1.0): new features, new UI sections
   - Major (1.0.2 → 2.0.0): breaking changes (rare)

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
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with project context and release protocol"
```

---

### Task 6: Dogfood — do the first release using the protocol

**Files:**
- Modify: `package.json:3` (bump to 1.1.0)
- Modify: `src/changelog.ts` (add entry)

**Step 1: Bump version in package.json**

Change:
```json
  "version": "1.0.2",
```
to:
```json
  "version": "1.1.0",
```

**Step 2: Add changelog entry**

Add to the TOP of the CHANGELOG array in `src/changelog.ts`:

```ts
  { version: '1.1.0', date: 'Mar 5', note: 'Auto-versioning in settings page' },
```

**Step 3: Verify**

Run: `npm run dev`
Open Settings tab.
Expected: Footer shows `v1.1.0 · <hash> · 2026-03-05`
Expected: Changelog shows `1.1.0` as the first entry with "Auto-versioning in settings page"

**Step 4: Final commit**

```bash
git add package.json src/changelog.ts
git commit -m "release: v1.1.0 — auto-versioning in settings page"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Extract changelog to module | `src/changelog.ts` |
| 2 | Vite build-time injection | `vite.config.ts`, `src/vite-env.d.ts` |
| 3 | Sync package.json version | `package.json` |
| 4 | Wire SettingsTab to injected values | `src/components/SettingsTab.tsx` |
| 5 | CLAUDE.md with release protocol | `CLAUDE.md` |
| 6 | Dogfood first release | `package.json`, `src/changelog.ts` |
