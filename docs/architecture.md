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

## Production Principles

- Human approval before email, CRM, or webhook side effects
- Trace every agent decision, tool call, model, cost, and error
- Store prompt versions and run evals before deployment
- Treat scraped websites and user-provided text as untrusted input
- Keep integrations plugin-shaped so contributors can add providers cleanly
