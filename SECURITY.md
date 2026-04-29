# Security Policy

## Supported Versions
Only the latest version of LeadForge AI is supported for security updates.

## Reporting a Vulnerability
We take the security of LeadForge AI seriously. If you believe you have found a security vulnerability, please do NOT open a public issue.

Instead, please report it via **GitHub Private Vulnerability Reporting**.

### Our Commitment
- We will acknowledge receipt of your report within 48 hours.
- We will provide an estimated timeline for a fix.
- We will credit you in our CHANGELOG once the fix is live.

## Secret Handling
- Never commit `.env` files or plaintext credentials to the repository.
- For hosted environments, store secrets in Vercel project environment variables instead of repo files.
- Local `.env` files are ignored by Git and excluded from Vercel CLI deployment uploads via `.vercelignore`.
