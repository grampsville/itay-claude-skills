# Itay-Claude-Skills Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a shareable npm package containing three Claude Code skills: docs-on-steroids, project-planner, and project-tracker.

**Architecture:** Monorepo with `skills/` containing three skill directories, each with a `SKILL.md` frontmatter file plus reference docs. A `bin/cli.js` using `@clack/prompts` handles interactive installation to `~/.claude/skills/` or `./.claude/skills/`.

**Tech Stack:** Node.js >= 18, ES modules, `@clack/prompts` for CLI, Mermaid for diagrams, standard Claude Code skill format (SKILL.md with YAML frontmatter).

---

## Task 1: Package Scaffolding

**Files:**
- Create: `D:/ws/Itay-Claude-Skills/package.json`
- Create: `D:/ws/Itay-Claude-Skills/LICENSE`
- Create: `D:/ws/Itay-Claude-Skills/CLAUDE.md`

**Step 1: Create package.json**

```json
{
  "name": "itay-claude-skills",
  "version": "1.0.0",
  "description": "Enhanced Claude Code skills: documentation on steroids, project planner, and project tracker",
  "type": "module",
  "bin": {
    "itay-claude-skills": "./bin/cli.js"
  },
  "files": [
    "bin",
    "skills"
  ],
  "engines": {
    "node": ">=18"
  },
  "keywords": [
    "claude",
    "claude-code",
    "skills",
    "documentation",
    "mermaid",
    "project-management",
    "planning"
  ],
  "author": "Itay",
  "license": "MIT",
  "dependencies": {
    "@clack/prompts": "^0.7.0"
  }
}
```

**Step 2: Create MIT LICENSE file**

Standard MIT license with year 2026 and author "Itay".

**Step 3: Create CLAUDE.md**

```markdown
# Itay-Claude-Skills

## Project Overview
Shareable npm package with three Claude Code skills. Installable via `npx itay-claude-skills`.

## Skills
- `docs-on-steroids` — Enhanced documentation with Mermaid diagrams, auto-detect, drift detection
- `project-planner` — Auto-generates PRD.md, PLAN.md, PROGRESS.md, PIVOTS.md with diagrams
- `project-tracker` — Lightweight PM via single PROJECT.md with kanban + Mermaid views

## Conventions
- All skill files use YAML frontmatter per Claude Code spec
- Skill names: lowercase with hyphens, max 64 chars
- Reference files: one level deep from SKILL.md
- Forward slashes in all paths
- Keep SKILL.md under 500 lines; move details to reference files
```

**Step 4: Commit**

```bash
git add package.json LICENSE CLAUDE.md
git commit -m "feat: scaffold npm package with package.json, LICENSE, CLAUDE.md"
```

---

## Task 2: CLI Installer

**Files:**
- Create: `D:/ws/Itay-Claude-Skills/bin/cli.js`

**Step 1: Create the CLI installer**

