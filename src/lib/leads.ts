import { LeadStatus } from "@/generated/prisma/enums";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

export type DashboardLead = {
  id: string;
  company: string;
  segment: string;
  fit: number | null;
  audit: number | null;
  stage: string;
  owner: string;
  next: string;
  website: string | null;
  contact: string | null;
  isSeed?: boolean;
};

export type LeadDataState = {
  leads: DashboardLead[];
  status: "connected" | "not_configured" | "unavailable";
  message: string;
};

export type LeadDetailState = {
  lead: DashboardLead;
  status: LeadDataState["status"];
  message: string;
  research: Array<{
    id: string;
    status: string;
    summary: string;
    confidence: number | null;
    citations: string[];
  }>;
  audits: Array<{
    id: string;
    status: string;
    overall: number | null;
    clarity: number | null;
    conversion: number | null;
    trust: number | null;
    seo: number | null;
    speed: number | null;
    findings: string[];
  }>;
  drafts: Array<{
    id: string;
    channel: string;
    subject: string | null;
    body: string;
    promptVersion: string | null;
  }>;
  approvals: Array<{
    id: string;
    status: string;
    requestedAction: string;
    notes: string | null;
  }>;
  traces: Array<{
    id: string;
    agentName: string;
    status: string;
    model: string | null;
    latencyMs: number | null;
    tokenCount: number | null;
    output: string;
  }>;
};

const seededLeads: DashboardLead[] = [
  {
    id: "seed-northstar",
    company: "Northstar Clinics",
    segment: "Healthcare ops",
    fit: 92,
    audit: 74,
    stage: "Approval",
    owner: "Research Agent",
    next: "Approve Gmail draft",
    website: "https://northstar.example",
    contact: "Maya Chen",
    isSeed: true,
  },
  {
    id: "seed-civicgrid",
    company: "CivicGrid",
    segment: "GovTech SaaS",
    fit: 88,
    audit: 81,
    stage: "Research",
    owner: "Audit Agent",
    next: "Verify pricing page",
    website: "https://civicgrid.example",
    contact: "Jordan Patel",
    isSeed: true,
  },
  {
    id: "seed-luma",
    company: "Luma Freight",
    segment: "Logistics",
    fit: 79,
    audit: 63,
    stage: "Drafted",
    owner: "Outreach Agent",
    next: "Brand voice review",
    website: "https://lumafreight.example",
    contact: "Sam Rivera",
    isSeed: true,
  },
  {
    id: "seed-operand",
    company: "Operand AI",
    segment: "B2B AI tooling",
    fit: 96,
    audit: 89,
    stage: "Ready",
    owner: "Reviewer Agent",
    next: "Sync to CRM",
    website: "https://operand.example",
    contact: "Ari Shah",
    isSeed: true,
  },
];

export const statusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  RESEARCH: "Research",
  AUDIT: "Audit",
  DRAFTED: "Drafted",
  APPROVAL: "Approval",
  READY: "Ready",
  SYNCED: "Synced",
  REJECTED: "Rejected",
};

const ownerByStatus: Record<LeadStatus, string> = {
  NEW: "Intake",
  RESEARCH: "Research Agent",
  AUDIT: "Audit Agent",
  DRAFTED: "Outreach Agent",
  APPROVAL: "Reviewer Agent",
  READY: "RevOps",
  SYNCED: "CRM Sync",
  REJECTED: "Reviewer Agent",
};

