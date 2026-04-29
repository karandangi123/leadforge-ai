import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  FileText,
  Gauge,
  GitBranch,
  HelpCircle,
  MailPlus,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

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
  searchParams: Promise<{ lead?: string }>;
}) {
  const leadState = await getDashboardLeads();
  const leads = leadState.leads;
  const agentRuns = getLeadMetrics(leads);
  const params = await searchParams;
  const leadNotice = getLeadNotice(params.lead);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#1e2521]">
      <section className="border-b border-[#d9d2c1] bg-[#f7f5ef]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#1e2521] text-[#f7f5ef]">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-bold">LeadForge AI</p>
              <p className="text-xs text-[#687169]">Open-source AI RevOps agent</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium text-[#687169] md:flex">
            <a href="#dashboard">Dashboard</a>
            <a href="#guide">Guide</a>
            <a href="#workflow">Agents</a>
            <a href="#roadmap">Roadmap</a>
          </div>
          <a
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#176b5d] px-4 text-sm font-semibold text-white transition hover:bg-[#115247]"
            href="https://github.com"
          >
            GitHub-ready <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <section id="dashboard" className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md border border-[#d9d2c1] bg-white/70 px-3 py-2 text-sm font-semibold text-[#176b5d]">
              <BarChart3 size={16} /> Revenue ops dashboard
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-normal text-[#1e2521] sm:text-5xl">
              LeadForge AI
            </h1>
            <p className="mt-2 max-w-3xl leading-7 text-[#4f5a53]">
              Add leads, inspect AI research, review website audit scores, and move every outreach action through approval.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="#add-lead"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#1e2521] px-4 text-sm font-bold text-white transition hover:bg-[#303a34]"
            >
              Add lead <ArrowUpRight size={16} />
            </a>
            <a
              href="#roadmap"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#bdb39d] bg-white/60 px-4 text-sm font-bold text-[#1e2521] transition hover:bg-white"
            >
              Roadmap <GitBranch size={16} />
            </a>
            <a
              href="#guide"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#bdb39d] bg-white/60 px-4 text-sm font-bold text-[#1e2521] transition hover:bg-white"
            >
              Guide <HelpCircle size={16} />
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#d2cab7] bg-[#fffdf8] shadow-[0_24px_80px_rgba(45,38,20,0.10)]">
          <div className="flex flex-col gap-3 border-b border-[#e3dccd] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-black">Lead command center</p>
              <p className="text-xs text-[#687169]">{leadState.message}</p>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-[#eaf4ef] px-3 py-1 text-xs font-bold text-[#176b5d]">
              <CheckCircle2 size={14} /> {leadState.status === "connected" ? "DB ready" : "Demo mode"}
            </div>
          </div>

          {leadNotice ? (
            <div className="border-b border-[#e3dccd] bg-[#f1f7f4] px-4 py-3 text-sm font-semibold text-[#176b5d]">
              {leadNotice}
            </div>
          ) : null}

          <div className="grid gap-px bg-[#e3dccd] sm:grid-cols-2 lg:grid-cols-4">
            {agentRuns.map((item) => (
              <div key={item.label} className="bg-[#fffdf8] px-5 py-4">
                <p className="text-[11px] font-black uppercase text-[#687169]">{item.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="rounded-md bg-[#eaf4ef] px-2 py-1 text-xs font-bold text-[#176b5d]">{item.delta}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-b border-[#e3dccd] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black">Lead pipeline</h2>
              <p className="text-sm text-[#687169]">Open a lead from the next action button to inspect its workspace.</p>
            </div>
            <p className="text-xs font-bold uppercase text-[#687169]">{leads.length} visible leads</p>
          </div>

          <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#e3dccd] bg-[#fbfaf7] text-xs uppercase text-[#687169]">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3 text-center">Fit</th>
                  <th className="px-4 py-3 text-center">Audit</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3 text-center">Next action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.company}
                    className="border-b border-[#eee8db] transition hover:bg-[#f8fbf7] last:border-0"
                  >
                    <td className="px-4 py-4 align-middle">
                      <Link className="text-base font-black transition hover:text-[#176b5d]" href={`/leads/${lead.id}`}>
                        {lead.company}
                      </Link>
                      <p className="text-xs text-[#687169]">
                        {lead.segment}
                        {lead.website ? ` · ${lead.website.replace(/^https?:\/\//, "")}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center align-middle">
                      <span className="inline-flex size-10 items-center justify-center rounded-md bg-[#f1eee5] font-black">
                        {lead.fit ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center align-middle">
                      <span className="inline-flex size-10 items-center justify-center rounded-md bg-[#f1eee5] font-black">
                        {lead.audit ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className="rounded-md bg-[#eaf4ef] px-2 py-1 text-xs font-black text-[#176b5d]">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle text-[#4f5a53]">{lead.owner}</td>
                    <td className="px-4 py-4 align-middle text-center">
                      <Link
                        className="inline-grid h-12 w-40 grid-cols-[1fr_auto] items-center justify-center gap-2 rounded-md border-2 border-[#176b5d] bg-[#176b5d] px-3 text-left text-sm font-black leading-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#115247] hover:shadow-[0_12px_28px_rgba(23,107,93,0.22)] focus:outline-none focus:ring-4 focus:ring-[#9fcfbe]"
                        href={`/leads/${lead.id}`}
                        aria-label={`Open ${lead.company}: ${lead.next}`}
                      >
                        <span className="line-clamp-2">{lead.next}</span>
                        <ArrowUpRight className="shrink-0" size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-[#fbfaf7]">
            <AddLeadForm databaseStatus={leadState.status} />
          </div>
        </div>
      </section>

      <section id="guide" className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        <div className="overflow-hidden rounded-lg border border-[#d2cab7] bg-[#fffdf8]">
          <div className="flex flex-col gap-2 border-b border-[#e3dccd] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black text-[#176b5d]">
                <HelpCircle size={17} /> Guide
              </p>
              <h2 className="mt-1 text-xl font-black">What LeadForge AI does</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[#4f5a53]">
              LeadForge AI helps you research leads, audit websites, draft outreach, and route every external action through human approval.
            </p>
          </div>
          <div className="grid gap-px bg-[#e3dccd] sm:grid-cols-2 lg:grid-cols-4">
            {glossary.map((item) => (
              <div key={item.term} className="bg-[#fffdf8] p-4">
                <p className="text-sm font-black">{item.term}</p>
                <p className="mt-2 text-sm leading-6 text-[#687169]">{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-y border-[#d9d2c1] bg-[#fffdf8] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-[#176b5d]">Agent workflow</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Built around traceable, reviewable work.</h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-[#e3dccd] bg-[#e3dccd] md:grid-cols-4">
            {workflow.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-[#fffdf8] p-6">
                  <Icon className="text-[#176b5d]" size={24} />
                  <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 leading-7 text-[#4f5a53]">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="roadmap" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase text-[#176b5d]">Build sequence</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">From MVP to respected open-source platform.</h2>
          <p className="mt-5 leading-8 text-[#4f5a53]">
            Start with a working dashboard and seeded flows. Then connect OpenAI, database persistence, Gmail drafts, CRM sync, LangGraph orchestration, and evals.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {roadmap.map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-md border border-[#d9d2c1] bg-white/70 p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#1e2521] text-sm font-black text-white">
                {index + 1}
              </div>
              <p className="font-bold">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#d9d2c1] bg-[#1e2521] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
          <FooterSignal icon={MailPlus} label="External actions" value="Drafts only until approved" />
          <FooterSignal icon={DatabaseZap} label="Integrations" value="Plugin-ready CRM layer" />
          <FooterSignal icon={AlertTriangle} label="Risk controls" value="Prompt injection checks" />
          <FooterSignal icon={FileText} label="Repo quality" value="Docs, evals, Docker next" />
        </div>
      </section>
    </main>
  );
}

function getLeadNotice(status?: string) {
  if (status === "created") {
    return "Lead saved. It is now queued for AI research.";
  }

  if (status === "invalid") {
    return "Lead was not saved. Check the company, website URL, and email format.";
  }

  if (status === "db-not-configured") {
    return "Add DATABASE_URL and run the Prisma migration before saving leads.";
  }

  return null;
}

function FooterSignal({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-1 text-[#8fd1c1]" size={20} />
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-1 text-sm text-[#cbd7d1]">{value}</p>
      </div>
    </div>
  );
}