```javascript
#!/usr/bin/env node

import * as p from '@clack/prompts';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillsSource = join(__dirname, '..', 'skills');

const SKILLS = [
  {
    value: 'docs-on-steroids',
    label: 'docs-on-steroids',
    hint: 'Enhanced documentation with Mermaid diagrams',
  },
  {
    value: 'project-planner',
    label: 'project-planner',
    hint: 'Auto-generate PRD, PLAN, PROGRESS, PIVOTS',
  },
  {
    value: 'project-tracker',
    label: 'project-tracker',
    hint: 'Lightweight PM via PROJECT.md',
  },
];

async function main() {
  p.intro('Itay Claude Skills Installer');

  const selected = await p.multiselect({
    message: 'Which skills would you like to install?',
    options: [
      ...SKILLS,
      { value: 'all', label: 'All skills (recommended)' },
    ],
    required: true,
  });

  if (p.isCancel(selected)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  const skillsToInstall = selected.includes('all')
    ? SKILLS.map((s) => s.value)
    : selected;

  const location = await p.select({
    message: 'Install location?',
    options: [
      {
        value: 'global',
        label: 'Global (~/.claude/skills/)',
        hint: 'Available in all projects',
      },
      {
        value: 'local',
        label: 'Local (./.claude/skills/)',
        hint: 'This project only',
      },
    ],
  });

  if (p.isCancel(location)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  const targetBase =
    location === 'global'
      ? join(homedir(), '.claude', 'skills')
      : join(process.cwd(), '.claude', 'skills');

  const spinner = p.spinner();
  spinner.start('Installing skills...');

  for (const skill of skillsToInstall) {
    const source = join(skillsSource, skill);
    const target = join(targetBase, skill);

    if (existsSync(target)) {
      spinner.message(`Overwriting ${skill}...`);
    }

    mkdirSync(target, { recursive: true });
    cpSync(source, target, { recursive: true });
  }

  spinner.stop('Skills installed successfully!');

  p.note(
    [
      `Installed ${skillsToInstall.length} skill(s) to ${targetBase}`,
      '',
      'Available commands:',
      '  /docs-on-steroids [topic]  — Generate documentation',
      '  /project-planner           — Start brainstorming/planning',
      '  /project-tracker [action]  — Manage project board',
    ].join('\n'),
    'Next steps'
  );

  p.outro('Happy building!');
}

main().catch(console.error);
```

**Step 2: Install dependencies**

Run: `cd D:/ws/Itay-Claude-Skills && npm install`
Expected: `node_modules/` created, `package-lock.json` created

**Step 3: Test CLI runs**

Run: `cd D:/ws/Itay-Claude-Skills && node bin/cli.js --help`
Expected: CLI starts (will show the interactive prompt)

**Step 4: Commit**

```bash
git add bin/cli.js package-lock.json
git commit -m "feat: add interactive CLI installer with @clack/prompts"
```

---

## Task 3: Skill 1 — docs-on-steroids/SKILL.md

**Files:**
- Create: `D:/ws/Itay-Claude-Skills/skills/docs-on-steroids/SKILL.md`

**Step 1: Create the skill definition**

The SKILL.md must:
- Have YAML frontmatter with `name`, `description`, `argument-hint`
- Stay under 500 lines (move references to separate files)
- Include the documentation template structure
- Include diagram type selection guide
- Include auto-detect instructions
- Include drift detection instructions
- Reference `mermaid-reference.md`, `diagram-examples.md`, `doc-templates.md`, `drift-detection.md`

```yaml
---
name: docs-on-steroids
description: Create comprehensive technical documentation with Mermaid diagrams, PlantUML guidance, and visual architecture docs. Auto-detects undocumented code areas, generates documentation gap reports, and flags stale docs that have drifted from code changes. Use when documenting code architecture, API flows, database schemas, state machines, system design, creating README files, explaining code, or when any technical concept benefits from visual diagrams. Also use when asked to audit documentation freshness or find undocumented code.
argument-hint: [topic or file to document]
---
```

Body should include:
1. **Documentation workflow** — Step-by-step process for generating docs
2. **Template selection** — Which template to use based on what's being documented (API, library, CLI, microservice, database)
3. **Diagram type decision matrix** — Map scenarios to the right diagram type
4. **Auto-detect mode** — Instructions for scanning codebase for undocumented areas
5. **Drift detection mode** — Instructions for comparing file dates and checking for stale references
6. **Multi-format output** — Primary Mermaid, with PlantUML/DOT guidance and SVG/PNG export instructions
7. **Naming conventions** — PascalCase for services, camelCase for actions, SCREAMING_SNAKE for constants
8. **Quality checklist** — Verify diagrams render, labels clear, flow logical, color accessible
9. **References** — Links to `mermaid-reference.md`, `diagram-examples.md`, `doc-templates.md`, `drift-detection.md`

**Step 2: Commit**

```bash
git add skills/docs-on-steroids/SKILL.md
git commit -m "feat: add docs-on-steroids skill definition"
```

---

## Task 4: Skill 1 — docs-on-steroids Reference Files

