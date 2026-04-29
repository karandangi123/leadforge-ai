# Build Plan

## Phase 1: GitHub MVP

Goal: a polished local demo that proves the workflow.

- Lead dashboard with seeded fallback data
- Add lead form backed by Prisma/PostgreSQL
- Lead detail workspace with research, audit, drafts, approvals, and traces
- Research, website audit, and outreach preview states
- Approval queue
- Prompt templates in `/prompts`
- Basic eval dataset in `/evals`
- README, architecture docs, screenshots, and local run instructions

Current database milestone:

- Prisma 7 configured with PostgreSQL driver adapter
- Supabase-ready `.env.example`
- Core schema for workspaces, users, leads, agent runs, website audits, outreach drafts, approvals, traces, prompt versions, and eval runs
- Add Lead server action
- Dashboard reads from Postgres and falls back to seeded demo data if the database is unavailable
- Start Here onboarding asks for database/OpenAI values, validates local setup, applies the Prisma schema, and creates a sample lead
- Product + ICP playbook captures what the workspace sells, ideal customers, industries, pains, proof points, positioning, and outreach tone
- Autonomous lead discovery creates target-market query plans, compliant source policy, scored candidate leads, and review-before-save conversion into real leads
- `/leads/[leadId]` detail page reads related lead records and falls back to seeded detail examples
- Detail actions can create research runs, website audits, outreach drafts, approvals, and agent traces for saved leads
- Agent runner supports OpenAI structured outputs when configured and local fallback outputs when not configured
- Agent evaluations score research, audit, and outreach outputs and appear in the lead workspace
- Client Ops action prepares Loom scripts, CRM notes, Airtable/CRM sync payloads, follow-up reminders, approvals, and traces
- Reviewer actions approve or reject prepared work, update lead status, mark sync payload readiness, and write reviewer traces
- Outcome learning records sent, replied, booked, won, and lost signals and summarizes them on the dashboard
- Agent analytics summarize trace coverage, eval pass rate, latency, and learning signals

## Phase 2: Startup Client Version

Goal: useful for a real founder or agency.

- Database persistence with PostgreSQL and Prisma
- OpenAI-powered research, audit, and outreach generation
- Gmail draft creation after approval
- Airtable sync using stored `IntegrationSync` payloads
- Follow-up reminders using stored `FollowUpReminder` records
- Loom script generator stored as outreach drafts
- Manual outcome learning loop for replies, meetings, wins, and losses
- Real search provider adapters for discovery, with rate limits, source citations, and manual LinkedIn import
- Slack notifications

## Phase 3: Advanced Version

Goal: respected open-source AI agent system.

- LangGraph or Agents SDK orchestration
- HubSpot, Pipedrive, and Salesforce integrations
- Agent trace viewer
- Prompt versioning and eval dashboard
- Reply classification and outcome learning
- Cost, latency, quality, and conversion analytics
- Docker Compose self-hosting
- CI workflow that runs lint, typecheck, unit tests, and eval smoke tests

## Weekly Build Rhythm

- Monday: choose one user-visible workflow
- Tuesday: build database and API contract
- Wednesday: build UI and local demo data
- Thursday: connect AI or integration behavior
- Friday: add tests, docs, and a short demo recording
