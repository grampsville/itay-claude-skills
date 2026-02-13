# Project: [Project Name]

## Sprint: 1 ([start-date] to [end-date])

**Goal:** [Define the sprint goal here]

## Board

### Backlog

- [ ] Define project requirements ~1d #planning @[assignee]
- [ ] Set up CI/CD pipeline ~2d #devops
- [ ] Design database schema ~1d #backend @[assignee]

### In Progress

- [ ] Initialize project repository ~0.5d #devops @[assignee]
  - [x] Create repo
  - [ ] Configure linting
  - [ ] Add pre-commit hooks

### In Review

- [ ] Write project README ~0.5d #docs @[assignee]

### Done

- [x] Create project plan ~1d #planning @[assignee]

## Timeline

```mermaid
gantt
    title Sprint 1
    dateFormat YYYY-MM-DD
    excludes weekends

    section Planning
    Create project plan           :done,    plan,       2026-02-13, 1d
    Define project requirements   :         reqs,       after plan, 1d

    section DevOps
    Initialize project repository :active,  init-repo,  2026-02-13, 1d
    Set up CI/CD pipeline         :         cicd,       after init-repo, 2d

    section Backend
    Design database schema        :         db-schema,  after reqs, 1d

    section Docs
    Write project README          :crit,    readme,     2026-02-13, 1d
```

## Dependencies

```mermaid
graph LR
    A["Create project plan"] --> B["Define project requirements"]
    A --> F["Write project README"]
    C["Initialize project repository"] --> D["Set up CI/CD pipeline"]
    B --> E["Design database schema"]

    style A fill:#4caf50,color:#fff
    style B fill:#e0e0e0,color:#333
    style C fill:#fff9c4,color:#333
    style D fill:#e0e0e0,color:#333
    style E fill:#e0e0e0,color:#333
    style F fill:#ffe0b2,color:#333
```

## Velocity

| Sprint | Planned | Completed | Carry-over | Velocity |
|--------|---------|-----------|------------|----------|

## Log

| Date | Action | Details |
|------|--------|---------|
| [start-date] | Initialized project | Created PROJECT.md with [N] tasks |