**Files:**
- Create: `D:/ws/Itay-Claude-Skills/skills/docs-on-steroids/mermaid-reference.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/docs-on-steroids/diagram-examples.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/docs-on-steroids/doc-templates.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/docs-on-steroids/drift-detection.md`

**Step 1: Create mermaid-reference.md**

Complete Mermaid syntax reference covering all 15 diagram types:
- Flowchart (node shapes, arrows, subgraphs, styling)
- Sequence Diagram (participants, messages, activation, loops, alt/opt)
- Class Diagram (classes, relationships, methods, annotations)
- State Diagram (states, transitions, forks, joins, notes)
- ER Diagram (entities, attributes, relationships with cardinality)
- C4 Context Diagram (system context boundary, external systems)
- C4 Container Diagram (containers within system boundary)
- C4 Component Diagram (components within container)
- User Journey (actors, tasks, satisfaction scores)
- Gantt Chart (tasks, sections, dependencies, milestones, excludes)
- Quadrant Chart (axes, quadrants, data points)
- Mindmap (hierarchical nodes, shapes, icons)
- Timeline (periods, events, sections)
- Git Graph (commits, branches, merges, cherry-picks)
- Pie Chart (data slices, percentages)
- Block Diagram (blocks, arrows, columns)

Each type should include: syntax overview, key keywords, a complete working example, and common pitfalls.

Add a table of contents at the top (file will exceed 100 lines).

**Step 2: Create diagram-examples.md**

15+ real-world examples showing documentation with embedded Mermaid diagrams:
1. REST API request/response flow (sequence diagram)
2. Microservices architecture (flowchart with subgraphs)
3. Database schema (ER diagram)
4. Authentication flow (sequence diagram with alt blocks)
5. CI/CD pipeline (flowchart)
6. State machine for order processing (state diagram)
7. System architecture overview (C4 context)
8. Component internals (C4 component)
9. User signup journey (user journey)
10. Sprint timeline (Gantt chart)
11. Feature prioritization (quadrant chart)
12. Technology decision tree (mindmap)
13. Project milestones (timeline)
14. Git branching strategy (git graph)
15. Error distribution (pie chart)
16. Deployment architecture (block diagram)

Each example should show the Mermaid source and explain when/why to use that diagram type.

**Step 3: Create doc-templates.md**

Context-specific documentation templates:

**API Service Template:**
- Overview + architecture diagram
- Authentication (how to authenticate, API keys, OAuth)
- Endpoints table (method, path, description)
- Request/Response examples with sequence diagrams
- Error codes table
- Rate limits
- Changelog

**Library/Package Template:**
- Overview + dependency diagram
- Installation
- Quick start
- API Reference (classes, methods, parameters)
- Class diagram
- Examples
- Migration guide

**CLI Tool Template:**
- Overview + command flow diagram
- Installation
- Commands reference table
- Flags and options
- Examples
- Configuration

**Microservice Template:**
- Overview + C4 context diagram
- Architecture + C4 container diagram
- Communication patterns + sequence diagrams
- Data model + ER diagram
- Deployment + block diagram
- Monitoring and health checks

**Database Schema Template:**
- Overview
- ER diagram
- Tables reference (columns, types, constraints)
- Relationships explanation
- Indexes
- Migration history

**Step 4: Create drift-detection.md**

Instructions for Claude on how to detect stale documentation:

1. **File date comparison** — Compare source file `git log` last modified date vs doc file last modified date. If source is newer, flag as potentially stale.
2. **Symbol reference check** — Extract function/class/variable names from source code. Check if docs reference names that no longer exist (renamed/deleted).
3. **Import/dependency check** — If a module's imports changed, its architecture docs may be stale.
4. **Gap report format** — Template for the documentation gap report output.
5. **Staleness severity levels** — Critical (referenced symbols deleted), Warning (source newer than doc), Info (new files without docs).

**Step 5: Commit**

```bash
git add skills/docs-on-steroids/
git commit -m "feat: add docs-on-steroids reference files (mermaid ref, examples, templates, drift detection)"
```

---

## Task 5: Skill 2 — project-planner/SKILL.md

