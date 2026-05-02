# LeadForge AI: Final Architecture & Product Advancement Plan
**Version:** 1.0.0-PRO  
**Status:** Approved for Implementation  
**Role:** Master Architect / CTO

---

## 1. System Identity & Mission
LeadForge AI is an operator-first Revenue Operating System (ROS) designed to bridge the gap between AI research and professional outbound execution. Unlike "stealth" automation tools, LeadForge prioritizes a **Human-in-the-Loop (HITL)** boundary, ensuring every AI-generated asset is reviewed, edited, and approved by a human operator before hitting production environments (Gmail, CRM, etc.).

### Core Philosophy
- **Visible Outputs:** Every AI step (Research, Audit, Outreach) produces a usable, editable artifact.
- **Trust via Traces:** Full observability of model usage, costs, and evaluations.
- **Demo-First Resilience:** A functional "Demo Mode" that allows product exploration without infrastructure friction.
- **Compliance by Design:** No unsafe scraping; explicit source policies for discovery.

---

## 2. Product Blueprint: The 14 Layers of LeadForge
LeadForge is structured into 14 distinct functional layers that move the user from market understanding to closed revenue.

### I. Acquisition & Entry Layers
1. **Landing & Demo Layer:** Clear value prop, interactive demo board, and "Try before you buy" growth tools.
2. **Setup & Context Layer:** Workspace onboarding, ICP definition, and Playbook creation.

### II. Discovery & Pipeline Layers
3. **Lead Discovery Layer:** Autonomous query planning, candidate scoring, and "Save to Pipeline" workflow.
4. **Pipeline Command Layer:** Visual Kanban board with stage counts, fit/audit metrics, and owner assignments.
5. **Lead System-of-Record:** Detailed lead workspaces with unified activity timelines and context editors.

### III. Intelligence & Asset Layers
6. **AI Research Layer:** Multi-signal company research with citation-backed summaries.
7. **Website Audit (Roast) Layer:** 5-point conversion scoring (Clarity, Trust, Conversion, SEO, Speed) and messaging rewrites.
8. **Competitor Intelligence Layer:** Positioning analysis, CTA patterns, and battlecard generation.
9. **Outreach Drafting Layer:** Personalization-first assets (Email, Loom scripts, CRM notes).

### IV. Governance & Learning Layers
10. **Approval Layer:** Centralized review queue with diff-views and audit trails.
11. **Client Ops Layer:** Prepared sync payloads for Gmail (drafts), Airtable, and CRM.
12. **Outcome Learning Layer:** Event logging (Sent, Replied, Won/Lost) and strategy feedback loops.
13. **Growth Strategy Layer:** "One-Prompt Growth Mode" for 90-day execution plans.
14. **Trust & Analytics Layer:** Trace viewer, eval pass rates, and latency/cost monitoring.

---

## 3. Modular Monorepo Architecture
To scale toward v1.0, the codebase will transition to a **Turborepo** monorepo structure.

```text
leadforge-ai/
├── apps/
│   ├── web/                # Next.js 16 App Router (Primary UI)
│   └── worker/             # Background job processor (BullMQ/Redis)
├── packages/
│   ├── database/           # Prisma Client, Migrations, and Seeders
│   ├── agents/             # AI Agent logic (Research, Audit, Outreach)
│   ├── ui/                 # Shared React components & Design System
│   ├── evals/              # Prompt evaluation logic & CI checks
│   ├── integrations/       # Provider adapters (Gmail, HubSpot, Airtable)
│   └── logger/             # Unified tracing and observability
├── .github/                # CI/CD Workflows
└── docs/                   # Engineering & Product Documentation
```

---

## 4. Technical Stack & Versioning
| Component | Technology | Version |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 16.x |
| **Database** | PostgreSQL | 16.x |
| **ORM** | Prisma | 7.x |
| **Styling** | Vanilla CSS + Tailwind | Project Standard |
| **Runtime** | Node.js | 20.x LTS |
| **AI Orchestration** | OpenAI SDK | Latest |
| **Validation** | Zod | 3.x |
| **Icons** | Lucide React | Latest |
| **Caching/Jobs** | Redis / BullMQ | 7.x |

---

## 5. Security & Compliance Framework
LeadForge implements enterprise-grade safety boundaries:
- **HITL Enforcement:** No external API side effects occur without explicit human approval.
- **Data Privacy:** Local `.env.local` management for OpenAI keys; no centralized key storage in v0.x.
- **Input Sanitization:** Strict Zod schema validation for every server action.
- **Audit Trails:** Every operator action and agent trace is recorded with timestamps and actor IDs.
- **Compliance Policy:** Explicit "LinkedIn-Manual-Only" policy to protect user accounts.

---

## 6. Git Flow & Development Standards
The repository follows a professional multi-branch strategy:

- **`main`**: Production-ready, stable code only. Tagged releases (e.g., `v1.0.0`).
- **`develop`**: Primary integration branch. All feature branches merge here.
- **`feature/*`**: Isolated feature development (e.g., `feature/roast-lab`).
- **`chore/*`**: Maintenance, refactoring, and repo restructuring.
- **`fix/*`**: Bug fixes.
- **`release/vX.Y`**: Stabilization branches for final testing before merging to `main`.

### Commit Standards
Follow **Conventional Commits**:
- `feat:` (new feature)
- `fix:` (bug fix)
- `chore:` (maintenance)
- `docs:` (documentation changes)
- `refactor:` (code restructuring)

---

## 7. CI/CD & DevOps Strategy
### Phase 1: Automation (Current)
- **Linting:** `eslint` checks on every PR.
- **Build Verification:** `npm run build` on every PR.
- **Type Safety:** `tsc` verification.

### Phase 2: Agent Quality (v0.6.0+)
- **Prompt Evals:** CI-based evaluation of agent outputs against benchmarks.
- **Schema Validation:** Automated tests for structured output contracts.

### Phase 3: Deployment
- **Staging:** Automatic deployment to staging on merge to `develop`.
- **Production:** Manual release to production on merge to `main`.

---

## 8. Release Roadmap: v0.1.0 to v1.0.0
| Version | Milestone | Key Features |
| :--- | :--- | :--- |
| **v0.1.0** | Core Workflow | Pipeline, Research, Audit, Approvals, Demo Mode. |
| **v0.3.0** | Intake & Disc. | CSV Import, Autonomous Discovery, Candidate Review. |
| **v0.5.0** | Viral Strategy | Roast Lab, Competitor Spy, Growth Mode, Public Funnel. |
| **v0.7.0** | Observability | Trace Viewer, Prompt Versioning, CI Evals, Cost Analytics. |
| **v1.0.0** | OSS Release | Monorepo Split, Self-Hosting Guide, Stable API. |

---

## 9. Verification & Quality Assurance
### Testing Matrix
- **User Flow Tests:** Onboarding -> Playbook -> Lead -> Approval -> Outcome.
- **Parity Tests:** Ensure Demo Mode behaves identically to Database Mode (minus persistence).
- **Security Tests:** Verify Zod validation and HITL blocks.
- **Agent Tests:** Factuality and coverage scores for Research/Audit agents.

---
*Created by LeadForge Architect Persona*
