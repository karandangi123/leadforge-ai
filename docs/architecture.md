# LeadForge AI Architecture

LeadForge AI is designed as an open-source AI revenue operations platform. The first version uses a Next.js app with seeded data. Production versions should split the system into web, worker, database, integrations, agent orchestration, and eval packages.

## Target Modules

- `apps/web`: dashboard, lead workspace, approval queue, settings, trace viewer
- `apps/worker`: scheduled jobs, enrichment runs, reminders, CRM sync tasks
- `packages/agents`: research, audit, outreach, reviewer, follow-up, and outcome agents
- `packages/integrations`: Gmail, Airtable, HubSpot, Salesforce, Slack, Notion
- `packages/database`: Prisma schema, migrations, typed database helpers
- `packages/evals`: datasets, scorers, prompt regression tests, reports

## Core Flow

1. A lead is created or imported.
2. The research agent gathers company facts, ICP signals, and source citations.
3. The website audit agent scores conversion, clarity, speed, trust, and SEO basics.
4. The outreach agent drafts messages using approved prompt versions.
5. The reviewer agent checks factuality, brand voice, and spam risk.
6. A human approves, edits, or rejects every external action.
7. Outcomes flow back into analytics and eval datasets.

## Database Layer

The app uses Prisma 7 with a PostgreSQL driver adapter. The schema lives in `prisma/schema.prisma`, the Prisma client helper lives in `src/lib/prisma.ts`, and dashboard lead reads live in `src/lib/leads.ts`.

The initial dashboard is intentionally resilient: if `DATABASE_URL` is missing or the database is unreachable, the UI falls back to seeded leads. Once Postgres is connected and migrations are applied, the Add Lead form writes real records and the table reads from the database.

The lead detail route is `/leads/[leadId]`. It loads one lead plus `ResearchRun`, `WebsiteAudit`, `OutreachDraft`, `Approval`, and `AgentTrace` records. Seeded lead IDs keep the demo useful before a database is connected.

Lead actions live in `src/app/actions.ts`. They call the agent runner in `src/lib/ai-agents.ts`, which uses the OpenAI Responses API with structured JSON outputs when `OPENAI_API_KEY` is configured. If no key is present, the runner returns local deterministic fallback outputs so the workflow remains testable.

## Workspace Playbook Layer

The `WorkspacePlaybook` model stores the product, ideal customer profile, target industries, solved pains, approved proof points, positioning, and outreach tone. The dashboard includes a Product + ICP setup wizard, and agent actions pass the saved playbook into research, website audit, outreach, and client-ops runs. This makes LeadForge start from business context instead of a blank manual lead table.

## Lead Discovery Layer

The `DiscoveryRun` and `CandidateLead` models power the Find Leads workflow. An operator enters a target market, the app creates a compliant query plan, records allowed and blocked source categories, and generates scored candidate companies before anything is saved to the lead pipeline.

Discovery is intentionally conservative. Safe source categories include company websites, search snippets, public directories, GitHub organizations, job posts, news pages, and public tech hints. The product explicitly blocks undetectable scraping, login-gated scraping, CAPTCHA bypass, and stealth LinkedIn automation. LinkedIn data should enter the system only through a user-approved manual import.

Saving a candidate creates a normal `Lead` record with the candidate's evidence, fit score, source type, initial research run, and trace. This keeps discovery auditable and keeps the same human-review path as manually added leads.

## Client Operations Layer

The next client-ready step prepares external work without performing unsafe side effects. `prepareClientOperations` generates a Loom script, CRM note, Airtable-ready payload, CRM payload, follow-up reminder, approval item, and agent trace. These records live in `OutreachDraft`, `IntegrationSync`, and `FollowUpReminder` so future provider adapters can promote them into real Gmail, Airtable, HubSpot, or Salesforce actions after human approval.

Reviewer actions keep this boundary explicit. Approving prepared work marks pending approvals as approved, moves ready sync payloads to an approved state, updates the lead's next action, and writes a reviewer trace. Rejecting blocks sync payloads and moves the lead back into revision without contacting external services.

## Outcome Learning Layer

Outcome events close the feedback loop without requiring live email or CRM integrations. Operators can record `EMAIL_SENT`, `REPLIED`, `MEETING_BOOKED`, `WON`, and `LOST` signals from the lead workspace. Each event updates the lead's next action, writes an `OutcomeEvent`, and records an `Outcome Learning Agent` trace. The dashboard summarizes reply rate, meetings, and wins so future analytics can compare outcomes against fit scores, audit scores, prompts, and agent evaluations.

## Agent Analytics Layer

The dashboard derives operational analytics from saved leads, agent traces, evaluations, and outcome events. The Agent Intelligence section surfaces trace coverage, eval pass rate, average latency, learning-signal volume, and risk/opportunity signals. This keeps the MVP useful before a dedicated warehouse or analytics service exists.

## Evaluation Layer

Agent quality checks live in `src/lib/evaluations.ts`. Each research, website audit, and outreach action creates an `AgentEvaluation` record with a score, pass/fail status, and check-level report. The lead detail page displays these in a Quality Evals panel so operators can see why an output is ready or needs review.

## Production Principles

- Human approval before email, CRM, or webhook side effects
- Trace every agent decision, tool call, model, cost, and error
- Store prompt versions and run evals before deployment
- Treat scraped websites and user-provided text as untrusted input
- Keep integrations plugin-shaped so contributors can add providers cleanly
