# Design & Business Breakdown

Analyze design and business specifications, then break down work items into developer-ready tasks with estimates. วิเคราะห์ impact ทั้งหมดจาก codebase และสรุป business flow แบบเก่า vs แบบใหม่

## Input
$ARGUMENTS

**Parse input as:**
- First word = `sprint` (e.g., `sprint3`)
- Remaining text = `sources` — comma-separated list of source references (Confluence pages, Jira tickets, file paths, URLs)
- If `sprint` or `sources` cannot be determined, stop and ask the user

**Example:** `/breakdown sprint3 https://confluence.example.com/page, JIRA-1234, docs/spec.md`

## Datetime
Get current datetime: run `date '+%d_%m_%Y_%H_%M_%S'` — use result as `{datetime}` in the report filename.

## Instructions

- If `sprint` or `sources` is not provided, stop and ask the user to supply them
- Read and interpret all provided sources, which may include relative paths or links:
  - Sequence Diagram
  - Confluence pages
  - Jira tickets
  - Images / screenshots
  - Architecture or Design specs
- Assume incomplete or ambiguous specs are normal — explicitly call out assumptions
- Break down work into **developer-executable tasks**
- Tasks should be sized for a **Junior Developer (baseline)**
- Use clear, implementation-oriented language (no business poetry)
- Create the task report in `tasks/` directory with filename:
  - `{sprint}-{datetime}-task.md` (example: `sprint3-03_03_2026_22_00_00-task.md`) thai version

## Output Expectations

- Tasks must be grouped logically (DB, Backend, API, Integration, Refactor, QA)
- Each task should include:
  - Description
  - Type (create / update / refactor / feature)
  - Suggested Story Point (Junior Dev scale)
  - Dependencies (if any)
- Highlight:
  - Risks
  - Open questions
  - Non-functional considerations

## Task Estimation Guide (Junior Dev)

- 1 SP: Small change, low cognitive load, well-defined
- 2 SP: Straightforward feature, minimal unknowns
- 3 SP: Multiple steps or moderate logic
- 5 SP: Cross-module change, unclear edge cases
- 8 SP: High risk or needs design clarification (flag explicitly)

## Task Report Format

```md
# Sprint: <sprint>

## Sources Reviewed
- <source 1>
- <source 2>

## Scope Summary
<short summary of business intent and technical scope>

## Assumptions
- <assumption 1>
- <assumption 2>

## Task Breakdown

### Database
| Task | Description | Type | Story Point | Dependency |
| ---- | ----------- | ---- | ----------- | ---------- |

### Backend / Module
| Task | Description | Type | Story Point | Dependency |
| ---- | ----------- | ---- | ----------- | ---------- |

### API / Controller
| Task | Description | Type | Story Point | Dependency |
| ---- | ----------- | ---- | ----------- | ---------- |

### Integration / External
| Task | Description | Type | Story Point | Dependency |
| ---- | ----------- | ---- | ----------- | ---------- |

### Refactor / Tech Debt
| Task | Description | Type | Story Point | Dependency |
| ---- | ----------- | ---- | ----------- | ---------- |

## Risks & Concerns
- <risk 1>
- <risk 2>

## Open Questions
- <question 1>
- <question 2>

## Notes for Tech Lead
<items that require review, alignment, or decision>

## Workflow
When this command completes, include this section in your output:

```
## Workflow Output
artifact_path: {path to created breakdown file}
card_status: completed
target_column: task
suggested_next: /estimate '{artifact_path}'
mode: create
```