**Files:**
- Create: `D:/ws/Itay-Claude-Skills/skills/project-planner/SKILL.md`

**Step 1: Create the skill definition**

```yaml
---
name: project-planner
description: Automatically creates comprehensive project planning documentation when brainstorming or starting new projects, features, or components. Generates PRD.md, PLAN.md, PROGRESS.md, and PIVOTS.md with auto-selected Mermaid diagrams. Use when the user is brainstorming, planning a new project, designing a feature, starting a new component, or discussing what to build. Triggers on phrases like "let's build", "I want to create", "new project", "add a feature", "new component", "let's brainstorm", "what if we".
argument-hint: [project or feature name]
---
```

Body should include:
1. **Detection logic** — How to recognize brainstorming/planning context from user messages
2. **Output directory** — `docs/plans/<feature-or-project-name>/`
3. **File generation order** — PRD.md first, then PLAN.md, then PROGRESS.md and PIVOTS.md
4. **Diagram auto-selection** — Decision matrix: new project → C4 + ER + Gantt + user journey; new feature → sequence + state + flowchart; new component → class + flowchart + component; refactor → before/after architecture
5. **PRD generation guide** — How to extract problem statement, goals, user stories, scope from conversation
6. **PLAN generation guide** — How to break work into phases and tasks with estimates
7. **Auto-update rules** — When/how to update PROGRESS.md (task completion) and PIVOTS.md (plan changes)
8. **Cross-skill hooks** — How to seed project-tracker's PROJECT.md from PLAN.md
9. **References** — Links to all template files

**Step 2: Commit**

```bash
git add skills/project-planner/SKILL.md
git commit -m "feat: add project-planner skill definition"
```

---

## Task 6: Skill 2 — project-planner Templates and Examples

**Files:**
- Create: `D:/ws/Itay-Claude-Skills/skills/project-planner/prd-template.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/project-planner/plan-template.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/project-planner/progress-template.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/project-planner/pivots-template.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/project-planner/diagram-selection.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/project-planner/examples/new-project.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/project-planner/examples/new-feature.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/project-planner/examples/new-component.md`

**Step 1: Create prd-template.md**

Full PRD template with:
- Problem Statement section with guidance prompts
- Goals & Success Criteria with checkbox format
- User Stories in "As a... I want... So that..." format
- Scope (In Scope / Out of Scope)
- Architecture Overview with placeholder for C4 context diagram
- Data Model with placeholder for ER diagram
- User Flow with placeholder for sequence/flowchart diagram
- Technical Constraints
- Dependencies
- Open Questions

Each section should include guidance comments explaining what to fill in.

**Step 2: Create plan-template.md**

Full PLAN template with:
- Phases section with task checklist format (`- [ ] Task ~estimate @assignee`)
- Architecture Decisions with placeholder for decision flowchart
- Component Breakdown with placeholder for component/class diagram
- Dependency Graph with placeholder for Mermaid graph
- Timeline with placeholder for Gantt chart
- Risk Assessment table (Risk, Likelihood, Impact, Mitigation)

**Step 3: Create progress-template.md**

Full PROGRESS template with:
- Current Status header
- Completed table (Date, Task, Notes)
- In Progress table (Task, Started, Assignee, Blockers)
- Metrics (tasks completed X/Y, current phase X of N)
- Timeline with placeholder for actual-vs-planned Gantt

Include instructions for auto-update: "Claude should append to Completed table when marking tasks done, move entries between tables when status changes, and regenerate the Gantt chart."

**Step 4: Create pivots-template.md**

Full PIVOTS template with:
- Change Log table (Date, What Changed, Why, Impact)
- Original Plan vs Current with placeholder for before/after diagram
- Lessons Learned bullet list

Include instructions for auto-update: "Claude should append to Change Log whenever the PLAN.md is modified, capturing the delta and reasoning."

**Step 5: Create diagram-selection.md**

Decision matrix for auto-selecting diagrams:

