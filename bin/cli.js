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
    value: 'amp-docs',
    label: 'amp:docs',
    hint: 'Enhanced documentation with Mermaid diagrams',
  },
  {
    value: 'amp-plan',
    label: 'amp:plan',
    hint: 'Auto-generate PRD, PLAN, PROGRESS, PIVOTS',
  },
  {
    value: 'amp-track',
    label: 'amp:track',
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
      '  /amp:docs [topic]   — Generate documentation',
      '  /amp:plan [name]    — Start brainstorming/planning',
      '  /amp:track [action] — Manage project board',
    ].join('\n'),
    'Next steps'
  );

  p.outro('Happy building!');
}

main().catch(console.error);
