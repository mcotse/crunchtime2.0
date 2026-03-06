# Session 1: Magic Patterns MCP Exploration

You are exploring a Magic Patterns design for "Crunch Time" — a friend group fund management app. Your goal is to thoroughly understand every screen, component, state, and interaction in the design, then produce structured planning artifacts.

## Prerequisites

- Magic Patterns MCP is already authenticated and connected
- The design URL will be provided below

## Design URL

```
[PASTE YOUR MAGIC PATTERNS DESIGN URL HERE]
```

## Your Mission

Extract everything from the Magic Patterns design and produce planning artifacts that will drive autonomous implementation in a later session.

## Phase 1: Inventory (Single Agent)

First, get the big picture:

1. Call `get_design(url)` to get the `editorId` and `artifactId`
2. Call `list_files(artifactId)` to get the complete file listing
3. Call `read_files(artifactId, [...])` for a few key files to understand the design system, structure, and conventions used

Produce an initial inventory:
- Total file count
- File organization pattern (how screens/components are grouped)
- Design system used (shadcn, MUI, custom, etc.)
- Key shared components identified

## Phase 2: Deep Dive (Parallel Agent Teams)

Based on the inventory, dispatch parallel sub-agents to analyze groups of files simultaneously. Each agent reads its assigned files via `read_files` and produces a structured analysis.

**Agent team structure:**
- Agent per screen group (e.g., "Home flow files", "Activity flow files", "Events flow files")
- One agent for shared components / design system files
- One agent for any configuration, routing, or utility files

**Each agent should extract:**

For every screen:
- Screen name and purpose
- All states (loading, empty, populated, error, etc.)
- Interactive elements (buttons, forms, modals, sheets)
- Data displayed (what entities/fields appear on screen)
- Navigation targets (what screens does this link to)
- Animations/transitions visible in the code

For every shared component:
- Component name and props
- Variants/states
- Where it's used across screens

## Phase 3: Synthesis (Single Agent)

After all deep-dive agents report back, synthesize everything into:

### 1. SPEC.md (write to project root)

Structure:
```markdown
# Crunch Time — App Specification

## Overview
[1-2 paragraph summary of the app]

## Screens

### [Screen Name]
- Route: /path
- States: [list all states]
- Components used: [list]
- Data requirements: [what data this screen needs]
- Interactions: [what user actions are possible]
- Animations: [any transitions/animations]
- Navigation: [where can user go from here]

[Repeat for every screen]

## Shared Components
[List every shared component with props and usage]

## Design System
- Colors/tokens extracted
- Typography scale
- Spacing system
- Component library used

## Data Model (Inferred)
[Based on what screens show, propose Supabase tables]

### Tables
- [table_name]: [fields, types, relationships]

### Relationships
[Entity relationship descriptions]

## API Routes (Inferred)
[Based on what each screen needs]

### [Route]
- Method: GET/POST/etc
- Purpose: [what it does]
- Request: [shape]
- Response: [shape]
- Used by: [which screens]

## Authentication
[Inferred auth requirements from the design]

## Business Rules
[Any logic rules visible in the design — priority ordering, fund calculations, fine rules, etc.]
```

### 2. prd.json (draft, write to project root)

Structure the work as atomic user stories. Follow the foundation → vertical slices pattern:

**Foundation stories first:**
- Project scaffold (Next.js + Tailwind + shadcn + Framer Motion)
- Design tokens and theme setup
- Shared component library
- Supabase local setup (schema, tables, RLS)
- Auth setup
- Test infrastructure (Vitest + React Testing Library)
- Routing skeleton

**Then vertical slice stories per screen:**
- Each screen gets 1-3 stories depending on complexity
- Each story includes: UI, data wiring, tests
- Stories must be small enough to fit in one context window

```json
{
  "branchName": "feat/crunch-time",
  "userStories": [
    {
      "id": "foundation-1",
      "title": "Scaffold Next.js project with Tailwind, shadcn, Framer Motion",
      "passes": false,
      "acceptanceCriteria": [
        "npm run dev starts without errors",
        "Tailwind classes render correctly",
        "shadcn components importable",
        "Framer Motion animations work"
      ],
      "priority": 1
    },
    {
      "id": "foundation-2",
      "title": "Set up Supabase local with schema",
      "passes": false,
      "acceptanceCriteria": [
        "supabase start runs successfully",
        "All tables created per SPEC.md data model",
        "RLS policies in place",
        "Seed data populated"
      ],
      "priority": 2
    }
  ]
}
```

### 3. unknowns.md (write to project root)

List everything that's ambiguous, missing, or requires human decision:

```markdown
# Unknowns & Questions

## Critical (blocks implementation)
- [ ] [Question about unclear aspect]

## Important (affects quality)
- [ ] [Question about unclear aspect]

## Nice to Know (can default if no answer)
- [ ] [Question about unclear aspect]
```

### 4. file-tree.md (write to project root)

Propose the project file structure:

```markdown
# Proposed File Structure

src/
  app/                    # Next.js App Router pages
    (tabs)/               # Tab-based layout group
      home/
      activity/
      events/
      ...
    layout.tsx
  components/
    shared/               # Shared UI components
    screens/              # Screen-specific components
  lib/
    supabase/             # Supabase client + queries
    hooks/                # Custom React hooks
    utils/                # Utility functions
  types/                  # TypeScript type definitions
supabase/
  migrations/             # SQL migration files
  seed.sql                # Seed data
```

## Supplementary Context

Read `docs/design-walkthrough.md` for a verbal walkthrough of the design. This transcript is INCOMPLETE — treat it as hints, not source of truth. The Magic Patterns files are authoritative.

## Important Rules

- Do NOT start implementing anything. This session is exploration only.
- Do NOT make up features that aren't in the design.
- DO flag anything in the design walkthrough that doesn't match the actual design files.
- DO be thorough — every screen, every state, every component.
- DO use agent teams aggressively to parallelize the exploration.
- DO commit all output artifacts to git on the main branch when done.
