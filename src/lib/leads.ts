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
  outcomeSummary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  agentAnalytics: AgentAnalytics;
  playbook: WorkspacePlaybookState;
  discovery: DiscoveryState;
};

export type WorkspacePlaybookState = {
  status: "saved" | "demo" | "empty";
  product: string;
  idealCustomer: string;
  industries: string[];
  pains: string[];
  proofPoints: string[];
  tone: string;
  positioning: string | null;
};

export type AgentAnalytics = {
  metrics: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  signals: Array<{
    label: string;
    detail: string;
    tone: "positive" | "warning" | "neutral";
  }>;
};

export type DiscoveryState = {
  status: "saved" | "demo" | "empty";
  targetMarket: string;
  summary: string;
  queryPlan: string[];
  sourcePolicy: {
    allowed: string[];
    blocked: string[];
    linkedin: string;
  };
  candidates: Array<{
    id: string;
    company: string;
    website: string | null;
    segment: string;
    sourceType: string;
    sourceUrl: string | null;
    evidence: string[];
    fitScore: number;
    auditHintScore: number | null;
    confidence: number | null;
    reason: string;
    status: string;
    savedLeadId: string | null;
  }>;
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
  evaluations: Array<{
    id: string;
    category: string;
    score: number;
    passed: boolean;
    checks: Array<{
      label: string;
      passed: boolean;
      detail: string;
    }>;
  }>;
  integrations: Array<{
    id: string;
    provider: string;
    status: string;
    payload: string;
  }>;
  reminders: Array<{
    id: string;
    channel: string;
    status: string;
    dueAt: string;
    note: string;
  }>;
  outcomes: Array<{
    id: string;
    eventType: string;
    note: string | null;
    createdAt: string;
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
      outcomeSummary: seededOutcomeSummary,
      agentAnalytics: seededAgentAnalytics,
      playbook: seededPlaybook,
      discovery: seededDiscovery,
    };
  }

  try {
    const prisma = getPrisma();
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        agentTraces: true,
        evaluations: true,
        outcomeEvents: true,
      },
    });
    const workspace = await prisma.workspace.findUnique({
      where: { slug: "demo" },
      include: {
        playbook: true,
        discoveryRuns: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { candidateLeads: { orderBy: { fitScore: "desc" } } },
        },
      },
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
      outcomeSummary: leads.length > 0 ? getOutcomeSummary(leads.flatMap((lead) => lead.outcomeEvents)) : seededOutcomeSummary,
      agentAnalytics: leads.length > 0 ? getAgentAnalytics(leads) : seededAgentAnalytics,
      playbook: workspace?.playbook ? mapPlaybook(workspace.playbook) : emptyPlaybook,
      discovery: workspace?.discoveryRuns[0] ? mapDiscovery(workspace.discoveryRuns[0]) : emptyDiscovery,
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
      outcomeSummary: seededOutcomeSummary,
      agentAnalytics: seededAgentAnalytics,
      playbook: seededPlaybook,
      discovery: seededDiscovery,
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
        evaluations: { orderBy: { createdAt: "desc" } },
        integrationSyncs: { orderBy: { createdAt: "desc" } },
        followUpReminders: { orderBy: { dueAt: "asc" } },
        outcomeEvents: { orderBy: { createdAt: "desc" } },
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
      evaluations: lead.evaluations.map((evaluation) => ({
        id: evaluation.id,
        category: evaluation.category,
        score: evaluation.score,
        passed: evaluation.passed,
        checks: readEvaluationChecks(evaluation.report),
      })),
      integrations: lead.integrationSyncs.map((sync) => ({
        id: sync.id,
        provider: sync.provider,
        status: sync.status,
        payload: JSON.stringify(sync.payload, null, 2),
      })),
      reminders: lead.followUpReminders.map((reminder) => ({
        id: reminder.id,
        channel: reminder.channel,
        status: reminder.status,
        dueAt: reminder.dueAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        note: reminder.note,
      })),
      outcomes: lead.outcomeEvents.map((outcome) => ({
        id: outcome.id,
        eventType: outcome.eventType,
        note: outcome.note,
        createdAt: outcome.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
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
    evaluations: [
      {
        id: `${lead.id}-eval-research`,
        category: "research",
        score: 100,
        passed: true,
        checks: [
          {
            label: "Has citations",
            passed: true,
            detail: "Seed research includes demo citation context.",
          },
          {
            label: "Actionable angle",
            passed: true,
            detail: "The output includes a conversion-focused outreach angle.",
          },
        ],
      },
      {
        id: `${lead.id}-eval-outreach`,
        category: "outreach",
        score: 75,
        passed: true,
        checks: [
          {
            label: "Low-pressure tone",
            passed: true,
            detail: "The draft avoids urgency and exaggerated claims.",
          },
          {
            label: "Approval reminder",
            passed: true,
            detail: "The lead remains in a human review step.",
          },
        ],
      },
    ],
    integrations: [
      {
        id: `${lead.id}-airtable`,
        provider: "AIRTABLE",
        status: "READY",
        payload: JSON.stringify(
          {
            company: lead.company,
            stage: lead.stage,
            fitScore: lead.fit,
            nextAction: lead.next,
          },
          null,
          2,
        ),
      },
      {
        id: `${lead.id}-crm`,
        provider: "CRM",
        status: "READY",
        payload: JSON.stringify(
          {
            company: lead.company,
            contact: lead.contact,
            note: "Ready for approved outreach and CRM sync.",
          },
          null,
          2,
        ),
      },
    ],
    reminders: [
      {
        id: `${lead.id}-follow-up`,
        channel: "EMAIL",
        status: "SCHEDULED",
        dueAt: "May 4, 2026",
        note: "Follow up if the approved Gmail draft has not been sent.",
      },
    ],
    outcomes: [
      {
        id: `${lead.id}-outcome-sent`,
        eventType: "EMAIL_SENT",
        note: "Approved outreach marked as sent in the seeded demo.",
        createdAt: "Apr 29, 2026",
      },
      {
        id: `${lead.id}-outcome-reply`,
        eventType: lead.stage === "Ready" ? "REPLIED" : "MEETING_BOOKED",
        note: "Outcome signal used to improve future fit scoring and outreach prompts.",
        createdAt: "Apr 30, 2026",
      },
    ],
  };
}

const seededOutcomeSummary = [
  {
    label: "Reply rate",
    value: "50%",
    detail: "Seeded learning signal",
  },
  {
    label: "Meetings",
    value: "1",
    detail: "Booked from approved outreach",
  },
  {
    label: "Wins",
    value: "1",
    detail: "Positive outcome examples",
  },
];

const seededPlaybook: WorkspacePlaybookState = {
  status: "demo",
  product: "AI-powered RevOps workflow automation",
  idealCustomer: "Founder-led B2B teams and agencies that need qualified outreach without losing human review.",
  industries: ["Healthcare ops", "GovTech SaaS", "Logistics", "B2B AI tooling"],
  pains: ["Manual lead research", "Weak website conversion", "Inconsistent follow-up", "No outreach quality tracking"],
  proofPoints: ["Human approval before external actions", "Traceable AI runs", "Quality evals and outcome learning"],
  tone: "Specific, low-pressure, useful, and concise",
  positioning: "LeadForge turns a product description into researched leads, website audits, approved outreach, and learning signals.",
};

const emptyPlaybook: WorkspacePlaybookState = {
  status: "empty",
  product: "",
  idealCustomer: "",
  industries: [],
  pains: [],
  proofPoints: [],
  tone: "",
  positioning: null,
};

const seededDiscovery: DiscoveryState = {
  status: "demo",
  targetMarket: "Healthcare operations teams",
  summary:
    "Demo discovery shows how LeadForge plans safe sources, scores candidates, and keeps LinkedIn as manual import only.",
  queryPlan: [
    "Healthcare operations teams companies case studies",
    "Healthcare operations software platforms hiring revops operations",
    "site:github.com/orgs healthcare operations company engineering",
    "Healthcare operations startup funding news customer operations",
  ],
  sourcePolicy: {
    allowed: [
      "Company websites",
      "Search result snippets",
      "Public directories",
      "GitHub organizations",
      "Job posts",
      "News pages",
      "Public tech hints",
    ],
    blocked: ["Undetectable scraping", "Login-gated scraping", "CAPTCHA bypass", "Stealth LinkedIn automation"],
    linkedin: "Manual CSV/import only. Do not automate LinkedIn browsing or messaging.",
  },
  candidates: [
    {
      id: "seed-discovery-candidate-1",
      company: "CareOps Systems",
      website: "https://careops.example",
      segment: "Healthcare ops",
      sourceType: "company_website",
      sourceUrl: "https://careops.example",
      evidence: ["Website category matches healthcare operations.", "Messaging suggests manual qualification pain."],
      fitScore: 91,
      auditHintScore: 78,
      confidence: 0.76,
      reason: "Strong ICP match with a public company website and clear operations pain.",
      status: "CANDIDATE",
      savedLeadId: null,
    },
    {
      id: "seed-discovery-candidate-2",
      company: "ClinicFlow Labs",
      website: null,
      segment: "Healthcare ops",
      sourceType: "github_org",
      sourceUrl: "https://github.com/clinicflow-labs",
      evidence: ["Public GitHub organization suggests an active technical team.", "Repo context can support research only."],
      fitScore: 86,
      auditHintScore: null,
      confidence: 0.72,
      reason: "Technical team signal and healthcare workflow category overlap.",
      status: "CANDIDATE",
      savedLeadId: null,
    },
  ],
};

const emptyDiscovery: DiscoveryState = {
  status: "empty",
  targetMarket: "",
  summary: "",
  queryPlan: [],
  sourcePolicy: {
    allowed: [],
    blocked: [],
    linkedin: "Manual import only. No stealth automation.",
  },
  candidates: [],
};

const seededAgentAnalytics: AgentAnalytics = {
  metrics: [
    {
      label: "Trace coverage",
      value: "100%",
      detail: "Seeded demo runs are traceable",
    },
    {
      label: "Eval pass rate",
      value: "88%",
      detail: "Quality gates passing",
    },
    {
      label: "Avg latency",
      value: "1.4s",
      detail: "Agent response timing",
    },
    {
      label: "Learning signals",
      value: "8",
      detail: "Outcomes captured",
    },
  ],
  signals: [
    {
      label: "Strong fit leads convert better",
      detail: "Seeded wins skew above 90 fit score.",
      tone: "positive",
    },
    {
      label: "Audit below 70 needs review",
      detail: "Lower audit scores should trigger stronger proof and CTA recommendations.",
      tone: "warning",
    },
    {
      label: "Human approval remains required",
      detail: "External actions stay blocked until reviewer approval.",
      tone: "neutral",
    },
  ],
};

function getOutcomeSummary(events: Array<{ eventType: string }>) {
  const sent = events.filter((event) => event.eventType === "EMAIL_SENT").length;
  const replies = events.filter((event) => event.eventType === "REPLIED").length;
  const meetings = events.filter((event) => event.eventType === "MEETING_BOOKED").length;
  const wins = events.filter((event) => event.eventType === "WON").length;

  return [
    {
      label: "Reply rate",
      value: sent > 0 ? `${Math.round((replies / sent) * 100)}%` : "0%",
      detail: sent > 0 ? `${replies} replies from ${sent} sent` : "No sent outcomes yet",
    },
    {
      label: "Meetings",
      value: String(meetings),
      detail: "Booked meetings logged",
    },
    {
      label: "Wins",
      value: String(wins),
      detail: "Won outcomes logged",
    },
  ];
}

function getAgentAnalytics(
  leads: Array<{
    fitScore: number | null;
    auditScore: number | null;
    agentTraces: Array<{ latencyMs: number | null }>;
    evaluations: Array<{ passed: boolean; score: number }>;
    outcomeEvents: Array<{ eventType: string }>;
  }>,
): AgentAnalytics {
  const traces = leads.flatMap((lead) => lead.agentTraces);
  const evaluations = leads.flatMap((lead) => lead.evaluations);
  const outcomes = leads.flatMap((lead) => lead.outcomeEvents);
  const latencies = traces.flatMap((trace) => (trace.latencyMs == null ? [] : [trace.latencyMs]));
  const passed = evaluations.filter((evaluation) => evaluation.passed).length;
  const wonLeads = leads.filter((lead) => lead.outcomeEvents.some((event) => event.eventType === "WON"));
  const wonFitScores = wonLeads.flatMap((lead) => (lead.fitScore == null ? [] : [lead.fitScore]));
  const lowAuditCount = leads.filter((lead) => lead.auditScore != null && lead.auditScore < 70).length;

  return {
    metrics: [
      {
        label: "Trace coverage",
        value: `${Math.round((traces.length / Math.max(leads.length, 1)) * 100)}%`,
        detail: `${traces.length} traces across ${leads.length} leads`,
      },
      {
        label: "Eval pass rate",
        value: evaluations.length > 0 ? `${Math.round((passed / evaluations.length) * 100)}%` : "0%",
        detail: evaluations.length > 0 ? `${passed} of ${evaluations.length} passed` : "No evals recorded yet",
      },
      {
        label: "Avg latency",
        value:
          latencies.length > 0
            ? `${(latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length / 1000).toFixed(1)}s`
            : "-",
        detail: latencies.length > 0 ? "Agent execution timing" : "No latency data yet",
      },
      {
        label: "Learning signals",
        value: String(outcomes.length),
        detail: "Outcome events captured",
      },
    ],
    signals: [
      {
        label: wonFitScores.length > 0 ? "Winning fit score" : "No wins logged yet",
        detail:
          wonFitScores.length > 0
            ? `Average won-lead fit is ${Math.round(wonFitScores.reduce((sum, score) => sum + score, 0) / wonFitScores.length)}.`
            : "Record won outcomes to tune ICP scoring.",
        tone: wonFitScores.length > 0 ? "positive" : "neutral",
      },
      {
        label: lowAuditCount > 0 ? "Low audit risk" : "Audit quality stable",
        detail:
          lowAuditCount > 0
            ? `${lowAuditCount} leads have audit scores below 70 and may need stronger messaging.`
            : "No saved leads are currently below the audit risk threshold.",
        tone: lowAuditCount > 0 ? "warning" : "positive",
      },
      {
        label: "Approval boundary",
        detail: "Analytics never imply external actions were sent; approvals and syncs remain explicit.",
        tone: "neutral",
      },
    ],
  };
}

function mapPlaybook(playbook: {
  product: string;
  idealCustomer: string;
  industries: unknown;
  pains: unknown;
  proofPoints: unknown;
  tone: string;
  positioning: string | null;
}): WorkspacePlaybookState {
  return {
    status: "saved",
    product: playbook.product,
    idealCustomer: playbook.idealCustomer,
    industries: readStringList(playbook.industries),
    pains: readStringList(playbook.pains),
    proofPoints: readStringList(playbook.proofPoints),
    tone: playbook.tone,
    positioning: playbook.positioning,
  };
}

function mapDiscovery(discovery: {
  targetMarket: string;
  summary: string | null;
  queryPlan: unknown;
  sourcePolicy: unknown;
  candidateLeads: Array<{
    id: string;
    company: string;
    website: string | null;
    segment: string | null;
    sourceType: string;
    sourceUrl: string | null;
    evidence: unknown;
    fitScore: number;
    auditHintScore: number | null;
    confidence: number | null;
    reason: string;
    status: string;
    savedLeadId: string | null;
  }>;
}): DiscoveryState {
  return {
    status: "saved",
    targetMarket: discovery.targetMarket,
    summary: discovery.summary ?? "Discovery run completed.",
    queryPlan: readStringList(discovery.queryPlan),
    sourcePolicy: readSourcePolicy(discovery.sourcePolicy),
    candidates: discovery.candidateLeads.map((candidate) => ({
      id: candidate.id,
      company: candidate.company,
      website: candidate.website,
      segment: candidate.segment ?? "Unsegmented",
      sourceType: candidate.sourceType,
      sourceUrl: candidate.sourceUrl,
      evidence: readStringList(candidate.evidence),
      fitScore: candidate.fitScore,
      auditHintScore: candidate.auditHintScore,
      confidence: candidate.confidence,
      reason: candidate.reason,
      status: candidate.status,
      savedLeadId: candidate.savedLeadId,
    })),
  };
}

function readSourcePolicy(value: unknown): DiscoveryState["sourcePolicy"] {
  if (typeof value !== "object" || value === null) {
    return emptyDiscovery.sourcePolicy;
  }

  const policy = value as { allowed?: unknown; blocked?: unknown; linkedin?: unknown };

  return {
    allowed: readStringList(policy.allowed),
    blocked: readStringList(policy.blocked),
    linkedin: typeof policy.linkedin === "string" ? policy.linkedin : emptyDiscovery.sourcePolicy.linkedin,
  };
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => (typeof item === "string" ? [item] : []));
}

function readEvaluationChecks(value: unknown): LeadDetailState["evaluations"][number]["checks"] {
  if (typeof value !== "object" || value === null || !("checks" in value)) {
    return [];
  }

  const checks = (value as { checks?: unknown }).checks;
  if (!Array.isArray(checks)) {
    return [];
  }

  return checks.flatMap((check) => {
    if (typeof check !== "object" || check === null) {
      return [];
    }

    const item = check as { label?: unknown; passed?: unknown; detail?: unknown };
    if (typeof item.label !== "string" || typeof item.passed !== "boolean" || typeof item.detail !== "string") {
      return [];
    }

    return [
      {
        label: item.label,
        passed: item.passed,
        detail: item.detail,
      },
    ];
  });
}
