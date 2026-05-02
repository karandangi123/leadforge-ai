# Security Policy

## Security Philosophy
LeadForge AI is an investor-grade RevOps platform. We prioritize the security of user data, API credentials, and autonomous workflows above all else. Our security posture is based on:
- **Zero-Trust generated artifacts**: We never commit build or prisma-generated files.
- **Automated Scanning**: Every PR is audited for secret leaks and dependency vulnerabilities.
- **Safe Execution**: All agentic actions are approval-gated by default.

## Supported Versions
Only the latest version of the `main` branch is supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| v1.x    | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability
**DO NOT OPEN A PUBLIC ISSUE** for security vulnerabilities.

If you discover a security risk, please report it privately:
1. **Email**: security@leadforge.ai
2. **Details**: Include a clear description of the vulnerability, steps to reproduce, and potential impact.

We aim to acknowledge all reports within 24 hours and provide a fix within 72 hours for critical issues.

## Disclosure Policy
We follow a 90-day responsible disclosure policy. We ask that you do not share details of the vulnerability publicly until a patch has been released.

---
*LeadForge AI is committed to maintaining a secure and transparent platform for the RevOps community.*
