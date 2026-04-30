import {
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  Crosshair,
  FileText,
  Flame,
  Gauge,
  GitPullRequest,
  Lightbulb,
  PenSquare,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
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
  saveLocalSetup,
} from "@/app/actions";
import { getDefaultWorkspaceGmailConnectionState } from "@/lib/integration-connections";
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
    meaning: "A log of what an AI or operator step did, including output, model, cost, and timing.",
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<PageParams>;
}) {
  const leadState = await getDashboardLeads();
  const gmailConnection = await getDefaultWorkspaceGmailConnectionState();
  const params = await searchParams;
  const currentView = params.view || "dashboard";
  const gmailConfigured = gmailConnection.status === "connected";
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
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

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#1e2521]">
      <header className="sticky top-0 z-10 border-b border-[#d9d2c1] bg-[#f7f5ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <h2 className="text-xl font-black tracking-tight">LeadForge AI</h2>
            <p className="text-xs text-[#687169]">{leadState.message}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#add-lead"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#176b5d] px-4 text-sm font-black text-white transition hover:bg-[#115247]"
            >
              <ArrowRight size={16} /> Add lead
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8">
        {currentView === "dashboard" ? (
          <div className="space-y-6">
            <section className="premium-card p-8 animate-fade-in">
              <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-[#cfe7de] bg-[#f3faf7] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#176b5d]">
                    <Sparkles size={14} /> Pipeline command layer
                  </p>
                  <h1 className="mt-6 py-1 text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">A visibly complete lead workflow.</h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-[#4f5a53] sm:text-lg">
                    Move from playbook and discovery into pipeline management, approvals, and outcome tracking without losing the human review boundary.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link href="/?view=roast" className="premium-button-primary">
                      Try Roast Lab
                    </Link>
                    <Link href="/?view=targeting" className="premium-button-secondary">
                      Create playbook
                    </Link>
                    <Link href="/?view=intelligence" className="premium-button-secondary">
                      Find leads
                    </Link>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {agentRuns.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-[#e3dccd] bg-white p-5 transition-all hover:border-[#176b5d]">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">{item.label}</p>
                      <p className="mt-2 text-4xl font-black text-[#1e2521]">{item.value}</p>
                      <p className="mt-1 text-xs font-bold text-[#176b5d]">{item.delta}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Panel icon={Sparkles} title="Quick actions launcher" subtitle="Direct entry points for the surfaces users can use immediately">
                <div className="grid gap-3 md:grid-cols-2">
                  <QuickActionCard href="/?view=roast" title="Roast a website" detail="Generate a page teardown, rewrites, and revenue opportunity estimate." />
                  <QuickActionCard href="/?view=competitor" title="Analyze a competitor" detail="Break down positioning, CTA patterns, and differentiation moves." />
                  <QuickActionCard href="/?view=growth" title="Generate a growth brief" detail="Turn one business goal into a 90-day execution plan." />
                  <QuickActionCard href="/?view=content" title="Build content engine" detail="Generate founder-grade content pillars, posts, CTAs, and a weekly publishing system." />
                  <QuickActionCard href="/?view=proposal" title="Generate proposal" detail="Create a client-facing proposal package with scope, timeline, pricing, and cover email." />
                  <QuickActionCard href="/?view=targeting" title="Create a playbook" detail="Save product, ICP, pains, proof, and tone before running AI steps." />
                  <QuickActionCard href="#add-lead" title="Import leads" detail="Add leads manually or by CSV and route them into the board." />
                  <QuickActionCard href="/?view=intelligence" title="Run discovery" detail="Create a compliant query plan and score candidate leads." />
                </div>
              </Panel>

              <Panel icon={ShieldCheck} title="Why operators trust this" subtitle="The product is built for direct use, not demo-only AI outputs">
                <div className="space-y-3">
                  <TrustLine title="Interactive demo mode" detail="Seeded leads, roast flows, and strategy surfaces remain usable before infrastructure is connected." />
                  <TrustLine title="Human approval boundary" detail="Generated work stays reviewable before any Gmail, CRM, Slack, or webhook-style action moves forward." />
                  <TrustLine title="Compliant discovery stance" detail="LeadForge avoids stealth automation and keeps LinkedIn firmly in the manual-import-only lane." />
                  <TrustLine title="Trace and eval visibility" detail="Every serious workflow can surface model, quality, and operator history when you need it." />
                </div>
              </Panel>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Panel icon={Target} title="Who this product is for" subtitle="Built for people who need usable outputs inside the app, not just prompts">
                <div className="grid gap-3 md:grid-cols-2">
                  {useCases.map((item) => (
                    <div key={item.title} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                      <p className="text-sm font-black text-[#1e2521]">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel icon={ArrowRight} title="The operating loop" subtitle="How the product should feel from first click to learning signal">
                <div className="space-y-3">
                  {operatingLoop.map((item, index) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl border border-[#e3dccd] bg-white p-4">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1e2521] text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-[#4f5a53]">{item}</p>
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
        ) : null}

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

        {currentView === "security" ? (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <Panel icon={ShieldCheck} title="Security & evals" subtitle="Quality boundaries already present in the MVP">
              <div className="grid gap-4 sm:grid-cols-2">
                {leadState.agentAnalytics.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">{metric.label}</p>
                    <p className="mt-2 text-3xl font-black">{metric.value}</p>
                    <p className="mt-1 text-xs text-[#687169]">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel icon={Gauge} title="Learning signals" subtitle="What the current evals and outcomes are telling us">
              <div className="space-y-3">
                {leadState.agentAnalytics.signals.map((signal) => (
                  <div key={signal.label} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-sm font-black">{signal.label}</p>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        ) : null}

        {currentView === "setup" ? (
          <div className="grid max-w-6xl gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-6">
              <p className="text-xs font-black uppercase text-[#176b5d]">Setup</p>
              <h2 className="mt-1 text-2xl font-black leading-tight">System configuration</h2>
              <p className="mt-2 text-sm text-[#687169]">Link Postgres, OpenAI, and Google Gmail so the workspace can save real leads, run live generations, and create approval-safe Gmail drafts without sending them.</p>
              {getSetupRunNotice(params.run) ? (
                <div className="mt-4 rounded-xl border border-[#cfe7de] bg-[#f3faf7] p-4 text-sm font-medium text-[#176b5d]">
                  {getSetupRunNotice(params.run)}
                </div>
              ) : null}
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <StatusPillCard label="Database" value={databaseConfigured ? "Connected" : "Not configured"} tone={databaseConfigured ? "positive" : "warning"} />
                <StatusPillCard label="OpenAI" value={openAiConfigured ? "Configured" : "Fallback mode"} tone={openAiConfigured ? "positive" : "neutral"} />
                <StatusPillCard label="Gmail Drafts" value={gmailConfigured ? "Configured" : "Not configured"} tone={gmailConfigured ? "positive" : "warning"} />
              </div>
              <form action={saveLocalSetup} className="mt-6 grid gap-4">
                <input name="databaseUrl" placeholder="DATABASE_URL" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
                <input name="openaiApiKey" placeholder="OPENAI_API_KEY (optional)" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
                <button className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white">Save and link</button>
              </form>
              <div className="mt-8 border-t border-[#e3dccd] pt-6">
                <p className="text-xs font-black uppercase text-[#176b5d]">Google Gmail OAuth</p>
                <p className="mt-2 text-sm text-[#687169]">
                  Configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then register the callback URL
                  <span className="mx-1 rounded bg-[#f7f5ef] px-1.5 py-0.5 font-mono text-xs text-[#1e2521]">
                    {process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "http://localhost:3000/api/integrations/google/callback"}
                  </span>
                  in your Google Cloud OAuth app.
                </p>
                <div className="mt-4 rounded-xl border border-[#e3dccd] bg-white p-4">
                  <p className="text-xs font-black uppercase text-[#687169]">Connection status</p>
                  <p className="mt-2 text-sm font-black text-[#1e2521]">
                    {gmailConnection.status === "connected"
                      ? gmailConnection.connectedEmail
                        ? `Connected to ${gmailConnection.connectedEmail}`
                        : "Connected"
                      : gmailConnection.status === "missing_oauth_config"
                        ? "OAuth credentials missing"
                        : gmailConnection.status === "expired"
                          ? "Connection expired"
                          : gmailConnection.status === "error"
                            ? "Connection needs attention"
                            : "Not connected"}
                  </p>
                  <p className="mt-2 text-sm text-[#687169]">
                    {gmailConnection.status === "connected"
                      ? "Approved outreach can now be pushed into Gmail drafts, and refresh tokens are stored at the workspace layer."
                      : "Use Connect Google Gmail after your database and OAuth credentials are in place."}
                  </p>
                  {gmailConnection.lastError ? (
                    <p className="mt-3 text-xs font-bold uppercase text-[#b2412d]">{gmailConnection.lastError}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/api/integrations/google/start?returnTo=/?view=setup"
                      className="inline-flex h-11 items-center justify-center rounded-md bg-[#1e2521] px-5 text-sm font-black text-white"
                    >
                      Connect Google Gmail
                    </Link>
                    {gmailConnection.status === "connected" ? (
                      <form action={disconnectGoogleConnection}>
                        <button className="inline-flex h-11 items-center justify-center rounded-md border border-[#d9d2c1] bg-white px-5 text-sm font-black text-[#1e2521]">
                          Disconnect Gmail
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <Panel icon={Sparkles} title="Onboarding checklist" subtitle="Use these steps to make the product directly usable for a real operator">
              <div className="space-y-3">
                <ChecklistItem title="Link your database" detail="Required for saving leads, playbooks, approvals, discovery runs, and growth-tool conversions." />
                <ChecklistItem title="Add your OpenAI key" detail="Enables live research, audit, outreach, roast, competitor, and strategy generations." />
                <ChecklistItem title="Configure Gmail draft access" detail="Enables the first real external workflow: create Gmail drafts only after reviewer approval, never auto-send." />
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
      </section>

      <footer className="sticky bottom-0 z-20 border-t border-[#d9d2c1] bg-[#f7f5ef]/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-col items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#687169] lg:flex-row lg:gap-6">
          <p className="text-center">© 2026 LeadForge AI • Architected by Karan Dangi</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/karandangi123" target="_blank" className="flex items-center gap-1.5 transition-colors hover:text-[#1e2521]">
              <GitPullRequest size={12} /> GitHub
            </a>
            <a href="https://linkedin.com/in/karan-dangi-4a672925b" target="_blank" className="flex items-center gap-1.5 transition-colors hover:text-[#176b5d]">
              <UserCheck size={12} /> LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
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
    "gmail-oauth-connected": "Google Gmail connected successfully. Approved outreach can now be pushed into Gmail drafts.",
    "gmail-oauth-disconnected": "The Google Gmail connection was removed from this workspace.",
    "gmail-oauth-invalid": "The Google OAuth callback could not be verified. Try connecting again from Setup.",
    "gmail-oauth-unavailable": "Add your database connection plus Google OAuth credentials before starting the Gmail connection flow.",
    "gmail-oauth-failed": "Google Gmail could not be connected right now. Check your OAuth app settings and try again.",
  };

  return notices[run] ?? null;
}
