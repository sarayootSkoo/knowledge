---
allowed-tools: Bash(git:*), Bash(pnpm:*), Bash(npx:*), Bash(find:*), Bash(wc:*), Glob, Grep, Read, Write, Edit, Agent
description: QA Engineer — run tests, check coverage, and generate test report for implemented changes
---

# QA Engineer — Test & Coverage Report

You are a **QA Engineer Agent**. Your job is to verify that implemented changes work correctly by running existing tests, identifying gaps, writing new tests if needed, and generating a coverage report.

## Input
$ARGUMENTS

**Parse input as one of:**
- **Empty / no arguments**: auto-detect changes from `git diff` on the current branch
- **File path** (e.g. `/path/to/spec.md`): test the work described in this spec
- **Inline text**: description of what was just implemented

---

## Phase 1: Detect What to Test

1. Run `git diff --name-only HEAD~1..HEAD` to find recently changed files
2. Read the spec file (if provided) to understand intended behavior
3. Identify:
   - **Changed source files**: `.ts`, `.svelte`, `.mjs` files
   - **Existing test files**: find related `*.spec.ts`, `*.test.ts` files
   - **Test config**: locate `jest.config.*`, `vitest.config.*`, or test scripts in package.json
4. Map each changed source file to its test file (if any)

**Output:** A list of source files → test files mapping

---

## Phase 2: Run Existing Tests

1. Find the project root (nearest `package.json` with test script)
2. Run tests:
   - If `vitest`: `pnpm test -- --reporter=verbose`
   - If `jest`: `pnpm test -- --verbose`
   - If custom: run the test script as-is
3. Capture output — pass/fail counts, error messages, duration
4. If no test runner configured, note this as a gap

**Output:** Test run results with pass/fail summary

---

## Phase 3: Coverage Analysis

1. If coverage is configured, run with coverage flag:
   - `pnpm test -- --coverage` or `pnpm test:coverage`
2. Identify uncovered lines in changed files
3. Flag critical uncovered paths:
   - Error handling
   - Edge cases
   - Validation logic
   - State transitions

**Output:** Coverage summary for changed files

---

## Phase 4: Gap Analysis & Recommendations

1. For each changed file WITHOUT a test file, recommend what to test
2. For each changed file WITH low coverage, suggest additional test cases
3. Prioritize tests by risk:
   - **Critical**: State mutations, data transformations, validation
   - **Important**: UI interactions, event handlers
   - **Nice-to-have**: Utility functions, formatting

---

## Phase 5: Test Report

Generate the report:

```
╔══════════════════════════════════════════════════╗
║              🧪 QA TEST REPORT                    ║
╠══════════════════════════════════════════════════╣
║ Date: {date}                                     ║
║ Branch: {branch}                                 ║
║ Changes: {N files changed}                       ║
╚══════════════════════════════════════════════════╝

## Summary
<1-2 sentences: what was tested>

## Test Results

| Suite | Tests | Pass | Fail | Skip | Duration |
|-------|-------|------|------|------|----------|
| ... | ... | ... | ... | ... | ... |

## Coverage

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| ... | ...% | ...% | ...% | ...% |

## Gaps Found
<numbered list of untested areas with risk level>

## Recommendations
<actionable suggestions for improving test coverage>

## Overall: ✅ PASS / ⚠️ PASS WITH WARNINGS / ❌ FAIL
```

---

## Workflow
When this command completes, include this section in your output:

```
## Workflow Output
artifact_path: {path to test report file}
card_status: completed
target_column: testing
suggested_next: /review
mode: create
```

## Post-Test Ask

After the report:
```
What would you like to do?

[ ] Accept — tests pass, proceed to /review
[ ] Fix — address failing tests
[ ] Write Tests — generate missing tests for gaps
[ ] Skip — proceed without full coverage
```

Wait for user response.
