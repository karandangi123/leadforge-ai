# Security Notes

LeadForge AI handles customer, lead, email, and CRM data. Security needs to be visible from the first serious version.

## Required Controls

- Encrypt OAuth tokens at rest
- Scope integrations per workspace
- Add audit logs for approvals and external actions
- Rate-limit lead enrichment and outreach draft generation
- Never send email without human approval in early versions
- Block prompt injection patterns in scraped website text
- Store source citations for researched claims
- Avoid putting secrets in prompt logs or traces
- Add workspace roles for owner, admin, reviewer, and viewer

## Prompt Injection Defense

Website content, CRM notes, imported CSVs, and email replies are untrusted. Agents should separate instructions from data and pass retrieved content as quoted context, never as system-level instructions.
