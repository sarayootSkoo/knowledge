# Review Planning

Create a plan to complete the review using the specified markdown `Plan Format`. Research the codebase and create a thorough plan.

## Input
$ARGUMENTS

**Parse input as one of:**
- **File path** (e.g. `/path/spec.md`): read the file and treat its full content as the prompt
- **Inline text**: first word = `adw_id`, remaining = `prompt`
- **Missing**: if `adw_id` or `prompt` cannot be determined, stop and ask the user

## Datetime
Get current datetime: run `date '+%d_%m_%Y_%H_%M_%S'` — use result as `{datetime}` in the review filename.

## Instructions
- If a page URL or file path is provided, read it first and use as context
- If the adw_id or prompt is not provided, stop and ask the user to provide them.
- Create a plan to complete the review described in the `prompt`
- The plan should be simple, thorough, and precise
- Create the plan in the `review/` directory with filename: `review-{datetime}-{adw_id}-{descriptive-name}.md` thai version
  - Replace `{descriptive-name}` with a short, descriptive name based on the review (e.g., "update-readme", "add-logging", "refactor-agent")
- Research the codebase starting with `README.md`
- Replace every <placeholder> in the `Plan Format` with the requested value
- Explain the line or method to fix and show filename with line numbers

## Codebase Structure

- `README.md` - Project overview and instructions (start here)
- `src/modules/` - NestJS modules (oms-orders, consumer, scheduler, etc.)
- `src/common/` - Shared enums, constants, decorators
- `sequelize/migrations/` - Database migrations
- `specs/` - Specification and plan documents
- `.claude/commands/` - Claude command templates

## Plan Format

```md
# review: <review name>

## Metadata
adw_id: `{adw_id}`
prompt: `{prompt}`

## review Description
<describe the review in detail based on the prompt>

## Relevant Files
Use these files to complete the review:

<list files relevant to the review with bullet points explaining why. Include new files to be created under an h3 'New Files' section if needed>

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers with bullet points. Start with foundational changes then move to specific changes. Last step should validate the work>

### 1. <First Task Name>
- <specific action>
- <specific action>

### 2. <Second Task Name>
- <specific action>
- <specific action>

## Validation Commands
Execute these commands to validate the review is complete:

<list specific commands to validate the work. Be precise about what to run>
- `pnpm build` - Verify TypeScript compiles
- `pnpm test` - Run unit tests

## Notes
<optional additional context or considerations>
```

## review
Use the review description from the `prompt` variable.

## Workflow
When this command completes, include this section in your output:

```
## Workflow Output
artifact_path: {path to review report file}
card_status: completed
target_column: validate
suggested_next: /validate
mode: create
```

## Report

Return the path to the plan file created.