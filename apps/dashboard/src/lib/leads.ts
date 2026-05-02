import { getPrisma, hasDatabaseUrl, LeadStatus } from "@leadforge/db";
import { serializeAsyncJob, type AsyncJobSnapshot } from "./ai-jobs/types";
import { readWorkspaceOpsMemory, type ProposalMemoryRecord, type TraceSavedView } from "./workspace-ops-memory";
import { defaultProposalBranding, readWorkspaceBranding, type ProposalBrandingProfile } from "./workspace-branding";
import { getAiRuntimeMode, type RuntimeMode } from "./runtime-mode";
import { getActiveWorkspace } from "./workspace";

export type DashboardLead = {
  id: string;
  company: string;
  segment: string;
  fit: number | null;
  audit: number | null;
  status: LeadStatus;
  stage: string;
  owner: string;
  next: string;
  aiNextAction: string;
  humanNextAction: string | null;
  website: string | null;
  contact: string | null;
  source: string;
  createdAt: string;
  ownerName: string | null;
  notes: string | null;
  tags: string[];
  hasPendingApproval: boolean;
  slaStatus: "healthy" | "warning" | "breached";
  slaDetail: string;
  isSeed?: boolean;
};

export type PipelineColumn = {
  status: LeadStatus;
  label: string;
  description: string;
  count: number;
  avgFit: string;
  avgAudit: string;
  pendingApprovals: number;
  leads: DashboardLead[];
};

export type ApprovalQueueItem = {
  id: string;
  leadId: string;
  leadName: string;
  leadStage: string;
  leadStatus: LeadStatus;
  assetType: string;
  requestedAction: string;
  status: string;
  notes: string | null;
  draftSubject: string | null;
  draftBody: string;
  contentPreview: string;
  syncPreview: string[];
  createdAt: string;
  decidedAt: string | null;
  history: ApprovalHistoryEntry[];
  diffPreview: ApprovalDiffPreview | null;
  isSeed?: boolean;
};

export type DiffSegment = {
  id: string;
  type: "same" | "added" | "removed";
  text: string;
};

export type ApprovalDiffPreview = {
  addedCount: number;
  removedCount: number;
  beforeSegments: DiffSegment[];
  afterSegments: DiffSegment[];
};

export type ApprovalHistoryEntry = {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  detail: string;
};

export type LeadFilterState = {
  search: string;
  stage: "ALL" | LeadStatus;
  source: string;
  fitBand: "ALL" | "0-49" | "50-74" | "75-100";
  pendingOnly: boolean;
};

export type RecentActivityItem = {
  label: string;
  detail: string;
  timestamp: string;
};

export type LeadDataState = {
  leads: DashboardLead[];
  pipelineColumns: PipelineColumn[];
  approvalQueue: ApprovalQueueItem[];
  filters: {
    sources: string[];
    stages: Array<{ value: LeadStatus; label: string }>;
  };
  recentActivitySummary: RecentActivityItem[];
  status: "connected" | "not_configured" | "unavailable";
  message: string;
  outcomeSummary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  agentAnalytics: AgentAnalytics;
  traceViewer: TraceViewerEntry[];
  qualityCenter: QualityCenterState;
  playbook: WorkspacePlaybookState;
  discovery: DiscoveryState;
  proposalMemory: ProposalMemoryRecord[];
  traceSavedViews: TraceSavedView[];
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
  branding: ProposalBrandingProfile;
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

export type TraceViewerEntry = {
  id: string;
  leadId: string;
  leadName: string;
  agentName: string;
  status: string;
  model: string | null;
  latencyMs: number | null;
  tokenCount: number | null;
  costCents: number | null;
  timestamp: string;
  preview: string;
  evaluationSummary: string[];
  errorMessage: string | null;
};

export type QualityCenterState = {
  summary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  findings: Array<{
    title: string;
    detail: string;
    tone: "positive" | "warning" | "neutral";
  }>;
  lowConfidenceResearch: Array<{
    leadId: string;
    leadName: string;
    confidence: string;
    summary: string;
  }>;
  failingEvaluations: Array<{
    leadId: string;
    leadName: string;
    category: string;
    score: number;
    detail: string;
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

export type TimelineEntry = {
  id: string;
  type: "research" | "audit" | "draft" | "approval" | "reminder" | "outcome" | "trace" | "job";
  label: string;
  status: string;
  timestamp: string;
  summary: string;
  meta: string[];
};

export type LeadDetailState = {
  lead: DashboardLead;
  status: LeadDataState["status"];
  runtimeMode: RuntimeMode;
  message: string;
  asyncJobs: AsyncJobSnapshot[];
  timeline: TimelineEntry[];
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
    approvalStatus: string | null;
    gmailStatus: string | null;
    gmailExternalId: string | null;
    gmailLastError: string | null;
  }>;
  approvals: Array<{
    id: string;
    status: string;
    requestedAction: string;
    notes: string | null;
    createdAt: string;
    decidedAt: string | null;
    draftSubject: string | null;
    draftBody: string | null;
    history: ApprovalHistoryEntry[];
    diffPreview: ApprovalDiffPreview | null;
  }>;
  traces: Array<{
    id: string;
    agentName: string;
    status: string;
    model: string | null;
    latencyMs: number | null;
    tokenCount: number | null;
    costCents: number | null;
    createdAt: string;
    input: string;
    toolCalls: string;
    output: string;
    errorMessage: string | null;
    relatedEvaluations: string[];
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
    preview: string[];
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

const PIPELINE_ORDER: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.RESEARCH,
  LeadStatus.AUDIT,
  LeadStatus.DRAFTED,
  LeadStatus.APPROVAL,
  LeadStatus.READY,
  LeadStatus.SYNCED,
  LeadStatus.REJECTED,
];

const PIPELINE_DESCRIPTIONS: Record<LeadStatus, string> = {
  NEW: "Fresh intake waiting for research context.",
  RESEARCH: "Research is running or ready to deepen.",
  AUDIT: "Website analysis is next in line.",
  DRAFTED: "Messaging assets are being prepared.",
  APPROVAL: "Human review is required before action.",
  READY: "Approved work is ready for operator execution.",
  SYNCED: "Outcome or send step has been recorded.",
  REJECTED: "Lead needs revision or was closed out.",
};

export async function createSampleLeadRecord(source: string) {
  const prisma = getPrisma();
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo",
    },
  });

  return prisma.lead.create({
    data: {
      workspaceId: workspace.id,
      company: `Atlas Clinic Ops ${new Date().toISOString().slice(11, 16)}`,
      website: "https://atlasclinic.example",
      contactName: "Priya Raman",
      contactEmail: "priya@atlasclinic.example",
      segment: "Healthcare operations",
      ownerName: "Karan Dangi",
      notes: "Sample lead created for first-run onboarding and demo screenshots.",
      tags: ["sample", "healthcare", "demo"],
      status: LeadStatus.RESEARCH,
      source: "sample",
      nextAction: "Run AI research",
      agentTraces: {
        create: {
          agentName: "Sample Lead Generator",
          status: "SUCCEEDED",
          input: { source },
          output: {
            nextAction: "Run AI research",
            note: "Sample lead created for first-run onboarding.",
          },
        },
      },
    },
  });
}

