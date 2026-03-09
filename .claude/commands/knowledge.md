---
allowed-tools: Bash(find:*), Glob, Grep, Read, AskUserQuestion
description: Search the shared knowledge base at ../knowledge for documentation, ADRs, domain terms, and backend specs
---

# Knowledge Search

Search the shared `../knowledge` knowledge base for the requested topic and return a synthesized answer.

---

## Input

Topic to search: `$ARGUMENTS`

---

## Step 1 — Check if topic is provided

**If `$ARGUMENTS` is empty or not provided:**

Use `AskUserQuestion` to ask the user what they want to find before doing anything else.

Ask with these options to guide them:
- **Architecture** — System diagrams, Kafka flow, cluster relationships
- **Domain & Terminology** — Business terms, SLA gotchas, order statuses
- **Conventions** — Coding standards, TypeScript, API format, pnpm
- **Backend API** — OMS order docs, endpoints, schemas, error codes
- **ADR (Decisions)** — Why Kafka, SLA naming, pnpm rationale
- **Onboarding** — Week-1 checklist, tool setup, first session guide
- **Projects** — Project list, stack, ports, cluster overview

Wait for their answer before proceeding to Step 2.

---

## Step 2 — Map topic to knowledge files

Based on the topic (from `$ARGUMENTS` or from the user's answer in Step 1), identify relevant files from this index:

### Knowledge File Map

| Topic keywords | Files to read |
|---|---|
| architecture, diagram, kafka, flow, cluster, system | `../knowledge/ARCHITECTURE.md` |
| domain, terminology, SLA, sla, seconds, minutes, status, escalation | `../knowledge/DOMAIN.md` |
| convention, standard, typescript, pnpm, api format, response format | `../knowledge/CONVENTIONS.md` |
| project, stack, port, service, repo | `../knowledge/PROJECTS.md` |
| environment, env, env var, port, 3000, 3001 | `../knowledge/ENVIRONMENTS.md` |
| onboarding, setup, new developer, first day | `../knowledge/ONBOARDING.md` |
| decision, adr, why kafka, why pnpm | `../knowledge/decisions/001-kafka-event-driven.md`, `../knowledge/decisions/002-sla-seconds-naming.md`, `../knowledge/decisions/003-pnpm-package-manager.md` |
| order status, fulfillment, payment status, status code | `../knowledge/oms-order-docs/STATUS_REFERENCE.md` |
| order lifecycle, business flow, order create | `../knowledge/oms-order-docs/BUSINESS_OVERVIEW.md` |
| database, schema, table, column, postgres | `../knowledge/oms-order-docs/DATABASE_SCHEMA.md` |
| error, error code, ERR_ | `../knowledge/oms-order-docs/ERROR_CODES_REFERENCE.md` |
| kafka message, schema, event type, payload | `../knowledge/oms-order-docs/KAFKA_MESSAGE_SCHEMAS.md` |
| stuck order, support, tier1, tier2 | `../knowledge/oms-order-docs/OMS_ORDERS_SUPPORT.md` |
| outbox, event pattern | `../knowledge/oms-order-docs/OUTBOX_PATTERN.md` |
| soft delete, purge, data retention | `../knowledge/oms-order-docs/SOFT_DELETE_AND_PURGE.md` |
| proration, discount, charge split | `../knowledge/oms-order-docs/ORDER_PRORATION.md` |
| substitution, swap, replacement | `../knowledge/oms-order-docs/SUBSTITUTION_ORDER.md` |
| bundle, product bundle | `../knowledge/oms-order-docs/BUNDLE_PRODUCT.md` |
| weight, weight item | `../knowledge/oms-order-docs/WEIGHT_ITEM.md` |
| help page, page help, help docs | `../knowledge/oms-webapp-help-docs/` |

---

## Step 3 — Search and read

1. Use `Grep` to search the topic keyword across `../knowledge/` — pattern: the main keywords from the topic
   ```
   path: ../knowledge/
   pattern: <keyword>
   glob: **/*.md
   output_mode: files_with_matches
   ```

2. Combine: files from the map above + files found by Grep → shortlist (max 5 files)

3. Read each file in the shortlist — for large files use `offset` + `limit` to read only relevant sections

---

## Step 4 — Synthesize and Report

Return a clear, structured answer that:

1. **Direct answer** — answers the question directly from the docs
2. **Key references** — cite exact files and sections (e.g., `../knowledge/DOMAIN.md` — SLA section)
3. **Related topics** — suggest 2-3 related topics from the knowledge base the user might also want to explore
4. **Next action** (if applicable) — suggest a follow-up command, e.g.:
   - `/chore <task>` — if they need to implement something
   - `/question <detail>` — if they need more code-level detail
   - `/knowledge <related-topic>` — to explore a related area

---

## Format rules

- Answer in the same language the user asked (Thai or English)
- Use headers and tables where the source docs use them
- Quote exact values, field names, and status codes as inline code
- Do NOT write or edit any files — this is read-only research
