# Crunch Time 2.0 — Ralph Loop: UX Bugfix Polish

You are an autonomous implementation agent fixing UX bugs in "Crunch Time" — a friend group fund management mobile web app (PWA).

## Context Files (READ THESE FIRST)

Every iteration, start by reading:
1. `history/v1/prd.json` — find the FIRST story where `passes: false`
2. `history/v1/progress.txt` — understand what previous iterations accomplished
3. `CLAUDE.md` — project conventions and tech stack
4. `history/v1/DECISION_PROTOCOL.md` — follow this when you encounter unknowns

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (custom CSS variables for theming)
- **Animation:** Framer Motion
- **Backend:** Supabase (local via CLI)
- **State:** TanStack React Query
- **Icons:** lucide-react
- **Package Manager:** npm

## Workflow Per Iteration

```
1. Read history/v1/prd.json -> find first story where passes: false
2. Read history/v1/progress.txt -> context from previous iterations
3. Read the relevant source files identified in the story description
4. Implement the fix:
   - Make the minimum changes needed
   - Follow existing code patterns and conventions
   - Do NOT refactor unrelated code
   - Do NOT add features beyond what the story requires
5. Verify:
   a. npm run build — must succeed with 0 errors
   b. npx tsc --noEmit — must pass with 0 errors
   c. Visually confirm the fix addresses the acceptance criteria
6. If verification passes:
   a. Mark story as passes: true in history/v1/prd.json
   b. Update the notes field with a brief summary of what changed
   c. Commit with message: "fix: [story title]"
   d. Append to history/v1/progress.txt what you did
7. If verification fails:
   a. Read the error output carefully
   b. Fix the issue
   c. Re-verify (max 3 attempts per story)
   d. If still failing after 3 attempts: trigger DECISION_PROTOCOL.md
8. If ALL stories pass: output <promise>BUGFIX COMPLETE</promise>
```

## Important Context for Specific Stories

### Viewport / PWA stories (US-001, US-006, US-007)
- These modify `index.html` and global CSS — be careful not to break existing layout
- Test that `npm run build` still works after viewport changes
- The app shell is in `src/pages/BudgetApp.tsx`

### State transition stories (US-008, US-009)
- US-008 should be done BEFORE US-009 (tab mounting affects loading behavior)
- Preferred approach for US-008: render all tabs but hide non-active with CSS (`display: none`) to preserve scroll position and local state
- For US-009: import `keepPreviousData` from `@tanstack/react-query`

### Emoji replacement stories (US-010 through US-013)
- These are ordered by scope: fire icon first, then UI chrome, then event covers, then remaining
- Each story builds on the previous — do them in order
- For US-012: create a small icon lookup map (icon name string -> lucide component)
- For event cover icons, the `coverEmoji` field on events becomes `coverIcon` (or keep the field name and just change values to icon identifiers)
- When replacing emojis in mock data strings (comments, descriptions), just remove them — don't replace inline emojis with icon markup

## Story Verification Checklist

For EVERY story, before marking `passes: true`:

- [ ] `npm run build` succeeds with 0 errors
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] The fix addresses ALL acceptance criteria listed in the story
- [ ] No unrelated code was modified
- [ ] No new TypeScript errors introduced
- [ ] Imports are clean (no unused imports added, removed imports that are no longer used)

## Git Strategy

- Work on branch: `ralph/bugfix-polish` (create from main if it doesn't exist)
- Commit after EVERY completed story: `fix: [story title]`
- Never commit broken code — verify before committing
- If you need to revert: `git revert HEAD` (don't force-push or reset)

## Progress Tracking

Append to `history/v1/progress.txt` after every completed story:

```
## Iteration [N] — [timestamp]
Story: [story id] — [story title]
Status: PASSED
Files changed: [list]
Notes: [anything notable]
```

## Error Recovery

If a story fails verification after 3 attempts:

1. DO NOT skip it silently
2. Follow the protocol in `history/v1/DECISION_PROTOCOL.md`
3. Implement the winning solution
4. Re-verify
5. Log the decision in progress.txt

## What NOT To Do

- Do NOT modify mock data structure unless the story specifically requires it (emoji stories do)
- Do NOT refactor code beyond what the story requires
- Do NOT skip stories (even if they seem trivial)
- Do NOT install new packages unless absolutely necessary
- Do NOT over-engineer — implement exactly what the story requires
- Do NOT change the visual design unless the story calls for it
- Do NOT push to remote (that's a separate step after the loop completes)

## Completion

When EVERY story in history/v1/prd.json has `passes: true`:

1. Run full verification: `npm run build` + `npx tsc --noEmit`
2. Append final summary to history/v1/progress.txt
3. Output: <promise>BUGFIX COMPLETE</promise>

This is the ONLY condition under which you may output the completion promise. Do NOT output it if any story has `passes: false` or if any verification step fails.
