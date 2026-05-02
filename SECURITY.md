# Security Policy

LeadForge AI is committed to maintaining a secure platform for revenue and growth operations. We appreciate the efforts of security researchers in keeping our community safe.

## Supported Versions

We provide security updates for the following versions of LeadForge AI:

| Version | Supported |
| ------- | --------- |
| Latest  | ✅ Yes     |
| < Latest| ❌ No      |

## Reporting a Vulnerability

**DO NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability, please report it via **GitHub Private Vulnerability Reporting**. This can be found under the **Security** tab of this repository.

### Our Commitment
- We will acknowledge receipt of your report within **48 hours**.
- We will provide an estimated timeline for a resolution.
- We will notify you once the fix is live.
- We will offer public credit in our `CHANGELOG` for responsible disclosure, unless you prefer to remain anonymous.

## Pro-Feature & Billing Protection

If you discover a way to bypass billing, role-based access control, or proprietary feature flags, please treat this as a high-priority security vulnerability and report it privately.

## Secret Handling Guidelines

- **Never** commit `.env` files or plaintext credentials to the repository.
- Use the provided `.env.example` as a template for local development.
- For production deployments on Vercel, use the Vercel Dashboard to manage environment variables securely.
- If you accidentally commit a secret, please notify the maintainers immediately so we can rotate the credential and clean the Git history.
