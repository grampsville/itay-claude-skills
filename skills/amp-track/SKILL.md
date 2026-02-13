---
name: amp:track
description: Lightweight project management through a single PROJECT.md file with kanban board, Mermaid Gantt timeline, dependency graph, and velocity tracking. Auto-updates board state, regenerates diagrams, and logs changes. Use when the user asks about project status, wants to track tasks, manage a board, add or complete tasks, check what's blocking, view the timeline, or manage sprints. Also use via /amp:track command.
argument-hint: [status | add <task> | init | next | board]
---

# amp:track

Manage an entire project through a single `PROJECT.md` file. The board section is the source of truth; timeline, dependency graph, and velocity are generated views that stay in sync automatically.

## Commands

### `init`

Create a new `PROJECT.md` in the repository root (or the current working directory).

**Behavior:**
1. Check if `PROJECT.md` already exists. If so, ask the user before overwriting.
2. Check if a `PLAN.md` exists (from amp:plan). If found, seed the board from its phases and tasks (see "Seeding from PLAN.md" below). If not, use the blank template from `project-template.md`.
3. Replace `[Project Name]` with the actual project name (ask the user or derive from the directory name).
4. Set Sprint 1 start date to today and end date to today + 14 days.
5. Log the initialization in the Log table.

### `status`

Read `PROJECT.md` and produce a concise summary:

- Current sprint number, date range, and goal
- Task counts per column (Backlog: N, In Progress: N, In Review: N, Done: N)
- Any blocked tasks (tasks with `blocked` tag or unresolved dependencies)
- Days remaining in current sprint
- Current velocity trend (from Velocity table)

This is the default action when no argument is given.

### `add <task>`

Add a new task to the Backlog column.

**Metadata parsing:** Extract metadata from the task description:
- `~Nd` or `~N.5d` -- duration in days (e.g., `~2d`, `~0.5d`)
- `#tag` -- category tag (e.g., `#backend`, `#ui`, `#bug`)
- `@name` -- assignee (e.g., `@alice`)
- `depends:TASK` -- dependency on another task
- `!` -- high priority marker

**Example:**
```
/amp:track add Implement user auth ~3d #backend @alice
```

Adds to Backlog:
```markdown
- [ ] Implement user auth ~3d #backend @alice
```

After adding, regenerate the Gantt and dependency graph, then append to the Log.

### `next`

Recommend the next task to work on based on:

1. **Unblocked** -- no incomplete dependencies
2. **Priority** -- tasks marked `!` first
3. **Critical path** -- tasks that block the most other tasks
4. **Sprint fit** -- tasks whose duration fits remaining sprint time

Present the top 1-3 recommendations with reasoning.

### `board`

Display the current board state in a readable format. If the terminal supports it, show the Mermaid kanban diagram. Otherwise, display a text-based column view:

```
| Backlog (3)     | In Progress (2) | In Review (1)  | Done (4)        |
|-----------------|-----------------|----------------|-----------------|
| Task A ~2d      | Task D ~3d      | Task F ~1d     | Task G ~1d      |
| Task B ~1d      | Task E ~2d      |                | Task H ~2d      |
| Task C ~3d      |                 |                | Task I ~1d      |
|                 |                 |                | Task J ~0.5d    |
```

## Board Management Rules

### Column Structure

The Board section of PROJECT.md has exactly four columns as level-3 headings:

```markdown
## Board

### Backlog
### In Progress
### In Review
### Done
```

### Task Format

Each task is a markdown checkbox list item with optional metadata:

```markdown
- [ ] Task description ~duration #tag @assignee
```

Completed tasks in the Done column use `[x]`:

```markdown
- [x] Task description ~duration #tag @assignee
```

### Subtasks

Tasks can have indented subtasks:

```markdown
- [ ] Parent task ~3d #backend @alice
  - [x] Subtask 1
  - [ ] Subtask 2
  - [ ] Subtask 3
```

Subtask checkboxes are independent of the parent. The parent moves to Done only when all subtasks are complete.

### Moving Tasks Between Columns

