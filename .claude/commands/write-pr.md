# Write PR — Create Pull Request in Azure DevOps

Analyze the current branch, generate a well-structured PR title and description, then create the PR in Azure DevOps. Thai version.

## Input
$ARGUMENTS

**Parse input as:**
- First word = `target_branch` (defaults to `develop` if not provided)
- Optional flags (comma-separated): `draft`, `autocomplete`, `squash`

## Instructions

- `target_branch`: The target branch to merge into. Defaults to `develop` if not provided.
- `options`: Optional flags (comma-separated):
  - `draft` — create as draft PR
  - `autocomplete` — enable autocomplete after creation
  - `squash` — set merge strategy to squash

## Workflow

### 1. Detect Repository Context
- Get the current branch name: `git branch --show-current`
- Get the git remote URL: `git remote get-url origin`
- Parse Azure DevOps org, project, and repo from the remote URL
- Determine target branch (use `target_branch` variable, default to `main`)
- If current branch IS the target branch, STOP and warn the user

### 2. Ensure Branch is Pushed
- Check if remote tracking branch exists: `git ls-remote --heads origin {current_branch}`
- If not pushed, push with: `git push -u origin {current_branch}`
- If already pushed, check if local is ahead: `git status -sb`
  - If ahead, push latest commits: `git push`

### 3. Gather Change Context
Run these commands to understand what changed:
- `git log origin/{target}..HEAD --oneline` — commit history
- `git diff origin/{target}...HEAD --stat` — files changed summary
- `git diff origin/{target}...HEAD --name-only` — list of changed files

For each changed file, read the diff to understand the changes:
- `git diff origin/{target}...HEAD -- {file_path}`

Also check for any spec files referenced in commits or changed files:
- Look in `specs/` for related plan documents that describe the intent

### 4. Analyze and Categorize Changes
Group changes by category:
- **New Features** — new files, new endpoints, new services
- **Enhancements** — modifications to existing functionality
- **Refactoring** — code restructuring without behavior change
- **Bug Fixes** — corrections to existing behavior
- **Configuration** — env, pipeline, package changes
- **Tests** — new or modified test files

### 5. Generate PR Title
- Keep under 70 characters
- Use conventional format: `{type}: {concise description}`
  - Types: `feat`, `fix`, `refactor`, `chore`, `perf`, `docs`, `test`
- If multiple types, use the primary/most impactful one
- Examples:
  - `feat: Add OrderUtilityService for centralized data fetching`
  - `refactor: Parallelize read queries in promising and fulfillment flows`
  - `fix: Revert unsafe parallel inventory mutations in SHIP event`

### 6. Generate PR Description
Use this template (max 4000 chars for Azure DevOps):

```
## Summary
{2-4 sentences describing the overall change and its purpose}

## Changes

### {Category 1}
- {bullet point with file path and what changed}
- {bullet point with file path and what changed}

### {Category 2}
- {bullet point with file path and what changed}

## Impact Analysis
- **Risk Level**: {Low / Medium / High}
- **Breaking Changes**: {None / describe}
- **Performance**: {No change / Improved — describe}
- **Business Logic**: {No change / Modified — describe}

## Testing
- [ ] Unit tests pass (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] {any specific test scenarios}

## Related
- {Links to spec documents if any}
- {Links to related PRs or work items if any}
```

### 7. Create PR in Azure DevOps
Use `mcp__azure-devops__repo_create_pull_request` with:
- `repositoryId`: repo name parsed from git remote (e.g., `oms-order`)
- `sourceRefName`: `refs/heads/{current_branch}`
- `targetRefName`: `refs/heads/{target_branch}`
- `title`: generated PR title
- `description`: generated PR description
- `isDraft`: true if `draft` option was specified

### 8. Post-Creation (if options specified)
If `autocomplete` option:
- Use `mcp__azure-devops__repo_update_pull_request` to enable autocomplete
- If `squash` option also set, use `mergeStrategy: "Squash"`

## Report
Return:
1. PR ID and URL
2. PR title
3. Summary of changes included
4. Any warnings (e.g., unpushed commits, large diff)
