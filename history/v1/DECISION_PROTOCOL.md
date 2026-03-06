# Decision Resolution Protocol

When you encounter an unknown during implementation — something not covered in the story description or acceptance criteria — follow this protocol. Do NOT guess or make arbitrary choices.

## When to Trigger

- A fix has multiple valid approaches and the choice significantly affects behavior
- You've attempted something and it failed 3 times, and the fix isn't obvious
- A change in one story conflicts with another story's requirements
- You're unsure whether a change will break existing functionality

## The Protocol

### Step 1: Propose (2 parallel agents)

Dispatch TWO sub-agents simultaneously. Each independently proposes **3 solutions** to the problem.

**Agent prompt template:**
```
You are a solution proposer. Given this problem:

[DESCRIBE THE PROBLEM]

Context:
- App: Crunch Time 2.0 (friend group fund manager PWA)
- Stack: React 18 + TypeScript + Tailwind + Framer Motion + Supabase + TanStack Query
- Icons: lucide-react
- Read CLAUDE.md for project conventions

Propose exactly 3 distinct solutions. For each:
1. Name (short label)
2. Description (2-3 sentences)
3. Pros
4. Cons
5. Effort estimate (low/medium/high)

Be creative. Don't propose variations of the same idea — propose genuinely different approaches.
```

### Step 2: Deduplicate (1 agent)

Dispatch ONE sub-agent that receives both lists (6 total solutions) and:
- Removes duplicates or near-duplicates
- Combines complementary ideas where reasonable
- Produces a final list of **3 to 6 unique solutions**
- Ranks them by feasibility

### Step 3: Debate (2 agents per solution, parallel)

For EACH solution in the deduplicated list, dispatch TWO sub-agents simultaneously:
- **Advocate agent:** Makes the strongest possible case FOR this solution
- **Critic agent:** Makes the strongest possible case AGAINST this solution

Both agents should consider:
- Technical feasibility given our stack
- Consistency with existing codebase patterns
- Impact on other stories in the PRD
- User experience implications
- Maintenance and complexity cost

### Step 4: Arbitrate (1 agent)

Dispatch ONE arbiter agent that receives ALL debate results and:
- Reviews every advocate and critic argument
- Identifies which criticisms are fatal vs. manageable
- Considers the full context of the project
- Picks the winning solution with clear reasoning
- Provides implementation guidance for the winner

### Step 5: Proceed

The main agent adopts the arbiter's chosen solution and proceeds with implementation.

**Log the decision** in history/v1/progress.txt:
```
## Decision: [Topic]
- Problem: [what was unclear]
- Solutions considered: [list]
- Winner: [chosen solution]
- Reasoning: [arbiter's key points]
- Iteration: [current Ralph iteration number]
```

## Cost Reality

This protocol spawns ~15+ sub-agents per decision. Use it for decisions that matter — not for trivial choices.

**Use the protocol for:**
- Conflicting fix approaches that affect multiple components
- Layout/scroll architecture decisions (overscroll, safe area interactions)
- Icon system design (how to map string identifiers to components)
- Animation approach changes (AnimatePresence strategy)

**Do NOT use for:**
- Styling choices (follow existing patterns)
- Exact icon selection (pick the closest lucide match)
- CSS value tweaks (use reasonable values)
