# Oneshot: Plan → Implement → Review → Done

Complete an entire task from research to working code in a single command. Combines multi-agent planning, parallel implementation, cross-review, and validation into one automated workflow.

## Input
$ARGUMENTS

**Parse input as one of:**
- **File path** (e.g. `/path/spec.md`): read the file and treat its full content as the prompt
- **Inline text**: first word = `adw_id`, remaining = `prompt`
- **Missing**: if `adw_id` or `prompt` cannot be determined, stop and ask the user

## Datetime
Get current datetime: run `date '+%d_%m_%Y_%H_%M_%S'` — use result as `{datetime}` in filenames.

## Instructions

- If a page URL or file path is provided, read it first and use as context (including dependent pages)
- Write example request.json and response.json following spec detail if applicable
- Analyze impact on business, performance, and all risks
- Show business flow AS-IS and TO-BE with score ratings
- If the adw_id or prompt is not provided, stop and ask the user to provide them.

---

## STAGE 1: RESEARCH (3 Parallel Agents)

Launch all 3 research agents simultaneously. All agents are READ-ONLY.

### Agent R1: Codebase Explorer
```
Use Task tool with subagent_type="Explore"
Prompt: Research the codebase for the following task: "{prompt}"

Find ALL relevant files, understand the current implementation, and map dependencies.

Deliver:
1. RELEVANT FILES - Every file that relates to this task (source, tests, configs, types, DTOs, enums)
2. DEPENDENCY MAP - What imports/depends on files that will change? What breaks if we change them?
3. CURRENT IMPLEMENTATION - How does the current code work? Document the existing logic flow
4. EXISTING PATTERNS - Builder, Transformer, Repository patterns used? NestJS conventions?
5. TEST FILES - Existing tests and testing patterns (jest mocks, fixtures)

Output: Structured list of files with descriptions, dependency chains, code flow documentation.
```

### Agent R2: Impact & Risk Analyzer
```
Use Task tool with subagent_type="audit"
Prompt: Analyze business and technical impact of: "{prompt}"

Assess:
1. BUSINESS FLOW - Document AS-IS flow (current) and TO-BE flow (after change), rate each: correctness, reliability, performance, maintainability (1-5)
2. PERFORMANCE IMPACT - DB queries, Kafka throughput, API response times, Promise.all ordering
3. RISK ASSESSMENT - Failure scenarios, blast radius, race conditions, rollback strategy
4. DOWNSTREAM IMPACT - Kafka consumers/producers, external services (Braze, Inventory, MAO), API clients

Output: Structured impact report with severity ratings.
```

### Agent R3: Pattern & Convention Scout
```
Use Task tool with subagent_type="Explore"
Prompt: Find existing patterns and similar implementations for: "{prompt}"

Focus on:
1. SIMILAR CODE - Find code that does something similar. How was it done before?
2. CONVENTIONS - Naming, file structure, code organization in this module
3. ERROR HANDLING - How errors are handled in this area (custom exceptions, error codes)
4. VALIDATION - Input validation patterns (class-validator DTOs, pipes)
5. REUSABLE CODE - Utilities, helpers, shared services available for reuse

Output: Code examples with file paths, convention checklist, reusable components list.
```

Wait for ALL 3 agents to complete. Read their outputs.

**Error Recovery:** If any agent fails, retry once. If it fails again, proceed with the available findings and note the gap in the plan.

---

## STAGE 2: PLAN SYNTHESIS

Combine all research findings into a plan. Save to: `specs/chore-{datetime}-{adw_id}-{descriptive-name}.md`

The plan MUST include:

1. **Chore Description** — what and why
2. **Business Flow Analysis** — AS-IS vs TO-BE with scores table
3. **Impact Analysis** — performance, risk matrix, downstream effects
4. **Relevant Files** — complete list from Agent R1
5. **Step by Step Tasks** — ordered, each step lists which files it touches
6. **Parallel Implementation Groups** — split steps into non-conflicting file groups:
   - **Group A** (Wave 1 — Foundation): enums, types, interfaces, constants, configs
   - **Group B** (Wave 2 — Core): models, services, repositories, transformers
   - **Group C** (Wave 3 — Integration): controllers, consumers, producers, DTOs
   - **Group D** (Wave 4 — Tests): unit tests, integration tests
   - Rule: No two groups share the same file
7. **Validation Commands** — specific commands to verify the work

---

## STAGE 3: PLAN REVIEW (Quality Gate)

Launch a review agent to validate the plan BEFORE implementation:

```
Use Task tool with subagent_type="code-reviewer"
Prompt: Review the plan at specs/chore-{datetime}-{adw_id}-{descriptive-name}.md

Verify:
1. COMPLETENESS - All affected files listed? Missing steps?
2. ORDERING - Steps in correct dependency order?
3. RISK COVERAGE - All risks addressed?
4. PATTERN COMPLIANCE - Follows existing codebase patterns?
5. GROUP INTEGRITY - No file appears in multiple implementation groups?
6. BUSINESS FLOW - AS-IS/TO-BE analysis accurate?

Output: List issues or confirm the plan is solid.
```

