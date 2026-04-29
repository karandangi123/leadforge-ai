import {
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  Crosshair,
  Filter,
  Flame,
  Gauge,
  GitPullRequest,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

import { AddLeadForm } from "@/app/add-lead-form";
import { CompetitorSpyForm } from "@/app/competitor-spy-form";
import { GrowthModeForm } from "@/app/growth-mode-form";
import { WebsiteRoastForm } from "@/app/website-roast-form";
import {
  approveLeadWork,
  moveLeadStage,
  rejectLeadWork,
  runLeadDiscovery,
  saveCandidateLead,
  saveLocalSetup,
  saveWorkspacePlaybook,
} from "@/app/actions";
import {
  getDashboardLeads,
  getLeadMetrics,
  type ApprovalQueueItem,
  type DashboardLead,
  type DiscoveryState,
  type LeadDataState,
  type PipelineColumn,
  type WorkspacePlaybookState,
} from "@/lib/leads";

const roadmap = [
  "Pipeline board and approval queue",
  "Roast My Website viral demo surface",
  "Competitor Spy positioning brief",
  "One Prompt Growth Mode strategy brief",
  "Editable lead workspace and timeline",
  "CSV import with duplicate handling",
  "External provider adapters after approval",
  "Prompt evals in CI",
  "Trace viewer and analytics expansion",
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
  view?: string;
  search?: string;
  stage?: string;
  source?: string;
  fit?: string;
  pending?: string;
  approvalStatus?: string;
  assetType?: string;
};

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<PageParams>;
}) {
  const leadState = await getDashboardLeads();
  const params = await searchParams;
  const currentView = params.view || "dashboard";
  const pipelineFilter = {
    search: params.search?.trim().toLowerCase() ?? "",
    stage: params.stage ?? "ALL",
    source: params.source ?? "ALL",
    fit: params.fit ?? "ALL",
    pendingOnly: params.pending === "1",
  };
  const approvalFilter = {
    approvalStatus: params.approvalStatus ?? "PENDING",
    assetType: params.assetType ?? "ALL",
  };

  const filteredPipelineColumns = leadState.pipelineColumns.map((column) => ({
    ...column,
    leads: column.leads.filter((lead) => matchesPipelineFilter(lead, pipelineFilter)),
  }));
  const visibleLeads = filteredPipelineColumns.flatMap((column) => column.leads);
  const agentRuns = getLeadMetrics(visibleLeads.length > 0 ? visibleLeads : leadState.leads);
  const visibleApprovalQueue = leadState.approvalQueue.filter((item) => matchesApprovalFilter(item, approvalFilter));

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
            <section className="rounded-[28px] border border-[#d2cab7] bg-[#fffdf8] p-6 shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
              <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-[#cfe7de] bg-[#f3faf7] px-3 py-2 text-xs font-black uppercase text-[#176b5d]">
                    <Sparkles size={14} /> Pipeline command layer
                  </p>
                  <h1 className="mt-4 py-1 text-3xl font-black leading-[1.08] sm:text-5xl">A visibly complete lead workflow in one command surface.</h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4f5a53] sm:text-base">
                    Move from playbook and discovery into pipeline management, approvals, and outcome tracking without losing the human review boundary.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {agentRuns.map((item) => (
                    <div key={item.label} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">{item.label}</p>
                      <p className="mt-2 text-3xl font-black">{item.value}</p>
                      <p className="mt-1 text-xs text-[#687169]">{item.delta}</p>
                    </div>
                  ))}
                </div>
              </div>
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
          <div className="max-w-4xl">
            <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-6">
              <p className="text-xs font-black uppercase text-[#176b5d]">Setup</p>
              <h2 className="mt-1 text-2xl font-black leading-tight">System configuration</h2>
              <p className="mt-2 text-sm text-[#687169]">Link Postgres and your OpenAI key so the workspace can save real leads and run live generations.</p>
              <form action={saveLocalSetup} className="mt-6 grid gap-4">
                <input name="databaseUrl" placeholder="DATABASE_URL" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
                <input name="openaiApiKey" placeholder="OPENAI_API_KEY (optional)" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
                <button className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white">Save and link</button>
              </form>
            </section>
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

function PipelineFilterBar({
  leadState,
  currentFilter,
}: {
  leadState: LeadDataState;
  currentFilter: {
    search: string;
    stage: string;
    source: string;
    fit: string;
    pendingOnly: boolean;
  };
}) {
  return (
    <form className="grid gap-2 rounded-xl border border-[#e3dccd] bg-white p-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
      <input type="hidden" name="view" value="dashboard" />
      <input
        name="search"
        defaultValue={currentFilter.search}
        placeholder="Search company or tag"
        className="h-10 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm"
      />
      <select name="stage" defaultValue={currentFilter.stage} className="h-10 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
        <option value="ALL">All stages</option>
        {leadState.filters.stages.map((stage) => (
          <option key={stage.value} value={stage.value}>
            {stage.label}
          </option>
        ))}
      </select>
      <select name="source" defaultValue={currentFilter.source} className="h-10 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
        <option value="ALL">All sources</option>
        {leadState.filters.sources.map((source) => (
          <option key={source} value={source}>
            {source}
          </option>
        ))}
      </select>
      <select name="fit" defaultValue={currentFilter.fit} className="h-10 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
        <option value="ALL">All fit bands</option>
        <option value="0-49">0-49</option>
        <option value="50-74">50-74</option>
        <option value="75-100">75-100</option>
      </select>
      <label className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
        <input type="checkbox" name="pending" value="1" defaultChecked={currentFilter.pendingOnly} className="accent-[#176b5d]" />
        Pending only
      </label>
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1e2521] px-4 text-sm font-black text-white">
        <Filter size={14} /> Apply
      </button>
    </form>
  );
}

