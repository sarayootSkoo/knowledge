# Implement Plan (Multi-Agent)

Follow the `Instructions` to implement the `Plan` using multiple parallel agents for faster execution. Agents are assigned non-conflicting file groups and review each other's work.

## Plan
$ARGUMENTS

## Instructions

### Phase 1: Plan Analysis & Task Splitting

1. Read the plan thoroughly. Understand every step, file, and dependency.
2. Identify all files that will be created or modified.
3. Split the work into **non-conflicting groups** where each group owns exclusive files.
   - If the plan has a "Parallel Implementation Groups" section, use those groups.
   - Otherwise, create groups based on these rules:
     - **Rule 1**: No two groups may modify the same file
     - **Rule 2**: Each group should be a cohesive unit of work (e.g., "enums + constants", "service + repository", "DTOs + controller", "tests")
     - **Rule 3**: Identify dependencies between groups — if Group B needs types from Group A, Group A must finish first
   - Common splitting strategies:
     - By layer: enums/types → models/entities → services → controllers → tests
     - By feature: feature-A files vs feature-B files
     - By module: module-X files vs module-Y files

4. Classify groups into **waves** based on dependencies:
   - **Wave 1**: Foundation work (enums, types, interfaces, constants, configs) — no dependencies
   - **Wave 2**: Core implementation (models, services, repositories) — depends on Wave 1
   - **Wave 3**: Integration (controllers, consumers, producers) — depends on Wave 2
   - **Wave 4**: Tests and validation — depends on all above

### Phase 2: Parallel Implementation (Launch Agents Per Wave)

For each wave, launch agents in parallel using the Task tool:

```
For each group in the current wave, launch:

Use Task tool with subagent_type="dev"
Prompt: You are implementing part of a plan. Your job is to implement ONLY the files assigned to you.

## Your Assigned Files (YOU OWN THESE — only you may edit them)
<list the files this agent owns>

## Full Plan Context (READ-ONLY — do not edit files outside your assignment)
<paste the relevant plan steps for this group>

## Implementation Rules
1. ONLY create or modify files in your assigned list above
2. Follow existing codebase patterns exactly (naming, structure, error handling)
3. Import from other files as needed, but do NOT modify them
4. If you need something from another file that doesn't exist yet, add a TODO comment and continue
5. Run `pnpm build` after your changes to verify compilation
6. Write clean, production-ready code — no placeholder or stub implementations

## Codebase Context
<include relevant existing patterns, conventions, and similar code examples from the plan>

## Report
When done, list:
- Each file you created/modified with a 1-line summary of changes
- Any TODO items or dependencies on other groups
- Any issues or concerns encountered
```

Wait for all agents in a wave to complete before starting the next wave.

Between waves:
- Read each agent's report
- Check for TODO items that the next wave needs to resolve
- Verify no file conflicts occurred
- Run `pnpm build` to ensure the codebase still compiles

### Phase 3: Cross-Review (Launch Review Agent)

After ALL waves complete, launch a review agent to check the entire body of work:

```
Use Task tool with subagent_type="code-reviewer"
Prompt: Review ALL changes made by the implementation agents.

## Files Changed
<list all files created/modified across all agents>

## Original Plan
<paste the full plan>

## Review Checklist
1. COMPLETENESS
   - Are all plan steps implemented?
   - Are there any TODO comments left unresolved?
   - Are all imports and references valid?

2. CONSISTENCY
   - Do all agents use the same naming conventions?
   - Are types/interfaces used consistently across files?
   - Do error codes and messages match?
   - Are enums used consistently (not hardcoded values)?

3. INTEGRATION
   - Do the pieces fit together? (e.g., service method signatures match controller calls)
   - Are Kafka message schemas consistent between producer and consumer?
   - Are DTO field names consistent between layers?

4. CORRECTNESS
   - Does the business logic match the plan's AS-IS → TO-BE flow?
   - Are edge cases handled?
   - Are there any off-by-one errors, missing null checks, or type mismatches?

5. PATTERNS
   - Does the code follow the codebase's Builder/Transformer/Repository patterns?
   - Are NestJS decorators used correctly?
   - Is Sequelize used correctly (transactions, includes, scopes)?

6. SECURITY
   - No SQL injection via raw queries
   - No sensitive data logged
   - Input validation on all endpoints

Output: List each issue found with:
- File path and line number
- What's wrong
- How to fix it
```

### Phase 4: Fix Issues

If the review agent found issues:
1. Group the fixes by file ownership (same rules as Phase 2)
2. Launch fix agents in parallel for non-conflicting files
3. Run another quick review if the fixes were significant

### Phase 5: Validation & Report

1. Run the validation commands from the plan
2. Run `pnpm build` to verify everything compiles
3. Run relevant tests: `pnpm test -- --testPathPattern="<relevant-pattern>"`

## Report
- Summarize the work done in a concise bullet point list
- List each agent's contribution (which files each agent handled)
- Note any issues found and fixed during cross-review
- Report the files and total lines changed with `git diff --stat`
- Report any remaining TODOs or follow-up items
