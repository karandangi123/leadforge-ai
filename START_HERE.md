# Start Here: Building LeadForge AI

This is the practical path for building LeadForge AI from the current scaffold into a real product.

## Step 1: Run the App

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js. In this workspace it is currently `http://localhost:3001` because port 3000 was already busy.

## Step 2: Understand the First Product

Version 1 should prove one complete workflow:

1. Add a lead.
2. Research the company.
3. Audit the website.
4. Generate outreach.
5. Send it to an approval queue.
6. Show status on the dashboard.
7. Open the lead detail workspace.

Do not start with Gmail, CRM, or automation. Start with the workflow people can see and understand.

The detail workspace route is:

```txt
/leads/[leadId]
```

It shows research, website audit, outreach drafts, approvals, and agent traces for each lead.

The first real lead actions are also wired:

- Run Research
- Run Website Audit
- Generate Outreach Draft

These actions are server-side database mutations. They are disabled for seeded demo leads and enabled for saved Postgres leads.

If `OPENAI_API_KEY` is set, the actions call the OpenAI Responses API with structured JSON outputs. Without it, they use local fallback outputs so the workflow remains testable.

## Step 3: Replace Seed Data with Real State

Create the first database tables:

- `Workspace`
- `User`
- `Lead`
- `ResearchRun`
- `WebsiteAudit`
- `OutreachDraft`
- `Approval`
- `AgentTrace`
- `PromptVersion`
- `EvalRun`

Recommended stack:

- PostgreSQL
- Prisma
- Next.js server actions or API routes

This project now includes the first Prisma setup. To connect Supabase or Postgres:

```bash
cp .env.example .env
```

Paste your real `DATABASE_URL` into `.env`, then run:

```bash
npm run db:generate
npm run db:migrate
```

After the migration succeeds, restart the dev server. The dashboard Add Lead form will save real leads instead of showing seeded demo data.

## Step 4: Add the First AI Calls

Start with three agents:

- Research Agent: company facts, citations, ICP signals
- Audit Agent: website score and recommendations
- Outreach Agent: email, LinkedIn note, follow-up angle

Keep the prompts in `/prompts` and log every input/output pair for debugging.

## Step 5: Add Human Approval

External actions must go through approvals:

- Gmail draft creation
- CRM sync
- Slack notification
- webhook delivery

For V1, an approval can simply be a status field: `pending`, `approved`, `rejected`, or `edited`.

## Step 6: Add Evals Before More Features

Create tiny golden datasets first. The eval system should catch:

- hallucinated lead facts
- aggressive or spammy outreach
- missing personalization
- weak website audit reasoning
- unsafe external action suggestions

Later, run these evals in CI for every pull request.

## Step 7: Add Integrations

Recommended order:

1. Airtable sync
2. Gmail draft creation
3. Slack notifications
4. HubSpot or Pipedrive
5. Salesforce

Gmail should create drafts, not send emails automatically.

## Step 8: Make It GitHub-Respected

Before launch, add:

- screenshots
- demo video or GIF
- Docker Compose
- `.env.example`
- architecture docs
- security docs
- contribution guide
- GitHub Actions CI
- eval examples
- seed data command

## The Rule

Every week, build one visible workflow end to end. A small finished loop beats ten disconnected advanced features.
