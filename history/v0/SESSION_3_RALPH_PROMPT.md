# Crunch Time — Ralph Loop Implementation

You are an autonomous implementation agent building "Crunch Time" — a friend group fund management mobile web app.

## Context Files (READ THESE FIRST)

Every iteration, start by reading:
1. `prd.json` — find the FIRST story where `passes: false`
2. `progress.txt` — understand what previous iterations accomplished
3. `SPEC.md` — reference for the full app specification
4. `DECISION_PROTOCOL.md` — follow this when you encounter unknowns

## Tech Stack

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion
- **Backend:** Supabase (local via CLI — `supabase start`)
- **Auth:** Supabase Auth
- **Testing:** Vitest + React Testing Library
- **Package Manager:** npm

## Workflow Per Iteration

```
1. Read prd.json → find first story where passes: false
2. Read progress.txt → context from previous iterations
3. If story is a foundation story → implement directly
   If story is a screen story → implement as vertical slice (UI + data + tests)
4. Verify:
   a. npm run build — must succeed with 0 errors
   b. npm test — all tests must pass
   c. Compare implementation against prototype code in SPEC.md
5. If verification passes:
   a. Mark story as passes: true in prd.json
   b. Commit with message: "feat: [story title]"
   c. Append to progress.txt what you did
6. If verification fails:
   a. Read the error output carefully
   b. Fix the issue
   c. Re-verify (max 3 attempts per story)
   d. If still failing after 3 attempts: trigger DECISION_PROTOCOL.md
7. If ALL stories pass: output <promise>FUNCTIONALLY COMPLETE</promise>
```

## Parallel Sub-Agents

When the current iteration has access to multiple independent stories (stories with no dependency on each other), you MAY dispatch parallel sub-agents using the Agent tool with `isolation: "worktree"`:

- Each agent gets ONE story
- Each agent works in its own git worktree
- After agents complete, merge worktrees and verify the combined result
- Only use parallel execution when stories are truly independent

**Foundation stories** often have dependencies — execute these sequentially.
**Screen stories** for different tabs/flows are often independent — parallelize these.

## Story Verification Checklist

For EVERY story, before marking `passes: true`:

- [ ] `npm run build` succeeds with 0 errors and 0 warnings
- [ ] `npm test` passes (all tests green)
- [ ] The implemented screen/component matches the structure described in SPEC.md
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console errors when running `npm run dev`
- [ ] New files follow the structure in `file-tree.md`

## Git Strategy

- Work on branch: `feat/crunch-time` (create from main if it doesn't exist)
- Commit after EVERY completed story: `feat: [story title]`
- Never commit broken code — verify before committing
- If you need to revert: `git revert HEAD` (don't force-push or reset)

## Progress Tracking

Append to `progress.txt` after every completed story:

```
## Iteration [N] — [timestamp]
Story: [story id] — [story title]
Status: PASSED
Files changed: [list]
Notes: [anything notable — patterns discovered, gotchas, decisions made]
```

If you discover patterns or gotchas that future iterations should know, optionally create or update `AGENTS.md` with institutional knowledge.

## Error Recovery

If a story fails verification after 3 attempts:

1. DO NOT skip it silently
2. Follow the protocol in `DECISION_PROTOCOL.md`:
   - Dispatch 2 proposer agents (3 solutions each)
   - Dispatch 1 deduplicator agent (combine to 3-6 solutions)
   - For each solution: 2 debater agents (for + against)
   - 1 arbiter agent picks the winner
3. Implement the winning solution
4. Re-verify
5. Log the decision in progress.txt

## Supabase Setup (Foundation Stories)

When implementing the Supabase foundation story:
1. Run `npx supabase init` if not already initialized
2. Run `npx supabase start` to start local Supabase
3. Create migration files in `supabase/migrations/`
4. Write seed data in `supabase/seed.sql`
5. Ensure `supabase start` runs cleanly
6. Store connection details in `.env.local` (never commit this file)
7. Include migration files so the schema can be deployed to cloud Supabase later

## Local Testing Requirement

The app MUST be fully testable locally:
- `npm run dev` starts the app on localhost
- `npx supabase start` runs the local database
- All features work against the local Supabase instance
- No external API dependencies required to run

## What NOT To Do

- Do NOT modify SPEC.md (it's the source of truth from planning)
- Do NOT reorder stories in prd.json (priority ordering is intentional)
- Do NOT skip stories (even if they seem unnecessary)
- Do NOT deploy to Vercel (that's a separate step after the loop completes)
- Do NOT install packages that aren't needed for the current story
- Do NOT over-engineer — implement exactly what the story requires

## Completion

When EVERY story in prd.json has `passes: true`:

1. Run the full test suite one final time: `npm test`
2. Run the full build: `npm run build`
3. Run TypeScript check: `npx tsc --noEmit`
4. Verify `npm run dev` starts without errors
5. Append final summary to progress.txt
6. Output: <promise>FUNCTIONALLY COMPLETE</promise>

This is the ONLY condition under which you may output the completion promise. Do NOT output it if any story has `passes: false` or if any verification step fails.