const seededLeads: DashboardLead[] = [
  {
    id: "seed-northstar",
    company: "Northstar Clinics",
    segment: "Healthcare ops",
    fit: 92,
    audit: 74,
    status: LeadStatus.APPROVAL,
    stage: "Approval",
    owner: "Ava Research",
    ownerName: "Ava Research",
    next: "Approve website audit email and CRM note",
    aiNextAction: "Approve website audit email and CRM note",
    humanNextAction: null,
    website: "https://northstar.example",
    contact: "Maya Chen",
    source: "manual",
    createdAt: "Apr 29, 2026",
    notes: "Strong fit for conversion-led healthcare ops outreach.",
    tags: ["healthcare", "high-fit", "needs-approval"],
    hasPendingApproval: true,
    slaStatus: "healthy",
    slaDetail: "Seeded data",
    isSeed: true,
  },
  {
    id: "seed-civicgrid",
    company: "CivicGrid",
    segment: "GovTech SaaS",
    fit: 88,
    audit: 81,
    status: LeadStatus.RESEARCH,
    stage: "Research",
    owner: "Noah Audit",
    ownerName: "Noah Audit",
    next: "Verify pricing page and positioning claims",
    aiNextAction: "Run website audit",
    humanNextAction: "Verify pricing page and positioning claims",
    website: "https://civicgrid.example",
    contact: "Jordan Patel",
    source: "discovery:company_website",
    createdAt: "Apr 28, 2026",
    notes: "Public-sector workflow with clear operational buyer.",
    tags: ["public-sector", "research"],
    hasPendingApproval: false,
    slaStatus: "healthy",
    slaDetail: "Seeded data",
    isSeed: true,
  },
  {
    id: "seed-luma",
    company: "Luma Freight",
    segment: "Logistics",
    fit: 79,
    audit: 63,
    status: LeadStatus.DRAFTED,
    stage: "Drafted",
    owner: "Mila Outreach",
    ownerName: "Mila Outreach",
    next: "Tighten proof points before approval",
    aiNextAction: "Review and approve outreach",
    humanNextAction: "Tighten proof points before approval",
    website: "https://lumafreight.example",
    contact: "Sam Rivera",
    source: "manual",
    createdAt: "Apr 27, 2026",
    notes: "Below-threshold audit score means stronger specificity is needed.",
    tags: ["logistics", "copy-revision"],
    hasPendingApproval: false,
    slaStatus: "healthy",
    slaDetail: "Seeded data",
    isSeed: true,
  },
  {
    id: "seed-operand",
    company: "Operand AI",
    segment: "B2B AI tooling",
    fit: 96,
    audit: 89,
    status: LeadStatus.READY,
    stage: "Ready",
    owner: "Karan Dangi",
    ownerName: "Karan Dangi",
    next: "Create Gmail draft and log send outcome",
    aiNextAction: "Create Gmail draft and sync CRM",
    humanNextAction: "Create Gmail draft and log send outcome",
    website: "https://operand.example",
    contact: "Ari Shah",
    source: "discovery:github_org",
    createdAt: "Apr 26, 2026",
    notes: "High-confidence AI tooling account with ready-to-send assets.",
    tags: ["ai", "ready"],
    hasPendingApproval: false,
    slaStatus: "healthy",
    slaDetail: "Seeded data",
    isSeed: true,
  },
  {
    id: "seed-seabrook",
    company: "Seabrook Dental Group",
    segment: "Multi-location clinics",
    fit: 84,
    audit: 71,
    status: LeadStatus.NEW,
    stage: "New",
    owner: "Intake Desk",
    ownerName: "Intake Desk",
    next: "Run AI research",
    aiNextAction: "Run AI research",
    humanNextAction: null,
    website: "https://seabrook.example",
    contact: "Nina Brooks",
    source: "csv_import",
    createdAt: "Apr 25, 2026",
    notes: "Imported from operator-provided clinic prospect sheet.",
    tags: ["csv", "multi-location"],
    hasPendingApproval: false,
    slaStatus: "healthy",
    slaDetail: "Seeded data",
    isSeed: true,
  },
  {
    id: "seed-arcus",
    company: "Arcus Labs",
    segment: "Developer tooling",
    fit: 91,
    audit: 87,
    status: LeadStatus.SYNCED,
    stage: "Synced",
    owner: "RevOps Team",
    ownerName: "RevOps Team",
    next: "Review reply and prepare meeting notes",
    aiNextAction: "Wait for reply",
    humanNextAction: "Review reply and prepare meeting notes",
    website: "https://arcus.example",
    contact: "Daria Kim",
    source: "manual",
    createdAt: "Apr 24, 2026",
    notes: "Positive reply received after approved outreach.",
    tags: ["won-path", "devtools"],
    hasPendingApproval: false,
    slaStatus: "healthy",
    slaDetail: "Seeded data",
    isSeed: true,
  },
  {
    id: "seed-lighthouse",
    company: "Lighthouse Commerce",
    segment: "Ecommerce enablement",
    fit: 58,
    audit: 52,
    status: LeadStatus.REJECTED,
    stage: "Rejected",
    owner: "Reviewer Agent",
    ownerName: "Reviewer Agent",
    next: "Review loss reason before retrying",
    aiNextAction: "Revise outreach assets",
    humanNextAction: "Review loss reason before retrying",
    website: "https://lighthouse.example",
    contact: "Chris Naylor",
    source: "manual",
    createdAt: "Apr 23, 2026",
    notes: "Poor fit and weak site fundamentals made outreach low-confidence.",
    tags: ["low-fit", "rejected"],
    hasPendingApproval: false,
    slaStatus: "healthy",
    slaDetail: "Seeded data",
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
    const opsMemory = await readWorkspaceOpsMemory("demo");
    return buildLeadState({
      leads: seededLeads,
      status: "not_configured",
      message: "Connect DATABASE_URL to save real leads. Showing seeded demo data.",
      playbook: seededPlaybook,
      discovery: seededDiscovery,
      agentAnalytics: seededAgentAnalytics,
      traceViewer: seededTraceViewer,
      qualityCenter: seededQualityCenter,
      outcomeSummary: seededOutcomeSummary,
      approvalQueue: seededApprovalQueue,
      recentActivitySummary: seededRecentActivity,
      proposalMemory: opsMemory.proposalMemory.length > 0 ? opsMemory.proposalMemory : seededProposalMemory,
      traceSavedViews: opsMemory.traceSavedViews.length > 0 ? opsMemory.traceSavedViews : seededTraceSavedViews,
    });
  }

  try {
    const prisma = getPrisma();
    const branding = await readWorkspaceBranding("demo");
    const opsMemory = await readWorkspaceOpsMemory("demo");
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        approvals: { orderBy: { createdAt: "desc" } },
        outreachDrafts: { orderBy: { createdAt: "desc" } },
        integrationSyncs: { orderBy: { createdAt: "desc" } },
        researchRuns: { orderBy: { createdAt: "desc" } },
        agentTraces: {
          orderBy: { createdAt: "desc" },
          include: { evaluations: true },
        },
        evaluations: true,
        outcomeEvents: true,
        followUpReminders: { orderBy: { dueAt: "asc" } },
        // @ts-ignore - Prisma types may be stale in monorepo cache
        lastStageChangedAt: true,
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

    const mappedLeads =
      leads.length > 0
        ? (leads as any[]).map((lead) =>
            mapDashboardLead({
              id: lead.id,
              company: lead.company,
              segment: lead.segment,
              fitScore: lead.fitScore,
              auditScore: lead.auditScore,
              status: lead.status,
              ownerName: lead.ownerName,
              nextAction: lead.nextAction,
              humanNextAction: lead.humanNextAction,
              website: lead.website,
              contactName: lead.contactName,
              contactEmail: lead.contactEmail,
              source: lead.source,
              createdAt: lead.createdAt,
              notes: lead.notes,
              tags: lead.tags,
              approvals: lead.approvals,
              lastStageChangedAt: lead.lastStageChangedAt,
            }),
          )
        : seededLeads;

    return buildLeadState({
      leads: mappedLeads,
      status: "connected",
      message:
        leads.length > 0
          ? "Connected to Postgres. Showing saved leads and live approvals."
          : "Connected to Postgres. Add your first lead to replace demo data.",
      playbook: workspace?.playbook ? mapPlaybook(workspace.playbook, branding) : { ...emptyPlaybook, branding },
      discovery: workspace?.discoveryRuns[0] ? mapDiscovery(workspace.discoveryRuns[0]) : emptyDiscovery,
      agentAnalytics: leads.length > 0 ? getAgentAnalytics(leads as any) : seededAgentAnalytics,
      traceViewer: leads.length > 0 ? buildTraceViewerFromDb(leads as any) : seededTraceViewer,
      qualityCenter: leads.length > 0 ? buildQualityCenterFromDb(leads as any) : seededQualityCenter,
      outcomeSummary: leads.length > 0 ? getOutcomeSummary(leads.flatMap((lead: any) => lead.outcomeEvents)) : seededOutcomeSummary,
      approvalQueue: leads.length > 0 ? buildApprovalQueueFromDb(leads as any) : seededApprovalQueue,
      recentActivitySummary: leads.length > 0 ? buildRecentActivityFromDb(leads as any) : seededRecentActivity,
      proposalMemory: opsMemory.proposalMemory.length > 0 ? opsMemory.proposalMemory : seededProposalMemory,
      traceSavedViews: opsMemory.traceSavedViews.length > 0 ? opsMemory.traceSavedViews : seededTraceSavedViews,
    });
  } catch {
    const opsMemory = await readWorkspaceOpsMemory("demo");
    return buildLeadState({
      leads: seededLeads,
      status: "unavailable",
      message: "DATABASE_URL is set, but the app could not reach the database. Showing seeded demo data.",
      playbook: seededPlaybook,
      discovery: seededDiscovery,
      agentAnalytics: seededAgentAnalytics,
      traceViewer: seededTraceViewer,
      qualityCenter: seededQualityCenter,
      outcomeSummary: seededOutcomeSummary,
      approvalQueue: seededApprovalQueue,
      recentActivitySummary: seededRecentActivity,
      proposalMemory: opsMemory.proposalMemory.length > 0 ? opsMemory.proposalMemory : seededProposalMemory,
      traceSavedViews: opsMemory.traceSavedViews.length > 0 ? opsMemory.traceSavedViews : seededTraceSavedViews,
    });
  }
}

