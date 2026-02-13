# Drift Detection Guide

Methodology for detecting documentation that has fallen out of sync with the code it describes. Follow these steps to identify stale, inaccurate, or missing documentation.

## Table of Contents

1. [Overview](#overview)
2. [File Date Comparison](#1-file-date-comparison)
3. [Symbol Reference Checking](#2-symbol-reference-checking)
4. [Import/Dependency Change Detection](#3-importdependency-change-detection)
5. [Coverage Gap Analysis](#4-coverage-gap-analysis)
6. [Staleness Severity Levels](#staleness-severity-levels)
7. [Gap Report Format](#gap-report-format)
8. [Automated Drift Check Workflow](#automated-drift-check-workflow)

---

## Overview

Documentation drift occurs when code changes but its corresponding documentation does not get updated. Drift makes documentation misleading -- worse than having no documentation at all, because readers trust it and make wrong assumptions.

Drift detection works by comparing:
- **File timestamps** -- Has the source file been modified more recently than its documentation?
- **Symbol references** -- Do function/class names in the documentation still exist in the code?
- **Dependency graphs** -- Have imports or dependencies changed since the docs were written?
- **Coverage gaps** -- Are there new files or exports that have no documentation at all?

---

## 1. File Date Comparison

Compare the last modification date of source files against their corresponding documentation files using `git log`.

### Method

For each documentation file, identify the source files it documents, then compare their last commit dates:

```bash
# Get last modification date of a source file
git log -1 --format="%ai" -- src/services/auth-service.ts

# Get last modification date of the corresponding doc
git log -1 --format="%ai" -- docs/auth-service.md
```

### Mapping Source to Docs

Use these heuristics to map source files to their documentation:

| Documentation File | Likely Source Files |
|---|---|
| `README.md` (in a directory) | All files in that directory |
| `docs/<name>.md` | `src/<name>.ts`, `src/<name>/index.ts` |
| `docs/api/*.md` | `src/routes/*.ts`, `src/controllers/*.ts` |
| `docs/architecture.md` | `src/**` (any structural change) |
| Inline JSDoc/docstrings | The file itself |

### Interpretation Rules

| Source Date vs Doc Date | Verdict | Action |
|---|---|---|
| Source is newer by < 7 days | **Info** | May be fine if the change was minor (formatting, comments) |
| Source is newer by 7-30 days | **Warning** | Review the diff to see if docs need updating |
| Source is newer by > 30 days | **Critical** | Documentation is likely stale -- review and update |
| Doc is newer or same date | **OK** | Documentation appears up to date |

### Checking the Diff

When a source file is newer than its docs, inspect what changed:

```bash
# See what changed in the source since the doc was last updated
git log --oneline --since="<doc_last_modified_date>" -- src/services/auth-service.ts

# See the actual diff
git diff <doc_last_commit_hash>..HEAD -- src/services/auth-service.ts
```

If the changes are only formatting, comments, or internal refactors that do not affect the public API, the documentation may still be accurate. Flag as Info rather than Warning.

---

## 2. Symbol Reference Checking

Extract function, class, type, and variable names from documentation and verify they still exist in the source code.

### Method

**Step 1: Extract referenced symbols from documentation.**

Look for these patterns in documentation files:
- Inline code references: `` `functionName()` ``, `` `ClassName` ``, `` `CONSTANT_NAME` ``
- Code block references: function calls, class instantiations, import statements in example code
- Heading references: "### `methodName(param1, param2)`"
- Table references: API endpoint tables, parameter tables

**Step 2: Search for each symbol in the source code.**

For each extracted symbol, check if it exists in the current codebase:
- Search for the function/class/type/variable name in source files
- Account for re-exports (the symbol might be defined in one file but exported from another)
- Check for renamed symbols (a function may have been renamed -- look for similar names)

### Severity Classification

| Finding | Severity | Example |
|---|---|---|
| Symbol deleted from source | **Critical** | Doc references `authenticateUser()` but function was removed |
| Symbol renamed in source | **Critical** | Doc references `getUser()` but it was renamed to `fetchUser()` |
| Symbol signature changed | **Warning** | Doc shows `createOrder(items)` but function now takes `createOrder(items, options)` |
| Symbol moved to different file | **Info** | Doc says "defined in `auth.ts`" but function moved to `auth-service.ts` |
| Symbol still exists and matches | **OK** | No action needed |

### Common Rename Patterns to Check

When a symbol is not found, check for common rename patterns:
- `get` <-> `fetch` <-> `retrieve` <-> `find` <-> `load`
- `create` <-> `add` <-> `insert` <-> `new`
- `update` <-> `modify` <-> `edit` <-> `patch`
- `delete` <-> `remove` <-> `destroy` <-> `drop`
- `is`/`has`/`can` prefix toggles (e.g., `isValid` to `validate`)
- CamelCase to snake_case or vice versa during language migration

---

## 3. Import/Dependency Change Detection

When a module's imports change, its architecture documentation may be stale.

### Method

**Step 1: Identify import statements in the source file.**

```bash
# For TypeScript/JavaScript
git diff <doc_last_commit>..HEAD -- src/services/order-service.ts | grep "^[+-].*import"

# For Python
git diff <doc_last_commit>..HEAD -- src/services/order_service.py | grep "^[+-].*from\|^[+-].*import"

# For Go
git diff <doc_last_commit>..HEAD -- src/services/order_service.go | grep "^[+-].*\".*\""
```

**Step 2: Classify the import changes.**

| Change Type | Impact on Docs | Example |
|---|---|---|
| New external dependency added | Architecture docs may need updating | Added `stripe` import |
| Internal dependency added | Dependency/architecture diagrams outdated | New import from `auth-service` |
| Dependency removed | Architecture diagrams show phantom connections | Removed `legacy-adapter` import |
| Dependency replaced | Architecture diagrams show wrong technology | Switched from `axios` to `fetch` |

**Step 3: Check architecture diagrams.**

If the documentation contains Mermaid diagrams (flowcharts, C4, etc.), verify that:
- All services/components shown in diagrams still exist
- All arrows/connections between components reflect actual imports
- No new dependencies are missing from the diagrams
- Technology labels on diagram nodes match actual dependencies

### Dependency Diff Report

```markdown
### Import Changes Since Last Doc Update

**File:** `src/services/order-service.ts`
**Doc last updated:** 2026-01-15
**Source last updated:** 2026-02-10

| Change | Import | Impact |
|--------|--------|--------|
| Added | `import { StripeClient } from './payment/stripe'` | Payment dependency not shown in architecture diagram |
| Removed | `import { LegacyPaymentAdapter } from './payment/legacy'` | Legacy adapter still shown in diagram |
| Changed | `import { cache } from 'redis'` to `import { cache } from 'ioredis'` | Technology label outdated |
```

---

## 4. Coverage Gap Analysis

Find source files and exported symbols that have no corresponding documentation.

### Method

**Step 1: Inventory all source files.**

List all source files in the project, excluding test files, generated files, and configuration:

```bash
# Find all source files
git ls-files -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.py' '*.go' '*.rs' \
  | grep -v '__tests__' \
  | grep -v '.test.' \
  | grep -v '.spec.' \
  | grep -v 'node_modules' \
  | grep -v 'generated'
```

**Step 2: Check each file for documentation.**

For each source file, check:
1. Does the file have JSDoc/docstring comments on exported symbols?
2. Does the directory containing the file have a README.md?
3. Is there a corresponding doc file in `docs/` or similar location?
4. For API routes: are the endpoints documented in API docs?

**Step 3: Check each exported symbol for documentation.**

For each public/exported function, class, type, or constant:
1. Does it have a doc comment (JSDoc `/** */`, Python `"""docstring"""`, Go `// FuncName ...`)?
2. If it is part of a public API, is it listed in API reference documentation?
3. If it has parameters, are they documented with types and descriptions?

### Coverage Metrics

Calculate documentation coverage as:

```
Coverage = (documented symbols / total exported symbols) x 100
```

| Coverage Level | Assessment |
|---|---|
| 90-100% | Excellent -- well-documented codebase |
| 70-89% | Good -- minor gaps to address |
| 50-69% | Fair -- significant documentation work needed |
| < 50% | Poor -- documentation initiative recommended |

---

## Staleness Severity Levels

### Critical

Conditions that make documentation actively misleading:
- Referenced function/class/type **no longer exists** (deleted or renamed)
- API endpoint documented but **route removed** from source
- Architecture diagram shows connections that **no longer exist**
- Configuration options documented that **are no longer supported**
- Code examples that **will not compile or run** against current source

**Action:** Fix immediately. Misleading documentation is worse than no documentation.

### Warning

Conditions where documentation is likely outdated but not necessarily wrong:
- Source file modified **7-30 days** after documentation
- Function **signature changed** (new parameters, different return type)
- New **dependencies added** that are not reflected in architecture diagrams
- **New exports** added to a module without corresponding documentation

**Action:** Review within the current sprint. Check the diff to determine if the documentation needs updating.

### Info

Conditions worth noting but not urgent:
- Source file modified **< 7 days** after documentation (may be a non-API change)
- New files created **without documentation** (but not yet public/stable)
- Symbol **moved to a different file** but still exists
- Minor version bumps in referenced dependencies

**Action:** Track and address when convenient. Add to documentation backlog.

---

## Gap Report Format

Use this template when generating documentation drift and coverage reports:

````markdown
# Documentation Drift Report

**Generated:** YYYY-MM-DD
**Repository:** repository-name
**Branch:** main
**Scanned:** N source files across N directories

## Summary

| Severity | Count |
|----------|:-----:|
| Critical | N |
| Warning | N |
| Info | N |

**Documentation Coverage:** N% (N/N exported symbols documented)

## Critical Issues

### 1. Deleted symbol still referenced in docs

- **Doc file:** `docs/auth-service.md` (line 45)
- **References:** `authenticateUser(email, password)`
- **Source file:** `src/services/auth-service.ts`
- **Status:** Function `authenticateUser` was renamed to `verifyCredentials` in commit `abc1234` (2026-02-01)
- **Fix:** Update all references from `authenticateUser` to `verifyCredentials` and update parameter documentation

### 2. API endpoint removed but still documented

- **Doc file:** `docs/api/users.md` (line 78)
- **References:** `DELETE /api/v1/users/:id`
- **Source file:** `src/routes/users.ts`
- **Status:** Endpoint removed in commit `def5678` (2026-01-28), replaced by soft-delete via `PATCH /api/v1/users/:id`
- **Fix:** Remove DELETE endpoint documentation, add PATCH soft-delete documentation

## Warnings

### 3. Source file newer than documentation

- **Doc file:** `docs/order-service.md` (last updated: 2026-01-10)
- **Source file:** `src/services/order-service.ts` (last updated: 2026-02-08)
- **Days stale:** 29
- **Recent changes:** 4 commits since doc was last updated
- **Key changes:** Added `cancelOrder()` method, modified `createOrder()` signature
- **Fix:** Update order service docs with new method and updated signature

## Info

### 4. New file without documentation

- **Source file:** `src/services/analytics-service.ts` (created: 2026-02-05)
- **Exports:** `trackEvent()`, `getMetrics()`, `AnalyticsConfig`
- **Documentation:** None
- **Fix:** Create `docs/analytics-service.md` with API reference

## Undocumented Exports

| File | Symbol | Type | Priority |
|------|--------|------|----------|
| `src/services/payment.ts` | `refundPayment()` | function | High |
| `src/models/subscription.ts` | `SubscriptionTier` | enum | Medium |
| `src/utils/retry.ts` | `withRetry()` | function | Low |
````

---

## Automated Drift Check Workflow

Follow this step-by-step workflow when performing a drift check:

### Step 1: Identify Documentation Files

Locate all documentation files in the repository:
- `README.md` files at any level
- Files in `docs/` directories
- Files with `.md` extension that appear to be documentation (not changelogs, licenses, etc.)

### Step 2: Map Docs to Source

For each documentation file, determine which source files it covers using the mapping heuristics in Section 1.

### Step 3: Run Date Comparison

Compare git timestamps between each doc file and its mapped source files. Flag any source file that is newer than its documentation.

### Step 4: Extract and Verify Symbols

From each flagged documentation file, extract all code symbols (function names, class names, constants) and verify they exist in the current source code.

### Step 5: Check Import Changes

For source files with significant changes, check if import statements have changed since the documentation was last updated.

### Step 6: Run Coverage Analysis

Scan for exported symbols without documentation and new files without corresponding docs.

### Step 7: Generate Report

Compile findings into the Gap Report Format above, sorted by severity (Critical first).

### Step 8: Prioritize Fixes

Recommend fixing Critical issues immediately, Warning issues within the current sprint, and Info issues when convenient. Offer to generate updated documentation for the highest-priority items.
