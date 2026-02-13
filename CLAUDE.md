# Itay-Claude-Skills

## Project Overview
Shareable npm package with three Claude Code skills. Installable via `npx itay-claude-skills`.

## Skills
- `amp:docs` — Enhanced documentation with Mermaid diagrams, auto-detect, drift detection
- `amp:plan` — Auto-generates PRD.md, PLAN.md, PROGRESS.md, PIVOTS.md with diagrams
- `amp:track` — Lightweight PM via single PROJECT.md with kanban + Mermaid views

## Conventions
- All skill files use YAML frontmatter per Claude Code spec
- Skill names: lowercase with hyphens, max 64 chars
- Reference files: one level deep from SKILL.md
- Forward slashes in all paths
- Keep SKILL.md under 500 lines; move details to reference files