When moving a task:
1. Remove the line (and its subtasks) from the source column
2. Add it under the destination column heading
3. Preserve all metadata (~duration, #tag, @assignee)
4. Update checkbox state:
   - Moving to Done: change `- [ ]` to `- [x]` (parent and all subtasks)
   - Moving out of Done: change `- [x]` to `- [ ]`
   - Moving between Backlog/In Progress/In Review: keep `- [ ]`
5. After moving, regenerate both the Gantt chart and the dependency graph
6. Append a log entry: `Moved "Task description" to <Column>`

### Dependencies

Tasks can declare dependencies:

```markdown
- [ ] Build API endpoints ~3d #backend @alice
- [ ] Write API tests ~2d #backend @bob depends:Build API endpoints
```

A task with unresolved dependencies cannot be moved to "In Progress" without acknowledging the dependency. When displaying the board or recommending next tasks, flag blocked tasks.

## Mermaid Diagram Regeneration

After every board change (add, move, complete), regenerate both diagrams in PROJECT.md.

### Gantt Chart Regeneration

See `update-guide.md` for the complete algorithm. Summary:

1. Parse all tasks from the four Board columns
2. Map each column to a Gantt status tag:
   - Backlog -> (no status tag)
   - In Progress -> `active`
   - In Review -> `crit`
   - Done -> `done`
3. Parse `~Nd` as duration (`Nd` in Gantt syntax)
4. Parse `depends:TASK` to generate `after` clauses
5. Group tasks into sections by `#tag` (tasks without tags go in a "General" section)
6. Use `excludes weekends` by default
7. Set `dateFormat YYYY-MM-DD` and start from the sprint start date

### Dependency Graph Regeneration

See `update-guide.md` for the complete algorithm. Summary:

1. Parse all tasks and their `depends:` relationships
2. Create a Mermaid flowchart (graph LR)
3. Style nodes by column:
   - Done: green fill (`style node fill:#4caf50,color:#fff`)
   - In Progress: yellow fill (`style node fill:#fff9c4,color:#333`)
   - In Review: orange fill (`style node fill:#ffe0b2,color:#333`)
   - Backlog: grey fill (`style node fill:#e0e0e0,color:#333`)
4. Draw directed edges for dependencies
5. Add checkmark emoji to Done task labels

## Log Management

The Log table at the bottom of PROJECT.md is an append-only audit trail.

**Format:**

```markdown
| Date | Action | Details |
|------|--------|---------|
| 2026-02-13 | Initialized project | Seeded from PLAN.md with 12 tasks |
```

**Log these events:**
- Project initialized
- Task added
- Task moved between columns
- Sprint started/ended
- Dependency added/removed
- Board regenerated (after manual edits)

Always use ISO 8601 date format (YYYY-MM-DD).

## Velocity Tracking

### Velocity Table

```markdown
| Sprint | Planned | Completed | Carry-over | Velocity |
|--------|---------|-----------|------------|----------|
| 1      | 10      | 8         | 2          | 8        |
```

- **Planned**: number of tasks in the sprint at sprint start (snapshot)
- **Completed**: number of tasks that reached Done during the sprint
- **Carry-over**: tasks that did not reach Done and are carried to the next sprint
- **Velocity**: same as Completed (tasks finished in the sprint)

### Velocity Trends

When the Velocity table has 3+ sprints, include trend analysis in `status` output:
- **Stable**: velocity varies less than 20% across last 3 sprints
- **Improving**: velocity trending upward
- **Declining**: velocity trending downward
- **Volatile**: velocity varies more than 40% across sprints

## Sprint Management

### Starting a New Sprint

When the user asks to start a new sprint or the current sprint's end date has passed:

1. End the current sprint:
   - Count planned, completed, and carry-over tasks
   - Append a row to the Velocity table
   - Log the sprint end
2. Start the next sprint:
   - Increment the sprint number
   - Set start date to today and end date to today + 14 days (default 2-week sprints)
   - Ask the user for the sprint goal
   - Move incomplete tasks from In Progress and In Review back to the top of Backlog (carry-over)
   - Clear the Done column (archive completed tasks in the log if needed)
   - Log the sprint start
3. Regenerate Gantt and dependency graph

### Mid-Sprint Adjustments

If the user adds or removes tasks mid-sprint, update the "Planned" count in the current sprint's velocity row. Note the change in the log.

## Metadata Parsing

When parsing task text, extract metadata tokens in this order:

1. **Priority**: leading `!` character
2. **Duration**: `~Nd` or `~N.5d` pattern (e.g., `~2d`, `~0.5d`)
3. **Tags**: `#word` patterns (e.g., `#backend`, `#ui`)
4. **Assignee**: `@word` pattern (e.g., `@alice`)
5. **Dependencies**: `depends:text` pattern (e.g., `depends:Setup database`)

The remaining text after stripping metadata tokens is the task title.

**Example:**
```
! Implement auth flow ~3d #backend #security @alice depends:Setup database
```
Parses to:
- Priority: high
- Title: "Implement auth flow"
- Duration: 3 days
- Tags: backend, security
- Assignee: alice
- Depends on: "Setup database"

## Cross-Skill Hooks

### Seeding from PLAN.md (amp:plan)

When `PLAN.md` exists during `init`:

1. Read the Phases section of PLAN.md
2. For each phase, extract tasks (lines matching `- [ ] Task ~estimate @assignee`)
3. Add Phase 1 tasks to the Backlog column in PROJECT.md
4. Add later-phase tasks to Backlog as well, but tag them with `#phase-N`
5. Preserve all metadata from PLAN.md tasks
6. Generate the initial Gantt chart from these tasks
7. Generate the initial dependency graph from PLAN.md's dependency graph if present

### Updating PROGRESS.md (amp:plan)

When a task is moved to Done and a `PROGRESS.md` exists:

1. Append the task to PROGRESS.md's Completed table with today's date
2. Update the metrics (tasks completed count)
3. If a phase's tasks are all complete, update the Current Status header in PROGRESS.md

## Templates and References

- `project-template.md` -- Complete PROJECT.md template used by `init`
- `update-guide.md` -- Detailed mechanical rules for maintaining PROJECT.md (moving tasks, regenerating diagrams, managing sprints, calculating velocity)

## Quality Checklist

Before presenting any PROJECT.md update to the user, verify:

- [ ] All Mermaid diagrams use valid syntax and render correctly
- [ ] Checkbox states match column positions (`[x]` only in Done)
- [ ] All metadata is preserved after task moves
- [ ] The Log table has an entry for the action just performed
- [ ] Gantt chart dates align with the current sprint's date range
- [ ] Dependency graph node colors match current column positions
- [ ] Subtask states are consistent with parent task state
