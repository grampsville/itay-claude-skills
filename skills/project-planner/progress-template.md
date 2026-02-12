# Progress Template

Use this template when generating PROGRESS.md files. Initialize it with empty tables when the plan is first created. Auto-update it as tasks are completed.

**Auto-update instructions for Claude:**
- When a task from PLAN.md is completed, append a row to the Completed table with today's date.
- When a task starts, add it to the In Progress table.
- When a blocker is discovered, update the Blockers column for the relevant task.
- When a phase completes, update the Current Status header.
- After any change, recalculate the metrics and regenerate the Gantt chart showing actual vs planned dates.

---

# Progress: [Project or Feature Name]

**PLAN:** [Link to PLAN.md]
**Started:** [YYYY-MM-DD]
**Last Updated:** [YYYY-MM-DD]

## Current Status: Phase [X] -- [Phase Name] [In Progress | Complete]

> Update this header whenever the active phase changes. Format: "Phase 1 -- Foundation In Progress"

## Completed

| Date | Task | Phase | Notes |
|------|------|-------|-------|

> Append rows here as tasks are completed. Include the date the task was actually finished, which phase it belongs to, and any relevant notes (e.g., "took longer than estimated due to API changes").

## In Progress

| Task | Started | Assignee | Blockers |
|------|---------|----------|----------|

> Move tasks here when work begins. Track who is working on it and any blockers. When the task completes, move the row to the Completed table.

## Upcoming

| Task | Phase | Estimate | Dependencies |
|------|-------|----------|-------------|

> List the next 3-5 tasks that will be started soon. This gives visibility into what is coming next.

## Metrics

- **Tasks completed:** 0 / [total] (0%)
- **Current phase:** 1 of [total phases]
- **Days elapsed:** 0
- **Days remaining (estimated):** [sum of remaining estimates]

> Recalculate these after every update. The percentage should reflect tasks completed vs total tasks across all phases.

## Timeline: Actual vs Planned

> Regenerate this Gantt chart after every task completion. Show both the planned dates (from PLAN.md) and actual dates. Use `done` for completed tasks, `active` for in-progress tasks, and `crit` for overdue tasks.

```mermaid
gantt
    title Actual vs Planned Timeline
    dateFormat YYYY-MM-DD
    excludes weekends

    section Planned
        Task 1 (planned)     :planned1, [start], [duration]
        Task 2 (planned)     :planned2, after planned1, [duration]

    section Actual
        Task 1 (actual)      :done, actual1, [start], [end]
        Task 2 (actual)      :active, actual2, [start], [duration]
```

## Blockers

> Track active blockers here. Remove them when resolved and note the resolution in the Completed table.

| Blocker | Affects | Raised | Status | Resolution |
|---------|---------|--------|--------|------------|

> Status values: Active, Resolved, Won't Fix