| Context | Diagrams | Why |
|---------|----------|-----|
| New project | C4 context, ER, component, Gantt, user journey | Full system overview needed |
| New feature | Sequence, state, flowchart, dependency graph | Feature behavior focus |
| New component | Class, flowchart, component | Internal structure focus |
| Refactor | Before/after architecture, dependency graph | Change impact focus |
| API design | Sequence, ER, flowchart | Request/response focus |
| Database change | ER, state, migration timeline | Data model focus |
| UI feature | User journey, flowchart, component | User experience focus |

Plus detailed guidance on when to pick each of the 15 Mermaid diagram types.

**Step 6: Create example files**

Three complete examples showing what the planning output looks like for:
- `examples/new-project.md` — A todo app project (PRD + PLAN + PROGRESS + PIVOTS with all diagrams filled in)
- `examples/new-feature.md` — Adding OAuth to an existing app (focused PRD + PLAN with sequence diagrams)
- `examples/new-component.md` — Building a reusable data table component (focused PRD + PLAN with class diagram)

Each example should be a realistic, complete output — not a template but an actual filled-in example.

**Step 7: Commit**

```bash
git add skills/project-planner/
git commit -m "feat: add project-planner templates, diagram selection guide, and examples"
```

---

## Task 7: Skill 3 — project-tracker/SKILL.md

**Files:**
- Create: `D:/ws/Itay-Claude-Skills/skills/project-tracker/SKILL.md`

**Step 1: Create the skill definition**

```yaml
---
name: project-tracker
description: Lightweight project management through a single PROJECT.md file with kanban board, Mermaid Gantt timeline, dependency graph, and velocity tracking. Auto-updates board state, regenerates diagrams, and logs changes. Use when the user asks about project status, wants to track tasks, manage a board, add or complete tasks, check what's blocking, view the timeline, or manage sprints. Also use via /project-tracker command.
argument-hint: [status | add <task> | init | next | board]
---
```

