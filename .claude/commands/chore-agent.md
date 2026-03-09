# Chore Planning (Multi-Agent)

Create a plan to complete the chore using multiple parallel agents for faster, deeper analysis. Each agent specializes in a different research dimension, then findings are synthesized into a comprehensive plan.

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
- Analyze Promise.all impact on order sequence and data business flow sequence
- Show business flow AS-IS and TO-BE with score ratings
- If the adw_id or prompt is not provided, stop and ask the user to provide them.

## Phase 1: Parallel Research (Launch 3 Agents Simultaneously)

Launch all 3 agents in parallel using the Task tool. All agents are READ-ONLY — they research and report findings but do NOT modify any files.

### Agent 1: Codebase Explorer
```
Use Task tool with subagent_type="Explore"
Prompt: Research the codebase for the following chore: "{prompt}"

Your job is to find ALL relevant files, understand the current implementation, and map dependencies.

Focus on:
1. RELEVANT FILES - Find every file that relates to this chore (source, tests, configs, types, DTOs, enums)
2. DEPENDENCY MAP - What imports/depends on the files that will change? What breaks if we change them?
3. CURRENT IMPLEMENTATION - How does the current code work? Document the existing logic flow
4. EXISTING PATTERNS - What patterns does the codebase use? (Builder, Transformer, Repository, etc.)
5. TEST FILES - Find existing tests for the affected code. Note test patterns used (jest mocks, fixtures, etc.)

Output format:
- List every relevant file with a 1-line description of its role
- Draw the dependency chain (what calls what)
- Document the current code flow step-by-step
- Note any patterns we must follow for consistency
```

### Agent 2: Impact Analyzer
```
Use Task tool with subagent_type="audit"
Prompt: Analyze the business and technical impact of the following chore: "{prompt}"

Research the codebase and assess:
1. BUSINESS FLOW ANALYSIS
   - Document the AS-IS business flow (current state) with step-by-step sequence
   - Design the TO-BE business flow (after chore) with step-by-step sequence
   - Rate both flows: correctness (1-5), reliability (1-5), performance (1-5), maintainability (1-5)
   - Identify any business rules that could break

2. PERFORMANCE IMPACT
   - Will this chore affect database queries? (N+1, missing indexes, unbounded queries)
   - Will this affect Kafka processing throughput?
   - Will this affect API response times?
   - Are there Promise.all patterns that could break ordering guarantees?

3. RISK ASSESSMENT
   - What could go wrong? List all failure scenarios
   - What is the blast radius? (single endpoint vs whole module vs system-wide)
   - Are there race conditions or data consistency risks?
   - What is the rollback strategy if something goes wrong?

4. DOWNSTREAM IMPACT
   - Which Kafka consumers/producers are affected?
   - Which external services are affected? (Braze, Inventory, MAO)
   - Which API clients will see changes?

Output format: Structured report with severity ratings for each finding.
```

### Agent 3: Pattern & Convention Researcher
```
Use Task tool with subagent_type="Explore"
Prompt: Research existing patterns, conventions, and similar implementations for: "{prompt}"

Focus on:
1. SIMILAR IMPLEMENTATIONS - Find code that does something similar to this chore. How was it done before?
2. CODING CONVENTIONS - What naming conventions, file structure, and code organization does this module use?
3. ERROR HANDLING PATTERNS - How are errors handled in this area? (try/catch, custom exceptions, error codes)
4. VALIDATION PATTERNS - How is input validated? (class-validator DTOs, manual checks, pipes)
5. TEST PATTERNS - How are similar features tested? What mocking strategy is used?
6. CONFIGURATION - Are there env vars, feature flags, or master configs related to this area?

Output format:
- Code examples from similar implementations (with file paths)
- Checklist of conventions to follow
- List of reusable utilities/helpers available
```

## Phase 2: Synthesis

After all 3 agents complete, synthesize their findings into a unified plan:

1. Read all agent outputs carefully
2. Cross-reference findings — if multiple agents flagged the same concern, mark it as HIGH priority
3. Create the plan file at: `specs/chore-{datetime}-{adw_id}-{descriptive-name}.md` thai version
4. Use the `Plan Format` below

## Phase 3: Plan Review (Launch 1 Agent)

**Error Recovery:** If any research agent fails, retry once. If it fails again, proceed with available findings and note the gap.

After writing the plan, launch a review agent:

```
Use Task tool with subagent_type="code-reviewer"
Prompt: Review the chore plan at specs/chore-{datetime}-{adw_id}-{descriptive-name}.md

Check for:
1. COMPLETENESS - Are all affected files listed? Are there missing steps?
2. ORDERING - Are steps in the correct dependency order? (e.g., create enum before using it)
3. RISK COVERAGE - Does the plan address all identified risks?
4. PATTERN COMPLIANCE - Does the plan follow existing codebase patterns?
5. VALIDATION - Are the validation commands sufficient to verify the work?
6. BUSINESS FLOW - Is the as-is/to-be analysis accurate and complete?

Output: List of issues found with suggested fixes. If the plan is solid, confirm it.
```

Apply any fixes from the review agent to the plan.

## Plan Format

```md
# Chore: <chore name>

## Metadata
adw_id: `{adw_id}`
prompt: `{prompt}`

## Chore Description
<describe the chore in detail based on the prompt>

## Business Flow Analysis

### AS-IS (Current State)
<step-by-step current business flow with sequence diagram if applicable>

**Score:**
| Dimension       | Score (1-5) | Notes |
| --------------- | ----------- | ----- |
| Correctness     |             |       |
| Reliability     |             |       |
| Performance     |             |       |
| Maintainability |             |       |

### TO-BE (After Chore)
<step-by-step target business flow with sequence diagram if applicable>

**Score:**
| Dimension       | Score (1-5) | Notes |
| --------------- | ----------- | ----- |
| Correctness     |             |       |
| Reliability     |             |       |
| Performance     |             |       |
| Maintainability |             |       |

## Impact Analysis

### Performance Impact
<findings from Agent 2>

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |

### Downstream Impact
<Kafka, external services, API clients affected>

## Relevant Files
Use these files to complete the chore:

<list files from Agent 1 with bullet points explaining why>

### New Files
<list any new files to be created>

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers with bullet points. Group by file ownership to enable parallel implementation later>

### 1. <First Task Name>
**Files:** <list of files this step touches>
- <specific action>
- <specific action>

### 2. <Second Task Name>
**Files:** <list of files this step touches>
- <specific action>
- <specific action>

## Parallel Implementation Groups
<group the steps above into non-conflicting file groups for use with /implement-agent>

### Group A: <description>
- Steps: [list step numbers]
- Files: [exclusive file list]

### Group B: <description>
- Steps: [list step numbers]
- Files: [exclusive file list]

## Validation Commands
Execute these commands to validate the chore is complete:

<list specific commands to validate the work>
- `pnpm build` - Verify compilation
- `pnpm test -- --testPathPattern="<relevant-test-pattern>"` - Run relevant tests

## Notes
<additional context, conventions to follow from Agent 3, and review agent feedback>
```

## Report

Return the path to the plan file created.