export async function getDashboardLeads(): Promise<LeadDataState> {
  if (!hasDatabaseUrl()) {
    return {
      leads: seededLeads,
      status: "not_configured",
      message: "Connect DATABASE_URL to save real leads. Showing seeded demo data.",
    };
  }

  try {
    const prisma = getPrisma();
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    return {
      leads:
        leads.length > 0
          ? leads.map((lead) => ({
              id: lead.id,
              company: lead.company,
              segment: lead.segment ?? "Unsegmented",
              fit: lead.fitScore,
              audit: lead.auditScore,
              stage: statusLabels[lead.status],
              owner: ownerByStatus[lead.status],
              next: lead.nextAction,
              website: lead.website,
              contact: lead.contactName ?? lead.contactEmail,
            }))
          : seededLeads,
      status: "connected",
      message:
        leads.length > 0
          ? "Connected to Postgres. Showing saved leads."
          : "Connected to Postgres. Add your first lead to replace demo data.",
    };
  } catch {
    return {
      leads: seededLeads,
      status: "unavailable",
      message:
        "DATABASE_URL is set, but the app could not reach the database. Showing seeded demo data.",
    };
  }
}

export async function getLeadDetail(leadId: string): Promise<LeadDetailState | null> {
  const seeded = getSeedLeadDetail(leadId);

  if (!hasDatabaseUrl()) {
    return seeded
      ? {
          ...seeded,
          status: "not_configured",
          message: "Connect DATABASE_URL to view saved lead records. Showing seeded demo detail.",
        }
      : null;
  }

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        researchRuns: { orderBy: { createdAt: "desc" } },
        websiteAudits: { orderBy: { createdAt: "desc" } },
        outreachDrafts: { orderBy: { createdAt: "desc" } },
        approvals: { orderBy: { createdAt: "desc" } },
        agentTraces: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!lead) {
      return seeded
        ? {
            ...seeded,
            status: "connected",
            message: "Connected to Postgres. Showing seeded demo detail.",
          }
        : null;
    }

    return {
      lead: {
        id: lead.id,
        company: lead.company,
        segment: lead.segment ?? "Unsegmented",
        fit: lead.fitScore,
        audit: lead.auditScore,
        stage: statusLabels[lead.status],
        owner: ownerByStatus[lead.status],
        next: lead.nextAction,
        website: lead.website,
        contact: lead.contactName ?? lead.contactEmail,
      },
      status: "connected",
      message: "Connected to Postgres. Showing saved lead detail.",
      research: lead.researchRuns.map((run) => ({
        id: run.id,
        status: run.status,
        summary: run.summary ?? "Research run queued. The AI research agent has not written a summary yet.",
        confidence: run.confidence,
        citations: readStringList(run.citations),
      })),
      audits: lead.websiteAudits.map((audit) => ({
        id: audit.id,
        status: audit.status,
        overall: audit.overallScore,
        clarity: audit.clarityScore,
        conversion: audit.conversionScore,
        trust: audit.trustScore,
        seo: audit.seoScore,
        speed: audit.speedScore,
        findings: readStringList(audit.findings),
      })),
      drafts: lead.outreachDrafts.map((draft) => ({
        id: draft.id,
        channel: draft.channel,
        subject: draft.subject,
        body: draft.body,
        promptVersion: draft.promptVersion,
      })),
      approvals: lead.approvals.map((approval) => ({
        id: approval.id,
        status: approval.status,
        requestedAction: approval.requestedAction,
        notes: approval.notes,
      })),
      traces: lead.agentTraces.map((trace) => ({
        id: trace.id,
        agentName: trace.agentName,
        status: trace.status,
        model: trace.model,
        latencyMs: trace.latencyMs,
        tokenCount: trace.tokenCount,
        output: JSON.stringify(trace.output, null, 2),
      })),
    };
  } catch {
    return seeded
      ? {
          ...seeded,
          status: "unavailable",
          message:
            "DATABASE_URL is set, but the app could not reach the database. Showing seeded demo detail.",
        }
      : null;
  }
}