export async function getLeadDetail(leadId: string): Promise<LeadDetailState | null> {
  const seeded = getSeedLeadDetail(leadId);

  if (!hasDatabaseUrl()) {
    return seeded
      ? {
          ...seeded,
          status: "not_configured",
          runtimeMode: "demo",
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
        approvals: { orderBy: { createdAt: "desc" }, include: { outreachDraft: true } },
        agentTraces: { orderBy: { createdAt: "desc" }, include: { evaluations: true } },
        evaluations: { orderBy: { createdAt: "desc" } },
        asyncJobs: { orderBy: { queuedAt: "desc" }, include: { events: { orderBy: { createdAt: "desc" }, take: 12 } } },
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
            runtimeMode: getAiRuntimeMode(),
            message: "Connected to Postgres. Showing seeded demo detail.",
          }
        : null;
    }

    const detailLead = mapDashboardLead({
      id: lead.id,
      company: lead.company,
      segment: lead.segment,
      fitScore: lead.fitScore,
      auditScore: lead.auditScore,
      status: lead.status,
      ownerName: lead.ownerName,
      nextAction: lead.nextAction,
      humanNextAction: lead.humanNextAction,
      website: lead.website,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      source: lead.source,
      createdAt: lead.createdAt,
      notes: lead.notes,
      tags: lead.tags,
      approvals: lead.approvals,
      lastStageChangedAt: (lead as any).lastStageChangedAt,
    });

    const research = lead.researchRuns.map((run) => ({
      id: run.id,
      status: run.status,
      summary: run.summary ?? "Research run queued. The AI research agent has not written a summary yet.",
      confidence: run.confidence,
      citations: readStringList(run.citations),
    }));
    const audits = lead.websiteAudits.map((audit) => ({
      id: audit.id,
      status: audit.status,
      overall: audit.overallScore,
      clarity: audit.clarityScore,
      conversion: audit.conversionScore,
      trust: audit.trustScore,
      seo: audit.seoScore,
      speed: audit.speedScore,
      findings: readStringList(audit.findings),
    }));
    const drafts = lead.outreachDrafts.map((draft) => {
      const relatedApproval = lead.approvals.find((approval) => approval.outreachDraftId === draft.id);
      const gmailSync = lead.integrationSyncs.find((sync) => {
        if (sync.provider !== "GMAIL") {
          return false;
        }
        const payload = readRecord(sync.payload);
        return payload.outreachId === draft.id;
      });

      return {
        id: draft.id,
        channel: draft.channel,
        subject: draft.subject,
        body: draft.body,
        promptVersion: draft.promptVersion,
        approvalStatus: relatedApproval?.status ?? null,
        gmailStatus: gmailSync?.status ?? null,
        gmailExternalId: gmailSync?.externalId ?? null,
        gmailLastError: gmailSync?.lastError ?? null,
      };
    });
    const approvals = lead.approvals.map((approval) => ({
      id: approval.id,
      status: approval.status,
      requestedAction: approval.requestedAction,
      notes: approval.notes,
      createdAt: formatDate(approval.createdAt),
      decidedAt: approval.decidedAt ? formatDate(approval.decidedAt) : null,
      draftSubject: approval.outreachDraft?.subject ?? null,
      draftBody: approval.outreachDraft?.body ?? null,
      history: buildApprovalHistory({
        approvalId: approval.id,
        createdAt: approval.createdAt,
        decidedAt: approval.decidedAt,
        notes: approval.notes,
        reviewerTraces: lead.agentTraces,
      }),
      diffPreview: buildApprovalDiffPreview({
        approvalId: approval.id,
        currentSubject: approval.outreachDraft?.subject ?? null,
        currentBody: approval.outreachDraft?.body ?? "",
        reviewerTraces: lead.agentTraces,
      }),
    }));
    const traces = lead.agentTraces.map((trace) => ({
      id: trace.id,
      agentName: trace.agentName,
      status: trace.status,
      model: trace.model,
      latencyMs: trace.latencyMs,
      tokenCount: trace.tokenCount,
      costCents: trace.costCents,
      createdAt: formatDate(trace.createdAt),
      input: JSON.stringify(trace.input, null, 2),
      toolCalls: JSON.stringify(trace.toolCalls, null, 2),
      output: JSON.stringify(trace.output, null, 2),
      errorMessage: trace.errorMessage,
      relatedEvaluations: trace.evaluations.map((evaluation) =>
        `${evaluation.category} ${evaluation.score}${evaluation.passed ? " pass" : " fail"}`,
      ),
    }));
    const evaluations = lead.evaluations.map((evaluation) => ({
      id: evaluation.id,
      category: evaluation.category,
      score: evaluation.score,
      passed: evaluation.passed,
      checks: readEvaluationChecks(evaluation.report),
    }));
    const integrations = lead.integrationSyncs.map((sync) => ({
      id: sync.id,
      provider: sync.provider,
      status: sync.status,
      payload: JSON.stringify(sync.payload, null, 2),
      preview: getSyncPreview(sync.provider, sync.payload, sync.externalId, sync.lastError),
    }));
    const asyncJobs = lead.asyncJobs.map((job) => serializeAsyncJob(job));
    const reminders = lead.followUpReminders.map((reminder) => ({
      id: reminder.id,
      channel: reminder.channel,
      status: reminder.status,
      dueAt: formatDate(reminder.dueAt),
      note: reminder.note,
    }));
    const outcomes = lead.outcomeEvents.map((outcome) => ({
      id: outcome.id,
      eventType: outcome.eventType,
      note: outcome.note,
      createdAt: formatDate(outcome.createdAt),
    }));

    return {
      lead: detailLead,
      status: "connected",
      runtimeMode: getAiRuntimeMode(),
      message: "Connected to Postgres. Showing saved lead detail.",
      asyncJobs,
      timeline: buildTimeline({
        lead: detailLead,
        asyncJobs: lead.asyncJobs,
        researchRuns: lead.researchRuns,
        websiteAudits: lead.websiteAudits,
        outreachDrafts: lead.outreachDrafts,
        approvals: lead.approvals,
        followUpReminders: lead.followUpReminders,
        outcomeEvents: lead.outcomeEvents,
        agentTraces: lead.agentTraces,
      }),
      research,
      audits,
      drafts,
      approvals,
      traces,
      evaluations,
      integrations,
      reminders,
      outcomes,
    };
  } catch {
    return seeded
      ? {
          ...seeded,
          status: "unavailable",
          runtimeMode: getAiRuntimeMode(),
          message: "DATABASE_URL is set, but the app could not reach the database. Showing seeded demo detail.",
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
      label: "Pipeline leads",
      value: String(active.length),
      delta: realLeads.length > 0 ? "Postgres active" : "Seeded preview",
    },
    {
      label: "Pending approvals",
      value: String(active.filter((lead) => lead.hasPendingApproval).length),
      delta: "Human review boundary",
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

function buildLeadState({
  leads,
  status,
  message,
  playbook,
  discovery,
  agentAnalytics,
  traceViewer,
  qualityCenter,
  outcomeSummary,
  approvalQueue,
  recentActivitySummary,
  proposalMemory,
  traceSavedViews,
}: {
  leads: DashboardLead[];
  status: LeadDataState["status"];
  message: string;
  playbook: WorkspacePlaybookState;
  discovery: DiscoveryState;
  agentAnalytics: AgentAnalytics;
  traceViewer: TraceViewerEntry[];
  qualityCenter: QualityCenterState;
  outcomeSummary: LeadDataState["outcomeSummary"];
  approvalQueue: ApprovalQueueItem[];
  recentActivitySummary: RecentActivityItem[];
  proposalMemory: ProposalMemoryRecord[];
  traceSavedViews: TraceSavedView[];
}): LeadDataState {
  return {
    leads,
    pipelineColumns: buildPipelineColumns(leads),
    approvalQueue,
    filters: {
      sources: Array.from(new Set(leads.map((lead) => lead.source))).sort(),
      stages: PIPELINE_ORDER.map((statusValue) => ({ value: statusValue, label: statusLabels[statusValue] })),
    },
    recentActivitySummary,
    status,
    message,
    playbook,
    discovery,
    agentAnalytics,
    traceViewer,
    qualityCenter,
    outcomeSummary,
    proposalMemory,
    traceSavedViews,
  };
}

function buildTraceViewerFromDb(
  leads: Array<{
    id: string;
    company: string;
    agentTraces: Array<{
      id: string;
      agentName: string;
      status: string;
      model: string | null;
      latencyMs: number | null;
      tokenCount: number | null;
      costCents: number | null;
      errorMessage: string | null;
      createdAt: Date;
      output: unknown;
      evaluations: Array<{
        category: string;
        score: number;
        passed: boolean;
      }>;
    }>;
  }>,
): TraceViewerEntry[] {
  return leads
    .flatMap((lead) =>
      lead.agentTraces.map((trace) => ({
        id: trace.id,
        leadId: lead.id,
        leadName: lead.company,
        agentName: trace.agentName,
        status: trace.status,
        model: trace.model,
        latencyMs: trace.latencyMs,
        tokenCount: trace.tokenCount,
        costCents: trace.costCents,
        timestamp: formatDate(trace.createdAt),
        preview: summarizeTraceOutput(trace.output),
        evaluationSummary: trace.evaluations.map((evaluation) =>
          `${evaluation.category} ${evaluation.score}${evaluation.passed ? " pass" : " fail"}`,
        ),
        errorMessage: trace.errorMessage,
      })),
    )
    .sort((left, right) => sortByDateDesc(left.timestamp, right.timestamp))
    .slice(0, 18);
}

function buildQualityCenterFromDb(
  leads: Array<{
    id: string;
    company: string;
    approvals: Array<{ status: string }>;
    researchRuns: Array<{ summary: string | null; confidence: number | null }>;
    evaluations: Array<{ category: string; score: number; passed: boolean; report: unknown; createdAt: Date }>;
    integrationSyncs: Array<{ status: string }>;
    outcomeEvents: Array<{ eventType: string }>;
  }>,
): QualityCenterState {
  const allEvaluations = leads.flatMap((lead) =>
    lead.evaluations.map((evaluation) => ({
      leadId: lead.id,
      leadName: lead.company,
      category: evaluation.category,
      score: evaluation.score,
      passed: evaluation.passed,
      detail: readEvaluationChecks(evaluation.report)
        .filter((check) => !check.passed)
        .map((check) => check.label)
        .join(", ") || "Review this output before relying on it.",
    })),
  );
  const lowConfidenceResearch = leads
    .flatMap((lead) =>
      lead.researchRuns
        .filter((run) => run.confidence != null && run.confidence < 0.75)
        .map((run) => ({
          leadId: lead.id,
          leadName: lead.company,
          confidence: `${Math.round((run.confidence ?? 0) * 100)}%`,
          summary: run.summary ?? "Research run needs closer review.",
        })),
    )
    .slice(0, 6);
  const blockedSyncs = leads.flatMap((lead) => lead.integrationSyncs.filter((sync) => sync.status === "BLOCKED")).length;
  const pendingApprovals = leads.flatMap((lead) => lead.approvals.filter((approval) => approval.status === "PENDING")).length;
  const failedEvaluations = allEvaluations.filter((evaluation) => !evaluation.passed);
  const wins = leads.flatMap((lead) => lead.outcomeEvents.filter((event) => event.eventType === "WON")).length;

  return {
    summary: [
      {
        label: "Failed evals",
        value: String(failedEvaluations.length),
        detail: "Outputs that need operator review or prompt improvement.",
      },
      {
        label: "Low-confidence research",
        value: String(lowConfidenceResearch.length),
        detail: "Research runs below the default confidence comfort band.",
      },
      {
        label: "Blocked syncs",
        value: String(blockedSyncs),
        detail: "Integration payloads held back by review decisions.",
      },
      {
        label: "Wins logged",
        value: String(wins),
        detail: "Positive outcomes feeding the learning loop.",
      },
    ],
    findings: [
      {
        title: pendingApprovals > 0 ? "Approval queue still matters" : "Approval pressure is under control",
        detail:
          pendingApprovals > 0
            ? `${pendingApprovals} approval item${pendingApprovals === 1 ? "" : "s"} are still waiting for a reviewer, which can stall outbound execution.`
            : "No pending approvals are currently blocking the main execution flow.",
        tone: pendingApprovals > 0 ? "warning" : "positive",
      },
      {
        title: failedEvaluations.length > 0 ? "Some generated outputs are failing quality checks" : "Generated outputs are mostly passing",
        detail:
          failedEvaluations.length > 0
            ? "Inspect failing evals to see whether the issue is weak specificity, missing citations, or tone quality."
            : "The current workflow is producing outputs that pass the built-in evaluation checks.",
        tone: failedEvaluations.length > 0 ? "warning" : "positive",
      },
      {
        title: lowConfidenceResearch.length > 0 ? "Research calibration needs review" : "Research confidence looks healthy",
        detail:
          lowConfidenceResearch.length > 0
            ? "Some research runs are carrying uncertainty high enough to merit manual confirmation before drafting."
            : "The saved research runs are staying inside the default confidence comfort band.",
        tone: lowConfidenceResearch.length > 0 ? "warning" : "neutral",
      },
    ],
    lowConfidenceResearch,
    failingEvaluations: failedEvaluations.slice(0, 8),
  };
}

function calculateSLAHealth(status: LeadStatus, lastChanged: Date): { status: "healthy" | "warning" | "breached"; detail: string } {
  const now = new Date();
  const diffHours = (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60);

  const thresholds: Record<LeadStatus, { warning: number; breached: number }> = {
    NEW: { warning: 12, breached: 24 },
    RESEARCH: { warning: 24, breached: 48 },
    AUDIT: { warning: 24, breached: 48 },
    DRAFTED: { warning: 12, breached: 24 },
    APPROVAL: { warning: 8, breached: 16 },
    READY: { warning: 48, breached: 96 },
    SYNCED: { warning: 1000, breached: 2000 },
    REJECTED: { warning: 1000, breached: 2000 },
  };

  const t = thresholds[status];
  if (diffHours >= t.breached) {
    return { status: "breached", detail: `${Math.round(diffHours)}h stagnant (Breached)` };
  }
  if (diffHours >= t.warning) {
    return { status: "warning", detail: `${Math.round(diffHours)}h stagnant (Warning)` };
  }
  return { status: "healthy", detail: "On track" };
}

function mapDashboardLead(input: {
  id: string;
  company: string;
  segment: string | null;
  fitScore: number | null;
  auditScore: number | null;
  status: LeadStatus;
  ownerName: string | null;
  nextAction: string;
  humanNextAction: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  source: string;
  createdAt: Date;
  notes: string | null;
  tags: unknown;
  approvals: Array<{ status: string }>;
  lastStageChangedAt: Date;
}): DashboardLead {
  const owner = input.ownerName?.trim() || ownerByStatus[input.status];
  const sla = calculateSLAHealth(input.status, input.lastStageChangedAt);
  
  return {
    id: input.id,
    company: input.company,
    segment: input.segment ?? "Unsegmented",
    fit: input.fitScore,
    audit: input.auditScore,
    status: input.status,
    stage: statusLabels[input.status],
    owner,
    next: input.humanNextAction?.trim() || input.nextAction,
    aiNextAction: input.nextAction,
    humanNextAction: input.humanNextAction,
    website: input.website,
    contact: input.contactName ?? input.contactEmail,
    source: input.source,
    createdAt: formatDate(input.createdAt),
    ownerName: input.ownerName,
    notes: input.notes,
    tags: readStringList(input.tags),
    hasPendingApproval: input.approvals.some((approval) => approval.status === "PENDING"),
    slaStatus: sla.status,
    slaDetail: sla.detail,
  };
}

function buildPipelineColumns(leads: DashboardLead[]): PipelineColumn[] {
  return PIPELINE_ORDER.map((status) => {
    const columnLeads = leads.filter((lead) => lead.status === status);
    const fits = columnLeads.flatMap((lead) => (lead.fit == null ? [] : [lead.fit]));
    const audits = columnLeads.flatMap((lead) => (lead.audit == null ? [] : [lead.audit]));
    const pendingApprovals = columnLeads.filter((lead) => lead.hasPendingApproval).length;
    return {
      status,
      label: statusLabels[status],
      description: PIPELINE_DESCRIPTIONS[status],
      count: columnLeads.length,
      avgFit: fits.length > 0 ? `${Math.round(fits.reduce((sum, value) => sum + value, 0) / fits.length)}` : "-",
      avgAudit:
        audits.length > 0 ? `${Math.round(audits.reduce((sum, value) => sum + value, 0) / audits.length)}` : "-",
      pendingApprovals,
      leads: columnLeads,
    };
  });
}

function buildApprovalQueueFromDb(
  leads: Array<{
    id: string;
    company: string;
    status: LeadStatus;
    approvals: Array<{
      id: string;
      status: string;
      requestedAction: string;
      notes: string | null;
      createdAt: Date;
      decidedAt: Date | null;
      outreachDraftId: string | null;
    }>;
    outreachDrafts: Array<{
      id: string;
      channel: string;
      subject: string | null;
      body: string;
    }>;
    integrationSyncs: Array<{
      provider: string;
      status: string;
      payload: unknown;
    }>;
    agentTraces: Array<{
      id: string;
      agentName: string;
      status: string;
      createdAt: Date;
      output: unknown;
    }>;
  }>,
): ApprovalQueueItem[] {
  return leads
    .flatMap((lead) =>
      lead.approvals.map((approval) => {
        const draft = approval.outreachDraftId
          ? lead.outreachDrafts.find((item) => item.id === approval.outreachDraftId)
          : lead.outreachDrafts[0];
        const syncPreview = lead.integrationSyncs
          .filter((sync) => sync.status === "READY" || sync.status === "APPROVED")
          .flatMap((sync) => getSyncPreview(sync.provider, sync.payload));
        return {
          id: approval.id,
          leadId: lead.id,
          leadName: lead.company,
          leadStage: statusLabels[lead.status],
          leadStatus: lead.status,
          assetType: draft?.channel.replaceAll("_", " ") ?? "Approval",
          requestedAction: approval.requestedAction,
          status: approval.status,
          notes: approval.notes,
          draftSubject: draft?.subject ?? null,
          draftBody: draft?.body ?? "Review prepared assets.",
          contentPreview: draft?.subject ? `${draft.subject}: ${draft.body}` : draft?.body ?? "Review prepared assets.",
          syncPreview,
          createdAt: formatDate(approval.createdAt),
          decidedAt: approval.decidedAt ? formatDate(approval.decidedAt) : null,
          history: buildApprovalHistory({
            approvalId: approval.id,
            createdAt: approval.createdAt,
            decidedAt: approval.decidedAt,
            notes: approval.notes,
            reviewerTraces: lead.agentTraces,
          }),
          diffPreview: buildApprovalDiffPreview({
            approvalId: approval.id,
            currentSubject: draft?.subject ?? null,
            currentBody: draft?.body ?? "Review prepared assets.",
            reviewerTraces: lead.agentTraces,
          }),
        };
      }),
    )
    .sort((left, right) => sortByDateDesc(left.createdAt, right.createdAt));
}

function buildRecentActivityFromDb(
  leads: Array<{
    company: string;
    followUpReminders: Array<{ dueAt: Date; note: string }>;
    outcomeEvents: Array<{ createdAt: Date; eventType: string }>;
    approvals: Array<{ createdAt: Date; status: string }>;
  }>,
): RecentActivityItem[] {
  return leads
    .flatMap((lead) => {
      const items: RecentActivityItem[] = [];
      const approval = lead.approvals[0];
      const reminder = lead.followUpReminders[0];
      const outcome = lead.outcomeEvents[0];
      if (approval) {
        items.push({
          label: `${lead.company} approval ${approval.status.toLowerCase()}`,
          detail: "Prepared work is waiting on a human decision.",
          timestamp: formatDate(approval.createdAt),
        });
      }
      if (reminder) {
        items.push({
          label: `${lead.company} follow-up scheduled`,
          detail: reminder.note,
          timestamp: formatDate(reminder.dueAt),
        });
      }
      if (outcome) {
        items.push({
          label: `${lead.company} logged ${outcome.eventType.toLowerCase().replaceAll("_", " ")}`,
          detail: "Outcome signals feed the learning loop and reporting.",
          timestamp: formatDate(outcome.createdAt),
        });
      }
      return items;
    })
    .sort((left, right) => sortByDateDesc(left.timestamp, right.timestamp))
    .slice(0, 6);
}

function buildTimeline({
  lead,
  asyncJobs,
  researchRuns,
  websiteAudits,
  outreachDrafts,
  approvals,
  followUpReminders,
  outcomeEvents,
  agentTraces,
}: {
  lead: DashboardLead;
  asyncJobs: Array<{
    id: string;
    kind: string;
    status: string;
    errorMessage: string | null;
    queuedAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    events: Array<{ message: string }>;
  }>;
  researchRuns: Array<{ id: string; status: string; summary: string | null; confidence: number | null; createdAt: Date }>;
  websiteAudits: Array<{ id: string; status: string; overallScore: number | null; findings: unknown; createdAt: Date }>;
  outreachDrafts: Array<{ id: string; channel: string; subject: string | null; body: string; createdAt: Date }>;
  approvals: Array<{ id: string; status: string; requestedAction: string; notes: string | null; createdAt: Date; decidedAt: Date | null }>;
  followUpReminders: Array<{ id: string; dueAt: Date; status: string; note: string; channel: string }>;
  outcomeEvents: Array<{ id: string; eventType: string; note: string | null; createdAt: Date }>;
  agentTraces: Array<{ id: string; createdAt: Date; agentName: string; status: string; output: unknown }>;
}): TimelineEntry[] {
  const timeline: Array<TimelineEntry & { sortDate: Date }> = [];

  timeline.push({
    id: `${lead.id}-created`,
    type: "trace",
    label: "Lead created",
    status: lead.stage,
    timestamp: lead.createdAt,
    summary: `${lead.company} entered the pipeline through ${lead.source}.`,
    meta: [lead.segment, lead.owner],
    sortDate: parseFormattedDate(lead.createdAt),
  });

  for (const job of asyncJobs) {
    const timestamp = job.completedAt ?? job.startedAt ?? job.queuedAt;
    timeline.push({
      id: job.id,
      type: "job",
      label: `${job.kind.replaceAll("_", " ")} job`,
      status: job.status,
      timestamp: formatDate(timestamp),
      summary: job.errorMessage ?? job.events[0]?.message ?? "Async execution is in progress.",
      meta: [job.kind.replaceAll("_", " ")],
      sortDate: timestamp,
    });
  }

  for (const run of researchRuns) {
    timeline.push({
      id: run.id,
      type: "research",
      label: "Research run",
      status: run.status,
      timestamp: formatDate(run.createdAt),
      summary: run.summary ?? "Research run was created without a summary yet.",
      meta: run.confidence == null ? [] : [`${Math.round(run.confidence * 100)}% confidence`],
      sortDate: run.createdAt,
    });
  }

  for (const audit of websiteAudits) {
    timeline.push({
      id: audit.id,
      type: "audit",
      label: "Website audit",
      status: audit.status,
      timestamp: formatDate(audit.createdAt),
      summary: `Audit scored ${audit.overallScore ?? "-"} overall and captured ${readStringList(audit.findings).length} findings.`,
      meta: audit.overallScore == null ? [] : [`Overall ${audit.overallScore}`],
      sortDate: audit.createdAt,
    });
  }

  for (const draft of outreachDrafts) {
    timeline.push({
      id: draft.id,
      type: "draft",
      label: `${draft.channel.replaceAll("_", " ")} draft`,
      status: "READY",
      timestamp: formatDate(draft.createdAt),
      summary: draft.subject ?? draft.body.slice(0, 120),
      meta: draft.subject ? [draft.subject] : [],
      sortDate: draft.createdAt,
    });
  }

  for (const approval of approvals) {
    timeline.push({
      id: approval.id,
      type: "approval",
      label: "Approval decision",
      status: approval.status,
      timestamp: formatDate(approval.decidedAt ?? approval.createdAt),
      summary: approval.requestedAction,
      meta: approval.notes ? [approval.notes] : [],
      sortDate: approval.decidedAt ?? approval.createdAt,
    });
  }

  for (const reminder of followUpReminders) {
    timeline.push({
      id: reminder.id,
      type: "reminder",
      label: `${reminder.channel} follow-up`,
      status: reminder.status,
      timestamp: formatDate(reminder.dueAt),
      summary: reminder.note,
      meta: ["Reminder scheduled"],
      sortDate: reminder.dueAt,
    });
  }

  for (const outcome of outcomeEvents) {
    timeline.push({
      id: outcome.id,
      type: "outcome",
      label: outcome.eventType.replaceAll("_", " "),
      status: "LOGGED",
      timestamp: formatDate(outcome.createdAt),
      summary: outcome.note ?? "Outcome logged for pipeline learning.",
      meta: ["Outcome signal"],
      sortDate: outcome.createdAt,
    });
  }

  for (const trace of agentTraces.filter((item) =>
    ["Lead Intake", "Lead Discovery Agent", "Reviewer Agent", "Outcome Learning Agent", "Operator Override"].includes(
      item.agentName,
    ),
  )) {
    timeline.push({
      id: trace.id,
      type: "trace",
      label: trace.agentName,
      status: trace.status,
      timestamp: formatDate(trace.createdAt),
      summary: summarizeTraceOutput(trace.output),
      meta: ["Agent trace"],
      sortDate: trace.createdAt,
    });
  }

  return timeline
    .sort((left, right) => right.sortDate.getTime() - left.sortDate.getTime())
    .map((entry) => ({
      id: entry.id,
      type: entry.type,
      label: entry.label,
      status: entry.status,
      timestamp: entry.timestamp,
      summary: entry.summary,
      meta: entry.meta,
    }));
}

function getSeedLeadDetail(leadId: string): LeadDetailState | null {
  const lead = seededLeads.find((item) => item.id === leadId);

  if (!lead) {
    return null;
  }

  const timeline = buildSeedTimeline(lead);

  return {
    lead,
    status: "not_configured",
    runtimeMode: "demo",
    message: "Showing seeded demo detail.",
    asyncJobs: [],
    timeline,
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
        approvalStatus: "PENDING",
        gmailStatus: null,
        gmailExternalId: null,
        gmailLastError: null,
      },
      {
        id: `${lead.id}-crm-note`,
        channel: "CRM_NOTE",
        subject: null,
        body: `${lead.company} is a credible fit with a recommended angle around conversion clarity, trust proof, and follow-up quality.`,
        promptVersion: "client-ops:v1",
        approvalStatus: null,
        gmailStatus: null,
        gmailExternalId: null,
        gmailLastError: null,
      },
    ],
    approvals: [
      {
        id: `${lead.id}-approval`,
        status: lead.hasPendingApproval ? "PENDING" : "APPROVED",
        requestedAction: "Create Gmail draft after reviewer approval",
        notes: "Requires factuality check before external action.",
        createdAt: "Apr 29, 2026",
        decidedAt: lead.hasPendingApproval ? null : "Apr 30, 2026",
        draftSubject: `Quick idea for ${lead.company}`,
        draftBody: `Hi ${lead.contact ?? "there"},\n\nI noticed ${lead.company} has a clear market position, but the website could make the next step easier for high-intent visitors. I put together a short audit angle focused on conversion clarity and follow-up quality.\n\nWorth sending over?`,
        history: [
          {
            id: `${lead.id}-approval-history-1`,
            actor: "System",
            action: "Approval created",
            timestamp: "Apr 29, 2026",
            detail: "Prepared outreach and client ops assets were routed into human review.",
          },
          {
            id: `${lead.id}-approval-history-2`,
            actor: lead.hasPendingApproval ? "Reviewer queue" : "Reviewer Agent",
            action: lead.hasPendingApproval ? "Waiting for decision" : "Approved",
            timestamp: lead.hasPendingApproval ? "Apr 29, 2026" : "Apr 30, 2026",
            detail: lead.hasPendingApproval
              ? "The package is still waiting for a reviewer."
              : "The package cleared review and can move into controlled execution.",
          },
        ],
        diffPreview: {
          addedCount: 2,
          removedCount: 2,
          beforeSegments: [
            { id: `${lead.id}-before-1`, type: "same", text: `Hi ${lead.contact ?? "there"},` },
            { id: `${lead.id}-before-2`, type: "removed", text: "I noticed your site has a clear market position, but the next step feels buried." },
            { id: `${lead.id}-before-3`, type: "removed", text: "Worth sending over a teardown?" },
          ],
          afterSegments: [
            { id: `${lead.id}-after-1`, type: "same", text: `Hi ${lead.contact ?? "there"},` },
            { id: `${lead.id}-after-2`, type: "added", text: "I noticed your site has a clear market position, but the next step could be easier for high-intent visitors." },
            { id: `${lead.id}-after-3`, type: "added", text: "I put together a short audit angle focused on conversion clarity and follow-up quality. Worth sending over?" },
          ],
        },
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
        costCents: 24,
        createdAt: "Apr 28, 2026",
        input: JSON.stringify({ company: lead.company, segment: lead.segment }, null, 2),
        toolCalls: JSON.stringify(["company_summary", "source_evidence"], null, 2),
        output: JSON.stringify({ nextAction: lead.aiNextAction, confidence: 0.86 }, null, 2),
        errorMessage: null,
        relatedEvaluations: ["research 100 pass"],
      },
      {
        id: `${lead.id}-trace-2`,
        agentName: "Website Audit Agent",
        status: "SUCCEEDED",
        model: "gpt-5.4-mini",
        latencyMs: 970,
        tokenCount: 1418,
        costCents: 9,
        createdAt: "Apr 28, 2026",
        input: JSON.stringify({ website: lead.website }, null, 2),
        toolCalls: JSON.stringify(["website_fetch", "audit_scoring"], null, 2),
        output: JSON.stringify({ auditScore: lead.audit, stage: lead.stage }, null, 2),
        errorMessage: null,
        relatedEvaluations: ["website_audit 75 pass"],
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
        preview: [`Company: ${lead.company}`, `Stage: ${lead.stage}`, `Fit: ${lead.fit ?? "-"}`],
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
        preview: [`Contact: ${lead.contact ?? "Not captured"}`, "Ready for CRM sync once approved"],
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
        eventType: lead.status === LeadStatus.READY ? "REPLIED" : "MEETING_BOOKED",
        note: "Outcome signal used to improve future fit scoring and outreach prompts.",
        createdAt: "Apr 30, 2026",
      },
    ],
  };
}

