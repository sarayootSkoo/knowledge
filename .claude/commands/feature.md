# Feature Planning

Create a plan to implement the feature using the specified markdown `Plan Format`. Research the codebase and create a thorough plan.

## Input
$ARGUMENTS

**Parse input as one of:**
- **File path** (e.g. `/path/spec.md`): read the file and treat its full content as the prompt
- **Inline text**: first word = `adw_id`, remaining = `prompt`
- **Missing**: if `adw_id` or `prompt` cannot be determined, stop and ask the user

## Datetime
Get current datetime: run `date '+%d_%m_%Y_%H_%M_%S'` — use result as `{datetime}` in the spec filename.

## Instructions

- Create a plan to implement the feature described in the `prompt`
- The plan should be comprehensive, well-designed, and follow existing patterns
- Create the plan in the `specs/` directory with filename: `feature-{datetime}-{adw_id}-{descriptive-name}.md`
  - Replace `{descriptive-name}` with a short, descriptive name based on the feature (e.g., "add-agent-logging", "implement-retry-logic", "create-workflow-api")
- Research the codebase starting with `README.md`
- Replace every <placeholder> in the `Plan Format` with the requested value
- Use your reasoning model: THINK HARD about the feature requirements, design, and implementation approach
- Follow existing patterns and conventions in the codebase
- Design for extensibility and maintainability

## Codebase Structure

- `README.md` - Project overview and instructions (start here)
- `src/modules/` - NestJS modules (oms-orders, consumer, scheduler, etc.)
- `src/common/` - Shared enums, constants, decorators
- `sequelize/migrations/` - Database migrations
- `specs/` - Specification and plan documents
- `.claude/commands/` - Claude command templates

## Plan Format

```md
# Feature: <feature name>

## Metadata
adw_id: `{adw_id}`
prompt: `{prompt}`

## Feature Description
<describe the feature in detail, including its purpose and value to users>

## User Story
As a <type of user>
I want to <action/goal>
So that <benefit/value>

## Problem Statement
<clearly define the specific problem or opportunity this feature addresses>

## Solution Statement
<describe the proposed solution approach and how it solves the problem>

## Relevant Files
Use these files to implement the feature:

<list files relevant to the feature with bullet points explaining why. Include new files to be created under an h3 'New Files' section if needed>

## Implementation Plan
### Phase 1: Foundation
<describe the foundational work needed before implementing the main feature>

### Phase 2: Core Implementation
<describe the main implementation work for the feature>

### Phase 3: Integration
<describe how the feature will integrate with existing functionality>

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers with bullet points. Start with foundational changes then move to specific changes. Include creating tests throughout the implementation process>

### 1. <First Task Name>
- <specific action>
- <specific action>

### 2. <Second Task Name>
- <specific action>
- <specific action>

<continue with additional tasks as needed>

## Testing Strategy
### Unit Tests
<describe unit tests needed for the feature>

### Edge Cases
<list edge cases that need to be tested>

## Acceptance Criteria
<list specific, measurable criteria that must be met for the feature to be considered complete>

## Validation Commands
Execute these commands to validate the feature is complete:

<list specific commands to validate the work. Be precise about what to run>
- `pnpm build` - Verify TypeScript compiles
- `pnpm test` - Run unit tests


## Notes
<optional additional context, future considerations, or dependencies. If new libraries are needed, specify using `uv add`>
```

## Feature
Use the feature description from the `prompt` variable.

## Workflow
When this command completes, include this section in your output:

```
## Workflow Output
artifact_path: {path to created spec file}
card_status: completed
target_column: design
suggested_next: /breakdown '{artifact_path}'
mode: create
```

## Report

Return the path to the plan file created.