import {
  ArrowLeft,
  Bot,
  CalendarClock,
  CalendarCheck,
  ChevronRight,
  CheckCircle2,
  ClipboardCheck,
  DatabaseZap,
  ExternalLink,
  FileText,
  Gauge,
  Mail,
  MessageSquareText,
  MousePointerClick,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Trophy,
  Video,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  approveLeadWork,
  generateOutreachDraft,
  prepareClientOperations,
  recordLeadOutcome,
  rejectLeadWork,
  runResearch,
  runWebsiteAudit,
} from "@/app/actions";
import { getLeadDetail } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ run?: string }>;
}) {
  const { leadId } = await params;
  const { run } = await searchParams;
  const detail = await getLeadDetail(leadId);

  if (!detail) {
    notFound();
  }

  const { lead } = detail;
  const actionsDisabled = detail.status !== "connected" || Boolean(lead.isSeed);
  const disabledReason = lead.isSeed
    ? "Demo leads are read-only. Create a real lead from the dashboard to run this step."
    : "Connect Postgres and run migrations before executing this step.";
  const notice = getRunNotice(run);
  const aiMode = process.env.OPENAI_API_KEY ? "Live OpenAI" : "Local fallback";

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#1e2521]">
      <section className="sticky top-0 z-10 border-b border-[#d9d2c1] bg-[#f7f5ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link href="/#dashboard" className="inline-flex items-center gap-2 font-bold text-[#176b5d]">
              <ArrowLeft size={17} /> Dashboard
            </Link>
            <ChevronRight className="text-[#9a9488]" size={16} />
            <span className="truncate font-bold text-[#687169]">{lead.company}</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-[#eaf4ef] px-3 py-2 text-xs font-bold text-[#176b5d]">
            <CheckCircle2 size={14} /> {detail.status === "connected" ? "DB detail" : "Demo detail"}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-2 rounded-md border border-[#d9d2c1] bg-white/70 px-3 py-2 text-sm font-semibold text-[#176b5d]">
                <Sparkles size={16} /> Lead workspace
              </p>
              <span className="rounded-md bg-[#eaf4ef] px-3 py-2 text-sm font-black text-[#176b5d]">{lead.stage}</span>
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">{lead.company}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-[#4f5a53]">{detail.message}</p>
          </div>
          <div className="grid min-w-[280px] grid-cols-2 overflow-hidden rounded-lg border border-[#d2cab7] bg-[#fffdf8]">
            <SummaryMetric label="Fit" value={lead.fit ?? "-"} />
            <SummaryMetric label="Audit" value={lead.audit ?? "-"} />
          </div>
        </div>
        {notice ? (
          <p className="mt-4 rounded-md border border-[#b9ddcf] bg-[#eaf4ef] px-4 py-3 text-sm font-bold text-[#176b5d]">
            {notice}
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-5 sm:px-8">
        <div className="overflow-hidden rounded-lg border border-[#b9ddcf] bg-[#fffdf8] shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
          <div className="flex flex-col gap-3 border-b border-[#d7eee6] bg-[#f3faf7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Next action</h2>
              <p className="mt-1 text-sm text-[#3f5d55]">
                Choose one step to move this lead forward. Every run writes an agent trace.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-black text-[#176b5d]">
              <Bot size={14} /> {aiMode}
            </span>
          </div>
          <div className="grid gap-px bg-[#e3dccd] md:grid-cols-2 xl:grid-cols-4">
            <ActionForm
              action={runResearch}
              leadId={lead.id}
              icon={Search}
              step="01"
              title="Run Research"
              description="Create company research, citations, ICP signals, and a trace."
              disabled={actionsDisabled}
              disabledReason={disabledReason}
            />
            <ActionForm
              action={runWebsiteAudit}
              leadId={lead.id}
              icon={Gauge}
              step="02"
              title="Run Website Audit"
              description="Score conversion, clarity, trust, SEO, speed, and findings."
              disabled={actionsDisabled}
              disabledReason={disabledReason}
            />
            <ActionForm
              action={generateOutreachDraft}
              leadId={lead.id}
              icon={Mail}
              step="03"
              title="Generate Outreach Draft"
              description="Create an email draft, approval item, and outreach trace."
              disabled={actionsDisabled}
              disabledReason={disabledReason}
            />
            <ActionForm
              action={prepareClientOperations}
              leadId={lead.id}
              icon={DatabaseZap}
              step="04"
              title="Prepare Client Ops"
              description="Create Loom script, CRM note, Airtable payload, and follow-up."
              disabled={actionsDisabled}
              disabledReason={disabledReason}
            />
          </div>
          {actionsDisabled ? (
            <div className="border-t border-[#e3dccd] bg-[#fbfaf7] px-5 py-3 text-sm font-medium text-[#687169]">
              <p className="font-black text-[#1e2521]">Why buttons are unavailable</p>
              <p className="mt-1">{disabledReason}</p>
              <Link href="/#start" className="mt-2 inline-flex items-center gap-2 font-black text-[#176b5d]">
                Go to Start here <ChevronRight size={15} />
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-5 sm:px-8">
        <aside className="rounded-lg border border-[#d2cab7] bg-[#fffdf8]">
          <div className="flex flex-col gap-2 border-b border-[#e3dccd] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-black">Lead context</p>
              <p className="mt-1 text-sm text-[#687169]">{lead.segment}</p>
            </div>
            {lead.website ? (
              <a className="inline-flex items-center gap-2 font-bold text-[#176b5d]" href={lead.website}>
                Website <ExternalLink size={15} />
              </a>
            ) : (
              <p className="text-[#687169]">No website captured</p>
            )}
          </div>
          <div className="grid gap-px bg-[#eee8db] md:grid-cols-2 lg:grid-cols-4">
            <MetricRow label="Owner" value={lead.owner} />
            <MetricRow label="Contact" value={lead.contact ?? "Not captured"} />
            <MetricRow label="Current step" value={lead.next} />
            <MetricRow label="Status" value={lead.stage} />
          </div>
        </aside>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-12 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <Panel icon={Search} title="Research" subtitle="Company facts, ICP signals, and citations">
          {detail.research.length > 0 ? (
            detail.research.map((run) => (
              <div key={run.id} className="space-y-4">
                <StatusLine label={run.status} meta={run.confidence == null ? null : `${Math.round(run.confidence * 100)}% confidence`} />
                <p className="leading-7 text-[#4f5a53]">{run.summary}</p>
                <List title="Citations" items={run.citations} empty="No citations captured yet." />
              </div>
            ))
          ) : (
            <EmptyState text="No research run yet. The next agent step should create one." />
          )}
        </Panel>

        <Panel icon={Gauge} title="Website Audit" subtitle="Conversion, trust, clarity, SEO, and speed scoring">
          {detail.audits.length > 0 ? (
            detail.audits.map((audit) => (
              <div key={audit.id} className="space-y-5">
                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-[#e3dccd] bg-[#e3dccd]">
                  <Score label="Overall" value={audit.overall} />
                  <Score label="Clarity" value={audit.clarity} />
                  <Score label="Convert" value={audit.conversion} />
                  <Score label="Trust" value={audit.trust} />
                  <Score label="SEO" value={audit.seo} />
                  <Score label="Speed" value={audit.speed} />
                </div>
                <List title="Findings" items={audit.findings} empty="No audit findings captured yet." />
              </div>
            ))
          ) : (
            <EmptyState text="No website audit yet. Run the audit agent after research." />
          )}
        </Panel>

        <Panel icon={Mail} title="Outreach Drafts" subtitle="Email, LinkedIn, Loom, and CRM note drafts">
          {detail.drafts.length > 0 ? (
            <div className="space-y-4">
              {detail.drafts.map((draft) => (
                <article key={draft.id} className="rounded-md border border-[#e3dccd] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black uppercase text-[#176b5d]">{draft.channel.replace("_", " ")}</p>
                    <p className="text-xs text-[#687169]">{draft.promptVersion ?? "No prompt version"}</p>
                  </div>
                  {draft.subject ? <p className="mt-3 font-black">{draft.subject}</p> : null}
                  <p className="mt-3 whitespace-pre-line leading-7 text-[#4f5a53]">{draft.body}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="No outreach drafts yet. Draft generation should wait for research and audit context." />
          )}
        </Panel>

        <Panel icon={ClipboardCheck} title="Approvals" subtitle="Human review queue before side effects">
          {detail.approvals.length > 0 ? (
            <div className="space-y-3">
              {detail.approvals.map((approval) => (
                <div key={approval.id} className="rounded-md border border-[#e3dccd] bg-white p-4">
                  <StatusLine label={approval.status} meta={approval.requestedAction} />
                  <p className="mt-3 leading-7 text-[#4f5a53]">{approval.notes ?? "No reviewer notes yet."}</p>
                  {approval.status === "PENDING" ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <ReviewForm
                        action={approveLeadWork}
                        leadId={lead.id}
                        approvalId={approval.id}
                        label="Approve work"
                        icon={CheckCircle2}
                        disabled={actionsDisabled}
                      />
                      <ReviewForm
                        action={rejectLeadWork}
                        leadId={lead.id}
                        approvalId={approval.id}
                        label="Reject"
                        icon={XCircle}
                        disabled={actionsDisabled}
                        variant="danger"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No approvals yet. Any Gmail, CRM, Slack, or webhook action should create one." />
          )}
        </Panel>

        <section className="rounded-lg border border-[#d2cab7] bg-[#fffdf8] lg:col-span-2">
          <div className="flex items-start gap-3 border-b border-[#e3dccd] p-5">
            <DatabaseZap className="mt-1 text-[#176b5d]" size={22} />
            <div>
              <h2 className="text-xl font-black">Client Operations</h2>
              <p className="mt-1 text-sm text-[#687169]">
                Gmail-ready assets, CRM/Airtable payloads, and follow-up reminders prepared for approval.
              </p>
            </div>
          </div>
          <div className="grid gap-px bg-[#eee8db] lg:grid-cols-[1fr_1fr]">
            <div className="bg-[#fffdf8] p-5">
              <div className="mb-4 flex items-center gap-2">
                <DatabaseZap size={18} className="text-[#176b5d]" />
                <h3 className="font-black">Sync payloads</h3>
              </div>
              {detail.integrations.length > 0 ? (
                <div className="space-y-3">
                  {detail.integrations.map((sync) => (
                    <article key={sync.id} className="rounded-md border border-[#e3dccd] bg-white p-4">
                      <StatusLine label={sync.status} meta={sync.provider} />
                      <pre className="mt-3 max-h-56 overflow-auto rounded-md bg-[#1e2521] p-3 text-xs leading-6 text-[#eaf4ef]">
                        {sync.payload}
                      </pre>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState text="No CRM or Airtable payloads yet. Prepare Client Ops after outreach drafting." />
              )}
            </div>
            <div className="bg-[#fffdf8] p-5">
              <div className="mb-4 flex items-center gap-2">
                <CalendarClock size={18} className="text-[#176b5d]" />
                <h3 className="font-black">Follow-up reminders</h3>
              </div>
              {detail.reminders.length > 0 ? (
                <div className="space-y-3">
                  {detail.reminders.map((reminder) => (
                    <article key={reminder.id} className="rounded-md border border-[#e3dccd] bg-white p-4">
                      <StatusLine label={reminder.status} meta={`${reminder.channel} due ${reminder.dueAt}`} />
                      <p className="mt-3 leading-7 text-[#4f5a53]">{reminder.note}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState text="No reminders yet. Client Ops creates one so follow-up does not depend on memory." />
              )}
              <div className="mt-5 rounded-md border border-[#d7eee6] bg-[#f3faf7] p-4">
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-[#176b5d]" />
                  <p className="font-black">Loom script status</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4f5a53]">
                  Loom scripts are stored as outreach drafts with the LOOM SCRIPT channel for reviewer approval.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#d2cab7] bg-[#fffdf8] lg:col-span-2">
          <div className="flex items-start gap-3 border-b border-[#e3dccd] p-5">
            <Trophy className="mt-1 text-[#176b5d]" size={22} />
            <div>
              <h2 className="text-xl font-black">Outcome Learning</h2>
              <p className="mt-1 text-sm text-[#687169]">
                Record what happened after approval so future scoring, prompts, and playbooks can improve.
              </p>
            </div>
          </div>
          <div className="grid gap-px bg-[#eee8db] xl:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-[#fffdf8] p-5">
              <h3 className="font-black">Record outcome</h3>
              <p className="mt-2 text-sm leading-6 text-[#687169]">
                These buttons only log internal learning signals. They do not send email or sync external tools.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <OutcomeForm eventType="EMAIL_SENT" label="Email sent" icon={Send} leadId={lead.id} disabled={actionsDisabled} />
                <OutcomeForm eventType="REPLIED" label="Replied" icon={MessageSquareText} leadId={lead.id} disabled={actionsDisabled} />
                <OutcomeForm eventType="MEETING_BOOKED" label="Meeting booked" icon={CalendarCheck} leadId={lead.id} disabled={actionsDisabled} />
                <OutcomeForm eventType="WON" label="Won" icon={Trophy} leadId={lead.id} disabled={actionsDisabled} />
                <OutcomeForm eventType="LOST" label="Lost" icon={XCircle} leadId={lead.id} disabled={actionsDisabled} variant="danger" />
              </div>
            </div>
            <div className="bg-[#fffdf8] p-5">
              <h3 className="font-black">Outcome history</h3>
              {detail.outcomes.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {detail.outcomes.map((outcome) => (
                    <article key={outcome.id} className="rounded-md border border-[#e3dccd] bg-white p-4">
                      <StatusLine label={outcome.eventType.replace("_", " ")} meta={outcome.createdAt} />
                      <p className="mt-3 leading-7 text-[#4f5a53]">
                        {outcome.note ?? "Outcome logged for future learning."}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState text="No outcomes logged yet. Start after approved outreach is sent or a reply arrives." />
                </div>
              )}
            </div>
          </div>
        </section>

        <Panel icon={TestTube2} title="Quality Evals" subtitle="Automated checks for AI output quality and safety">
          {detail.evaluations.length > 0 ? (
            <div className="space-y-4">
              {detail.evaluations.map((evaluation) => (
                <article key={evaluation.id} className="rounded-md border border-[#e3dccd] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase text-[#176b5d]">
                        {evaluation.category.replace("_", " ")}
                      </p>
                      <p className="mt-1 text-sm text-[#687169]">
                        {evaluation.passed ? "Passed quality gate" : "Needs review"}
                      </p>
                    </div>
                    <div className="flex size-14 items-center justify-center rounded-md bg-[#eaf4ef] text-xl font-black text-[#176b5d]">
                      {evaluation.score}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {evaluation.checks.map((check) => (
                      <div key={check.label} className="flex gap-2 text-sm leading-6 text-[#4f5a53]">
                        <CheckCircle2
                          className={`mt-1 shrink-0 ${check.passed ? "text-[#176b5d]" : "text-[#9a6a2f]"}`}
                          size={15}
                        />
                        <div>
                          <p className="font-black text-[#1e2521]">{check.label}</p>
                          <p>{check.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="No evaluations yet. Running an agent action will score the output before review." />
          )}
        </Panel>

        <section className="rounded-lg border border-[#d2cab7] bg-[#fffdf8] lg:col-span-2">
          <div className="flex items-start gap-3 border-b border-[#e3dccd] p-5">
            <Bot className="mt-1 text-[#176b5d]" size={22} />
            <div>
              <h2 className="text-xl font-black">Agent Traces</h2>
              <p className="mt-1 text-sm text-[#687169]">Tool calls, model metadata, latency, tokens, and structured outputs.</p>
            </div>
          </div>
          {detail.traces.length > 0 ? (
            <div className="divide-y divide-[#eee8db]">
              {detail.traces.map((trace) => (
                <article key={trace.id} className="grid gap-4 p-5 lg:grid-cols-[280px_1fr]">
                  <div>
                    <p className="font-black">{trace.agentName}</p>
                    <p className="mt-1 text-sm text-[#687169]">{trace.model ?? "No model recorded"}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <MiniMetric label="Status" value={trace.status} />
                      <MiniMetric label="Latency" value={trace.latencyMs == null ? "-" : `${trace.latencyMs}ms`} />
                      <MiniMetric label="Tokens" value={trace.tokenCount ?? "-"} />
                    </div>
                  </div>
                  <pre className="overflow-x-auto rounded-md bg-[#1e2521] p-4 text-xs leading-6 text-[#eaf4ef]">
                    {trace.output}
                  </pre>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState text="No traces yet. Agent execution should write a trace for every meaningful step." />
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#fffdf8] px-4 py-4 text-sm">
      <p className="text-xs font-black uppercase text-[#687169]">{label}</p>
      <p className="mt-2 font-black leading-6">{value}</p>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#fffdf8] px-4 py-3">
      <p className="text-xs font-black uppercase text-[#687169]">{label} score</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function ActionForm({
  action,
  leadId,
  icon: Icon,
  step,
  title,
  description,
  disabled,
  disabledReason,
}: {
  action: (formData: FormData) => Promise<void>;
  leadId: string;
  icon: typeof FileText;
  step: string;
  title: string;
  description: string;
  disabled: boolean;
  disabledReason: string;
}) {
  return (
    <form
      action={action}
      className={`group bg-[#fffdf8] p-4 transition ${
        disabled
          ? "opacity-85"
          : "cursor-pointer hover:bg-white"
      }`}
    >
      <input type="hidden" name="leadId" value={leadId} />
      <div className="flex h-full items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-md ${
            disabled ? "bg-[#f1eee5] text-[#687169]" : "bg-[#176b5d] text-white transition group-hover:scale-105"
          }`}
        >
          <Icon size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase text-[#176b5d]">Step {step}</p>
          <p className="mt-1 text-lg font-black">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[#687169]">{description}</p>
          <button
            type="submit"
            disabled={disabled}
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#176b5d] px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#115247] focus:outline-none focus:ring-4 focus:ring-[#9fcfbe] disabled:cursor-not-allowed disabled:bg-[#b5bbb4] sm:w-auto"
          >
            <MousePointerClick size={17} />
            {disabled ? "Unavailable" : "Run step"}
          </button>
          {disabled ? <p className="mt-2 text-xs leading-5 text-[#687169]">{disabledReason}</p> : null}
        </div>
      </div>
    </form>
  );
}

function ReviewForm({
  action,
  leadId,
  approvalId,
  label,
  icon: Icon,
  disabled,
  variant = "primary",
}: {
  action: (formData: FormData) => Promise<void>;
  leadId: string;
  approvalId: string;
  label: string;
  icon: typeof FileText;
  disabled: boolean;
  variant?: "primary" | "danger";
}) {
  const classes =
    variant === "danger"
      ? "border-[#ead7c3] bg-[#fff8ef] text-[#8a4c19] hover:bg-[#fff2dd] focus:ring-[#e1b67b]"
      : "border-[#b9ddcf] bg-[#176b5d] text-white hover:bg-[#115247] focus:ring-[#9fcfbe]";

  return (
    <form action={action}>
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="approvalId" value={approvalId} />
      <button
        type="submit"
        disabled={disabled}
        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border px-4 text-sm font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:border-[#d2cab7] disabled:bg-[#f1eee5] disabled:text-[#687169] ${classes}`}
      >
        <Icon size={17} />
        {disabled ? "Unavailable" : label}
      </button>
    </form>
  );
}

function OutcomeForm({
  eventType,
  label,
  icon: Icon,
  leadId,
  disabled,
  variant = "primary",
}: {
  eventType: string;
  label: string;
  icon: typeof FileText;
  leadId: string;
  disabled: boolean;
  variant?: "primary" | "danger";
}) {
  const classes =
    variant === "danger"
      ? "border-[#ead7c3] bg-[#fff8ef] text-[#8a4c19] hover:bg-[#fff2dd] focus:ring-[#e1b67b]"
      : "border-[#b9ddcf] bg-white text-[#176b5d] hover:bg-[#f3faf7] focus:ring-[#9fcfbe]";

  return (
    <form action={recordLeadOutcome}>
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="eventType" value={eventType} />
      <button
        type="submit"
        disabled={disabled}
        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:border-[#d2cab7] disabled:bg-[#f1eee5] disabled:text-[#687169] ${classes}`}
      >
        <Icon size={17} />
        {disabled ? "Unavailable" : label}
      </button>
    </form>
  );
}

function Panel({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof FileText;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#d2cab7] bg-[#fffdf8]">
      <div className="flex items-start gap-3 border-b border-[#e3dccd] p-5">
        <Icon className="mt-1 text-[#176b5d]" size={22} />
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="mt-1 text-sm text-[#687169]">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function StatusLine({ label, meta }: { label: string; meta: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-2 rounded-md bg-[#eaf4ef] px-2 py-1 text-xs font-black text-[#176b5d]">
        <ShieldCheck size={13} /> {label}
      </span>
      {meta ? <span className="text-sm text-[#687169]">{meta}</span> : null}
    </div>
  );
}

function Score({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="bg-white p-3">
      <p className="text-xs font-bold uppercase text-[#687169]">{label}</p>
      <p className="mt-1 text-2xl font-black">{value ?? "-"}</p>
    </div>
  );
}

function List({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-[#687169]">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 leading-7 text-[#4f5a53]">
              <CheckCircle2 className="mt-1 shrink-0 text-[#176b5d]" size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[#687169]">{empty}</p>
      )}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-[#e3dccd] bg-white p-2">
      <p className="text-[11px] font-bold uppercase text-[#687169]">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-dashed border-[#d2cab7] bg-white p-4 text-sm text-[#687169]">
      <MessageSquareText className="mt-0.5 shrink-0 text-[#176b5d]" size={17} />
      <p>{text}</p>
    </div>
  );
}

function getRunNotice(status?: string) {
  if (status === "research") {
    return "Research run created. The lead moved to website audit.";
  }

  if (status === "audit") {
    return "Website audit created. The lead is ready for outreach drafting.";
  }

  if (status === "draft") {
    return "Outreach draft and approval request created.";
  }

  if (status === "client-ops") {
    return "Client operations assets created: Loom script, CRM note, sync payloads, and follow-up reminder.";
  }

  if (status === "approve") {
    return "Reviewer approved the work. Sync payloads are marked approved and ready for external execution.";
  }

  if (status === "reject") {
    return "Reviewer rejected the work. The lead is ready for revision.";
  }

  if (status === "outcome") {
    return "Outcome logged. LeadForge can now use that signal for future scoring and prompt improvement.";
  }

  if (status === "invalid") {
    return "That action was invalid, so no change was saved.";
  }

  if (status === "sample") {
    return "Sample lead created. You can now run the workflow buttons on this saved lead.";
  }

  if (status === "setup-complete") {
    return "Setup complete. Database schema is ready and this sample lead is saved.";
  }

  if (status === "db-not-configured") {
    return "Connect DATABASE_URL and run migrations before executing lead actions.";
  }

  if (status === "db-unavailable") {
    return "The database could not be reached, so the action was not saved.";
  }

  if (status === "missing") {
    return "That lead was not found in the database.";
  }

  return null;
}
