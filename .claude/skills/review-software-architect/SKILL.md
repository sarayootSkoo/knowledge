---
name: review-software-architect
description: >
  Comprehensive Software Architect Review for codebase and project health.
  Use when you need a full architectural review covering: business alignment,
  technical debt, performance bottlenecks, software design quality, security,
  maintainability, supportability, and risk analysis.
  Activates for architecture review, codebase health check, tech debt audit,
  or when preparing for major refactoring decisions.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, WebSearch, WebFetch
---

# Software Architect Review

## Overview

This skill performs a **comprehensive, multi-dimensional architectural review** of the current project/codebase. It orchestrates multiple parallel analysis agents, each specializing in a different review dimension, then synthesizes findings into an actionable report.

## Review Dimensions

The review covers **8 critical dimensions**:

| # | Dimension | Focus Area |
|---|-----------|------------|
| 1 | **Business Alignment** | Does the code serve business goals? Are domain models correct? |
| 2 | **Technical Design** | Architecture patterns, SOLID principles, coupling, cohesion |
| 3 | **Performance** | Bottlenecks, N+1 queries, memory leaks, async patterns |
| 4 | **Security & Risk** | OWASP top 10, auth flows, data exposure, injection risks |
| 5 | **Maintainability** | Code complexity, test coverage, documentation, readability |
| 6 | **Operational Health** | Error handling, logging, monitoring, deployment readiness |
| 7 | **Data & Integration** | Database design, API contracts, message queue reliability |
| 8 | **Future-Proofing** | Technical debt, upgrade paths, scalability ceilings |

---

## Execution Strategy

### Phase 1: Parallel Deep-Dive Analysis (Multi-Agent)

Launch **4 parallel agent groups** to maximize coverage and speed:

#### Agent Group A: Business & Domain Analysis
```
Use Task tool with subagent_type="audit"
Prompt: Analyze the codebase for business alignment and domain modeling quality.
Focus on:
1. DOMAIN MODEL INTEGRITY
   - Are domain entities well-defined and properly bounded?
   - Do entity relationships reflect real business rules?
   - Are there anemic domain models (entities with no behavior)?
   - Is business logic leaking into controllers/routes?

2. BUSINESS RULE CONSISTENCY
   - Are business rules centralized or scattered across layers?
   - Are there hardcoded values that should be configurable?
   - Do enums/constants accurately represent business states?
   - Are state transitions validated and enforced?

3. API CONTRACT QUALITY
   - Do API endpoints follow RESTful conventions?
   - Are DTOs properly validated with class-validator?
   - Are response shapes consistent across endpoints?
   - Is error response format standardized?

4. WORKFLOW COMPLETENESS
   - Are all business workflows fully implemented?
   - Are edge cases handled (partial failures, retries, idempotency)?
   - Is the happy path vs error path ratio balanced?

Report format: List each finding with severity (CRITICAL/HIGH/MEDIUM/LOW),
file location, and recommended action.
```

#### Agent Group B: Technical Design & Performance
```
Use Task tool with subagent_type="audit"
Prompt: Analyze the codebase for technical design quality and performance issues.
Focus on:
1. ARCHITECTURE PATTERNS
   - Is the layered architecture (controller → service → repository) respected?
   - Are there circular dependencies between modules?
   - Is dependency injection used correctly?
   - Are there god classes or god services (>500 lines)?
   - Is the Builder/Transformer/Repository pattern applied consistently?

2. SOLID PRINCIPLES VIOLATIONS
   - Single Responsibility: Services doing too many things?
   - Open/Closed: Hard to extend without modifying existing code?
   - Liskov Substitution: Interface contracts honored?
   - Interface Segregation: Fat interfaces forcing unused implementations?
   - Dependency Inversion: Concrete dependencies instead of abstractions?

3. PERFORMANCE BOTTLENECKS
   - N+1 query patterns in Sequelize/ORM usage
   - Missing database indexes for frequent queries
   - Unbounded queries (no pagination/limits)
   - Synchronous operations that should be async
   - Memory-intensive operations (large array processing, no streaming)
   - Kafka consumer processing speed and backpressure handling
   - HTTP client timeout and retry configurations

4. CODE COMPLEXITY
   - Cyclomatic complexity hotspots
   - Deeply nested conditionals (>3 levels)
   - Functions longer than 50 lines
   - Files longer than 500 lines

Report format: List each finding with severity, file:line location,
code snippet, and recommended refactoring approach.
```

