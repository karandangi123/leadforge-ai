import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Crosshair,
  Database,
  FileText,
  Flame,
  Gauge,
  GitPullRequest,
  Lightbulb,
  Mail,
  PenSquare,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Zap,
  Building2,
  Radar,
  Search,
  Box,
  GitBranch,
  BookOpen,
  CreditCard,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

import { AddLeadForm } from "@/app/add-lead-form";
import { CompetitorSpyForm } from "@/app/competitor-spy-form";
import { FounderContentForm } from "@/app/founder-content-form";
import { GrowthModeForm } from "@/app/growth-mode-form";
import { ProposalGeneratorForm } from "@/app/proposal-generator-form";
import { WebsiteRoastForm } from "@/app/website-roast-form";
import {
  createSampleLead,
  disconnectGoogleConnection,
  refreshGoogleWorkspaceData,
  saveLocalSetup,
} from "@/app/actions";
import { getDefaultWorkspaceGmailConnectionState, type GmailConnectionState } from "@/lib/integration-connections";
import { GOOGLE_PROVIDER } from "@/lib/workspace";
import {
  getDashboardLeads,
  getLeadMetrics,
  type LeadFilterState,
  matchesApprovalFilter,
  matchesPipelineFilter,
  matchesTraceFilter,
} from "@/lib/leads";

// Dashboard Components
import { 
  Panel, 
  DetailRow, 
  ListBlock, 
  QuickActionCard, 
  TrustLine, 
  ChecklistItem, 
  EmptyState 
} from "@/components/dashboard/shared";
import { PromptLab } from "@/components/dashboard/prompt-lab";
import { Mailroom } from "@/components/dashboard/mailroom";
import { PipelineFilterBar, PipelineColumnView } from "@/components/dashboard/pipeline-board";
import { ApprovalFilterBar, ApprovalQueueCard } from "@/components/dashboard/approvals";
import { PlaybookWizard } from "@/components/dashboard/playbook";
import { LeadDiscoveryPanel } from "@/components/dashboard/discovery";
import { TraceViewer } from "@/components/dashboard/trace-viewer";
import { MultiChannelCommandCenter } from "@/components/dashboard/multichannel";
import { SchedulerAndDialer } from "@/components/dashboard/scheduler";
import { EnrichmentPanel } from "@/components/dashboard/enrichment-panel";
import { SequenceBuilder } from "@/components/dashboard/sequence-builder";
import { DeliverabilityPanel } from "@/components/dashboard/deliverability-panel";
import { CrmHub } from "@/components/dashboard/crm-hub";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { BillingPanel } from "@/components/dashboard/billing";
import { OpenSourceView } from "@/components/dashboard/opensource-view";
import { SecurityCenter } from "@/components/dashboard/security-center";
import { getWorkspaceSequences, getChannelPerformanceStats } from "@/lib/sequence-engine";
import { getDeliverabilityDomains } from "@/app/actions/deliverability";
import { getLeadEnrichmentProfile } from "@/app/actions/enrichment";
import { getAuditLogs, getDncEntries } from "@/app/actions/security";
import { hasTwilioCredentials, hasLinkedInCredentials, hasLinkedInSalesNavigator } from "@leadforge/integrations";
import { ViewContainer } from "@/components/dashboard/ViewContainer";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { CategoryView } from "@/components/dashboard/category-view";
import { Github } from "@/components/ui/BrandIcons";
import { FeatureGate, ProBadge } from "@/components/ui/FeatureGate";
import { BillingService } from "@leadforge/billing";

// Marketing Section Imports for Command Center View
import { HeroRevenueFlow } from "@/components/marketing/sections/HeroRevenueFlow";
import { RevenueEngineDiagram } from "@/components/marketing/sections/RevenueEngineDiagram";
import { ScrollProductStory } from "@/components/marketing/sections/ScrollProductStory";
import { FeatureBentoGrid } from "@/components/marketing/sections/FeatureBentoGrid";
import { AudienceAndTrust } from "@/components/marketing/sections/AudienceAndTrust";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";

function CommandCenterView() {
  return (
    <div className="bg-[#02040a] text-white overflow-y-auto h-full scroll-smooth -mx-6 -my-8 sm:-mx-10">
      <HeroRevenueFlow />
      <RevenueEngineDiagram />
      <ScrollProductStory />
      <FeatureBentoGrid />
      <AudienceAndTrust />
      <FinalCTA />
    </div>
  );
}

const roadmap = [
  "Pipeline board and approval queue",
  "Roast My Website viral demo surface",
  "Competitor Spy positioning brief",
  "One Prompt Growth Mode strategy brief",
  "Founder Content Engine for repeatable authority content",
  "Proposal Generator for client-facing deal packaging",
  "Editable lead workspace and timeline",
  "CSV import with duplicate handling",
  "External provider adapters after approval",
  "Prompt evals in CI",
  "Trace viewer and analytics expansion",
];

const useCases = [
  {
    title: "Founder",
    detail: "Turn one offer, one ICP, and one growth goal into a real pipeline, website improvements, and approved outreach.",
  },
  {
    title: "Agency",
    detail: "Run research, audits, drafts, approvals, and client-ops payloads from one workspace instead of scattered docs and prompts.",
  },
  {
    title: "Freelancer",
    detail: "Use Roast Lab, Competitor Spy, and Growth Mode to create sharp lead magnets and then convert the best sessions into leads.",
  },
  {
    title: "RevOps consultant",
    detail: "Manage discovery, assign owners, review approvals, and capture outcome signals without sacrificing human control.",
  },
];

const operatingLoop = [
  "Create the playbook and offer context",
  "Find leads through discovery or public growth tools",
  "Run research and audit the website",
  "Generate personalised outreach and client ops assets",
  "Approve actions, sync safely, and log outcomes",
];

const glossary = [
  {
    term: "Lead",
    meaning: "A company or contact you may want to research and reach out to.",
  },
  {
    term: "Fit",
    meaning: "How closely the lead matches your ideal customer profile.",
  },
  {
    term: "Audit",
    meaning: "A website score for clarity, trust, conversion, SEO, and speed signals.",
  },
  {
    term: "Approval",
    meaning: "A human review step before Gmail, CRM, Slack, or any external action.",
  },
  {
    term: "Trace",
    meaning: "A log of what an intelligence or operator step did, including output, model, cost, and timing.",
  },
];

type PageParams = {
  lead?: string;
  run?: string;
  view?: string;
  search?: string;
  stage?: string;
  source?: string;
  fit?: string;
  pending?: string;
  approvalStatus?: string;
  assetType?: string;
  traceSearch?: string;
  traceAgent?: string;
  traceStatus?: string;
};

export const dynamic = "force-dynamic";

