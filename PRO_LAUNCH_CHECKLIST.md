# 🚀 LeadForge AI: Pro Launch & Open-Core Transition Checklist

This document outlines the "Deep and Smart" boundaries implemented to protect proprietary SaaS assets while maintaining a professional, contributor-friendly open-source core.

## 1. Security & Logic Boundaries
- [x] **Billing Isolation**: `packages/billing` is hardened. It defaults to a development mock but requires `LEADFORGE_PRO_MODE=true` and valid Stripe secrets for production.
- [x] **Prompt Protection**: `packages/agents` supports fetching high-performance prompts from a private API (`LEADFORGE_PRIVATE_PROMPT_URL`). 
- [x] **Secret Auditing**: GitHub Actions (`security.yml`) now scan every PR for leaked credentials using Gitleaks.

## 2. Dashboard UI Gating
- [x] **Feature Gates**: The `FeatureGate` component in `apps/dashboard` elegantly locks Pro features (e.g., Growth Brief, Proposal Engine) for unentitled users.
- [x] **Pro Branding**: `ProBadge` and `isPro` props in shared UI components clearly signify premium value.
- [x] **Upgrade Path**: Gated features trigger cinematic upgrade overlays that direct users to the Billing portal.

## 3. Open Source Foundation
- [x] **Core Adapters**: Gmail, LinkedIn, and Enrichment adapters in `packages/integrations` remain open and functional for the community.
- [x] **Smart Fallbacks**: Enrichment logic falls back to OpenAI inference if specialized API keys (Clearbit/Apollo) are missing.
- [x] **Demo Mode**: High-fidelity mock data is preserved for "try-before-you-buy" exploration without infrastructure friction.

## 4. Next Steps for SaaS Launch
1. **Private Backend**: Deploy a secure internal API to host proprietary "High-Performance" prompts and set `LEADFORGE_PRIVATE_PROMPT_URL`.
2. **Stripe Config**: Configure production Stripe Price IDs and Secret Keys in your Vercel/Production environment.
3. **Internal Key**: Set `LEADFORGE_INTERNAL_KEY` to authenticate the Dashboard against your private prompt/logic services.
4. **Branch Protection**: Enable branch protection on `main` to require a passing Security Audit (CI) before merging.

---
*Status: Repository is hardened and ready for public visibility.*