function buildSeedTimeline(lead: DashboardLead): TimelineEntry[] {
  return [
    {
      id: `${lead.id}-timeline-1`,
      type: "outcome",
      label: "EMAIL SENT",
      status: "LOGGED",
      timestamp: "Apr 30, 2026",
      summary: "Approved outreach was marked as sent in the demo workspace.",
      meta: ["Outcome signal"],
    },
    {
      id: `${lead.id}-timeline-2`,
      type: "approval",
      label: "Approval decision",
      status: lead.hasPendingApproval ? "PENDING" : "APPROVED",
      timestamp: "Apr 29, 2026",
      summary: "Review prepared outreach and CRM payloads before any external action.",
      meta: ["Human approval boundary"],
    },
    {
      id: `${lead.id}-timeline-3`,
      type: "draft",
      label: "EMAIL draft",
      status: "READY",
      timestamp: "Apr 29, 2026",
      summary: `Prepared specific outreach for ${lead.company}.`,
      meta: ["outreach:v1"],
    },
    {
      id: `${lead.id}-timeline-4`,
      type: "audit",
      label: "Website audit",
      status: "SUCCEEDED",
      timestamp: "Apr 28, 2026",
      summary: `Website audit scored ${lead.audit ?? "-"} overall with conversion and trust findings.`,
      meta: [`Overall ${lead.audit ?? "-"}`],
    },
    {
      id: `${lead.id}-timeline-5`,
      type: "research",
      label: "Research run",
      status: "SUCCEEDED",
      timestamp: "Apr 28, 2026",
      summary: "Researched the lead, fit signals, and outreach angle.",
      meta: [`Fit ${lead.fit ?? "-"}`],
    },
    {
      id: `${lead.id}-timeline-6`,
      type: "trace",
      label: "Lead created",
      status: lead.stage,
      timestamp: lead.createdAt,
      summary: `${lead.company} entered the pipeline from ${lead.source}.`,
      meta: [lead.segment],
    },
  ];
}

