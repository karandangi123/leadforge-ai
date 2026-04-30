# LeadForge AI Architecture

LeadForge AI is structured as a monorepo with one shipped app today and a small set of real workspace packages. The current goal is repository trustworthiness: contributors should be able to clone the repo, understand the boundaries, and get to a green local build without reverse-engineering stale paths.

## Current Modules

- `apps/dashboard`: dashboard, lead workspace, approval queue, settings, and growth surfaces
- `packages/agents`: research, audit, outreach, reviewer, follow-up, and outcome agents
- `packages/db`: Prisma schema, generated client, typed database helpers
- `packages/evals`: output scoring and quality checks
- `packages/integrations`: Gmail, Airtable, HubSpot, Salesforce, Slack, Notion

The repository does not currently ship a worker app. Any docs or CI assumptions about `apps/worker`, `develop`, or legacy root-level `src/` and `prisma/` paths should be treated as stale unless they have been reintroduced intentionally.

## Core Flow

1. A lead is created or imported.
2. The research agent gathers company facts, ICP signals, and source citations.
3. The website audit agent scores conversion, clarity, speed, trust, and SEO basics.
4. The outreach agent drafts messages using approved prompt versions.
5. The reviewer agent checks factuality, brand voice, and spam risk.
6. A human approves, edits, or rejects every external action.
7. Outcomes flow back into analytics and eval datasets.

## Database Layer

The app uses Prisma 7 with a PostgreSQL driver adapter. The schema lives in `packages/db/prisma/schema.prisma`, the Prisma client helper lives in `packages/db/src/prisma.ts`, and dashboard lead reads live in `apps/dashboard/src/lib/leads.ts`.

The initial dashboard is intentionally resilient: if `DATABASE_URL` is missing or the database is unreachable, the UI falls back to seeded leads. Once Postgres is connected and migrations are applied, the Add Lead form writes real records and the table reads from the database.

The lead detail route is `/leads/[leadId]`. It loads one lead plus `ResearchRun`, `WebsiteAudit`, `OutreachDraft`, `Approval`, and `AgentTrace` records. Seeded lead IDs keep the demo useful before a database is connected.

Lead actions live under `apps/dashboard/src/app/actions`. They call the agent runtime in `packages/agents`, the evaluation helpers in `packages/evals`, and the Gmail adapter in `packages/integrations`. If `OPENAI_API_KEY` is missing, the agent runner returns deterministic fallback outputs so the workflow remains testable.

## Workspace Playbook Layer

The `WorkspacePlaybook` model stores the product, ideal customer profile, target industries, solved pains, approved proof points, positioning, and outreach tone. The dashboard includes a Product + ICP setup wizard, and agent actions pass the saved playbook into research, website audit, outreach, and client-ops runs. This makes LeadForge start from business context instead of a blank manual lead table.

## Lead Discovery Layer

The `DiscoveryRun` and `CandidateLead` models power the Find Leads workflow. An operator enters a target market, the app creates a compliant query plan, records allowed and blocked source categories, and generates scored candidate companies before anything is saved to the lead pipeline.

Discovery is intentionally conservative. Safe source categories include company websites, search snippets, public directories, GitHub organisations, job posts, news pages, and public tech hints. The product explicitly blocks undetectable scraping, login-gated scraping, CAPTCHA bypass, and stealth LinkedIn automation. LinkedIn data should enter the system only through a user-approved manual import.

Saving a candidate creates a normal `Lead` record with the candidate's evidence, fit score, source type, initial research run, and trace. This keeps discovery auditable and keeps the same human-review path as manually added leads.

## Client Operations Layer

The next client-ready step prepares external work without performing unsafe side effects. `prepareClientOperations` generates a Loom script, CRM note, payload stubs, follow-up reminders, approval items, and traces. These records live in `OutreachDraft`, `IntegrationSync`, and `FollowUpReminder` so future provider adapters can promote them into real actions after human approval.

Reviewer actions keep this boundary explicit. Approving prepared work marks pending approvals as approved, moves ready sync payloads to an approved state, updates the lead's next action, and writes a reviewer trace. Rejecting blocks sync payloads and moves the lead back into revision without contacting external services. The only real provider path in scope for this phase is Gmail draft creation, and it must never auto-send.

## Outcome Learning Layer

Outcome events close the feedback loop without requiring live email or CRM integrations. Operators can record `EMAIL_SENT`, `REPLIED`, `MEETING_BOOKED`, `WON`, and `LOST` signals from the lead workspace. Each event updates the lead's next action, writes an `OutcomeEvent`, and records an `Outcome Learning Agent` trace. The dashboard summarizes reply rate, meetings, and wins so future analytics can compare outcomes against fit scores, audit scores, prompts, and agent evaluations.

## Agent Analytics Layer

The dashboard derives operational analytics from saved leads, agent traces, evaluations, and outcome events. The Agent Intelligence section surfaces trace coverage, eval pass rate, average latency, learning-signal volume, and risk/opportunity signals. This keeps the MVP useful before a dedicated warehouse or analytics service exists.

## Evaluation Layer

Agent quality checks live in `packages/evals/src/evaluations.ts`. Each research, website audit, and outreach action creates an `AgentEvaluation` record with a score, pass/fail status, and check-level report. The lead detail page displays these in a Quality Evals panel so operators can see why an output is ready or needs review.

## Production Principles

- Human approval before email, CRM, or webhook side effects
- Trace every agent decision, tool call, model, cost, and error
- Store prompt versions and run evals before deployment
- Treat scraped websites and user-provided text as untrusted input
- Keep integrations plugin-shaped so contributors can add providers cleanly