function PipelineColumnView({
  column,
}: {
  column: PipelineColumn;
}) {
  return (
    <section className="flex min-h-[620px] flex-col rounded-2xl border border-[#d2cab7] bg-[#fffdf8]">
      <div className="border-b border-[#e3dccd] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-black">{column.label}</p>
          <span className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">{column.count}</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#687169]">{column.description}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase text-[#687169]">
          <div className="rounded-lg bg-white px-2 py-2 text-center">Fit {column.avgFit}</div>
          <div className="rounded-lg bg-white px-2 py-2 text-center">Audit {column.avgAudit}</div>
          <div className="rounded-lg bg-white px-2 py-2 text-center">Pending {column.pendingApprovals}</div>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-3">
        {column.leads.length > 0 ? column.leads.map((lead) => <LeadCard key={lead.id} lead={lead} />) : <EmptyState text="No leads match this stage and filter combination." compact />}
      </div>
    </section>
  );
}

function LeadCard({
  lead,
}: {
  lead: DashboardLead;
}) {
  const previousStage = getAdjacentStage(lead.status, -1);
  const nextStage = getAdjacentStage(lead.status, 1);

  return (
    <article className="rounded-xl border border-[#e3dccd] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/leads/${lead.id}`} className="text-sm font-black text-[#1e2521] hover:text-[#176b5d]">
            {lead.company}
          </Link>
          <p className="mt-1 text-xs text-[#687169]">{lead.segment}</p>
        </div>
        {lead.hasPendingApproval ? (
          <span className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">Pending</span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {lead.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-[#f7f5ef] px-2 py-1 text-[10px] font-black uppercase text-[#687169]">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Metric label="Fit" value={lead.fit == null ? "-" : `${lead.fit}`} />
        <Metric label="Audit" value={lead.audit == null ? "-" : `${lead.audit}`} />
      </div>

      <div className="mt-3 space-y-2 text-xs text-[#4f5a53]">
        <p>
          <span className="font-black text-[#1e2521]">Owner:</span> {lead.owner}
        </p>
        <p>
          <span className="font-black text-[#1e2521]">Source:</span> {lead.source}
        </p>
        <p className="line-clamp-3">
          <span className="font-black text-[#1e2521]">Next:</span> {lead.next}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/leads/${lead.id}`} className="inline-flex h-9 items-center justify-center rounded-md border border-[#b9ddcf] px-3 text-xs font-black text-[#176b5d]">
          Open lead
        </Link>
        {previousStage ? (
          <form action={moveLeadStage}>
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="status" value={previousStage} />
            <input type="hidden" name="manualStatusReason" value="Moved backward from the pipeline board." />
            <input type="hidden" name="returnTo" value="/?view=dashboard" />
            <button className="inline-flex h-9 items-center justify-center rounded-md border border-[#d9d2c1] px-3 text-xs font-black text-[#1e2521]">Back</button>
          </form>
        ) : null}
        {nextStage ? (
          <form action={moveLeadStage}>
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="status" value={nextStage} />
            <input type="hidden" name="manualStatusReason" value="Moved forward from the pipeline board." />
            <input type="hidden" name="returnTo" value="/?view=dashboard" />
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-[#1e2521] px-3 text-xs font-black text-white">Forward</button>
          </form>
        ) : null}
      </div>
    </article>
  );
}

function ApprovalFilterBar({
  items,
  currentFilter,
}: {
  items: ApprovalQueueItem[];
  currentFilter: { approvalStatus: string; assetType: string };
}) {
  const assetTypes = Array.from(new Set(items.map((item) => item.assetType))).sort();
  return (
    <form className="grid gap-2 rounded-xl border border-[#e3dccd] bg-white p-3 lg:grid-cols-[1fr_1fr_auto]">
      <input type="hidden" name="view" value="outreach" />
      <select name="approvalStatus" defaultValue={currentFilter.approvalStatus} className="h-10 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
        <option value="ALL">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>
      <select name="assetType" defaultValue={currentFilter.assetType} className="h-10 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
        <option value="ALL">All asset types</option>
        {assetTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1e2521] px-4 text-sm font-black text-white">
        <Filter size={14} /> Apply
      </button>
    </form>
  );
}

function ApprovalQueueCard({
  item,
  disabled,
}: {
  item: ApprovalQueueItem;
  disabled: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5 shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-[#176b5d]">{item.assetType}</p>
          <h3 className="mt-1 text-xl font-black">{item.leadName}</h3>
          <p className="mt-2 text-sm text-[#687169]">{item.requestedAction}</p>
        </div>
        <span className="rounded-full bg-[#f3faf7] px-3 py-1 text-[10px] font-black uppercase text-[#176b5d]">{item.status}</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#687169]">Content preview</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#4f5a53]">{item.contentPreview}</p>
          {item.notes ? (
            <p className="mt-3 rounded-lg bg-[#f7f5ef] px-3 py-3 text-xs leading-5 text-[#4f5a53]">
              <span className="font-black text-[#1e2521]">Reviewer note:</span> {item.notes}
            </p>
          ) : null}
        </div>
        <div className="space-y-3 rounded-xl border border-[#e3dccd] bg-white p-4">
          <DetailRow label="Lead stage" value={item.leadStage} />
          <DetailRow label="Created" value={item.createdAt} />
          <DetailRow label="Decision" value={item.decidedAt ?? "Pending"} />
          <div>
            <p className="text-xs font-black uppercase text-[#687169]">Sync preview</p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-[#4f5a53]">
              {item.syncPreview.map((detail) => (
                <li key={detail}>• {detail}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/leads/${item.leadId}`} className="inline-flex h-10 items-center justify-center rounded-md border border-[#b9ddcf] px-4 text-sm font-black text-[#176b5d]">
          Open lead
        </Link>
        {item.status === "PENDING" ? (
          <>
            <form action={approveLeadWork}>
              <input type="hidden" name="leadId" value={item.leadId} />
              <input type="hidden" name="approvalId" value={item.id} />
              <input type="hidden" name="returnTo" value="/?view=outreach" />
              <button disabled={disabled} className="inline-flex h-10 items-center justify-center rounded-md bg-[#176b5d] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[#9da59f]">
                Approve
              </button>
            </form>
            <form action={rejectLeadWork}>
              <input type="hidden" name="leadId" value={item.leadId} />
              <input type="hidden" name="approvalId" value={item.id} />
              <input type="hidden" name="returnTo" value="/?view=outreach" />
              <button disabled={disabled} className="inline-flex h-10 items-center justify-center rounded-md border border-[#d9d2c1] px-4 text-sm font-black text-[#1e2521] disabled:cursor-not-allowed disabled:text-[#9da59f]">
                Reject
              </button>
            </form>
          </>
        ) : null}
      </div>
    </article>
  );
}

function PlaybookWizard({ playbook, databaseStatus }: { playbook: WorkspacePlaybookState; databaseStatus: LeadDataState["status"] }) {
  const disabled = databaseStatus !== "connected";
  return (
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase text-[#176b5d]">Playbook</p>
          <h2 className="mt-1 text-2xl font-black">Product + ICP setup</h2>
        </div>
        <span className="rounded-full bg-[#f3faf7] px-3 py-1 text-[10px] font-black uppercase text-[#176b5d]">{playbook.status}</span>
      </div>
      <form action={saveWorkspacePlaybook} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="product" placeholder="Product name" defaultValue={playbook.product} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
          <input name="idealCustomer" placeholder="Ideal customer" defaultValue={playbook.idealCustomer} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <textarea name="industries" defaultValue={playbook.industries.join("\n")} disabled={disabled} rows={4} placeholder="Industries" className="rounded-md border border-[#d9d2c1] bg-white px-4 py-3 text-sm" />
          <textarea name="pains" defaultValue={playbook.pains.join("\n")} disabled={disabled} rows={4} placeholder="Pain points" className="rounded-md border border-[#d9d2c1] bg-white px-4 py-3 text-sm" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <textarea name="proofPoints" defaultValue={playbook.proofPoints.join("\n")} disabled={disabled} rows={4} placeholder="Proof points" className="rounded-md border border-[#d9d2c1] bg-white px-4 py-3 text-sm" />
          <textarea name="positioning" defaultValue={playbook.positioning ?? ""} disabled={disabled} rows={4} placeholder="Positioning" className="rounded-md border border-[#d9d2c1] bg-white px-4 py-3 text-sm" />
        </div>
        <input name="tone" placeholder="Tone" defaultValue={playbook.tone} disabled={disabled} className="h-12 w-full rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
        <button type="submit" disabled={disabled} className="inline-flex h-11 items-center justify-center rounded-md bg-[#1e2521] px-5 text-sm font-black text-white disabled:bg-[#9da59f]">
          Save playbook
        </button>
      </form>
    </section>
  );
}

function LeadDiscoveryPanel({ discovery, databaseStatus }: { discovery: DiscoveryState; databaseStatus: LeadDataState["status"] }) {
  const disabled = databaseStatus !== "connected";
  return (
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-6">
      <p className="text-xs font-black uppercase text-[#176b5d]">Discovery</p>
      <h2 className="mt-1 text-2xl font-black">Autonomous lead discovery</h2>
      <p className="mt-2 text-sm text-[#687169]">Generate a compliant query plan, inspect candidate evidence, then save only the leads worth moving into the pipeline.</p>

      <form action={runLeadDiscovery} className="mt-6 flex flex-col gap-3 md:flex-row">
        <input name="targetMarket" defaultValue={discovery.targetMarket} disabled={disabled} placeholder="Target market (e.g. Healthcare SaaS)" className="h-12 flex-1 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
        <button type="submit" disabled={disabled} className="inline-flex h-12 items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white disabled:bg-[#9da59f]">
          Find leads
        </button>
      </form>

      {discovery.queryPlan.length > 0 ? (
        <div className="mt-6 rounded-xl border border-[#e3dccd] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#687169]">Query plan</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4f5a53]">
            {discovery.queryPlan.map((query) => (
              <li key={query}>• {query}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        {discovery.candidates.length > 0 ? (
          discovery.candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-black">{candidate.company}</p>
                  <p className="mt-1 text-xs text-[#687169]">
                    {candidate.segment} • {candidate.sourceType}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{candidate.reason}</p>
                  <ul className="mt-3 space-y-1 text-sm leading-6 text-[#4f5a53]">
                    {candidate.evidence.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="min-w-[140px] rounded-xl border border-[#d9d2c1] bg-[#fffdf8] p-3 text-center">
                  <p className="text-[10px] font-black uppercase text-[#687169]">Fit score</p>
                  <p className="mt-2 text-3xl font-black">{candidate.fitScore}</p>
                  <form action={saveCandidateLead} className="mt-3">
                    <input type="hidden" name="candidateId" value={candidate.id} />
                    <button disabled={disabled || Boolean(candidate.savedLeadId)} className="inline-flex h-10 items-center justify-center rounded-md bg-[#1e2521] px-3 text-xs font-black text-white disabled:bg-[#9da59f]">
                      {candidate.savedLeadId ? "Saved" : "Save to pipeline"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState text="Run discovery with a target market to generate candidate leads and save the best ones into the pipeline." />
        )}
      </div>
    </section>
  );
}

function Panel({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
      <div className="flex items-start gap-3 border-b border-[#e3dccd] pb-4">
        <Icon className="mt-1 text-[#176b5d]" size={20} />
        <div>
          <h2 className="py-0.5 text-xl font-black leading-tight">{title}</h2>
          <p className="mt-1 text-sm text-[#687169]">{subtitle}</p>
        </div>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f7f5ef] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#687169]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#1e2521]">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-[#687169]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[#4f5a53]">{value}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-xs font-black uppercase text-[#687169]">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4f5a53]">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({
  text,
  compact,
}: {
  text: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-dashed border-[#d2cab7] bg-white/70 text-[#687169] ${compact ? "p-4 text-xs" : "p-6 text-sm"}`}>
      {text}
    </div>
  );
}

function matchesPipelineFilter(
  lead: DashboardLead,
  filter: {
    search: string;
    stage: string;
    source: string;
    fit: string;
    pendingOnly: boolean;
  },
) {
  const matchesSearch =
    !filter.search ||
    [lead.company, lead.segment, lead.source, lead.owner, ...lead.tags].some((value) => value.toLowerCase().includes(filter.search));
  const matchesStage = filter.stage === "ALL" || lead.status === filter.stage;
  const matchesSource = filter.source === "ALL" || lead.source === filter.source;
  const matchesPending = !filter.pendingOnly || lead.hasPendingApproval;
  const fitValue = lead.fit ?? -1;
  const matchesFit =
    filter.fit === "ALL" ||
    (filter.fit === "0-49" && fitValue >= 0 && fitValue <= 49) ||
    (filter.fit === "50-74" && fitValue >= 50 && fitValue <= 74) ||
    (filter.fit === "75-100" && fitValue >= 75 && fitValue <= 100);

  return matchesSearch && matchesStage && matchesSource && matchesPending && matchesFit;
}

function matchesApprovalFilter(item: ApprovalQueueItem, filter: { approvalStatus: string; assetType: string }) {
  const statusMatch = filter.approvalStatus === "ALL" || item.status === filter.approvalStatus;
  const assetMatch = filter.assetType === "ALL" || item.assetType === filter.assetType;
  return statusMatch && assetMatch;
}

function getAdjacentStage(status: DashboardLead["status"], offset: -1 | 1) {
  const statuses = ["NEW", "RESEARCH", "AUDIT", "DRAFTED", "APPROVAL", "READY", "SYNCED", "REJECTED"] as const;
  const index = statuses.indexOf(status);
  const target = statuses[index + offset];
  return target ?? null;
}
