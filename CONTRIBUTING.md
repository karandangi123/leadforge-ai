# Contributing to LeadForge AI

We are excited to build the future of autonomous RevOps with the community. To maintain our "investor-grade" standards, we ask all contributors to adhere to the following guidelines.

## Code of Conduct
By participating in this project, you agree to maintain a professional, respectful, and inclusive environment.

## Professional Standards
- **Consistency**: Follow existing patterns in the monorepo. Use `@leadforge/*` packages for shared logic.
- **Type Safety**: No `any` types. Every PR must pass `npm run build` (type checking).
- **Aesthetics**: UI contributions must adhere to the cinematic, high-fidelity design system established in `apps/dashboard`.

## Branching Strategy
- **`main`**: Production-ready, stable code.
- **`dev`**: Active integration branch. **All PRs must target `dev`.**
- **Feature Branches**: Use `feat/description` or `fix/description`.

## Pull Request Process
1. **Target `dev`**: Never open a PR directly against `main`.
2. **Security Audit**: Ensure your code passes the local `gitleaks` scan.
3. **Documentation**: Update `README.md` or relevant `docs/*.md` if adding features.
4. **Testing**: Add unit tests for new logic in `packages/*`.

## Code Ownership
Critical paths in `/packages/billing`, `/apps/dashboard/src/auth.ts`, and CI workflows require review from the Core Maintainers (`CODEOWNERS`).

---
*Thank you for helping us build the next generation of revenue intelligence.*
