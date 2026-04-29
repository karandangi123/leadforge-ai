import {
  ArrowLeft,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  DatabaseZap,
  Gauge,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  approveLeadWork,
  generateOutreachDraft,
  moveLeadStage,
  prepareClientOperations,
  recordLeadOutcome,
  rejectLeadWork,
  runResearch,
  runWebsiteAudit,
  setLeadHumanNextAction,
  updateLeadMetadata,
} from "@/app/actions";
import { getLeadDetail, statusLabels } from "@/lib/leads";

export const dynamic = "force-dynamic";

const outcomeOptions = [
  { value: "EMAIL_SENT", label: "Email sent" },
  { value: "REPLIED", label: "Replied" },
  { value: "MEETING_BOOKED", label: "Meeting booked" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

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
    ? "Demo leads are read-only. Create a real lead from the pipeline to run this step."
    : "Connect Postgres and run migrations before executing this step.";
  const aiMode = process.env.OPENAI_API_KEY ? "Live OpenAI" : "Local fallback";
  const notice = getRunNotice(run);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#1e2521]">
      <section className="sticky top-0 z-10 border-b border-[#d9d2c1] bg-[#f7f5ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link href="/?view=dashboard" className="inline-flex items-center gap-2 font-black text-[#176b5d]">
              <ArrowLeft size={17} /> Pipeline
            </Link>
            <ChevronRight className="text-[#9a9488]" size={16} />
            <span className="truncate font-black text-[#687169]">{lead.company}</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-[#eaf4ef] px-3 py-2 text-xs font-black text-[#176b5d]">
            <CheckCircle2 size={14} /> {detail.status === "connected" ? "DB detail" : "Demo detail"}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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

        <div className="mt-6 rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-4">
          <p className="text-xs font-black uppercase text-[#176b5d]">Stage progression</p>
          <div className="mt-4 grid gap-2 md:grid-cols-4 lg:grid-cols-8">
            {Object.entries(statusLabels).map(([status, label]) => {
              const active = lead.status === status;
              return (
                <div
                  key={status}
                  className={`rounded-xl border px-3 py-3 text-center text-xs font-black uppercase ${
                    active ? "border-[#176b5d] bg-[#176b5d] text-white" : "border-[#e3dccd] bg-white text-[#687169]"
                  }`}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {notice ? (
          <p className="mt-4 rounded-md border border-[#b9ddcf] bg-[#eaf4ef] px-4 py-3 text-sm font-bold text-[#176b5d]">
            {notice}
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-5 sm:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#b9ddcf] bg-[#fffdf8] shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
          <div className="flex flex-col gap-3 border-b border-[#d7eee6] bg-[#f3faf7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Next action controls</h2>
              <p className="mt-1 text-sm text-[#3f5d55]">Run agents, override stage intentionally, and keep the AI suggestion separate from the human plan.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-black text-[#176b5d]">
              <Bot size={14} /> {aiMode}
            </span>
          </div>

          <div className="grid gap-px bg-[#e3dccd] md:grid-cols-2 xl:grid-cols-4">
            <ActionForm action={runResearch} leadId={lead.id} icon={Search} step="01" title="Run Research" description="Create company research, citations, ICP signals, and a trace." disabled={actionsDisabled} disabledReason={disabledReason} />
            <ActionForm action={runWebsiteAudit} leadId={lead.id} icon={Gauge} step="02" title="Run Website Audit" description="Score conversion, clarity, trust, SEO, speed, and findings." disabled={actionsDisabled} disabledReason={disabledReason} />
            <ActionForm action={generateOutreachDraft} leadId={lead.id} icon={Mail} step="03" title="Generate Outreach Draft" description="Create an email draft, approval item, and outreach trace." disabled={actionsDisabled} disabledReason={disabledReason} />
            <ActionForm action={prepareClientOperations} leadId={lead.id} icon={DatabaseZap} step="04" title="Prepare Client Ops" description="Create Loom script, CRM note, Airtable payload, and follow-up." disabled={actionsDisabled} disabledReason={disabledReason} />
          </div>

          <div className="grid gap-5 border-t border-[#e3dccd] p-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-[#d9d2c1] bg-white p-4">
              <p className="text-xs font-black uppercase text-[#176b5d]">AI suggested next move</p>
              <p className="mt-2 text-sm font-black text-[#1e2521]">{lead.aiNextAction}</p>
              <p className="mt-3 text-xs text-[#687169]">Human next move stays editable and does not overwrite the AI-generated recommendation.</p>
              <form action={setLeadHumanNextAction} className="mt-4 space-y-3">
                <input type="hidden" name="leadId" value={lead.id} />
                <input
                  name="humanNextAction"
                  defaultValue={lead.humanNextAction ?? ""}
                  disabled={actionsDisabled}
                  placeholder="Set the human next move"
                  className="h-11 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm"
                />
                <button disabled={actionsDisabled} className="inline-flex h-10 items-center justify-center rounded-md bg-[#1e2521] px-4 text-sm font-black text-white disabled:bg-[#9da59f]">
                  Save human next move
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-[#d9d2c1] bg-white p-4">
              <p className="text-xs font-black uppercase text-[#176b5d]">Manual stage override</p>
              <form action={moveLeadStage} className="mt-4 space-y-3">
                <input type="hidden" name="leadId" value={lead.id} />
                <select name="status" defaultValue={lead.status} disabled={actionsDisabled} className="h-11 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <textarea
                  name="manualStatusReason"
                  disabled={actionsDisabled}
                  rows={3}
                  placeholder="Reason for changing the stage manually"
                  className="w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 py-3 text-sm"
                />
                <button disabled={actionsDisabled} className="inline-flex h-10 items-center justify-center rounded-md bg-[#176b5d] px-4 text-sm font-black text-white disabled:bg-[#9da59f]">
                  Save stage override
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-5 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <Panel icon={ClipboardCheck} title="Lead context" subtitle="Editable fields that guide the workflow">
          <form action={updateLeadMetadata} className="space-y-4">
            <input type="hidden" name="leadId" value={lead.id} />
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Website" name="website" defaultValue={lead.website ?? ""} disabled={actionsDisabled} />
              <Field label="Contact" name="contactName" defaultValue={lead.contact?.includes("@") ? "" : lead.contact ?? ""} disabled={actionsDisabled} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Contact email" name="contactEmail" defaultValue={lead.contact?.includes("@") ? lead.contact : ""} disabled={actionsDisabled} />
              <Field label="Segment" name="segment" defaultValue={lead.segment} disabled={actionsDisabled} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Owner" name="ownerName" defaultValue={lead.ownerName ?? lead.owner} disabled={actionsDisabled} />
              <Field label="Tags" name="tags" defaultValue={lead.tags.join(", ")} disabled={actionsDisabled} />
            </div>
            <Area label="Notes" name="notes" defaultValue={lead.notes ?? ""} disabled={actionsDisabled} />
            <button disabled={actionsDisabled} className="inline-flex h-10 items-center justify-center rounded-md bg-[#1e2521] px-4 text-sm font-black text-white disabled:bg-[#9da59f]">
              Save lead context
            </button>
          </form>
        </Panel>

        <Panel icon={CalendarClock} title="Timeline" subtitle="One ordered view of what happened on this lead">
          {detail.timeline.length > 0 ? (
            <div className="space-y-3">
              {detail.timeline.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black">{entry.label}</p>
                      <p className="mt-1 text-xs font-bold uppercase text-[#687169]">{entry.status}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-[#687169]">{entry.timestamp}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{entry.summary}</p>
                  {entry.meta.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.meta.map((meta) => (
                        <span key={meta} className="rounded-full bg-[#f7f5ef] px-2 py-1 text-[10px] font-black uppercase text-[#687169]">
                          {meta}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="The timeline will fill in as research, approvals, reminders, and outcomes are recorded." />
          )}
        </Panel>

        <Panel icon={Search} title="Research" subtitle="Company facts, ICP signals, and citations">
          {detail.research.length > 0 ? (
            detail.research.map((run) => (
              <div key={run.id} className="space-y-4 rounded-xl border border-[#e3dccd] bg-white p-4">
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
              <div key={audit.id} className="space-y-5 rounded-xl border border-[#e3dccd] bg-white p-4">
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

        <Panel icon={Mail} title="Outreach Drafts" subtitle="Prepared messages and client-facing assets">
          {detail.drafts.length > 0 ? (
            <div className="space-y-4">
              {detail.drafts.map((draft) => (
                <article key={draft.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
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
                <div key={approval.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                  <StatusLine label={approval.status} meta={approval.requestedAction} />
                  <p className="mt-3 leading-7 text-[#4f5a53]">{approval.notes ?? "No reviewer notes yet."}</p>
                  {approval.status === "PENDING" ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <ReviewForm action={approveLeadWork} leadId={lead.id} approvalId={approval.id} label="Approve work" icon={CheckCircle2} disabled={actionsDisabled} />
                      <ReviewForm action={rejectLeadWork} leadId={lead.id} approvalId={approval.id} label="Reject" icon={XCircle} disabled={actionsDisabled} variant="danger" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No approvals yet. Any Gmail, CRM, Slack, or webhook action should create one." />
          )}
        </Panel>

        <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] lg:col-span-2">
          <div className="flex items-start gap-3 border-b border-[#e3dccd] p-5">
            <DatabaseZap className="mt-1 text-[#176b5d]" size={22} />
            <div>
              <h2 className="text-xl font-black">Client Operations</h2>
              <p className="mt-1 text-sm text-[#687169]">Gmail-ready assets, CRM payloads, reminders, and outcome tracking prepared for approval.</p>
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
                    <article key={sync.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                      <StatusLine label={sync.status} meta={sync.provider} />
                      <ul className="mt-3 space-y-1 text-sm leading-6 text-[#4f5a53]">
                        {sync.preview.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-black uppercase text-[#176b5d]">Raw payload</summary>
                        <pre className="mt-3 max-h-56 overflow-auto rounded-md bg-[#1e2521] p-3 text-xs leading-6 text-[#eaf4ef]">
                          {sync.payload}
                        </pre>
                      </details>
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
                <h3 className="font-black">Follow-up reminders and outcomes</h3>
              </div>
              <div className="space-y-3">
                {detail.reminders.map((reminder) => (
                  <article key={reminder.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <StatusLine label={reminder.status} meta={`${reminder.channel} • ${reminder.dueAt}`} />
                    <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{reminder.note}</p>
                  </article>
                ))}
                {detail.outcomes.map((outcome) => (
                  <article key={outcome.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <StatusLine label={outcome.eventType.replace("_", " ")} meta={outcome.createdAt} />
                    <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{outcome.note ?? "Outcome signal captured."}</p>
                  </article>
                ))}
              </div>

              <form action={recordLeadOutcome} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input type="hidden" name="leadId" value={lead.id} />
                <select name="eventType" disabled={actionsDisabled} className="h-11 flex-1 rounded-md border border-[#d9d2c1] bg-white px-3 text-sm">
                  {outcomeOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <button disabled={actionsDisabled} className="inline-flex h-11 items-center justify-center rounded-md bg-[#176b5d] px-4 text-sm font-black text-white disabled:bg-[#9da59f]">
                  Log outcome
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] lg:col-span-2">
          <div className="flex items-start gap-3 border-b border-[#e3dccd] p-5">
            <ShieldCheck className="mt-1 text-[#176b5d]" size={22} />
            <div>
              <h2 className="text-xl font-black">Agent Evidence</h2>
              <p className="mt-1 text-sm text-[#687169]">Raw traces and evals stay available, but lower in the page hierarchy so the workflow remains readable first.</p>
            </div>
          </div>
          <div className="grid gap-px bg-[#eee8db] lg:grid-cols-[1fr_1fr]">
            <div className="bg-[#fffdf8] p-5">
              <h3 className="mb-4 font-black">Quality evals</h3>
              <div className="space-y-3">
                {detail.evaluations.map((evaluation) => (
                  <details key={evaluation.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black">{evaluation.category}</p>
                          <p className="mt-1 text-xs text-[#687169]">{evaluation.passed ? "Passed" : "Failed"}</p>
                        </div>
                        <span className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">{evaluation.score}</span>
                      </div>
                    </summary>
                    <div className="mt-3 space-y-3">
                      {evaluation.checks.map((check) => (
                        <div key={check.label} className="rounded-lg bg-[#f7f5ef] p-3">
                          <p className="text-sm font-black">{check.label}</p>
                          <p className="mt-1 text-sm leading-6 text-[#4f5a53]">{check.detail}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div className="bg-[#fffdf8] p-5">
              <h3 className="mb-4 font-black">Trace log</h3>
              <div className="space-y-3">
                {detail.traces.map((trace) => (
                  <details key={trace.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black">{trace.agentName}</p>
                          <p className="mt-1 text-xs text-[#687169]">
                            {trace.model ?? "No model"} • {trace.status} • {trace.latencyMs ?? "-"} ms
                          </p>
                        </div>
                        <span className="rounded-full bg-[#f7f5ef] px-2 py-1 text-[10px] font-black uppercase text-[#687169]">{trace.tokenCount ?? "-"} tok</span>
                      </div>
                    </summary>
                    <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-[#1e2521] p-3 text-xs leading-6 text-[#eaf4ef]">{trace.output}</pre>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
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
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8]">
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
  icon: React.ComponentType<{ size?: number; className?: string }>;
  step: string;
  title: string;
  description: string;
  disabled: boolean;
  disabledReason: string;
}) {
  return (
    <form action={action} className="bg-white p-5">
      <input type="hidden" name="leadId" value={leadId} />
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3faf7] text-[#176b5d]">
          <Icon size={18} />
        </div>
        <span className="rounded-full bg-[#f7f5ef] px-2 py-1 text-[10px] font-black uppercase text-[#687169]">{step}</span>
      </div>
      <p className="mt-4 text-base font-black">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{description}</p>
      <button
        disabled={disabled}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[#1e2521] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[#9da59f]"
        title={disabled ? disabledReason : title}
      >
        Run step
      </button>
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
  variant,
}: {
  action: (formData: FormData) => Promise<void>;
  leadId: string;
  approvalId: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  disabled: boolean;
  variant?: "danger";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="approvalId" value={approvalId} />
      <button
        disabled={disabled}
        className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-black ${
          variant === "danger"
            ? "border border-[#d9d2c1] text-[#1e2521] disabled:text-[#9da59f]"
            : "bg-[#176b5d] text-white disabled:bg-[#9da59f]"
        }`}
      >
        <Icon size={16} /> {label}
      </button>
    </form>
  );
}

function StatusLine({ label, meta }: { label: string; meta: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">{label}</span>
      {meta ? <span className="text-[10px] font-bold uppercase text-[#687169]">{meta}</span> : null}
    </div>
  );
}

function Score({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="bg-white p-3 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#687169]">{label}</p>
      <p className="mt-1 text-xl font-black">{value ?? "-"}</p>
    </div>
  );
}

function List({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-[#687169]">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4f5a53]">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[#687169]">{empty}</p>
      )}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-r border-[#d2cab7] p-4 last:border-r-0">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-[#687169]">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-[#687169]">{label}</span>
      <input name={name} defaultValue={defaultValue} disabled={disabled} className="mt-1 h-11 w-full rounded-md border border-[#d9d2c1] bg-white px-3 text-sm disabled:bg-[#f1eee5]" />
    </label>
  );
}

function Area({
  label,
  name,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-[#687169]">{label}</span>
      <textarea name={name} defaultValue={defaultValue} disabled={disabled} rows={5} className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-white px-3 py-3 text-sm disabled:bg-[#f1eee5]" />
    </label>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-[#d2cab7] bg-white/70 p-4 text-sm text-[#687169]">{text}</div>;
}

function getRunNotice(run?: string) {
  if (!run) {
    return null;
  }

  const notices: Record<string, string> = {
    sample: "Sample lead created. The workspace is ready for research, audit, outreach, and approvals.",
    research: "Research run complete. Review the fit signals and move into website audit.",
    audit: "Website audit complete. Findings are ready to feed your outreach angle.",
    draft: "Outreach draft created. The approval queue now has a review item.",
    "client-ops": "Client operations assets were prepared. Review the payloads before any external action.",
    approve: "Approval recorded. Ready assets and sync payloads moved forward safely.",
    reject: "Approval rejected. The lead has been moved back into revision mode.",
    outcome: "Outcome logged. The learning loop has a new signal to work with.",
    metadata: "Lead context updated. The workspace will use the latest operator metadata.",
    "stage-moved": "Stage override recorded with an operator trace for auditability.",
    "next-action": "Human next move saved separately from the AI suggestion.",
    "setup-complete": "Setup completed. Your database is linked and a sample lead was created.",
  };

  return notices[run] ?? null;
}
