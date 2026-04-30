# Contributing to LeadForge AI

We welcome focused contributions that make the workflow more trustworthy, easier to run locally, and easier to extend.

## Workflow
1. Fork the repo.
2. Create a short-lived branch from `main`.
3. Keep the change scoped to one concern when possible.
4. Run the local quality checks before opening a PR.
5. Submit a PR to `main`.

## Repository layout

- `apps/dashboard`: the shipped Next.js 16 App Router application
- `packages/agents`: AI runtime and structured outputs
- `packages/evals`: evaluation logic for agent outputs
- `packages/integrations`: provider-facing adapters such as Gmail
- `packages/db`: Prisma schema, generated client, and DB helpers

## Local checks

```bash
npm ci
npm run typecheck
npm run lint:all
npm run build:all
npm run test:e2e
```

## Code Standards
- Use TypeScript for everything.
- Keep package boundaries honest. Shared runtime code belongs in `packages/*`, while dashboard-only UI state and presentation helpers stay in `apps/dashboard`.
- Add or update eval coverage when prompt or agent behavior changes.
- Preserve the human approval boundary for any external action. Draft creation is acceptable; automatic sending is not.
