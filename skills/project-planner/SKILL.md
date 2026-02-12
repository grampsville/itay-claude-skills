---
name: project-planner
description: Automatically creates comprehensive project planning documentation when brainstorming or starting new projects, features, or components. Generates PRD.md, PLAN.md, PROGRESS.md, and PIVOTS.md with auto-selected Mermaid diagrams. Use when the user is brainstorming, planning a new project, designing a feature, starting a new component, or discussing what to build. Triggers on phrases like "let's build", "I want to create", "new project", "add a feature", "new component", "let's brainstorm", "what if we".
argument-hint: [project or feature name]
---

# Project Planner

Generate structured planning documentation with Mermaid diagrams for any project, feature, or component.

## Detection Logic

Activate this skill when the user's message matches any of these patterns:

**Direct triggers:**
- Explicit `/project-planner` invocation
- "let's build...", "I want to create...", "new project..."
- "add a feature...", "we need to implement...", "new feature..."
- "let's create a component...", "new module...", "new component..."
- "let's brainstorm...", "I'm thinking about...", "what if we..."
- "plan out...", "design a...", "architect..."

**Contextual triggers:**
- User describes a problem and asks how to solve it with software
- User shares an idea and wants to explore feasibility
- User asks "how should we structure..." or "what's the best approach for..."

**Do NOT activate when:**
- User is asking about an existing plan (use project-tracker instead)
- User wants documentation for existing code (use docs-on-steroids instead)
- User is debugging or fixing an issue

## Output Directory

All planning files go in: `docs/plans/<name>/`

Where `<name>` is a kebab-case slug derived from the project or feature name.

Examples:
- "Let's build a todo app" -> `docs/plans/todo-app/`
- "Add OAuth support" -> `docs/plans/oauth-support/`
- "New data table component" -> `docs/plans/data-table-component/`

## File Generation Order

Generate files in this exact order:

1. **PRD.md** -- Extract requirements from the conversation
2. **PLAN.md** -- Break requirements into phases and tasks
3. **PROGRESS.md** -- Initialize empty progress tracker
4. **PIVOTS.md** -- Initialize empty change log

Present each file to the user for review before generating the next. Ask clarifying questions between PRD and PLAN if the scope is unclear.

## Workflow

### Step 1: Gather Context

Before generating anything, understand:
- **What** is being built (project, feature, or component)
- **Why** it needs to exist (problem statement)
- **Who** will use it (target users)
- **How big** is the scope (estimate complexity)
- **What exists** already (greenfield vs brownfield)

Ask the user targeted questions if context is missing. Do not generate a PRD with placeholder content -- every section should reflect real decisions.

### Step 2: Select Diagram Types

Use the diagram auto-selection matrix (see `diagram-selection.md` for the full guide):

| Context | Recommended Diagrams |
|---------|---------------------|
| New project | C4 context, ER diagram, component diagram, Gantt, user journey |
| New feature | Sequence diagram, state diagram, flowchart, dependency graph |
| New component | Class diagram, flowchart, component diagram |
| Refactor | Before/after architecture diagrams, dependency graph |
| API design | Sequence diagram, ER diagram, flowchart |
| Database change | ER diagram, state diagram, migration timeline |
| UI feature | User journey, flowchart, component diagram |

Always include at least:
- One **structural** diagram (architecture, class, ER, or component)
- One **behavioral** diagram (sequence, state, flowchart, or user journey)
- One **planning** diagram (Gantt or dependency graph)

### Step 3: Generate PRD.md

Follow the template in `prd-template.md`. Key principles:

- **Problem Statement**: Write from the user's perspective, not the developer's. State the pain point clearly.
- **Goals**: Each goal must be measurable. Use the format: `- [ ] Goal -- metric (target value)`.
- **User Stories**: Write 3-8 stories covering the primary, secondary, and edge-case flows.
- **Scope**: Be explicit about what is OUT of scope. This prevents scope creep.
- **Architecture**: Generate real Mermaid diagrams, not placeholders. Show actual system components.
- **Data Model**: If the feature touches persistent data, include an ER diagram with real entities and relationships.
- **User Flow**: Show the primary happy path as a sequence or flowchart diagram.

### Step 4: Generate PLAN.md

Follow the template in `plan-template.md`. Key principles:

- **Phases**: Break work into 2-5 phases. Each phase should be independently shippable.
- **Tasks**: Each task should be completable in 0.5-3 days. If larger, break it down further.
- **Estimates**: Use `~Nd` format (e.g., `~1d`, `~0.5d`, `~3d`). Be honest about unknowns -- add `~?d` for uncertain tasks.
- **Dependencies**: Identify which tasks block others. Reflect this in the dependency graph.
- **Risks**: For each risk, provide a concrete mitigation strategy, not just "monitor it."

### Step 5: Initialize PROGRESS.md and PIVOTS.md

These start mostly empty but with the correct structure so they are ready for auto-updates.

## Auto-Update Rules

### PROGRESS.md Updates

Update PROGRESS.md whenever:
- A task from PLAN.md is marked as complete
- A task moves from one status to another
- A new blocker is discovered
- A phase is completed

**How to update:**
1. Move the task row to the Completed table with today's date
2. Update the metrics (X/Y count, percentage)
3. Regenerate the actual-vs-planned Gantt chart
4. If a phase completed, update the Current Status header

### PIVOTS.md Updates

Update PIVOTS.md whenever:
- A task is added, removed, or significantly changed in PLAN.md
- An estimate changes by more than 50%
- A dependency is added or removed
- The architecture changes
- A phase is reordered or merged

**How to update:**
1. Append a row to the Change Log table with the date, what changed, why, and impact
2. If the architecture changed, update the before/after diagram
3. Append a lesson learned if the change was driven by a discovery

## Cross-Skill Hooks

### Seeding project-tracker

When the user has the `project-tracker` skill installed and runs `/project-tracker init` after planning:
- Read the PLAN.md phases and tasks
- Create PROJECT.md with tasks populated in the Backlog column
- Preserve estimates (~Nd), tags (#tag), and assignees (@name)
- Generate the initial Gantt and dependency graph from the plan

### Feeding docs-on-steroids

When documentation is generated with `docs-on-steroids`:
- Reference the PRD.md architecture diagrams as starting points
- Use the PLAN.md component breakdown to identify what needs documenting
- Check PROGRESS.md to know which components are built and ready for docs

## Templates and References

- `prd-template.md` -- PRD template with guidance comments
- `plan-template.md` -- Implementation plan template
- `progress-template.md` -- Progress tracking template with auto-update instructions
- `pivots-template.md` -- Change tracking template with auto-update instructions
- `diagram-selection.md` -- Full decision matrix for diagram type selection
- `examples/new-project.md` -- Complete example: planning a todo app from scratch
- `examples/new-feature.md` -- Complete example: adding OAuth to an existing app
- `examples/new-component.md` -- Complete example: building a reusable data table component

## Quality Checklist

Before presenting planning docs to the user, verify:

- [ ] Every Mermaid diagram renders correctly (valid syntax)
- [ ] No placeholder text remains -- all content reflects the actual project
- [ ] PRD scope section explicitly lists what is out of scope
- [ ] Every task in PLAN.md has an estimate
- [ ] The Gantt chart reflects the actual task sequence and dependencies
- [ ] Risk mitigations are actionable, not vague
- [ ] The dependency graph matches the task ordering in phases
- [ ] User stories follow "As a... I want... So that..." format
- [ ] Goals have measurable success criteria
