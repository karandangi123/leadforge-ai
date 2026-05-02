# Contributing to LeadForge AI

We welcome focused contributions that make the workflow more trustworthy, easier to run locally, and easier to extend.

## Branching Strategy

We follow a professional branching model to ensure stability:

- **`main`**: The stable, production-ready branch. Only merges from `release/*` or `hotfix/*` are allowed.
- **`dev`**: The active development branch. All feature branches should branch from and merge back into `dev`.
- **`feature/*`**: New features or improvements.
- **`fix/*`**: Bug fixes.
- **`release/*`**: Preparation for a new production release.
- **`hotfix/*`**: Urgent production fixes.

**Note**: Direct commits to `main` and `dev` are blocked. All changes must go through a Pull Request with at least one approval.

## Repository Layout

- `apps/dashboard`: The primary Next.js 16 application (Open Source UI).
- `packages/agents`: AI runtime and structured outputs (Open Source Core).
- `packages/evals`: Evaluation logic for agent outputs (Open Source).
- `packages/integrations`: Provider adapters like Gmail (Open Source).
- `packages/db`: Prisma schema and database helpers (Open Source).
- `packages/billing`: Proprietary subscription and pricing logic (**Protected**).

## Contribution Boundaries

### What you CAN contribute:
- UI improvements to `apps/dashboard`.
- New AI agents or prompt optimizations in `packages/agents`.
- Integration adapters in `packages/integrations`.
- Bug fixes across the open-source packages.

### What you SHOULD NOT modify:
- **`packages/billing`**: This package contains proprietary logic. Changes here are strictly handled by the core team.
- **Auth Logic**: Sensitive authentication flows in `src/auth.ts` require deep security review.

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