export function getLeadMetrics(leads: DashboardLead[]) {
  const realLeads = leads.filter((lead) => !lead.isSeed);
  const active = realLeads.length > 0 ? realLeads : leads;
  const fitScores = active.flatMap((lead) => (lead.fit == null ? [] : [lead.fit]));
  const auditScores = active.flatMap((lead) => (lead.audit == null ? [] : [lead.audit]));

  return [
    {
      label: "Saved leads",
      value: String(realLeads.length),
      delta: realLeads.length > 0 ? "Postgres active" : "Seeded preview",
    },
    {
      label: "Research queue",
      value: String(active.filter((lead) => ["New", "Research"].includes(lead.stage)).length),
      delta: "Ready for agents",
    },
    {
      label: "Avg audit",
      value:
        auditScores.length > 0
          ? String(Math.round(auditScores.reduce((sum, score) => sum + score, 0) / auditScores.length))
          : "-",
      delta: "Website score",
    },
    {
      label: "Avg fit",
      value:
        fitScores.length > 0
          ? String(Math.round(fitScores.reduce((sum, score) => sum + score, 0) / fitScores.length))
          : "-",
      delta: "ICP score",
    },
  ];
}

function getSeedLeadDetail(leadId: string): LeadDetailState | null {
  const lead = seededLeads.find((item) => item.id === leadId);

  if (!lead) {
    return null;
  }

  return {
    lead,
    status: "not_configured",
    message: "Showing seeded demo detail.",
    research: [
      {
        id: `${lead.id}-research`,
        status: "SUCCEEDED",
        summary:
          "Company positioning suggests an operations-heavy buyer with clear pain around conversion, follow-up discipline, and proof-led messaging.",
        confidence: 0.86,
        citations: [lead.website ?? "Company website", "Seeded CRM note", "Website audit snapshot"],
      },
    ],
    audits: [
      {
        id: `${lead.id}-audit`,
        status: "SUCCEEDED",
        overall: lead.audit,
        clarity: Math.min((lead.audit ?? 72) + 4, 100),
        conversion: Math.max((lead.audit ?? 72) - 7, 0),
        trust: Math.min((lead.audit ?? 72) + 9, 100),
        seo: Math.max((lead.audit ?? 72) - 3, 0),
        speed: Math.min((lead.audit ?? 72) + 1, 100),
        findings: [
          "Primary call to action is present but competes with secondary navigation.",
          "Trust proof is available but appears late in the page flow.",
          "Outbound angle should focus on improving qualified conversion, not generic growth.",
        ],
      },
    ],
    drafts: [
      {
        id: `${lead.id}-email`,
        channel: "EMAIL",
        subject: `Quick idea for ${lead.company}`,
        body: `Hi ${lead.contact ?? "there"},\n\nI noticed ${lead.company} has a clear market position, but the website could make the next step easier for high-intent visitors. I put together a short audit angle focused on conversion clarity and follow-up quality.\n\nWorth sending over?`,
        promptVersion: "outreach:v1",
      },
      {
        id: `${lead.id}-linkedin`,
        channel: "LINKEDIN",
        subject: null,
        body: `Saw the work ${lead.company} is doing in ${lead.segment}. I had one practical website/outreach observation that might be useful. Open to a quick note?`,
        promptVersion: "outreach:v1",
      },
    ],
    approvals: [
      {
        id: `${lead.id}-approval`,
        status: lead.stage === "Approval" ? "PENDING" : "APPROVED",
        requestedAction: "Create Gmail draft after reviewer approval",
        notes: "Requires factuality check before external action.",
      },
    ],
    traces: [
      {
        id: `${lead.id}-trace-1`,
        agentName: "Research Agent",
        status: "SUCCEEDED",
        model: "gpt-5.4",
        latencyMs: 1840,
        tokenCount: 3120,
        output: JSON.stringify({ nextAction: lead.next, confidence: 0.86 }, null, 2),
      },
      {
        id: `${lead.id}-trace-2`,
        agentName: "Website Audit Agent",
        status: "SUCCEEDED",
        model: "gpt-5.4-mini",
        latencyMs: 970,
        tokenCount: 1418,
        output: JSON.stringify({ auditScore: lead.audit, stage: lead.stage }, null, 2),
      },
    ],
  };
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => (typeof item === "string" ? [item] : []));
}
