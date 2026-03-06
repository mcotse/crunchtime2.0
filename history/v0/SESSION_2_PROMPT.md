# Session 2: Interactive Q&A — Finalize the Plan

You are in Session 2 of a 3-session workflow for building "Crunch Time" — a friend group fund management app.

## Context

Session 1 has already completed. It explored the Magic Patterns design via MCP and produced these artifacts at the project root:
- `SPEC.md` — full app specification (screens, data model, API routes, business rules)
- `prd.json` — draft PRD with atomic user stories
- `unknowns.md` — list of unresolved questions
- `file-tree.md` — proposed project structure

## Your Mission

1. Read ALL artifacts from Session 1
2. Present a summary of what was discovered
3. Use the `AskUserQuestion` tool to resolve EVERY item in unknowns.md
4. Go beyond unknowns.md — proactively identify gaps in the spec and ask about those too
5. Finalize all artifacts based on answers

## Process

### Step 1: Read and Summarize

Read SPEC.md, prd.json, unknowns.md, and file-tree.md. Present a concise summary:
- Total screens discovered
- Total user stories in prd.json
- Number of unknowns to resolve
- Any red flags or concerns about the plan

### Step 2: Resolve Unknowns

Work through unknowns.md systematically using `AskUserQuestion`. Ask ONE question at a time. For each unknown:
- Present context (what the design shows, why it's ambiguous)
- Offer 2-4 concrete options with trade-offs
- Record the answer

After unknowns.md is exhausted, proactively interview about:
- **Data model:** Are the inferred tables and relationships correct?
- **Auth:** How should user authentication work? (email/password, magic link, social?)
- **Permissions:** Who can do what? (admin vs member, creator vs participant)
- **Edge cases:** What happens when fund hits 0? Can fines be disputed?
- **Notifications:** Push notifications? Email? In-app only?
- **Real-time:** Should the fund balance update in real-time across users?
- **Offline:** Does the app need to work offline?

### Step 3: Finalize Artifacts

After all questions are resolved:

1. **Update SPEC.md** with all new information and decisions
2. **Finalize prd.json** — ensure stories are:
   - Correctly ordered (foundation → vertical slices)
   - Properly sized (fit in one context window each)
   - Have clear acceptance criteria including verification steps
   - Include "Verify: npm run build succeeds" and "Verify: tests pass" in every story
3. **Delete unknowns.md** (all unknowns resolved)
4. **Update file-tree.md** if the structure needs changes
5. **Verify DECISION_PROTOCOL.md exists** (should already be at project root)

### Step 4: Final Review

Present the finalized plan:
- Total stories count
- Estimated Ralph iterations needed
- Foundation stories list
- Screen stories list
- Any remaining risks

Ask the user: "Does this plan look ready for the Ralph loop?"

### Step 5: Commit

Commit all finalized artifacts to the main branch:
```
git add SPEC.md prd.json file-tree.md DECISION_PROTOCOL.md
git commit -m "finalize implementation plan for crunch-time"
```

## Important Rules

- Do NOT start implementing anything. This session is planning only.
- Do NOT skip unknowns — resolve every single one.
- DO be thorough in your proactive questioning.
- DO use `AskUserQuestion` for every question (not just text output).
- DO challenge the spec — if something seems wrong or missing, ask about it.
- Each story in prd.json should take 1 Ralph iteration to complete (small and atomic).
