# PR Review

Review a pull request, create a review document, and optionally post comments to Azure DevOps.

## Input
$ARGUMENTS

**Parse input as:**
- First word = `branch` (required — source branch name to review)
- Optional flags: `critical` (only critical issues), `no-post` (skip posting to Azure DevOps)
- If `branch` is not provided, stop and ask the user to provide the branch name
- Defaults: severity = `all`, post_comments = `yes`

## Workflow

### 1. Gather PR Information
- Get git remote URL to identify Azure DevOps project and repository 
- Find PR by source branch name using `mcp__azure-devops__repo_list_pull_requests_by_repo_or_project`
- Get commit history: `git log origin/main..origin/{branch} --oneline`
- Get changed files: `git diff origin/main...origin/{branch} --name-only`

### 2. Analyze Changes
- Review each changed file, focusing on:
  - **Copy-paste errors** - Wrong class/function names in logs, spans, comments
  - **Missing configuration** - Environment variables used but not in `.env.example`
  - **Naming issues** - Typos in filenames, inconsistent naming conventions
  - **Missing tests** - New modules without corresponding test files
  - **Security issues** - Hardcoded secrets, SQL injection, XSS vulnerabilities
  - **Code quality** - Unused imports, dead code, missing error handling

### 3. Categorize Issues
- **Critical (Must Fix)**: Copy-paste errors, security issues, runtime errors
- **Medium (Should Fix)**: Missing config, naming typos, missing tests
- **Low (Nice to Have)**: Code style, minor improvements

### 4. Create Review Document
Create file at `review/pr-review-{branch}-{descriptive-name}.md` thai version using this format:

```md
# Chore: PR Review - {PR Title}

## Metadata
branch: `{branch}`
pr_id: `{pr_id}`
pr_url: `{pr_url}`

## PR Summary
- **Title**: {title}
- **Author**: {author}
- **Source**: `{source_branch}` → `{target_branch}`
- **Files Changed**: {file_count}

## Changes Overview
{Brief description of what this PR implements}

## Critical Issues Found
{List critical issues with file paths and line numbers}

## Medium Issues Found
{List medium issues with file paths and line numbers}

## Low Issues Found
{List low priority issues}

## Architecture Assessment
{Evaluate if the code follows project patterns and best practices}

## Recommendations
{List specific actions to take before merge}

## Validation Commands
- `pnpm lint` - Verify code passes linting
- `pnpm build` - Ensure TypeScript compiles
- `pnpm test` - Run unit tests
```

### 5. Post Comments to Azure DevOps (if enabled)
Use MCP tools to post comments:
- `mcp__azure-devops__repo_create_pull_request_thread` for each issue
- Include file path and line numbers for inline comments
- Add a summary comment with overall review

#### Comment Format
```
🔴 **Critical**: {issue description}
🟡 **Medium**: {issue description}
🔵 **Low**: {issue description}
```

#### Summary Comment Format
```md
## 📋 PR Review Summary

### ✅ What's Good
- {positive observations}

### 🔴 Critical Issues (X found)
| #   | Issue | File |
| --- | ----- | ---- |

### 🟡 Medium Issues (X found)
| #   | Issue | File |
| --- | ----- | ---- |

### 📝 Recommendation
{Overall recommendation: approve, request changes, or comment}
```

## Common Patterns to Check

### NestJS Specific
- Services use `@Injectable()` decorator
- Controllers use proper HTTP decorators
- DTOs use `class-validator` decorators
- Modules export necessary providers
- Dependency injection is correct

### Logging & Tracing
- Logger service names match actual class/method
- Span names match actual class/method
- Error logs include context
- No `console.log` usage

### Configuration
- All env vars documented in `.env.example`
- Config service used (not `process.env` directly)
- Sensitive values not hardcoded

### Testing
- New services have unit tests
- New controllers have integration tests
- Edge cases covered

## Report
Return:
1. Path to the review document created
2. List of comment thread IDs posted (if post_comments=yes)
3. Summary of issues found by severity