const seededApprovalQueue: ApprovalQueueItem[] = [
  {
    id: "seed-approval-northstar",
    leadId: "seed-northstar",
    leadName: "Northstar Clinics",
    leadStage: "Approval",
    leadStatus: LeadStatus.APPROVAL,
    assetType: "EMAIL",
    requestedAction: "Approve outreach and CRM sync payload",
    status: "PENDING",
    notes: "Check factual claims and keep the tone low-pressure.",
    draftSubject: "Quick idea for Northstar Clinics",
    draftBody: "Focus the note on conversion clarity and proof placement.",
    contentPreview: "Quick idea for Northstar Clinics: focus the note on conversion clarity and proof placement.",
    syncPreview: ["Airtable stage update ready", "CRM note prepared"],
    createdAt: "Apr 29, 2026",
    decidedAt: null,
    history: [
      {
        id: "seed-approval-northstar-history-1",
        actor: "Outreach Agent",
        action: "Submitted for approval",
        timestamp: "Apr 29, 2026",
        detail: "Email draft and CRM sync payload were packaged for review.",
      },
      {
        id: "seed-approval-northstar-history-2",
        actor: "Reviewer queue",
        action: "Pending",
        timestamp: "Apr 29, 2026",
        detail: "Still waiting on a human reviewer to clear external actions.",
      },
    ],
    diffPreview: {
      addedCount: 1,
      removedCount: 1,
      beforeSegments: [
        { id: "seed-approval-northstar-before-1", type: "removed", text: "Focus the note on general website improvements." },
      ],
      afterSegments: [
        { id: "seed-approval-northstar-after-1", type: "added", text: "Focus the note on conversion clarity and proof placement." },
      ],
    },
    isSeed: true,
  },
  {
    id: "seed-approval-luma",
    leadId: "seed-luma",
    leadName: "Luma Freight",
    leadStage: "Drafted",
    leadStatus: LeadStatus.DRAFTED,
    assetType: "CRM NOTE",
    requestedAction: "Approve revised copy before sync payload moves forward",
    status: "PENDING",
    notes: "Audit score is low enough that proof points need to be sharper.",
    draftSubject: null,
    draftBody: "Lead is ready for a tighter audit-led message before CRM payload approval.",
    contentPreview: "Lead is ready for a tighter audit-led message before CRM payload approval.",
    syncPreview: ["CRM note staged for approval"],
    createdAt: "Apr 28, 2026",
    decidedAt: null,
    history: [
      {
        id: "seed-approval-luma-history-1",
        actor: "Client Ops Agent",
        action: "Submitted for approval",
        timestamp: "Apr 28, 2026",
        detail: "CRM note draft was staged for reviewer inspection.",
      },
      {
        id: "seed-approval-luma-history-2",
        actor: "Reviewer queue",
        action: "Needs revision",
        timestamp: "Apr 28, 2026",
        detail: "Proof points and specificity still need to be tightened before approval.",
      },
    ],
    diffPreview: {
      addedCount: 1,
      removedCount: 1,
      beforeSegments: [
        { id: "seed-approval-luma-before-1", type: "removed", text: "Lead is ready for a CRM payload approval." },
      ],
      afterSegments: [
        { id: "seed-approval-luma-after-1", type: "added", text: "Lead is ready for a tighter audit-led message before CRM payload approval." },
      ],
    },
    isSeed: true,
  },
];

