# Decision Resolution Protocol

When you encounter an unknown-unknown during implementation — something not covered in SPEC.md, prd.json, or the design files — follow this protocol exactly. Do NOT guess or make arbitrary choices.

## When to Trigger

- A design decision has no clear answer from existing artifacts
- Multiple valid approaches exist and the choice significantly affects the codebase
- You've attempted something and it failed, and the fix isn't obvious
- An architectural decision needs to be made that wasn't anticipated in planning

## The Protocol

### Step 1: Propose (2 parallel agents)

Dispatch TWO sub-agents simultaneously. Each independently proposes **3 solutions** to the problem.

**Agent prompt template:**
```
You are a solution proposer. Given this problem:

[DESCRIBE THE PROBLEM]

Context:
- App: Crunch Time (friend group fund manager)
- Stack: Next.js + Tailwind + shadcn + Supabase + Framer Motion
- Read SPEC.md for full app context

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
- Impact on other screens/features
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

**Log the decision** in progress.txt:
```
## Decision: [Topic]
- Problem: [what was unclear]
- Solutions considered: [list]
- Winner: [chosen solution]
- Reasoning: [arbiter's key points]
- Iteration: [current Ralph iteration number]
```

## Cost Reality

This protocol spawns ~15+ sub-agents per decision. Use it for decisions that matter — not for trivial choices like variable naming or CSS margin values.

**Use the protocol for:**
- Data model design choices
- State management architecture
- API design decisions
- Authentication flow decisions
- Complex component architecture

**Do NOT use for:**
- Styling choices (just match the prototype)
- Library version choices (use latest stable)
- File naming conventions (follow existing patterns)
- Test structure (follow Vitest conventions)