const leadStateFallback = {
  leads: [],
  pipelineColumns: [],
  approvalQueue: [],
  filters: { sources: [], stages: [] },
  recentActivitySummary: [],
  status: "unavailable" as const,
  message: "System is taking too long to respond. Showing temporary offline state.",
  outcomeSummary: [],
  agentAnalytics: { metrics: [], signals: [] },
  traceViewer: [],
  qualityCenter: { summary: [], findings: [], lowConfidenceResearch: [], failingEvaluations: [] },
  playbook: { status: "empty" as const, product: "", idealCustomer: "", industries: [], pains: [], proofPoints: [], tone: "", positioning: null, branding: {} as any },
  discovery: { status: "empty" as const, targetMarket: "", summary: "", queryPlan: [], sourcePolicy: { allowed: [], blocked: [], linkedin: "" }, candidates: [] },
  proposalMemory: [],
  traceSavedViews: []
};

const gmailConnectionFallback: GmailConnectionState = {
  provider: GOOGLE_PROVIDER,
  status: "error",
  workspaceSlug: "demo",
  connectedEmail: null,
  connectedAt: null,
  lastSyncedAt: null,
  expiresAt: null,
  hasRefreshToken: false,
  lastError: "Connection timed out",
  scopes: [],
  isActive: false,
  statusLabel: "Checking...",
  statusDetail: "The system is verifying your Gmail connection.",
  requiresReconnect: false,
  snapshotStatus: null,
  snapshotError: null,
  lastAttemptedSyncAt: null,
  lastSuccessfulSyncAt: null,
  labelCount: 0,
  recentDraftCount: 0,
  readiness: {
    databaseReady: false,
    clientIdReady: false,
    clientSecretReady: false,
    redirectUriReady: false,
    expectedRedirectUri: "",
    configuredRedirectUri: null,
    redirectUriMatchesHost: false,
    blockers: [],
    userFacingBlockers: []
  }
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  const timeoutPromise = new Promise<T>((resolve) => {
    setTimeout(() => resolve(fallback), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<PageParams>;
}) {
  const params = await searchParams;
  const currentView = params.view || "dashboard";

  // Parallelize all major data fetching to avoid sequential timeout delays
  const [
    leadState,
    gmailConnection,
    sequences,
    channelStats,
    auditLogs,
    dncEntries,
    session
  ] = await Promise.all([
    withTimeout(getDashboardLeads(), 2000, leadStateFallback),
    withTimeout(getDefaultWorkspaceGmailConnectionState(), 2000, gmailConnectionFallback),
    withTimeout(getWorkspaceSequences("live").catch(() => []), 2000, []),
    withTimeout(getChannelPerformanceStats("live").catch(() => []), 2000, []),
    withTimeout(getAuditLogs(), 2000, []),
    withTimeout(getDncEntries(), 2000, []),
    withTimeout(import("@/auth").then((m) => m.auth()), 2000, null)
  ]);

  const gmailConfigured = gmailConnection.isActive;
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const databaseConfigured = gmailConnection.readiness.databaseReady;
  const gmailRecoveryBlocked = gmailConnection.readiness.userFacingBlockers.length > 0;
  const pipelineFilter: LeadFilterState = {
    search: params.search?.trim().toLowerCase() ?? "",
    stage: (params.stage as LeadFilterState["stage"]) ?? "ALL",
    source: params.source ?? "ALL",
    fitBand: (params.fit as LeadFilterState["fitBand"]) ?? "ALL",
    pendingOnly: params.pending === "1",
  };
  const approvalFilter = {
    approvalStatus: params.approvalStatus ?? "PENDING",
    assetType: params.assetType ?? "ALL",
  };
  const traceFilter = {
    search: params.traceSearch?.trim().toLowerCase() ?? "",
    agent: params.traceAgent ?? "ALL",
    status: params.traceStatus ?? "ALL",
  };

  const filteredPipelineColumns = leadState.pipelineColumns.map((column) => ({
    ...column,
    leads: column.leads.filter((lead) => matchesPipelineFilter(lead, pipelineFilter)),
  }));
  const visibleLeads = filteredPipelineColumns.flatMap((column) => column.leads);
  const agentRuns = getLeadMetrics(visibleLeads.length > 0 ? visibleLeads : leadState.leads);
  const visibleApprovalQueue = leadState.approvalQueue.filter((item) => matchesApprovalFilter(item, approvalFilter));
  const visibleTraces = leadState.traceViewer.filter((trace) => matchesTraceFilter(trace, traceFilter));

  const isDemo = session?.user?.id === "demo-user" || !databaseConfigured;

  // Enrichment — use first lead in pipeline as demo subject
  const enrichmentLeadId = leadState.leads[0]?.id ?? "demo-lead";
  const enrichmentCompany = leadState.leads[0]?.company ?? "Acme Corp";

  const enrichmentProfile = currentView === "enrichment"
    ? await getLeadEnrichmentProfile(enrichmentLeadId, isDemo, enrichmentCompany).catch(() => null)
    : null;

  // Deliverability data
  const deliverabilityDomains = currentView === "deliverability"
    ? await getDeliverabilityDomains().catch(() => [])
    : [];

  const totalSent = sequences.reduce((sum, s) => sum + s.totalCompleted, 0) || 0;
  const totalOpened = sequences.reduce((sum, s) => sum + ((s as any).totalOpened || 0), 0) || 0;
  const totalClicked = sequences.reduce((sum, s) => sum + ((s as any).totalClicked || 0), 0) || 0;
  const totalReplied = sequences.reduce((sum, s) => sum + (s.totalReplied || 0), 0) || 0;
  const meetingsBooked = sequences.reduce((sum, s) => sum + ((s as any).meetingsBooked || 0), 0) || 0;
  const analyticsMetrics = { totalSent, totalOpened, totalClicked, totalReplied, meetingsBooked };

  const analyticsCampaigns = sequences.map(s => ({
    id: s.id,
    name: s.name,
    sent: s.totalCompleted,
    openRate: s.totalCompleted > 0 ? (((s as any).totalOpened || 0) / s.totalCompleted) * 100 : 0,
    clickRate: ((s as any).totalOpened || 0) > 0 ? (((s as any).totalClicked || 0) / ((s as any).totalOpened)) * 100 : 0,
    replyRate: s.totalCompleted > 0 ? (s.totalReplied / s.totalCompleted) * 100 : 0,
    meetings: (s as any).meetingsBooked || 0,
  }));

  const activeWorkspaceId = leadState.leads[0]?.workspaceId || "demo-workspace";
  const isEntitledPro = await BillingService.hasEntitlement(activeWorkspaceId, "PRO_FEATURES");

  return (
    <div className="flex flex-col h-full bg-[#02040a] text-[#0b1220] relative overflow-hidden">
      {/* 6sense inspired grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d1c1_1px,transparent_1px),linear-gradient(to_bottom,#00d1c1_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.02] pointer-events-none" />
      
      {/* Radial glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent-cyan)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 relative z-10">
        <ViewContainer viewKey={currentView}>
        {currentView === "home" && <CommandCenterView />}
        {currentView === "dashboard" && (
          <div className="space-y-10">
            {/* Mission Control Navigation Hub - MAXIMUM VISIBILITY */}
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                { 
                  title: "Revenue Platform", 
                  icon: LayoutDashboard, 
                  color: "#22D3EE",
                  href: "/dashboard?view=cat-platform",
                  items: ["Pipeline", "Sequences", "CRM Hub", "Approvals"]
                },
                { 
                  title: "Growth Lab", 
                  icon: Flame, 
                  color: "#F43F5E",
                  href: "/dashboard?view=cat-growth",
                  items: ["Roast Lab", "Competitor Spy", "Growth Mode", "Content Engine"]
                },
                { 
                  title: "War Room HQ", 
                  icon: Radar, 
                  color: "#F59E0B",
                  href: "/war-room",
                  items: ["Visual Proof", "Forensic Audits", "Avatar Outreach", "Lead Portals"]
                },
                { 
                  title: "Intelligence Hub", 
                  icon: Search, 
                  color: "#8B5CF6",
                  href: "/dashboard?view=cat-intel",
                  items: ["Discovery", "Enrichment", "Playbook", "Analytics"]
                },
                { 
                  title: "Resources & Trust", 
                  icon: ShieldCheck, 
                  color: "#10B981",
                  href: "/dashboard?view=cat-resources",
                  items: ["Security", "Roadmap", "Guides", "Pricing"]
                }
              ].map((cat) => (
                <Link 
                  key={cat.title} 
                  href={cat.href}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0D1117] p-6 transition-all hover:border-white/10 hover:bg-[#161B22] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#02040a] transition-all shadow-xl">
                      <cat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">HQ Access</p>
                      <h3 className="text-sm font-black text-white tracking-tight">{cat.title}</h3>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {cat.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-[11px] font-bold text-[#94A3B8]">
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                    Enter Sector
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </section>

            <DashboardHero agentRuns={agentRuns} />

            <section className="grid gap-6 xl:grid-cols-2">
              <Panel icon={Sparkles} title="Quick Actions Launcher" subtitle="Direct entry points for the high-frictionless growth tools" isPro={isEntitledPro}>
                <div className="grid gap-3 md:grid-cols-2">
                  <QuickActionCard href="/dashboard?view=roast" title="Roast Lab" detail="Generate a page teardown, rewrites, and revenue opportunity estimate." />
                  <QuickActionCard href="/dashboard?view=competitor" title="Competitor Spy" detail="Break down positioning, CTA patterns, and find strategic voids." />
                  <FeatureGate feature="Growth Strategy" isEntitled={isEntitledPro}>
                    <QuickActionCard href="/dashboard?view=growth" title="Growth Brief" detail="Turn one business goal into a complete 90-day execution plan." isPro={isEntitledPro} />
                  </FeatureGate>
                  <QuickActionCard href="/dashboard?view=content" title="Content Engine" detail="Generate founder-grade pillars, posts, CTAs, and a publishing system." isPro={isEntitledPro} />
                  <FeatureGate feature="Proposal Packaging" isEntitled={isEntitledPro}>
                    <QuickActionCard href="/dashboard?view=proposal" title="Proposal Engine" detail="Create a client-facing proposal package with scope and pricing." isPro={isEntitledPro} />
                  </FeatureGate>
                  <QuickActionCard href="/dashboard?view=targeting" title="Playbook Center" detail="Save product, ICP, and tone before running intelligence sequences." />
                  <QuickActionCard href="#add-lead" title="Lead Discovery" detail="Import leads manually or by CSV and route them into the board." />
                  <QuickActionCard href="/dashboard?view=intelligence" title="Market Intel" detail="Create a compliant query plan and score candidate leads." />
                </div>
              </Panel>

              <Panel icon={ArrowRight} title="The Operating Loop" subtitle="How to navigate LeadForge from first click to revenue signal">
                <div className="space-y-3">
                  {operatingLoop.map((item, index) => (
                    <div key={item} className="flex items-start gap-4 rounded-xl border border-[var(--border-light)] bg-white p-5 shadow-sm">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--dark-bg)] text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.75fr_0.95fr]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase text-[#176b5d]">Pipeline</p>
                      <h2 className="mt-1 text-2xl font-black leading-tight">Lead pipeline board</h2>
                      <p className="mt-2 text-sm text-[#687169]">Filter the lead universe, inspect stage health, and move work forward with explicit operator actions.</p>
                    </div>
                    <PipelineFilterBar leadState={leadState} currentFilter={pipelineFilter} />
                  </div>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="grid min-w-[1280px] grid-cols-8 gap-4">
                    {filteredPipelineColumns.map((column) => (
                      <PipelineColumnView key={column.status} column={column} />
                    ))}
                  </div>
                </div>

                <AddLeadForm databaseStatus={leadState.status} />
              </div>

              <aside className="space-y-6">
                <Panel icon={ClipboardCheck} title="Pending approvals" subtitle="What needs a reviewer next">
                  {leadState.approvalQueue.length > 0 ? (
                    <div className="space-y-3">
                      {leadState.approvalQueue.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black">{item.leadName}</p>
                              <p className="mt-1 text-xs text-[#687169]">{item.requestedAction}</p>
                            </div>
                            <span className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">{item.status}</span>
                          </div>
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#4f5a53]">{item.contentPreview}</p>
                          <Link href="/?view=outreach" className="mt-3 inline-flex items-center gap-2 text-xs font-black text-[#176b5d]">
                            Open approvals <ChevronRight size={14} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Run outreach or client ops to generate the next approval queue items." />
                  )}
                </Panel>

                <Panel icon={Gauge} title="Recent activity" subtitle="Fast context for what moved recently">
                  <div className="space-y-3">
                    {leadState.recentActivitySummary.map((item) => (
                      <div key={`${item.label}-${item.timestamp}`} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-black">{item.label}</p>
                          <span className="text-[10px] font-bold uppercase text-[#687169]">{item.timestamp}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </aside>
            </section>
          </div>
        )}

        {currentView === "roast" ? (
          <div className="space-y-6">
            <WebsiteRoastForm />
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Panel
                icon={Flame}
                title="Why this phase"
                subtitle="The next product layer after pipeline completion is a feature people can understand in one glance."
              >
                <div className="space-y-3 text-sm leading-7 text-[#4f5a53]">
                  <p>Roast Lab is the first public-facing, low-friction feature in LeadForge. It turns the product from a private ops console into something instantly demo-able.</p>
                  <p>It is also a smart bridge: the same audit logic that powers lead workspaces now becomes a shareable founder growth experience.</p>
                </div>
              </Panel>
              <Panel
                icon={Gauge}
                title="What to build after this"
                subtitle="The most natural follow-ons once Roast Lab is in place"
              >
                <ListBlock
                  title="Next likely additions"
                  items={[
                    "Competitor Spy for CTA, offer, and funnel comparison",
                    "Before / After copy snapshots for social screenshots",
                    "Revenue opportunity calculator exports",
                    "One Prompt Growth Mode for founder action plans",
                  ]}
                />
              </Panel>
            </section>
          </div>
        ) : null}

        {currentView === "competitor" ? (
          <div className="space-y-6">
            <CompetitorSpyForm />
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Panel
                icon={Crosshair}
                title="Why this feature"
                subtitle="The next growth move after a public roast tool is a positioning feature that helps founders frame the market."
              >
                <div className="space-y-3 text-sm leading-7 text-[#4f5a53]">
                  <p>Competitor Spy gives LeadForge a second highly demo-able surface. It turns vague “competitive analysis” into positioning advice that a founder can use on the homepage the same day.</p>
                  <p>It also complements Roast Lab well: one feature critiques your site, the other helps you out-position the market around it.</p>
                </div>
              </Panel>
              <Panel
                icon={Gauge}
                title="What to build after this"
                subtitle="The next layer should combine these viral tools into a higher-level founder workflow"
              >
                <ListBlock
                  title="Likely next additions"
                  items={[
                    "One Prompt Growth Mode for complete action plans",
                    "Before / After copy cards for social posts",
                    "Founder Content Engine for LinkedIn and X",
                    "Proposal Generator for client-facing offers",
                  ]}
                />
              </Panel>
            </section>
          </div>
        ) : null}

        {currentView === "growth" ? (
          <div className="space-y-6">
            <GrowthModeForm />
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Panel
                icon={Lightbulb}
                title="Why this feature"
                subtitle="This is the first high-level strategy layer that combines what LeadForge knows about ICP, offers, websites, content, and outbound."
              >
                <div className="space-y-3 text-sm leading-7 text-[#4f5a53]">
                  <p>Growth Mode turns the app from a toolkit into a planning partner. Instead of isolated audits or competitor observations, it gives a founder one operating brief that can guide the next 90 days.</p>
                  <p>It is also the best bridge between the viral surfaces and the deeper operator workflow inside LeadForge.</p>
                </div>
              </Panel>
              <Panel
                icon={Gauge}
                title="What to build after this"
                subtitle="The strongest next step is a content-and-execution layer on top of the strategy brief"
              >
                <ListBlock
                  title="Likely next additions"
                  items={[
                    "Founder Content Engine for LinkedIn and X post systems",
                    "Proposal Generator for agencies and freelancers",
                    "Before / After copy cards export",
                    "Saved strategy workspaces tied to leads and playbooks",
                  ]}
                />
              </Panel>
            </section>
          </div>
        ) : null}

        {currentView === "content" ? (
          <div className="space-y-6">
            <FounderContentForm />
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Panel
                icon={PenSquare}
                title="Why this feature"
                subtitle="Founder Content Engine turns positioning and teardown insight into a repeatable audience-building system."
              >
                <div className="space-y-3 text-sm leading-7 text-[#4f5a53]">
                  <p>LeadForge now has the missing bridge between founder strategy and public demand creation. Instead of isolated ideas, the app can generate a usable content engine with pillars, posts, CTAs, and repurposing structure.</p>
                  <p>That makes the product feel larger than outbound tooling alone. It becomes a system for market narrative, trust-building, and pipeline creation.</p>
                </div>
              </Panel>
              <Panel
                icon={Gauge}
                title="What to build after this"
                subtitle="The strongest next layer is converting content outcomes back into pipeline and playbook learning"
              >
                <ListBlock
                  title="Likely next additions"
                  items={[
                    "Content performance memory across winning hooks and CTAs",
                    "Reply and objection clustering tied to public content angles",
                    "Proposal Generator for converting warm demand into offers",
                    "Trace viewer and quality center for all growth surfaces",
                  ]}
                />
              </Panel>
            </section>
          </div>
        ) : null}

        {currentView === "proposal" ? (
          <div className="space-y-6">
            <ProposalGeneratorForm playbook={leadState.playbook} proposalMemory={leadState.proposalMemory} />
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Panel
                icon={FileText}
                title="Why this feature"
                subtitle="Proposal Generator turns LeadForge from demand creation tooling into client-closing infrastructure."
              >
                <div className="space-y-3 text-sm leading-7 text-[#4f5a53]">
                  <p>This closes a practical gap in the founder and agency workflow. After you identify problems, create strategy, and generate assets, you still need a clean way to package the engagement commercially.</p>
                  <p>The proposal surface keeps that step inside the product instead of pushing it back into docs, Notion pages, or ad hoc email drafts.</p>
                </div>
              </Panel>
              <Panel
                icon={Gauge}
                title="What to build after this"
                subtitle="The strongest follow-on is deeper proposal memory and conversion analytics"
              >
                <ListBlock
                  title="Likely next additions"
                  items={[
                    "Proposal templates by service line or niche",
                    "Proposal win/loss tracking tied to offer themes",
                    "Reusable proof block library linked to playbook data",
                    "Export-ready client deck or PDF packaging",
                  ]}
                />
              </Panel>
            </section>
          </div>
        ) : null}

        {currentView === "intelligence" ? (
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <LeadDiscoveryPanel discovery={leadState.discovery} databaseStatus={leadState.status} />
            <Panel icon={ShieldCheck} title="Source policy" subtitle="Discovery stays explicit and compliant">
              <div className="grid gap-4 sm:grid-cols-2">
                <ListBlock title="Allowed" items={leadState.discovery.sourcePolicy.allowed} />
                <ListBlock title="Blocked" items={leadState.discovery.sourcePolicy.blocked} />
              </div>
              <p className="mt-4 rounded-xl border border-[#e3dccd] bg-white p-4 text-sm leading-6 text-[#4f5a53]">
                <span className="font-black text-[#1e2521]">LinkedIn policy:</span> {leadState.discovery.sourcePolicy.linkedin}
              </p>
            </Panel>
          </div>
        ) : null}

        {currentView === "targeting" ? (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
            <PlaybookWizard playbook={leadState.playbook} databaseStatus={leadState.status} />
            <Panel icon={Target} title="Current positioning" subtitle="What the agents are optimizing for">
              <div className="space-y-4 text-sm leading-6 text-[#4f5a53]">
                <DetailRow label="Product" value={leadState.playbook.product || "No saved product context yet."} />
                <DetailRow label="Ideal customer" value={leadState.playbook.idealCustomer || "No saved ICP yet."} />
                <DetailRow label="Tone" value={leadState.playbook.tone || "No saved tone yet."} />
                <DetailRow label="Positioning" value={leadState.playbook.positioning || "No saved positioning yet."} />
              </div>
            </Panel>
          </div>
        ) : null}

        {currentView === "outreach" ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-[#176b5d]">Approvals</p>
                  <h2 className="mt-1 text-2xl font-black leading-tight">Central review queue</h2>
                  <p className="mt-2 text-sm text-[#687169]">Approve or reject prepared assets across the workspace without digging through every lead page.</p>
                </div>
                <ApprovalFilterBar items={leadState.approvalQueue} currentFilter={approvalFilter} />
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-2">
              {visibleApprovalQueue.length > 0 ? (
                visibleApprovalQueue.map((item) => (
                  <ApprovalQueueCard key={item.id} item={item} disabled={item.isSeed || leadState.status !== "connected"} />
                ))
              ) : (
                <div className="xl:col-span-2">
                  <EmptyState text="No approval items match the current filter. Generate outreach or broaden the filter to review more work." />
                </div>
              )}
            </div>
          </div>
        ) : null}

        {currentView === "quality" ? (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <Panel icon={ShieldCheck} title="Quality center" subtitle="See where the workspace is healthy, risky, or blocked">
              <div className="grid gap-4 sm:grid-cols-2">
                {leadState.qualityCenter.summary.map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">{metric.label}</p>
                    <p className="mt-2 text-3xl font-black">{metric.value}</p>
                    <p className="mt-1 text-xs text-[#687169]">{metric.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {leadState.qualityCenter.findings.map((signal) => (
                  <div key={signal.title} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-sm font-black">{signal.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel icon={Gauge} title="Failing evals and weak confidence" subtitle="The outputs most likely to need human intervention">
              <div className="space-y-3">
                {leadState.qualityCenter.failingEvaluations.map((evaluation) => (
                  <div key={`${evaluation.leadName}-${evaluation.category}`} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">{evaluation.leadName}</p>
                        <p className="mt-1 text-xs font-black uppercase text-[#176b5d]">
                          {evaluation.category} • {evaluation.score}
                        </p>
                      </div>
                      <Link href={`/leads/${evaluation.leadId}`} className="text-xs font-black text-[#176b5d]">
                        Open lead
                      </Link>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{evaluation.detail}</p>
                  </div>
                ))}
                {leadState.qualityCenter.lowConfidenceResearch.map((item) => (
                  <div key={`${item.leadName}-${item.confidence}`} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">{item.leadName}</p>
                        <p className="mt-1 text-xs font-black uppercase text-[#176b5d]">Research confidence {item.confidence}</p>
                      </div>
                      <Link href={`/leads/${item.leadId}`} className="text-xs font-black text-[#176b5d]">
                        Open lead
                      </Link>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{item.summary}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        ) : null}

        {currentView === "traces" ? (
          <TraceViewer leadState={leadState} traceFilter={traceFilter} visibleTraces={visibleTraces} />
        ) : null}

        {currentView === "prompts" ? (
          <PromptLab />
        ) : null}

        {currentView === "mailroom" ? (
          <Mailroom
            approvalQueue={leadState.approvalQueue}
            traceViewer={leadState.traceViewer}
            gmailConnection={gmailConnection}
          />
        ) : null}

        {currentView === "sequences" ? (
          <MultiChannelCommandCenter
            sequences={sequences}
            channelStats={channelStats}
            isDemo={isDemo}
            hasTwilio={hasTwilioCredentials()}
            hasLinkedIn={hasLinkedInCredentials()}
            hasSalesNavigator={hasLinkedInSalesNavigator()}
          />
        ) : null}

        {currentView === "scheduler" || currentView === "dialer" ? (
          <div className="max-w-5xl">
            <SchedulerAndDialer
              hasTwilio={hasTwilioCredentials()}
              isDemo={isDemo}
              upcomingEvents={[]}
              pastCalls={[]}
            />
          </div>
        ) : null}

        {currentView === "enrichment" ? (
          <div className="max-w-3xl">
            <EnrichmentPanel
              leadId={enrichmentLeadId}
              company={enrichmentCompany}
              profile={enrichmentProfile}
              isDemo={isDemo}
            />
          </div>
        ) : null}

        {currentView === "deliverability" ? (
          <div className="space-y-6 animate-fade-in">
             <DeliverabilityPanel domains={deliverabilityDomains as any} />
          </div>
        ) : null}

        {currentView === "crm" ? (
          <div className="space-y-6 animate-fade-in">
             <CrmHub />
          </div>
        ) : null}

        {currentView === "analytics" ? (
          <div className="space-y-6 animate-fade-in">
             <AnalyticsDashboard metrics={analyticsMetrics} campaigns={analyticsCampaigns} />
          </div>
        ) : null}

        {currentView === "billing" ? (
          <div className="space-y-6 animate-fade-in">
             <BillingPanel currentPlan="FREE" isDemo={isDemo} />
          </div>
        ) : null}

        {currentView === "opensource" ? (
          <div className="animate-fade-in">
             <OpenSourceView />
          </div>
        ) : null}

        {currentView === "security" ? (
          <div className="space-y-6 animate-fade-in">
             <SecurityCenter 
               initialAuditLogs={auditLogs} 
               initialDncEntries={dncEntries} 
               mfaEnabled={(session?.user as any)?.twoFactorEnabled}
             />
          </div>
        ) : null}

        {currentView === "gmail" ? (
          <div className="grid max-w-6xl gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-6">
              <p className="text-xs font-black uppercase text-[#176b5d]">Gmail access</p>
              <h2 className="mt-1 text-2xl font-black leading-tight">Real Gmail connection and trust center</h2>
              <p className="mt-2 text-sm text-[#687169]">
                This is where operators can see which Google account is connected, what LeadForge syncs, and whether the workspace is ready for approved Gmail draft handoff.
              </p>
              {getSetupRunNotice(params.run) ? (
                <div className="mt-4 rounded-xl border border-[#cfe7de] bg-[#f3faf7] p-4 text-sm font-medium text-[#176b5d]">
                  {getSetupRunNotice(params.run)}
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <StatusPillCard label="Status" value={gmailConnection.statusLabel} tone={gmailConfigured ? "positive" : "warning"} />
                <StatusPillCard label="Connected user" value={gmailConnection.connectedEmail ?? "Not connected"} tone={gmailConnection.connectedEmail ? "positive" : "neutral"} />
                <StatusPillCard label="Labels synced" value={String(gmailConnection.labelCount)} tone={gmailConnection.labelCount > 0 ? "positive" : "neutral"} />
                <StatusPillCard label="Recent drafts" value={String(gmailConnection.recentDraftCount)} tone={gmailConnection.recentDraftCount > 0 ? "positive" : "neutral"} />
              </div>

              <div className="mt-6 rounded-2xl border border-[#e3dccd] bg-white">
                <div className="flex items-center justify-between border-b border-[#e3dccd] px-5 py-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Workspace access</p>
                    <p className="mt-1 text-lg font-black text-[#1e2521]">Managed Google Integration</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${gmailConfigured ? "bg-[#edf9f3] text-[#176b5d]" : "bg-[#fff4eb] text-[#8a4b12]"}`}>
                    {gmailConfigured ? "Connected" : gmailConnection.snapshotStatus ?? "Awaiting Access"}
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-sm leading-6 text-[#687169]">
                    LeadForge uses a secure, product-owned Google Cloud app to sync labels and prepare outreach drafts. End users only need to grant access once to enable the full workspace lifecycle.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <DetailRow label="Connected Google account" value={gmailConnection.connectedEmail ?? "Not connected"} />
                    <DetailRow label="Required callback" value={gmailConnection.readiness.expectedRedirectUri} />
                    <DetailRow label="Configured callback" value={gmailConnection.readiness.configuredRedirectUri ?? "Missing"} />
                    <DetailRow label="Snapshot state" value={gmailConnection.snapshotStatus ?? "Not started"} />
                    <DetailRow label="Last connection sync" value={gmailConnection.lastSyncedAt ? formatStatusTimestamp(gmailConnection.lastSyncedAt) : "Not yet"} />
                    <DetailRow label="Last Gmail data sync" value={gmailConnection.lastSuccessfulSyncAt ? formatStatusTimestamp(gmailConnection.lastSuccessfulSyncAt) : "Not yet"} />
                  </div>
                  {gmailConnection.readiness.userFacingBlockers.length > 0 ? (
                    <div className="space-y-2 rounded-xl border border-[#f1cfbf] bg-[#fff8f2] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a4b12]">Readiness blockers</p>
                      {gmailConnection.readiness.userFacingBlockers.map((blocker) => (
                        <p key={blocker} className="text-sm text-[#8a4b12]">{blocker}</p>
                      ))}
                    </div>
                  ) : null}
                  {gmailConnection.snapshotError ? (
                    <div className="rounded-xl border border-[#f1cfbf] bg-[#fff4eb] p-4 text-sm text-[#8a4b12]">
                      Gmail data sync error: {gmailConnection.snapshotError}
                    </div>
                  ) : null}
                  {gmailConnection.lastError ? (
                    <div className="rounded-xl border border-[#f1cfbf] bg-[#fff4eb] p-4 text-sm text-[#8a4b12]">
                      Connection error: {gmailConnection.lastError}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    {gmailConnection.readiness.userFacingBlockers.length === 0 ? (
                      <Link
                        href="/api/integrations/google/start?returnTo=/?view=gmail"
                        className="inline-flex h-11 items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white transition hover:bg-[#115247]"
                      >
                        {gmailConnection.connectedEmail ? "Repair or switch Gmail" : "Connect Gmail"}
                      </Link>
                    ) : (
                      <Link
                        href="/?view=setup"
                        className="inline-flex h-11 items-center justify-center rounded-md border border-[#d9d2c1] bg-white px-5 text-sm font-black text-[#1e2521] transition hover:bg-[#f7f5ef]"
                      >
                        Open setup requirements
                      </Link>
                    )}
                    {gmailConnection.connectedEmail ? (
                      <form action={refreshGoogleWorkspaceData}>
                        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#b9ddcf] bg-white px-5 text-sm font-black text-[#176b5d] hover:bg-[#f3faf7]">
                          <RefreshCcw size={15} /> Refresh Gmail data
                        </button>
                      </form>
                    ) : null}
                    {gmailConnection.connectedEmail ? (
                      <form action={disconnectGoogleConnection}>
                        <button className="inline-flex h-11 items-center justify-center rounded-md border border-transparent px-5 text-sm font-black text-[#b2412d] hover:bg-[#fff4eb]">
                          Disconnect
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#e3dccd] bg-white p-5">
                  <div className="flex items-center gap-2 text-[#176b5d]">
                    <ShieldCheck size={18} />
                    <p className="text-sm font-black">Per-user access</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#4f5a53]">
                    Each person signs in with their own Google account. LeadForge does not attach one private Gmail account to every future user automatically.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e3dccd] bg-white p-5">
                  <div className="flex items-center gap-2 text-[#176b5d]">
                    <Mail size={18} />
                    <p className="text-sm font-black">Limited data sync</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#4f5a53]">
                    This implementation syncs Gmail labels and recent draft metadata for workspace visibility. It does not import inbox message bodies in this phase.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e3dccd] bg-white p-5">
                  <div className="flex items-center gap-2 text-[#176b5d]">
                    <Database size={18} />
                    <p className="text-sm font-black">Workspace-scoped storage</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#4f5a53]">
                    Synced Gmail metadata is stored per workspace with audit logs, health state, and recovery controls so operators can inspect trust before they use it.
                  </p>
                </div>
              </div>
            </section>

            <Panel icon={ShieldCheck} title="What users can trust" subtitle="Clear boundaries help Gmail feel real instead of magical">
              <div className="space-y-3">
                <TrustLine title="No shared hidden mailbox" detail="The Gmail account belongs to the person who authenticates. Other users should connect their own account when they log into their own workspace." />
                <TrustLine title="Drafts only, not auto-send" detail="LeadForge can prepare Gmail drafts after approval, but sending still remains a user action outside this implementation." />
                <TrustLine title="Minimal sync surface" detail="The app syncs labels, connection health, and recent draft metadata rather than broad mailbox contents." />
                <TrustLine title="Repairable and auditable" detail="Re-authenticate, refresh Gmail data, and disconnect are all available from one visible surface with status and error details." />
              </div>
              <div className="mt-6 rounded-2xl border border-[#e3dccd] bg-white p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Recommended operator flow</p>
                <div className="mt-3 space-y-3 text-sm leading-6 text-[#4f5a53]">
                  <p>1. Configure Postgres and Google OAuth in Setup.</p>
                  <p>2. Sign in with the Google account that should own Gmail draft sync for this workspace.</p>
                  <p>3. Open Gmail Access to confirm labels, recent drafts, and sync timestamps are healthy.</p>
                  <p>4. Create outreach, approve it, and then hand it off to Gmail drafts from the lead workspace.</p>
                </div>
              </div>
            </Panel>
          </div>
        ) : null}



        {currentView === "setup" ? (
          <div className="grid max-w-6xl gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-6">
              <p className="text-xs font-black uppercase text-[#176b5d]">Workspace Administration</p>
              <h2 className="mt-1 text-2xl font-black leading-tight">Platform health & infrastructure</h2>
              <p className="mt-2 text-sm text-[#687169]">
                LeadForge manages the Google Cloud integration behind the scenes. This view allows operators to verify local database connectivity, AI model status, and recover workspace access if credentials expire.
              </p>
              {getSetupRunNotice(params.run) ? (
                <div className="mt-4 rounded-xl border border-[#cfe7de] bg-[#f3faf7] p-4 text-sm font-medium text-[#176b5d]">
                  {getSetupRunNotice(params.run)}
                </div>
              ) : null}
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <StatusPillCard label="Database" value={databaseConfigured ? "Connected" : "Not configured"} tone={databaseConfigured ? "positive" : "warning"} />
                <StatusPillCard label="OpenAI" value={openAiConfigured ? "Configured" : "Fallback mode"} tone={openAiConfigured ? "positive" : "neutral"} />
                <StatusPillCard label="Gmail Drafts" value={gmailConfigured ? "Active" : gmailConnection.statusLabel} tone={gmailConfigured ? "positive" : "warning"} />
              </div>
              <form action={saveLocalSetup} className="mt-6 grid gap-4">
                <input name="databaseUrl" placeholder="DATABASE_URL" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
                <input name="openaiApiKey" placeholder="OPENAI_API_KEY (optional)" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
                <button className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white">Save local infrastructure</button>
              </form>
              <div className="mt-4 overflow-hidden rounded-xl border border-[#e3dccd] bg-white">
                <div className="border-b border-[#e3dccd] bg-[#fcfaf2] px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#687169]">Developer Diagnostics</p>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-sm leading-6 text-[#687169]">
                    End users only need to approve Google access. For developers running this product on a new host, ensure the callback URL below is registered in the product-owned Google Cloud Console.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-[#e3dccd] bg-[#fcfaf2] p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#687169]">Required Redirect URI</p>
                      <p className="mt-2 break-all rounded bg-white px-2 py-1 font-mono text-xs text-[#1e2521]">
                        {gmailConnection.readiness.expectedRedirectUri}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#e3dccd] bg-[#fcfaf2] p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#687169]">Environment Config</p>
                      <p className="mt-2 break-all rounded bg-white px-2 py-1 font-mono text-xs text-[#1e2521]">
                        {gmailConnection.readiness.configuredRedirectUri ?? "Managed by host"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-[#e3dccd] bg-white">
                <div className={`px-4 py-3 border-b border-[#e3dccd] flex items-center justify-between ${gmailConnection.isActive ? "bg-[#f3faf7]" : "bg-white"}`}>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#687169]">Google connection status</p>
                    <p className="mt-1 text-sm font-black text-[#1e2521]">{gmailConnection.statusLabel}</p>
                  </div>
                  {gmailConnection.isActive && (
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-[#cfe7de] shadow-sm">
                      <CheckCircle2 size={16} className="text-[#176b5d]" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm leading-6 text-[#687169]">{gmailConnection.statusDetail}</p>
                  {gmailConnection.connectedEmail ? (
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#176b5d]">
                      Connected account: {gmailConnection.connectedEmail}
                    </p>
                  ) : null}
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <StatusPillCard label="Labels synced" value={String(gmailConnection.labelCount)} tone={gmailConnection.labelCount > 0 ? "positive" : "neutral"} />
                    <StatusPillCard label="Recent drafts" value={String(gmailConnection.recentDraftCount)} tone={gmailConnection.recentDraftCount > 0 ? "positive" : "neutral"} />
                    <StatusPillCard
                      label="Snapshot"
                      value={gmailConnection.snapshotStatus ?? "Not started"}
                      tone={gmailConnection.snapshotStatus === "SYNCED" ? "positive" : gmailConnection.snapshotStatus === "FAILED" ? "warning" : "neutral"}
                    />
                  </div>
                  {gmailConnection.lastSyncedAt ? (
                    <p className="mt-2 text-xs text-[#687169]">Last synced: {formatStatusTimestamp(gmailConnection.lastSyncedAt)}</p>
                  ) : null}
                  {gmailConnection.lastSuccessfulSyncAt ? (
                    <p className="mt-2 text-xs text-[#687169]">Last successful Gmail data sync: {formatStatusTimestamp(gmailConnection.lastSuccessfulSyncAt)}</p>
                  ) : null}
                  {gmailConnection.lastAttemptedSyncAt ? (
                    <p className="mt-2 text-xs text-[#687169]">Last attempted Gmail data sync: {formatStatusTimestamp(gmailConnection.lastAttemptedSyncAt)}</p>
                  ) : null}
                  {gmailConnection.snapshotError ? (
                    <p className="mt-3 rounded-md bg-[#fff4eb] p-2 text-xs font-bold uppercase text-[#b2412d]">{gmailConnection.snapshotError}</p>
                  ) : null}
                  {gmailConnection.lastError ? (
                    <p className="mt-3 text-xs font-bold uppercase text-[#b2412d] bg-[#fff4eb] p-2 rounded-md">{gmailConnection.lastError}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/?view=gmail"
                      className="inline-flex h-11 items-center justify-center rounded-md border border-[#b9ddcf] bg-white px-5 text-sm font-black text-[#176b5d] transition-all hover:bg-[#f3faf7]"
                    >
                      Open Gmail access center
                    </Link>
                    {gmailRecoveryBlocked ? (
                      <span className="inline-flex h-11 items-center justify-center rounded-md border border-[#e3dccd] bg-[#f7f5ef] px-5 text-sm font-black text-[#9a9488]">
                        Re-authenticate Gmail
                      </span>
                    ) : (
                      <Link
                        href="/api/integrations/google/start?returnTo=/?view=setup"
                        className="inline-flex h-11 items-center justify-center rounded-md border border-[#d9d2c1] bg-white px-5 text-sm font-black text-[#1e2521] transition-all hover:bg-[#f7f5ef]"
                      >
                        Re-authenticate Gmail
                      </Link>
                    )}
                    {gmailConnection.connectedEmail ? (
                      <form action={refreshGoogleWorkspaceData}>
                        <button className="inline-flex h-11 items-center justify-center rounded-md border border-[#b9ddcf] bg-white px-5 text-sm font-black text-[#176b5d] hover:bg-[#f3faf7]">
                          Refresh Gmail data
                        </button>
                      </form>
                    ) : null}
                    {gmailConnection.connectedEmail ? (
                      <form action={disconnectGoogleConnection}>
                        <button className="inline-flex h-11 items-center justify-center rounded-md border border-transparent text-[#b2412d] px-5 text-sm font-black hover:bg-[#fff4eb]">
                          Disconnect
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <Panel icon={Sparkles} title="Operational checklist" subtitle="Use these steps to make the workspace healthy for a real operator">
              <div className="space-y-3">
                <ChecklistItem title="Link your database" detail="Required for saving leads, playbooks, approvals, discovery runs, and growth-tool conversions." />
                <ChecklistItem title="Add your OpenAI key" detail="Enables live research, audit, outreach, roast, competitor, and strategy generations." />
                <ChecklistItem title="Use Google sign-in first" detail="The workspace and Gmail draft bridge are auto-provisioned during real Google sign-in, so Setup is mainly for recovery." />
                <ChecklistItem title="Re-authenticate only for recovery" detail="Use Gmail recovery when a token expires, scopes drift, or you intentionally want to switch the connected Google account." />
                <ChecklistItem title="Create the sample workspace" detail="Use seeded examples first, then replace them with your own playbook and leads." />
                <ChecklistItem title="Start with playbook, then discovery" detail="The cleanest workflow is product context first, lead finding second, approvals and outcomes after." />
              </div>
              <form action={createSampleLead} className="mt-5">
                <button className="inline-flex h-11 items-center justify-center rounded-md border border-[#b9ddcf] bg-white px-4 text-sm font-black text-[#176b5d]">
                  Create sample workspace lead
                </button>
              </form>
            </Panel>
          </div>
        ) : null}

        {currentView === "guide" ? (
          <div className="max-w-3xl space-y-4">
            {glossary.map((item) => (
              <details key={item.term} className="rounded-xl border border-[#d2cab7] bg-[#fffdf8] p-4">
                <summary className="cursor-pointer list-none font-black">{item.term}</summary>
                <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{item.meaning}</p>
              </details>
            ))}
          </div>
        ) : null}

        {currentView === "roadmap" ? (
          <div className="max-w-3xl space-y-4">
            {roadmap.map((item, index) => (
              <div key={item} className="flex items-center gap-4 rounded-xl border border-[#d2cab7] bg-[#fffdf8] p-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#1e2521] text-xs font-black text-white">{index + 1}</span>
                <p className="text-sm font-black text-[#1e2521]">{item}</p>
              </div>
            ))}
          </div>
        ) : null}

        {currentView === "cat-platform" ? (
          <CategoryView 
            title="Revenue Platform"
            subtitle="Operational Foundation"
            description="Manage your revenue funnel, deal flow, and automated sequences from a single, high-fidelity command center."
            items={[
              { icon: LayoutDashboard, label: "Pipeline", detail: "Real-time visibility into your lead stages and conversion health.", href: "/dashboard?view=dashboard" },
              { icon: Zap, label: "Sequences", detail: "Multi-channel automated outreach flows across Email and SMS.", href: "/dashboard?view=sequences" },
              { icon: Building2, label: "CRM Hub", detail: "Centralized deal management and contact history tracking.", href: "/dashboard?view=crm" },
              { icon: ClipboardCheck, label: "Approvals", detail: "Human-in-the-loop review queue for prepared outreach.", href: "/dashboard?view=outreach" },
            ]}
          />
        ) : null}

        {currentView === "cat-growth" ? (
          <CategoryView 
            title="Growth Lab"
            subtitle="Intelligence & Audit"
            description="Leverage advanced intelligence audits and competitive research to build high-converting outbound playbooks."
            items={[
              { icon: Flame, label: "Roast Lab", detail: "Deep website teardowns and cognitive load audits for viral growth.", href: "/dashboard?view=roast" },
              { icon: Radar, label: "Competitor Spy", detail: "Real-time positioning voids and messaging differentiation matrices.", href: "/dashboard?view=competitor" },
              { icon: Lightbulb, label: "Growth Mode", detail: "Predictive 90-day strategy briefs and execution roadmaps.", href: "/dashboard?view=growth" },
              { icon: PenSquare, label: "Content Engine", detail: "Build authority with founder-grade content and thought leadership.", href: "/dashboard?view=content" },
              { icon: FileText, label: "Proposal Gen", detail: "Transform leads into deals with enterprise-grade proposal packages.", href: "/dashboard?view=proposal" },
            ]}
          />
        ) : null}

        {currentView === "cat-intel" ? (
          <CategoryView 
            title="Intelligence Hub"
            subtitle="Data & Discovery"
            description="Discover high-intent prospects and enrich your leads with deep-profile research and revenue signals."
            items={[
              { icon: Search, label: "Discovery", detail: "Find high-fit accounts and key decision makers across the web.", href: "/dashboard?view=intelligence" },
              { icon: Box, label: "Enrichment", detail: "Automatic data enrichment and social profile research for every lead.", href: "/dashboard?view=enrichment" },
              { icon: Target, label: "Playbook", detail: "Define your ICP, outreach tone, and core positioning pillars.", href: "/dashboard?view=targeting" },
              { icon: BarChart3, label: "Analytics", detail: "Deep-dive performance metrics and revenue attribution signals.", href: "/dashboard?view=analytics" },
            ]}
          />
        ) : null}

        {currentView === "cat-resources" ? (
          <CategoryView 
            title="Resources & Trust"
            subtitle="Ecosystem & Security"
            description="Explore our open-core architecture, upcoming roadmap, and enterprise-grade security protocols."
            items={[
              { icon: Github, label: "Open Source", detail: "Inspect our core architecture and contribute to the community.", href: "/dashboard?view=opensource" },
              { icon: GitBranch, label: "Roadmap", detail: "Track our upcoming feature releases and platform expansions.", href: "/dashboard?view=roadmap" },
              { icon: ShieldCheck, label: "Security", detail: "Manage workspace compliance, RBAC, and DNC suppression lists.", href: "/dashboard?view=security" },
              { icon: BookOpen, label: "Guides", detail: "Master the art of outbound growth with our technical playbooks.", href: "/dashboard?view=guide" },
              { icon: CreditCard, label: "Pricing", detail: "Compare plans and manage your workspace subscription.", href: "/dashboard?view=billing" },
            ]}
          />
        ) : null}

        {currentView === "sequences" ? (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-black text-[#1e2521]">Sequence Builder</h1>
                  <p className="mt-1 text-sm text-[#687169]">Design multi-step outbound flows across Email, LinkedIn, and SMS.</p>
                </div>
             </div>
             <SequenceBuilder />
          </div>
        ) : null}

        </ViewContainer>
      </div>

      <footer className="flex-shrink-0 border-t border-white/5 bg-[#02040a] px-4 py-3 backdrop-blur">
        <div className="flex flex-col items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#687169] lg:flex-row lg:gap-6">
          <p className="text-center text-white/40">© 2026 LeadForge AI • Architected by Karan Dangi</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/karandangi123" target="_blank" className="flex items-center gap-1.5 transition-colors text-white/30 hover:text-white">
              <GitPullRequest size={12} /> GitHub
            </a>
            <a href="https://linkedin.com/in/karan-dangi-4a672925b" target="_blank" className="flex items-center gap-1.5 transition-colors text-white/30 hover:text-[#22D3EE]">
              <UserCheck size={12} /> LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatusPillCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "warning" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "border-[#cfe7de] bg-[#f3faf7] text-[#176b5d]"
      : tone === "warning"
        ? "border-[#ecd7bd] bg-[#fff9f1] text-[#94602c]"
        : "border-[#d9d2c1] bg-white text-[#687169]";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-2 text-sm font-black">{value}</p>
    </div>
  );
}

function getSetupRunNotice(run?: string) {
  if (!run) {
    return null;
  }

  const notices: Record<string, string> = {
    "gmail-oauth-connected": "Google Gmail was refreshed successfully. Approved outreach can now be pushed into Gmail drafts again.",
    "gmail-sync-partial": "Google re-authentication worked, but LeadForge could not refresh Gmail labels and draft metadata yet. Inspect the sync error below and run a fresh sync.",
    "gmail-oauth-disconnected": "The Google Gmail connection was removed from this workspace.",
    "gmail-oauth-invalid": "The Google OAuth recovery callback could not be verified. Try the Gmail recovery flow again from Setup.",
    "gmail-oauth-unavailable": "Gmail connection is temporarily unavailable because the server-side Google app or workspace storage is not ready yet.",
    "gmail-oauth-failed": "Google Gmail could not be repaired right now. Check your OAuth app settings and try the recovery flow again.",
    "gmail-sync-refreshed": "Gmail labels and recent draft metadata were refreshed successfully for this workspace.",
    "gmail-sync-failed": "LeadForge could connect to Google, but the Gmail data refresh failed. Review the sync error and callback setup below.",
  };

  return notices[run] ?? null;
}

function formatStatusTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
