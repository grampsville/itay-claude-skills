# Design: Itay-Claude-Skills

**Date:** 2026-02-13
**Status:** Approved

## Overview

A shareable npm package (`itay-claude-skills`) containing three Claude Code skills for enhanced documentation, automated project planning, and lightweight project management. Installable via `npx itay-claude-skills`.

## Repository Structure

```
Itay-Claude-Skills/
├── package.json                       # npm package "itay-claude-skills"
├── README.md
├── LICENSE (MIT)
├── .gitignore
├── CLAUDE.md
├── bin/
│   └── cli.js                         # Interactive CLI installer
├── skills/
│   ├── amp-docs/
│   │   ├── SKILL.md                   # Documentation skill definition (amp:docs)
│   │   ├── mermaid-reference.md       # Complete Mermaid syntax (15+ types)
│   │   ├── diagram-examples.md        # Real-world examples
│   │   ├── doc-templates.md           # Templates for different doc types
│   │   └── drift-detection.md         # Stale doc detection instructions
│   ├── amp-plan/
│   │   ├── SKILL.md                   # Brainstorming/planning skill definition (amp:plan)
│   │   ├── prd-template.md            # PRD.md template
│   │   ├── plan-template.md           # PLAN.md template
│   │   ├── progress-template.md       # PROGRESS.md template
│   │   ├── pivots-template.md         # PIVOTS.md template
│   │   ├── diagram-selection.md       # Which diagrams for which context
│   │   └── examples/
│   │       ├── new-project.md
│   │       ├── new-feature.md
│   │       └── new-component.md
│   └── amp-track/
│       ├── SKILL.md                   # Project management skill definition (amp:track)
│       ├── project-template.md        # PROJECT.md template
│       └── update-guide.md            # Rules for auto-updating board + diagrams
└── docs/
    └── plans/
```

---

## Skill 1: amp:docs

### Trigger

Activates when the user asks to document code, create READMEs, explain architecture, generate diagrams, or when Claude detects undocumented areas.

### Enhancements Over Reference Repo

| Feature | Reference Repo | amp:docs |
|---------|---------------|------------------|
| Diagram types | 15 Mermaid types | 15 Mermaid + PlantUML + DOT/Graphviz guidance |
| Detection | Manual invocation only | Auto-scans for undocumented code areas |
| Output | Markdown only | Markdown + instructions for SVG/PNG export |
| Staleness | None | Drift detection — flags when code changed but docs didn't |
| Templates | 1 generic template | Context-specific templates (API, library, CLI, microservice) |
| Naming | Basic | Enforced conventions (PascalCase services, camelCase actions) |

### Core Capabilities

1. **Auto-detect & document** — Scans the codebase for:
   - Functions/classes without doc comments
   - Modules without README
   - Complex code paths without architecture docs
   - Generates a "documentation gap report" and offers to fill gaps

2. **Multi-format** — Primary output is Mermaid-in-Markdown. Also includes:
   - PlantUML equivalent snippets where PlantUML is stronger (detailed class diagrams, deployment diagrams)
   - Instructions for exporting to SVG/PNG via `mmdc` (Mermaid CLI) or `mermaid.ink` API
   - DOT/Graphviz guidance for complex graph layouts

3. **Living docs / drift detection**:
   - Compares file modification dates: if source file changed after its doc was last updated, flag it
   - Checks for renamed/deleted functions still referenced in docs
   - Suggests specific updates needed

4. **Context-specific templates** — Different doc structures for:
   - API services (endpoints, auth, rate limits, error codes)
   - Libraries/packages (installation, API reference, examples)
   - CLI tools (commands, flags, examples)
   - Microservices (architecture, communication patterns, deployment)
   - Database schemas (ER diagrams, migrations, relationships)

### Supported Diagram Types

All 15 Mermaid types: Flowchart, Sequence, Class, State, ER, C4 Context/Container/Component, User Journey, Gantt, Quadrant, Mindmap, Timeline, Git Graph, Pie Chart, Block Diagram.

Plus guidance for PlantUML and DOT where they excel.

### Documentation Template Structure

```markdown
# [System/Feature Name]

## Overview
[2-3 sentences + HIGH-LEVEL DIAGRAM]

## Key Concepts
[Important terms and concepts]

## Architecture
[Detailed architecture + C4/COMPONENT DIAGRAM]

## How It Works
[Step-by-step + SEQUENCE/STATE DIAGRAM]

## Data Model
[If applicable + ER/CLASS DIAGRAM]

## API Reference
[If applicable]

## Configuration
[Configuration options and examples]

## Troubleshooting
[Common issues and solutions]
```

---

## Skill 2: amp:plan

### Trigger

Activates automatically when Claude detects the user is:
- Starting a new project ("let's build...", "I want to create...", "new project for...")
- Planning a new feature ("add a feature for...", "we need to implement...")
- Designing a new component ("let's create a component for...", "new module for...")
- Brainstorming ("let's brainstorm...", "I'm thinking about...", "what if we...")

### Output

Generates a complete planning package in `docs/plans/<feature-or-project-name>/`:

#### PRD.md (Product Requirements Document)