Body should include:
1. **Commands** — What happens for each argument:
   - `init` — Create PROJECT.md from scratch (or seed from PLAN.md if it exists)
   - `status` — Read PROJECT.md and summarize current state
   - `add <task>` — Add task to Backlog with metadata parsing (~duration #tag @assignee)
   - `next` — Recommend the next task to work on (unblocked, highest priority)
   - `board` — Display the current board state
   - No argument — Default to `status`
2. **Board management rules** — How to move tasks between columns, update checkboxes, handle subtasks
3. **Mermaid regeneration** — After every board change: regenerate Gantt from Board section tasks, regenerate dependency graph from task relationships
4. **Log management** — Append to Log table with ISO date and action description
5. **Velocity tracking** — Update velocity table at sprint boundaries
6. **Sprint management** — How to start/end sprints, carry over incomplete tasks
7. **Metadata parsing** — How to parse `~2d`, `#tag`, `@assignee` from task descriptions
8. **Cross-skill hooks** — Read PLAN.md to seed initial tasks, update PROGRESS.md on completions
9. **References** — Links to `project-template.md` and `update-guide.md`

**Step 2: Commit**

```bash
git add skills/project-tracker/SKILL.md
git commit -m "feat: add project-tracker skill definition"
```

---

## Task 8: Skill 3 — project-tracker Reference Files

**Files:**
- Create: `D:/ws/Itay-Claude-Skills/skills/project-tracker/project-template.md`
- Create: `D:/ws/Itay-Claude-Skills/skills/project-tracker/update-guide.md`

**Step 1: Create project-template.md**

The complete PROJECT.md template with all sections:
- Project header with name
- Sprint section (number, date range, goal)
- Board with 4 columns: Backlog, In Progress, In Review, Done
- Each column with example placeholder tasks showing metadata format
- Timeline section with a Mermaid Gantt placeholder
- Dependencies section with a Mermaid graph placeholder
- Velocity table with headers
- Log table with headers

This is what gets copied when the user runs `/project-tracker init`.

**Step 2: Create update-guide.md**

Detailed rules for Claude on how to maintain PROJECT.md:

**Moving tasks:**
- Change `- [ ]` to `- [x]` when moving to Done
- Physically move the line from one section heading to another
- Preserve all metadata (~duration, #tags, @assignee)
- Update subtask checkboxes independently

**Regenerating Gantt:**
- Parse all tasks from Board sections
- Map column to Gantt status: Backlog → no tag, In Progress → `active`, In Review → `crit`, Done → `done`
- Parse `~Nd` as duration in days
- Generate `after` dependencies from task descriptions or explicit dep markers
- Use `excludes weekends` by default
- Group by #tag as sections

**Regenerating dependency graph:**
- Parse task IDs (if present) or use task descriptions as node labels
- Done tasks get green fill + checkmark
- In Progress tasks get yellow fill + spinner emoji
- Blocked tasks get red fill
- Draw edges for dependencies

**Log format:**
- ISO date (YYYY-MM-DD)
- Action: "Moved X to Done", "Added task Y", "Started sprint N"
- Details: any relevant context

**Velocity calculation:**
- At sprint end: count tasks planned vs completed vs carried over
- Append row to Velocity table

**Step 3: Commit**

```bash
git add skills/project-tracker/
git commit -m "feat: add project-tracker template and update guide"
```

---

## Task 9: README.md

**Files:**
- Create: `D:/ws/Itay-Claude-Skills/README.md`

**Step 1: Create README**

Include:
- Project title and one-line description
- Installation section (`npx itay-claude-skills`)
- Skills overview table (name, description, slash command)
- Detailed section for each skill with:
  - What it does
  - Example usage
  - Sample output (truncated Mermaid example)
- Cross-skill workflow diagram (Mermaid flowchart showing how the 3 skills interact)
- Manual installation instructions (clone + copy to `.claude/skills/`)
- Contributing section
- License

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with installation, skill overview, and usage examples"
```

---

## Task 10: Final Verification

**Step 1: Verify directory structure**

Run: `find D:/ws/Itay-Claude-Skills -type f | grep -v node_modules | grep -v .git | sort`

Expected output should match the design doc structure:
```
bin/cli.js
CLAUDE.md
docs/plans/2026-02-13-implementation-plan.md
docs/plans/2026-02-13-itay-claude-skills-design.md
LICENSE
package.json
package-lock.json
README.md
skills/docs-on-steroids/SKILL.md
skills/docs-on-steroids/diagram-examples.md
skills/docs-on-steroids/doc-templates.md
skills/docs-on-steroids/drift-detection.md
skills/docs-on-steroids/mermaid-reference.md
skills/project-planner/SKILL.md
skills/project-planner/diagram-selection.md
skills/project-planner/examples/new-component.md
skills/project-planner/examples/new-feature.md
skills/project-planner/examples/new-project.md
skills/project-planner/plan-template.md
skills/project-planner/pivots-template.md
skills/project-planner/progress-template.md
skills/project-planner/prd-template.md
skills/project-tracker/SKILL.md
skills/project-tracker/project-template.md
skills/project-tracker/update-guide.md
```

**Step 2: Verify all SKILL.md frontmatter is valid**

For each SKILL.md, check:
- `name` is lowercase with hyphens, max 64 chars
- `description` is non-empty, max 1024 chars
- No reserved words ("anthropic", "claude") in name
- `argument-hint` is present

**Step 3: Verify CLI runs**

Run: `cd D:/ws/Itay-Claude-Skills && node bin/cli.js`
Expected: Interactive prompt appears with skill selection

**Step 4: Test local installation**

Run the CLI, select "All skills", select "Local" installation.
Verify: `.claude/skills/docs-on-steroids/SKILL.md`, `.claude/skills/project-planner/SKILL.md`, `.claude/skills/project-tracker/SKILL.md` all exist.

**Step 5: Final commit**

```bash
git add docs/plans/2026-02-13-implementation-plan.md
git commit -m "docs: add implementation plan"
```

**Step 6: Verify git log**

Run: `cd D:/ws/Itay-Claude-Skills && git log --oneline`
Expected: Clean commit history with one commit per task.
