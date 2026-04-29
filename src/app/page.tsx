import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Compass,
  DatabaseZap,
  FileText,
  Gauge,
  GitBranch,
  HelpCircle,
  ListChecks,
  MailPlus,
  MessageSquareText,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
  GitPullRequest,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

import { runLeadDiscovery, saveCandidateLead, saveLocalSetup, saveWorkspacePlaybook } from "@/app/actions";
import { AddLeadForm } from "@/app/add-lead-form";
import { getDashboardLeads, getLeadMetrics } from "@/lib/leads";

const workflow = [
  {
    icon: Search,
    title: "Research",
    body: "Collects company facts, ICP fit signals, recent triggers, and source citations.",
  },
  {
    icon: Gauge,
    title: "Audit",
    body: "Scores site clarity, conversion friction, SEO basics, speed signals, and trust gaps.",
  },
  {
    icon: MessageSquareText,
    title: "Generate",
    body: "Creates outreach, follow-ups, Loom scripts, and CRM notes using approved prompts.",
  },
  {
    icon: ShieldCheck,
    title: "Approve",
    body: "Routes every external action through a human queue before drafts or syncs happen.",
  },
];

const roadmap = [
  "Gmail draft creation",
  "Airtable and HubSpot sync",
  "LangGraph orchestration",
  "Prompt evals in CI",
  "Agent trace viewer",
  "Outcome learning loop",
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
    term: "Stage",
    meaning: "Where the lead is in the workflow, such as research, drafted, approval, or ready.",
  },
  {
    term: "Agent",
    meaning: "The AI workflow step responsible for the current task.",
  },
  {
    term: "Next action",
    meaning: "The recommended step to open and move the lead forward.",
  },
  {
    term: "Approval",
    meaning: "A human review step before Gmail, CRM, Slack, or any external action.",
  },
  {
    term: "Trace",
    meaning: "A log of what an AI step did, including output, model, cost, and timing.",
  },
];

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string; view?: string }>;
}) {
  const leadState = await getDashboardLeads();
  const leads = leadState.leads;
  const agentRuns = getLeadMetrics(leads);
  const params = await searchParams;
  const leadNotice = getLeadNotice(params.lead);
  const currentView = params.view || "dashboard";

  return (
    <main className="min-h-screen">
      {/* Header with quick actions */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Command Center</h2>
          <p className="text-xs text-gray-500">Managing {leads.length} active autonomous research agents.</p>
        </div>
        <div className="flex items-center gap-3">
           <a
              href="#add-lead"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-sm"
            >
              <ArrowUpRight size={16} /> New Lead
            </a>
        </div>
      </header>

      <section className="p-8">
        {currentView === "dashboard" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Operations Hub</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">Monitor your autonomous research engine. Track active agent runs, overall fit accuracy, and real-time ROI across your entire pipeline.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {agentRuns.map((item) => (
                  <div key={item.label} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">{item.label}</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Live Pipeline</h3>
              </div>
              {/* Simplified Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-gray-50">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-gray-900">{lead.company}</p>
                          <p className="text-[10px] text-gray-400">{lead.website}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Link href={`/leads/${lead.id}`} className="text-xs font-bold text-emerald-600">Inspect ↗</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === "intelligence" && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Autonomous Discovery</h2>
              <p className="text-sm text-gray-500 mt-1">Set your target market and let LeadForge agents hunt for high-intent candidates across the web. No manual searching required.</p>
            </div>
            <LeadDiscoveryPanel discovery={leadState.discovery} databaseStatus={leadState.status} />
          </div>
        )}

        {currentView === "targeting" && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
             <div>
              <h2 className="text-2xl font-bold text-gray-900">Intelligence Playbook</h2>
              <p className="text-sm text-gray-500 mt-1">Train your agents by defining your product value and pain points. This context ensures every research run is laser-focused on your ICP.</p>
            </div>
            <PlaybookWizard playbook={leadState.playbook} databaseStatus={leadState.status} />
          </div>
        )}

        {currentView === "setup" && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
             <div>
              <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
              <p className="text-sm text-gray-500 mt-1">Transition from demo mode to a live production environment. Link your Postgres/Supabase database and secure your AI research nodes.</p>
            </div>
             <div className="p-8 rounded-3xl border border-gray-100 bg-white space-y-6">
                <div className="grid gap-px bg-gray-100 lg:grid-cols-2 rounded-2xl overflow-hidden">
                   <div className="bg-white p-6">
                      <h3 className="font-bold mb-4">Database Connection</h3>
                      <SetupStep done={leadState.status === "connected"} title="Status" detail={leadState.status === "connected" ? "Stable" : "Not Linked"} />
                   </div>
                   <div className="bg-white p-6">
                      <form action={saveLocalSetup} className="space-y-4">
                        <input name="databaseUrl" placeholder="DATABASE_URL" className="w-full p-3 rounded-lg border border-gray-100 text-sm" />
                        <button className="w-full bg-gray-900 text-white p-3 rounded-lg font-bold text-sm">Save & Link</button>
                      </form>
                   </div>
                </div>
             </div>
          </div>
        )}

        {currentView === "guide" && (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Expert Guide</h2>
              <p className="text-sm text-gray-500 mt-1">Master the LeadForge ecosystem. Understand the core terminology and learn how to optimize your autonomous research workflows.</p>
            </div>
            <div className="space-y-4">
            {glossary.map((item) => (
              <details key={item.term} className="group p-4 rounded-xl border border-gray-100 bg-white transition-all duration-200">
                <summary className="flex items-center justify-between font-bold text-gray-900 cursor-pointer list-none">
                  {item.term}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{item.meaning}</p>
              </details>
            ))}
          </div>
        </div>
      )}

        {currentView === "roadmap" && (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Future Vision</h2>
              <p className="text-sm text-gray-500 mt-1">Our transparent build sequence. From a local research MVP to an enterprise-grade, multi-agent growth infrastructure.</p>
            </div>
            <div className="space-y-3">
              {roadmap.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
                  <span className="size-8 flex items-center justify-center rounded-lg bg-gray-900 text-white text-xs font-bold">{i+1}</span>
                  <p className="text-sm font-bold text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Unified Masterpiece Signature Bar */}
      <footer className="sticky bottom-0 z-20 border-t border-gray-100 bg-white/80 backdrop-blur-md py-2">
        <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
          <p>© 2026 LeadForge AI • Architected by Karan Dangi</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/karandangi123" target="_blank" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
              <GitPullRequest size={12} /> GitHub
            </a>
            <a href="https://linkedin.com/in/karan-dangi-4a672925b" target="_blank" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <UserCheck size={12} /> LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function getLeadNotice(status?: string) {
  if (status === "created") return "Lead saved. It is now queued for AI research.";
  if (status === "invalid") return "Lead was not saved. Check the company, website URL, and email format.";
  if (status === "db-not-configured") return "Add DATABASE_URL and run the Prisma migration before saving leads.";
  if (status === "db-unavailable") return "DATABASE_URL is set, but the app could not create a sample lead.";
  if (status === "setup-invalid") return "Setup was not saved. Paste a valid Postgres or Supabase DATABASE_URL.";
  if (status === "setup-failed") return "Setup could not complete. Check the database URL.";
  if (status === "playbook-saved") return "Workspace playbook saved.";
  if (status === "playbook-invalid") return "Playbook was not saved. Fill the required fields.";
  if (status === "discovery-created") return "Lead discovery run created.";
  if (status === "discovery-invalid") return "Discovery was not started.";
  if (status === "candidate-duplicate") return "That candidate was already saved as a lead.";
  return null;
}

function PlaybookWizard({ playbook, databaseStatus }: { playbook: any; databaseStatus: any }) {
  const disabled = databaseStatus !== "connected";
  return (
    <div className="p-8 rounded-3xl border border-gray-100 bg-white space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Intelligence Playbook</h3>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100 uppercase tracking-widest">{playbook.status}</span>
      </div>
      <form action={saveWorkspacePlaybook} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="product" placeholder="Product name" defaultValue={playbook.product} disabled={disabled} className="p-3 rounded-lg border border-gray-100 text-sm w-full" />
          <input name="idealCustomer" placeholder="ICP" defaultValue={playbook.idealCustomer} disabled={disabled} className="p-3 rounded-lg border border-gray-100 text-sm w-full" />
        </div>
        <textarea name="pains" placeholder="Pain points" defaultValue={playbook.pains.join("\n")} disabled={disabled} className="w-full p-3 rounded-lg border border-gray-100 text-sm" rows={3} />
        <button type="submit" disabled={disabled} className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-200">Save Context</button>
      </form>
    </div>
  );
}

function LeadDiscoveryPanel({ discovery, databaseStatus }: { discovery: any; databaseStatus: any }) {
  const disabled = databaseStatus !== "connected";
  return (
    <div className="p-8 rounded-3xl border border-gray-100 bg-white space-y-6">
      <h3 className="text-xl font-bold">Autonomous Discovery</h3>
      <form action={runLeadDiscovery} className="space-y-4">
        <input name="targetMarket" placeholder="Target market (e.g. Healthcare SaaS)" defaultValue={discovery.targetMarket} disabled={disabled} className="w-full p-3 rounded-lg border border-gray-100 text-sm" />
        <button type="submit" disabled={disabled} className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors disabled:bg-gray-200">Find Leads</button>
      </form>
      {discovery.candidates.length > 0 && (
        <div className="pt-4 border-t border-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top Candidates</p>
          <div className="space-y-2">
            {discovery.candidates.slice(0, 3).map((c: any) => (
              <div key={c.company} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-sm font-bold text-gray-700">{c.company}</span>
                <span className="text-xs font-bold text-emerald-600">{c.score}% Match</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SetupStep({ done, title, detail }: { done: boolean; title: string; detail: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-[#e3dccd] bg-white p-3">
      {done ? (
        <CheckCircle2 className="mt-0.5 shrink-0 text-[#176b5d]" size={18} />
      ) : (
        <XCircle className="mt-0.5 shrink-0 text-[#9a6a2f]" size={18} />
      )}
      <div>
        <p className="text-sm font-black">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#687169]">{detail}</p>
      </div>
    </div>
  );
}