```markdown
# PRD: [Feature/Project Name]

## Problem Statement
[What problem are we solving and for whom]

## Goals & Success Criteria
- [ ] Goal 1 — measurable success metric
- [ ] Goal 2 — measurable success metric

## User Stories
- As a [role], I want [capability] so that [benefit]

## Scope
### In Scope
### Out of Scope

## Architecture Overview
[Mermaid C4 context diagram]

## Data Model
[Mermaid ER diagram]

## User Flow
[Mermaid sequence or flowchart diagram]

## Technical Constraints
## Dependencies
## Open Questions
```

#### PLAN.md (Implementation Plan)

```markdown
# Implementation Plan: [Name]

## Phases
### Phase 1: [Name]
- [ ] Task 1 ~estimate @assignee
- [ ] Task 2 ~estimate @assignee

## Architecture Decisions
[Mermaid decision flowchart]

## Component Breakdown
[Mermaid component/class diagram]

## Dependency Graph
[Mermaid graph showing task dependencies]

## Timeline
[Mermaid Gantt chart]

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
```

#### PROGRESS.md (Auto-updated)

```markdown
# Progress: [Name]

## Current Status: [Phase X — In Progress]

## Completed
| Date | Task | Notes |
|------|------|-------|

## In Progress
| Task | Started | Assignee | Blockers |
|------|---------|----------|----------|

## Metrics
- Tasks completed: X/Y (Z%)
- Current phase: X of N

## Timeline
[Mermaid Gantt — auto-regenerated with actual vs planned]
```

#### PIVOTS.md (Change Tracking)

```markdown
# Pivots & Changes: [Name]

## Change Log
| Date | What Changed | Why | Impact |
|------|-------------|-----|--------|

## Original Plan vs Current
[Mermaid diff-style diagram showing original → current architecture]

## Lessons Learned
- [Auto-appended when pivots are logged]
```

### Diagram Auto-Selection Logic

| Context | Auto-generated Diagrams |
|---------|------------------------|
| New project | C4 context, ER diagram, component diagram, Gantt, user journey |
| New feature | Sequence diagram, state diagram, flowchart, dependency graph |
| New component | Class diagram, flowchart, component diagram |
| Refactor | Before/after architecture diagrams, dependency graph |

### Auto-Update Behavior

- When a task is completed → append to PROGRESS.md, regenerate Gantt
- When the plan changes → append to PIVOTS.md with reason and impact
- When a new blocker is found → update PROGRESS.md blockers section

---

## Skill 3: amp:track

### Trigger

Activates when the user asks to:
- Track project progress ("what's the status?", "update the board")
- Manage tasks ("add a task", "mark X as done", "what's next?")
- View project state ("show me the timeline", "what's blocking?")
- Or via explicit `/project` slash command

### Single-File Approach

Maintains one `PROJECT.md` at the repo root — the entire PM system in one file.

#### PROJECT.md Structure

```markdown
# Project: [Name]

## Sprint: [N] ([start] → [end])
**Goal:** [Sprint goal]

## Board

### Backlog
- [ ] Task description ~2d #tag @assignee

### In Progress
- [ ] Task description ~3d #tag @assignee
  - [x] Subtask 1
  - [ ] Subtask 2

### In Review
- [ ] Task description ~1d #tag @assignee

### Done
- [x] Task description ~1d #tag @assignee

## Timeline
[Mermaid Gantt — auto-generated from Board section]

## Dependencies
[Mermaid graph — auto-generated from task relationships]

## Velocity
| Sprint | Planned | Completed | Carry-over |
|--------|---------|-----------|------------|

## Log
| Date | Action | Details |
|------|--------|---------|
```

### Auto-Update Behavior

- Moving tasks between columns: changes checkbox state + moves to new section
- Regenerates Mermaid Gantt and dependency graph after every board change
- Appends to Log table with timestamp
- Updates velocity table at sprint boundaries

### Design Principle: Single Source of Truth + Generated Views

- **Board section** (TODO.md-style checkboxes) = source of truth
- **Timeline section** (Mermaid Gantt) = generated view, auto-regenerated
- **Dependencies section** (Mermaid graph) = generated view, auto-regenerated
- **Log section** = append-only audit trail

---

## Cross-Skill Awareness

- `amp:plan` creates PLAN.md → `amp:track` can seed PROJECT.md from it
- `amp:track` task completions → `amp:plan` auto-updates PROGRESS.md
- `amp:docs` reads PROJECT.md to understand what's been built and needs docs

---

## CLI Installer

**Package:** `itay-claude-skills`
**Install:** `npx itay-claude-skills`
**Dependency:** `@clack/prompts ^0.7.0`
**Node:** `>=18`

### CLI Flow

```
┌  Itay Claude Skills Installer
│
◆  Which skills would you like to install?
│  ◻ amp:docs — Enhanced documentation with Mermaid diagrams
│  ◻ amp:plan — Auto-generate PRD, PLAN, PROGRESS, PIVOTS
│  ◻ amp:track — Lightweight PM via PROJECT.md
│  ◻ All skills (recommended)
│
◆  Install location?
│  ● Global (~/.claude/skills/) — available in all projects
│  ○ Local (./.claude/skills/) — this project only
│
◇  Installing skills...
│
└  Done! Installed 3 skills to ~/.claude/skills/

   Available commands:
   /amp:docs [topic]   — Generate documentation
   /amp:plan [name]    — Start brainstorming/planning
   /amp:track [action] — Manage project board
```