Apply fixes to the plan. If critical issues found, fix them before proceeding.

---

## STAGE 4: PARALLEL IMPLEMENTATION (Wave-Based)

Implement the plan using multiple agents. Execute waves sequentially, agents within each wave run in parallel.

### Wave 1: Foundation (Group A files)
```
Use Task tool with subagent_type="dev"
Prompt: Implement ONLY the foundation files assigned to you.

## Your Assigned Files (EXCLUSIVE — only you edit these)
<list Group A files: enums, types, interfaces, constants, configs>

## Plan Context (READ-ONLY)
<paste relevant steps from the plan>

## Rules
1. ONLY modify your assigned files
2. Follow existing codebase patterns exactly
3. If you need something that doesn't exist yet, add a TODO comment
4. Run `pnpm build` after changes

## Report
List each file changed with 1-line summary, any TODOs, any issues.
```

After Wave 1 completes → run `pnpm build` → if errors, fix before proceeding.

### Wave 2: Core (Group B files)
```
Launch dev agent(s) for Group B files (services, repositories, transformers).
Same rules: exclusive file ownership, follow patterns, build after changes.
Resolve any TODO items from Wave 1.
```

After Wave 2 completes → run `pnpm build` → check for errors → proceed.

### Wave 3: Integration (Group C files)
```
Launch dev agent(s) for Group C files (controllers, consumers, DTOs).
Same rules. Resolve TODOs from previous waves.
```

After Wave 3 completes → run `pnpm build` → check for errors → proceed.

### Wave 4: Tests (Group D files)
```
Launch dev agent(s) for Group D files (test files).
Write tests that cover the new/changed code.
Follow existing test patterns (jest mocks, fixtures).
```

After Wave 4 completes → run tests.

**Note:** If a wave has no files (e.g., no new enums needed), skip it. If a group is small enough (≤3 files), implement directly without launching a separate agent.

---

## STAGE 5: CROSS-REVIEW

Launch a review agent to check ALL changes across all waves:

```
Use Task tool with subagent_type="code-reviewer"
Prompt: Review ALL implementation changes.

## Files Changed
<list all files created/modified across all waves>

## Original Plan
<reference the plan file>

## Review Checklist
1. COMPLETENESS - All plan steps implemented? Unresolved TODOs?
2. CONSISTENCY - Same naming, types, enums used across all files?
3. INTEGRATION - Service signatures match controller calls? Kafka schemas consistent?
4. CORRECTNESS - Business logic matches TO-BE flow? Edge cases handled?
5. PATTERNS - Builder/Transformer/Repository patterns followed? NestJS decorators correct?
6. SECURITY - No SQL injection, no sensitive data logged, input validation present?

Output: Issue list with file:line and fix instructions, or confirmation all is clean.
```

---

## STAGE 6: FIX & VALIDATE

1. If review found issues → fix them (launch parallel dev agents for non-conflicting files)
2. Run final validation:
   - `pnpm build` — compilation check
   - `pnpm test -- --testPathPattern="<relevant-pattern>"` — run relevant tests
   - `git diff --stat` — summary of all changes

---

## STAGE 7: REPORT

Output a final summary:

```md
# Oneshot Complete: {descriptive-name}

## Plan
📄 specs/chore-{datetime}-{adw_id}-{descriptive-name}.md

## Summary
<bullet points of what was done>

## Business Flow
- **AS-IS Score:** correctness X/5, reliability X/5, performance X/5, maintainability X/5
- **TO-BE Score:** correctness X/5, reliability X/5, performance X/5, maintainability X/5

## Changes
<git diff --stat output>

## Agents Used
| Stage        | Agent           | Files       | Status |
| ------------ | --------------- | ----------- | ------ |
| Research     | Explorer        | (read-only) | ✅      |
| Research     | Impact Analyzer | (read-only) | ✅      |
| Research     | Pattern Scout   | (read-only) | ✅      |
| Plan Review  | Reviewer        | (read-only) | ✅      |
| Wave 1       | Foundation      | <files>     | ✅      |
| Wave 2       | Core            | <files>     | ✅      |
| Wave 3       | Integration     | <files>     | ✅      |
| Wave 4       | Tests           | <files>     | ✅      |
| Cross-Review | Reviewer        | (read-only) | ✅      |

## Review Results
<clean / issues found and fixed>

## Validation
- Build: ✅ / ❌
- Tests: ✅ / ❌ (X passed, Y failed)

## Next Steps
<any follow-up items, manual testing needed, or deployment notes>
```