#### Agent Group C: Security, Risk & Operational Health
```
Use Task tool with subagent_type="audit"
Prompt: Analyze the codebase for security vulnerabilities, risk factors,
and operational health.
Focus on:
1. SECURITY AUDIT (OWASP Top 10)
   - SQL/NoSQL injection via raw queries or unsanitized input
   - Cross-Site Scripting (XSS) in any rendered content
   - Broken authentication/authorization patterns
   - Sensitive data exposure (PII in logs, unencrypted secrets)
   - Mass assignment vulnerabilities (unvalidated request bodies)
   - Missing rate limiting on public endpoints
   - Insecure deserialization of Kafka messages

2. RISK ANALYSIS
   - Single points of failure in the architecture
   - Missing circuit breakers for external service calls
   - Cascade failure scenarios (one service down → system down)
   - Data consistency risks in distributed transactions
   - Race conditions in concurrent processing

3. OPERATIONAL HEALTH
   - Error handling completeness (try/catch, error boundaries)
   - Logging quality (structured logs, correlation IDs, log levels)
   - Health check endpoints
   - Graceful shutdown handling
   - Configuration management (env vars, secrets rotation)
   - Database connection pool management

4. MONITORING & OBSERVABILITY
   - Are key business metrics tracked?
   - Are there alerting thresholds defined?
   - Is distributed tracing implemented?
   - Are Kafka consumer lag metrics monitored?

Report format: Prioritized risk matrix with likelihood × impact scoring,
specific file locations, and mitigation recommendations.
```

#### Agent Group D: Maintainability, Testing & Future-Proofing
```
Use Task tool with subagent_type="audit"
Prompt: Analyze the codebase for maintainability, test quality,
and future-proofing concerns.
Focus on:
1. MAINTAINABILITY ASSESSMENT
   - Code duplication (DRY violations across modules)
   - Naming conventions consistency
   - Module organization and boundary clarity
   - Dead code and unused exports
   - Comment quality (meaningful vs noise)
   - Type safety (any usage, missing types, assertion abuse)

2. TEST QUALITY AUDIT
   - Test coverage distribution (which modules lack tests?)
   - Test isolation (do tests depend on external services?)
   - Mock quality (are mocks too loose or too tight?)
   - Test naming and organization
   - Missing integration/e2e tests for critical workflows
   - Edge case coverage in unit tests

3. DEPENDENCY HEALTH
   - Outdated or vulnerable dependencies
   - Unused dependencies bloating the bundle
   - Lock file consistency
   - Dependency on deprecated APIs or libraries

4. TECHNICAL DEBT INVENTORY
   - TODO/FIXME/HACK comments in codebase
   - Legacy code that should be migrated
   - Patterns that don't match current team conventions
   - Database schema evolution needs (missing migrations)
   - Configuration drift between environments

5. SCALABILITY CEILINGS
   - What breaks at 10x current load?
   - Database query performance at scale
   - Kafka partition strategy adequacy
   - Caching strategy effectiveness
   - Connection pool sizing

Report format: Technical debt register with estimated effort
(S/M/L/XL), business impact, and suggested prioritization.
```

### Phase 2: Synthesis & Report Generation

After all agents complete, synthesize findings into a unified report:

```markdown
# 🏗️ Software Architect Review Report
## Project: [project-name]
## Date: [current-date]
## Reviewer: Claude (AI-Assisted Architectural Review)

---

## Executive Summary
[2-3 paragraph overview of overall health, key risks, and top recommendations]

## Health Scorecard

| Dimension | Score | Trend | Key Finding |
|-----------|-------|-------|-------------|
| Business Alignment | ⬛⬛⬛⬜⬜ | — | [one-liner] |
| Technical Design | ⬛⬛⬛⬛⬜ | — | [one-liner] |
| Performance | ⬛⬛⬜⬜⬜ | — | [one-liner] |
| Security | ⬛⬛⬛⬜⬜ | — | [one-liner] |
| Maintainability | ⬛⬛⬛⬜⬜ | — | [one-liner] |
| Ops Health | ⬛⬛⬜⬜⬜ | — | [one-liner] |
| Data & Integration | ⬛⬛⬛⬜⬜ | — | [one-liner] |
| Future-Proofing | ⬛⬛⬜⬜⬜ | — | [one-liner] |

## 🔴 Critical Findings (Act Now)
[Numbered list with file locations and fix recommendations]

## 🟠 High Priority (Plan This Sprint)
[Numbered list with file locations and fix recommendations]

## 🟡 Medium Priority (Plan This Quarter)
[Numbered list with file locations and fix recommendations]

## 🔵 Low Priority / Observations
[Numbered list of improvements and observations]

## 📊 Technical Debt Register
| ID | Area | Description | Effort | Impact | Priority |
|----|------|-------------|--------|--------|----------|

## 🛡️ Risk Matrix
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|

## 📋 Recommended Action Plan
### Immediate (This Week)
### Short-term (This Sprint)
### Medium-term (This Quarter)
### Long-term (Next Quarter+)

## 🔗 Detailed Findings
[Link to each agent's detailed report]
```

---

## Complementary Skills Integration

When performing this review, leverage these complementary skills for deeper analysis:

| Skill | When to Use |
|-------|-------------|
| **Security Scanner** | Deep-dive on specific vulnerability patterns found in Phase 1 |
| **Performance Profiler** | Profile specific bottlenecks identified by Agent Group B |
| **Peer Reviewer** | Detailed code-level review of critical files flagged in the report |
| **Risk Assessor** | Expanded risk modeling for critical architectural risks |
| **Compliance Checker** | Regulatory compliance checks if handling PII/financial data |
| **Migration Planner** | Plan migration paths for legacy code identified as tech debt |
| **testing-qa** | Deep test coverage analysis and test strategy recommendations |
| **error-monitoring** | Detailed error handling and observability review |

---

## Usage Examples

### Full Review (Default)
```
/review-software-architect
```
Runs all 8 dimensions in parallel with 4 agent groups.

### Focused Review
```
/review-software-architect --focus security,performance
```
Runs only the specified dimensions.

### Module-Specific Review
```
/review-software-architect --module src/modules/oms-orders
```
Scopes the review to a specific module directory.

---

## NestJS / TypeScript Specific Checks

Since this project uses NestJS with TypeScript, the review includes these framework-specific checks:

### NestJS Patterns
- **Module boundaries**: Are modules properly isolated with clear exports?
- **Provider scope**: Are providers using correct scope (DEFAULT, REQUEST, TRANSIENT)?
- **Guard/Interceptor/Pipe usage**: Are cross-cutting concerns handled via decorators?
- **Exception filters**: Is error handling centralized via exception filters?
- **Config module**: Is configuration validated at startup with Joi/class-validator?
- **Circular dependency**: Are `forwardRef()` calls necessary or signs of bad design?

### Sequelize ORM Patterns
- **Model definitions**: Are models using proper data types and constraints?
- **Associations**: Are relationships defined correctly (hasMany, belongsTo, etc.)?
- **Transactions**: Are multi-table operations wrapped in transactions?
- **Raw queries**: Are raw queries parameterized to prevent SQL injection?
- **Migration discipline**: Are schema changes tracked in migrations?

### Kafka Patterns
- **Consumer groups**: Are consumer groups properly named and isolated?
- **Error handling**: Are failed messages sent to DLQ (Dead Letter Queue)?
- **Idempotency**: Are message handlers idempotent?
- **Ordering**: Are partition keys chosen to maintain ordering guarantees?
- **Backpressure**: Is consumer processing rate managed?

---

## Output

The final output is saved to:
```
specs/architect-review-[date].md
```

This file serves as a living document for tracking architectural health over time.