const seededRecentActivity: RecentActivityItem[] = [
  {
    label: "Northstar Clinics approval pending",
    detail: "Prepared work is waiting on a human decision.",
    timestamp: "Apr 29, 2026",
  },
  {
    label: "Operand AI ready for send",
    detail: "Approved assets are prepared for operator execution.",
    timestamp: "Apr 28, 2026",
  },
  {
    label: "Arcus Labs logged replied",
    detail: "Positive reply is feeding the learning loop.",
    timestamp: "Apr 27, 2026",
  },
];

const seededOutcomeSummary = [
  {
    label: "Reply rate",
    value: "50%",
    detail: "Seeded learning signal",
  },
  {
    label: "Meetings",
    value: "2",
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
  branding: defaultProposalBranding,
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
  branding: defaultProposalBranding,
};

const seededDiscovery: DiscoveryState = {
  status: "demo",
  targetMarket: "Healthcare operations teams",
  summary: "Demo discovery shows how LeadForge plans safe sources, scores candidates, and keeps LinkedIn as manual import only.",
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
      "GitHub organisations",
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
      evidence: ["Public GitHub organisation suggests an active technical team.", "Repo context can support research only."],
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

const seededTraceViewer: TraceViewerEntry[] = [
  {
    id: "seed-trace-1",
    leadId: "seed-northstar",
    leadName: "Northstar Clinics",
    agentName: "Research Agent",
    status: "SUCCEEDED",
    model: "gpt-5.4",
    latencyMs: 1840,
    tokenCount: 3120,
        costCents: 24,
        timestamp: "Apr 30, 2026",
        preview: "Generated fit signals, citations, and a conversion-led outreach angle.",
        evaluationSummary: ["research 100 pass"],
        errorMessage: null,
      },
  {
    id: "seed-trace-2",
    leadId: "seed-northstar",
    leadName: "Northstar Clinics",
    agentName: "Website Audit Agent",
    status: "SUCCEEDED",
    model: "gpt-5.4-mini",
    latencyMs: 970,
    tokenCount: 1418,
    costCents: 9,
    timestamp: "Apr 29, 2026",
    preview: "Scored clarity, trust, conversion, SEO, and speed with three findings.",
    evaluationSummary: ["website_audit 82 pass"],
    errorMessage: null,
  },
  {
    id: "seed-trace-3",
    leadId: "seed-arcus",
    leadName: "Arcus Labs",
    agentName: "Reviewer Agent",
    status: "SUCCEEDED",
    model: null,
    latencyMs: 210,
    tokenCount: null,
    costCents: 0,
    timestamp: "Apr 28, 2026",
    preview: "Approved prepared work and moved integration payloads forward safely.",
    evaluationSummary: ["reviewer 100 pass"],
    errorMessage: null,
  },
];

const seededQualityCenter: QualityCenterState = {
  summary: [
    {
      label: "Failed evals",
      value: "1",
      detail: "One generated output needs closer operator review.",
    },
    {
      label: "Low-confidence research",
      value: "1",
      detail: "A seeded research run should be manually confirmed before drafting.",
    },
    {
      label: "Blocked syncs",
      value: "0",
      detail: "No seeded integration payloads are blocked.",
    },
    {
      label: "Wins logged",
      value: "1",
      detail: "Positive outcome examples are feeding the learning loop.",
    },
  ],
  findings: [
    {
      title: "Approval queue still needs attention",
      detail: "The seeded workspace still has pending approvals that block outbound execution.",
      tone: "warning",
    },
    {
      title: "Research confidence is mixed",
      detail: "At least one seeded run should be manually verified before its claims feed outreach.",
      tone: "warning",
    },
    {
      title: "Trace coverage is visible",
      detail: "The workspace can already show a healthy trail of research, audit, reviewer, and outcome traces.",
      tone: "positive",
    },
  ],
  lowConfidenceResearch: [
    {
      leadId: "seed-luma",
      leadName: "Luma Freight",
      confidence: "68%",
      summary: "Research likely needs stronger verification before outbound use.",
    },
  ],
  failingEvaluations: [
    {
      leadId: "seed-luma",
      leadName: "Luma Freight",
      category: "outreach",
      score: 50,
      detail: "Low-pressure tone passed, but the draft still needs more specificity.",
    },
  ],
};

const seededProposalMemory: ProposalMemoryRecord[] = [
  {
    id: "seed-proposal-1",
    proposalTitle: "Outbound Acceleration proposal for Northstar Clinics",
    clientName: "Northstar Clinics",
    clientType: "Healthcare operations group",
    templateName: "Outbound Acceleration",
    serviceLine: "outbound-acceleration",
    niche: "Healthcare",
    primaryPriceAnchor: "Core sprint $5k-$7k",
    outcome: "WON",
    notes: "Won after the proof-led healthcare pricing frame resonated with the buyer.",
    createdAt: "2026-04-28T10:00:00.000Z",
    updatedAt: "2026-04-30T10:00:00.000Z",
  },
  {
    id: "seed-proposal-2",
    proposalTitle: "Positioning Sprint proposal for Luma Freight",
    clientName: "Luma Freight",
    clientType: "Freight tech operator",
    templateName: "Positioning Sprint",
    serviceLine: "positioning-sprint",
    niche: "Logistics",
    primaryPriceAnchor: "Core sprint $4k-$6k",
    outcome: "LOST",
    notes: "Lost because the buyer wanted implementation-heavy support, not a messaging-first sprint.",
    createdAt: "2026-04-25T10:00:00.000Z",
    updatedAt: "2026-04-29T10:00:00.000Z",
  },
];

const seededTraceSavedViews: TraceSavedView[] = [
  {
    id: "seed-trace-view-1",
    name: "Reviewer bottlenecks",
    search: "review",
    agent: "Reviewer Agent",
    status: "SUCCEEDED",
    pinned: true,
    createdAt: "2026-04-30T08:00:00.000Z",
  },
  {
    id: "seed-trace-view-2",
    name: "Audit quality checks",
    search: "audit",
    agent: "Website Audit Agent",
    status: "ALL",
    pinned: false,
    createdAt: "2026-04-29T08:00:00.000Z",
  },
];

function buildApprovalHistory({
  approvalId,
  createdAt,
  decidedAt,
  notes,
  reviewerTraces,
}: {
  approvalId: string;
  createdAt: Date;
  decidedAt: Date | null;
  notes: string | null;
  reviewerTraces: Array<{
    id: string;
    agentName: string;
    status: string;
    createdAt: Date;
    output: unknown;
  }>;
}): ApprovalHistoryEntry[] {
  const history: Array<ApprovalHistoryEntry & { sortDate: Date }> = [
    {
      id: `${approvalId}-created`,
      actor: "System",
      action: "Approval created",
      timestamp: formatDate(createdAt),
      detail: "Prepared work was routed into the human review queue.",
      sortDate: createdAt,
    },
  ];

  if (notes) {
    for (const [index, note] of notes
      .split(/\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean)
      .entries()) {
      const timestampMatch = note.match(/^\[(.+?)\]\s*/);
      const noteBody = timestampMatch ? note.slice(timestampMatch[0].length) : note;
      const parsedDate = timestampMatch ? new Date(timestampMatch[1]) : null;
      const noteDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : decidedAt ?? createdAt;
      history.push({
        id: `${approvalId}-note-${index}`,
        actor: noteBody.includes("Edited by reviewer") || noteBody.includes("Sent back for revision") ? "Reviewer" : "System note",
        action: noteBody.includes("Approved")
          ? "Approval note"
          : noteBody.includes("Rejected") || noteBody.includes("revision")
            ? "Revision note"
            : "Review note",
        timestamp: formatDate(noteDate),
        detail: noteBody,
        sortDate: noteDate,
      });
    }
  }

  for (const trace of reviewerTraces.filter((item) => ["Reviewer Agent", "Approval Editor"].includes(item.agentName))) {
    history.push({
      id: trace.id,
      actor: trace.agentName,
      action: trace.agentName === "Approval Editor" ? "Edited asset" : "Review decision",
      timestamp: formatDate(trace.createdAt),
      detail: summarizeTraceOutput(trace.output),
      sortDate: trace.createdAt,
    });
  }

  return history
    .sort((left, right) => right.sortDate.getTime() - left.sortDate.getTime())
    .map((entry) => {
      const { sortDate, ...rest } = entry;
      void sortDate;
      return rest;
    });
}

function buildApprovalDiffPreview({
  approvalId,
  currentSubject,
  currentBody,
  reviewerTraces,
}: {
  approvalId: string;
  currentSubject: string | null;
  currentBody: string;
  reviewerTraces: Array<{
    id: string;
    agentName: string;
    status: string;
    createdAt: Date;
    output: unknown;
  }>;
}): ApprovalDiffPreview | null {
  const editTrace = reviewerTraces.find((trace) => {
    if (trace.agentName !== "Approval Editor") {
      return false;
    }
    const output = isRecord(trace.output) ? trace.output : null;
    const nestedApproval = isRecord(output?.approval) ? output.approval : null;
    return output?.approvalId === approvalId || nestedApproval?.id === approvalId || output?.approvalId === undefined;
  });

  if (!editTrace) {
    return null;
  }

  const output = isRecord(editTrace.output) ? editTrace.output : null;
  const previousSubject = typeof output?.previousSubject === "string" ? output.previousSubject : currentSubject;
  const previousBody = typeof output?.previousBody === "string" ? output.previousBody : currentBody;
  const updatedSubject = typeof output?.updatedSubject === "string" ? output.updatedSubject : currentSubject;
  const updatedBody = typeof output?.updatedBody === "string" ? output.updatedBody : currentBody;
  const beforeText = [previousSubject, previousBody].filter(Boolean).join("\n");
  const afterText = [updatedSubject, updatedBody].filter(Boolean).join("\n");

  return buildLineDiff(beforeText, afterText);
}

function buildLineDiff(beforeText: string, afterText: string): ApprovalDiffPreview {
  const beforeLines = beforeText.split("\n");
  const afterLines = afterText.split("\n");
  const max = Math.max(beforeLines.length, afterLines.length);
  const beforeSegments: DiffSegment[] = [];
  const afterSegments: DiffSegment[] = [];
  let addedCount = 0;
  let removedCount = 0;

  for (let index = 0; index < max; index += 1) {
    const before = beforeLines[index] ?? "";
    const after = afterLines[index] ?? "";

    if (before === after) {
      if (before !== "" || after !== "") {
        beforeSegments.push({ id: `before-same-${index}`, type: "same", text: before });
        afterSegments.push({ id: `after-same-${index}`, type: "same", text: after });
      }
      continue;
    }

    if (before) {
      removedCount += 1;
      beforeSegments.push({ id: `before-removed-${index}`, type: "removed", text: before });
    }

    if (after) {
      addedCount += 1;
      afterSegments.push({ id: `after-added-${index}`, type: "added", text: after });
    }
  }

  return {
    addedCount,
    removedCount,
    beforeSegments,
    afterSegments,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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
}, branding: ProposalBrandingProfile): WorkspacePlaybookState {
  return {
    status: "saved",
    product: playbook.product,
    idealCustomer: playbook.idealCustomer,
    industries: readStringList(playbook.industries),
    pains: readStringList(playbook.pains),
    proofPoints: readStringList(playbook.proofPoints),
    tone: playbook.tone,
    positioning: playbook.positioning,
    branding,
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

function getSyncPreview(provider: string, value: unknown, externalId?: string | null, lastError?: string | null): string[] {
  if (typeof value !== "object" || value === null) {
    return [`${provider} payload ready`];
  }

  const payload = value as Record<string, unknown>;
  const preview = Object.entries(payload)
    .slice(0, 3)
    .map(([key, item]) => `${toTitleCase(key)}: ${typeof item === "string" || typeof item === "number" ? item : "ready"}`);

  if (externalId) {
    preview.push(`External Id: ${externalId}`);
  }

  if (lastError) {
    preview.push(`Last Error: ${lastError}`);
  }

  return preview;
}

function readRecord(value: unknown) {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function summarizeTraceOutput(output: unknown) {
  if (typeof output !== "object" || output === null) {
    return "Trace output captured.";
  }

  const record = output as Record<string, unknown>;
  const nextAction = typeof record.nextAction === "string" ? record.nextAction : null;
  const decision = typeof record.approvalStatus === "string" ? record.approvalStatus : null;
  const savedAsLead = typeof record.savedAsLead === "boolean" ? record.savedAsLead : null;

  if (decision) {
    return `Review decision recorded as ${decision.toLowerCase()}.`;
  }

  if (nextAction) {
    return `Next action updated to "${nextAction}".`;
  }

  if (savedAsLead) {
    return "Discovery candidate was saved into the pipeline.";
  }

  return "Trace output captured.";
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseFormattedDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date("2026-01-01") : parsed;
}

function sortByDateDesc(left: string, right: string) {
  return parseFormattedDate(right).getTime() - parseFormattedDate(left).getTime();
}

function toTitleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
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

export function matchesPipelineFilter(lead: DashboardLead, filter: LeadFilterState) {
  const searchMatch = !filter.search || lead.company.toLowerCase().includes(filter.search.toLowerCase()) || lead.tags.some((tag) => tag.toLowerCase().includes(filter.search.toLowerCase()));
  const stageMatch = filter.stage === "ALL" || lead.status === filter.stage;
  const sourceMatch = filter.source === "ALL" || lead.source === filter.source;
  let fitMatch = true;
  if (filter.fitBand === "0-49") fitMatch = (lead.fit ?? 0) < 50;
  else if (filter.fitBand === "50-74") fitMatch = (lead.fit ?? 0) >= 50 && (lead.fit ?? 0) < 75;
  else if (filter.fitBand === "75-100") fitMatch = (lead.fit ?? 0) >= 75;

  const pendingMatch = !filter.pendingOnly || lead.hasPendingApproval;

  return searchMatch && stageMatch && sourceMatch && fitMatch && pendingMatch;
}

export function matchesTraceFilter(
  trace: TraceViewerEntry,
  filter: { search: string; agent: string; status: string },
) {
  const haystack = [trace.leadName, trace.agentName, trace.preview, trace.model ?? "", trace.status, ...trace.evaluationSummary]
    .join(" ")
    .toLowerCase();
  const searchMatch = !filter.search || haystack.includes(filter.search.toLowerCase());
  const agentMatch = filter.agent === "ALL" || trace.agentName === filter.agent;
  const statusMatch = filter.status === "ALL" || trace.status === filter.status;
  return searchMatch && agentMatch && statusMatch;
}

export function getAdjacentStage(status: LeadStatus, offset: -1 | 1) {
  const statuses = [
    LeadStatus.NEW,
    LeadStatus.RESEARCH,
    LeadStatus.AUDIT,
    LeadStatus.DRAFTED,
    LeadStatus.APPROVAL,
    LeadStatus.READY,
    LeadStatus.SYNCED,
    LeadStatus.REJECTED,
  ];
  const index = statuses.indexOf(status);
  const target = statuses[index + offset];
  return target ?? null;
}


export function matchesApprovalFilter(item: ApprovalQueueItem, filter: { approvalStatus: string; assetType: string }) {
  const statusMatch = filter.approvalStatus === "ALL" || item.status === filter.approvalStatus;
  const assetMatch = filter.assetType === "ALL" || item.assetType === filter.assetType;
  return statusMatch && assetMatch;
}
