"use client";

import { useActionState, useRef } from "react";
import { BriefcaseBusiness, Download, FileOutput, Printer, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { runProposalGenerator, saveProposalMemory, updateProposalMemoryOutcome, type ProposalGeneratorState } from "@/app/actions";
import { ToolJobStatus } from "@/components/dashboard/tool-job-status";
import type { WorkspacePlaybookState } from "@/lib/leads";
import { getProposalPricingLayout, getProposalTemplate, proposalServiceLineTemplates } from "@/lib/proposal-templates";
import { useAsyncToolJob } from "@/lib/use-async-tool-job";
import type { ProposalMemoryRecord } from "@/lib/workspace-ops-memory";

const initialState: ProposalGeneratorState = {
  message: "",
  jobId: null,
  result: null,
};

export function ProposalGeneratorForm({
  playbook,
  proposalMemory,
}: {
  playbook: WorkspacePlaybookState;
  proposalMemory: ProposalMemoryRecord[];
}) {
  const [state, action, pending] = useActionState(runProposalGenerator, initialState);
  const { job, result } = useAsyncToolJob(state);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const branding = {
    ...playbook.branding,
    ...(result?.branding ?? {}),
  };
  const activeTemplate = getProposalTemplate(result?.serviceLine ?? playbook.branding.defaultServiceLine);
  const activePricingLayout = getProposalPricingLayout(result?.serviceLine ?? playbook.branding.defaultServiceLine, result?.niche ?? playbook.branding.defaultNiche);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!result || !exportRef.current) {
      return;
    }

    const doc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(result.proposalTitle)}</title>
    <style>
      body { font-family: Georgia, serif; margin: 0; background: #f4efe4; color: #1f2521; }
      main { max-width: 900px; margin: 0 auto; padding: 48px 32px; }
      section { background: #fffdf8; border: 1px solid #d8d1c2; border-radius: 20px; padding: 24px; margin-bottom: 20px; }
      h1, h2, h3 { margin: 0; }
      h1 { font-size: 38px; line-height: 1.05; }
      h2 { font-size: 22px; margin-bottom: 12px; }
      h3 { font-size: 16px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #176b5d; }
      p, li { font-size: 15px; line-height: 1.7; }
      ul { margin: 12px 0 0; padding-left: 18px; }
      .hero { background: linear-gradient(135deg, #176b5d, #23453e); color: white; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .chip { display: inline-block; border: 1px solid rgba(255,255,255,0.4); border-radius: 999px; padding: 6px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; }
      .muted { color: #59645e; }
      .price { font-size: 24px; font-weight: 700; color: #176b5d; }
      pre { white-space: pre-wrap; font-family: Georgia, serif; }
      @media print { body { background: white; } main { padding: 0; } section { break-inside: avoid; } }
    </style>
  </head>
  <body>
    <main>${exportRef.current.innerHTML}</main>
  </body>
</html>`;

    const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = slugify(result.proposalTitle) || "leadforge-proposal.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#d2cab7] bg-[#fffdf8] p-6 shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#cfe7de] bg-[#f3faf7] px-3 py-2 text-xs font-black uppercase text-[#176b5d]">
              <Sparkles size={14} /> Proposal generator
            </p>
            <h1 className="mt-4 py-1 text-3xl font-black leading-[1.08] sm:text-5xl">Generate a founder-grade proposal</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4f5a53] sm:text-base">
              Turn client context into a polished proposal package with executive summary, scope, deliverables, phased timeline, pricing options, assumptions, risk framing, and a cover email.
            </p>
            <div className="mt-4 rounded-2xl border border-[#d9d2c1] bg-white p-4">
              <p className="text-xs font-black uppercase text-[#176b5d]">Workspace brand kit</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-lg font-black text-[#1e2521]">{branding.brandName}</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{branding.tagLine}</p>
                  <p className="mt-3 text-xs font-black uppercase text-[#687169]">{branding.proposalVoice}</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{branding.pricingFootnote}</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: branding.accentColor, background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Export theme</p>
                  <div className="mt-4 flex gap-2">
                    <span className="h-8 w-8 rounded-full border border-white/30" style={{ backgroundColor: branding.primaryColor }} />
                    <span className="h-8 w-8 rounded-full border border-white/30" style={{ backgroundColor: branding.secondaryColor }} />
                    <span className="h-8 w-8 rounded-full border border-white/30" style={{ backgroundColor: branding.accentColor }} />
                  </div>
                  <p className="mt-4 text-xs font-black uppercase text-white/84">{branding.signoffName}</p>
                  <p className="mt-2 text-xs leading-5 text-white/84">{branding.contactEmail}</p>
                </div>
              </div>
            </div>
            <form action={action} className="mt-6 space-y-4 rounded-2xl border border-[#e3dccd] bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="clientName" label="Client name" placeholder="Acme Health" required />
                <Field name="clientType" label="Client type" placeholder="Founder-led B2B SaaS" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="projectType" label="Project type" placeholder="Positioning + outbound growth sprint" required />
                <Field name="timelinePreference" label="Timeline preference" placeholder="4 weeks" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase text-[#687169]">Service line template</span>
                  <select name="serviceLine" defaultValue={playbook.branding.defaultServiceLine} className="mt-1 h-12 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm">
                    {proposalServiceLineTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Field name="niche" label="Target niche" placeholder="B2B SaaS" required defaultValue={playbook.branding.defaultNiche} />
              </div>
              <label className="block">
                <span className="text-xs font-black uppercase text-[#687169]">Desired outcome</span>
                <textarea name="desiredOutcome" required rows={3} placeholder="Book more qualified meetings from a sharper offer and better outbound system" className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 py-3 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase text-[#687169]">Scope notes</span>
                <textarea name="scopeNotes" rows={3} placeholder="Website teardown, positioning refinement, outreach assets, client ops support" className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 py-3 text-sm" />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="pricingContext" label="Pricing context" placeholder="Premium but founder-friendly" />
                <Field name="proofAssets" label="Proof assets" placeholder="Teardowns, case studies, conversion insights" />
              </div>
              <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white disabled:bg-[#9da59f]">
                {pending ? "Submitting..." : "Generate proposal"}
              </button>
              {state.message ? <p className="text-sm font-medium text-[#4f5a53]">{state.message}</p> : null}
            </form>
            <div className="mt-4 rounded-2xl border border-[#e3dccd] bg-white p-4">
              <p className="text-xs font-black uppercase text-[#176b5d]">Current default template</p>
              <div className="mt-3 grid gap-4 xl:grid-cols-[1fr_1fr]">
                <div>
                  <p className="text-lg font-black text-[#1e2521]">{activeTemplate.name}</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{activeTemplate.description}</p>
                  <ul className="mt-3 space-y-1 text-sm leading-6 text-[#4f5a53]">
                    {activeTemplate.reusableSections.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-[#e3dccd] bg-[#fffdf8] p-4">
                  <p className="text-xs font-black uppercase text-[#176b5d]">{activePricingLayout.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{activePricingLayout.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activePricingLayout.priceAnchors.map((anchor) => (
                      <span key={anchor} className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">{anchor}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <QuickFact icon={BriefcaseBusiness} title="Commercial framing" detail="Builds a proposal around client outcomes, scope clarity, and believable deliverables." />
            <QuickFact icon={Wallet} title="Pricing options" detail="Gives structured package options instead of leaving the commercial section blank." />
            <QuickFact icon={ShieldCheck} title="Safer close" detail="Includes assumptions, risks, mitigations, and a cover note instead of overpromising." />
          </div>
        </div>
      </section>

      {job ? <ToolJobStatus job={job} title="Proposal generator job" /> : null}

      {result ? (
            <div className="space-y-6">
          <section className="proposal-no-print rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[#176b5d]">Proposal packaging</p>
                <h2 className="mt-1 py-0.5 text-2xl font-black leading-tight">Export-ready client packet</h2>
                <p className="mt-2 text-sm leading-6 text-[#4f5a53]">Use print-to-PDF for a polished handoff, or download the formatted HTML packet for further editing.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handlePrint} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#176b5d] px-4 text-sm font-black text-white">
                  <Printer size={16} /> Print / Save PDF
                </button>
                <button type="button" onClick={handleDownloadHtml} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm font-black text-[#1e2521]">
                  <Download size={16} /> Download HTML packet
                </button>
              </div>
            </div>
          </section>

            <div ref={exportRef} className="space-y-6 proposal-print-root">
            <section className="proposal-page-break rounded-[28px] border p-6 text-white shadow-[0_18px_50px_rgba(45,38,20,0.14)]" style={{ borderColor: branding.accentColor, background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em]">
                <FileOutput size={14} /> LeadForge AI proposal packet
              </span>
              <h2 className="mt-6 max-w-4xl py-1 text-3xl font-black leading-[1.05] sm:text-5xl">{result.proposalTitle}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/88 sm:text-base">{result.executiveSummary}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <ExportChip label="Brand" value={branding.brandName} />
                <ExportChip label="Model" value={result.model ?? "demo-v1"} />
                <ExportChip label="Package type" value={result.mode === "openai" ? "Live AI proposal" : "Fallback proposal"} />
                <ExportChip label="Template" value={result.templateName} />
              </div>
            </section>

            <section className="proposal-page-break grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Panel title="Client situation" eyebrow="What this proposal is responding to">
                <TextCard value={result.clientSituation} />
                <div className="mt-4">
                  <ListPanel title="Goals" items={result.goals} />
                </div>
              </Panel>

              <Panel title="Scope and deliverables" eyebrow="What is included">
                <div className="grid gap-4 lg:grid-cols-2">
                  <ListPanel title="Scope" items={result.scope} />
                  <ListPanel title="Deliverables" items={result.deliverables} />
                </div>
              </Panel>
            </section>

            <section className="proposal-page-break grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Panel title="Timeline" eyebrow="Phased plan">
                <div className="space-y-3">
                  {result.timeline.map((item) => (
                    <div key={item.phase} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-[#1e2521]">{item.phase}</p>
                        <span className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">{item.duration}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{item.outcome}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Pricing options" eyebrow="Commercial packaging">
                <div className="space-y-4">
                  {result.pricingOptions.map((option) => (
                    <div key={option.name} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-[#1e2521]">{option.name}</p>
                        <span className="text-lg font-black text-[#176b5d]">{option.price}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{option.bestFor}</p>
                      <div className="mt-3">
                        <ListPanel title="Includes" items={option.includes} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="proposal-page-break grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Panel title="Assumptions and proof" eyebrow="Why the proposal is grounded">
                <div className="grid gap-4 lg:grid-cols-2">
                  <ListPanel title="Assumptions" items={result.assumptions} />
                  <ListPanel title="Proof points" items={result.proofPoints} />
                </div>
              </Panel>

              <Panel title="Risks and mitigations" eyebrow="Keep the scope believable">
                <div className="space-y-3">
                  {result.risksAndMitigations.map((item) => (
                    <div key={item.risk} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                      <p className="text-sm font-black text-[#1e2521]">{item.risk}</p>
                      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{item.mitigation}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="proposal-page-break grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Panel title="Guarantee language" eyebrow="Template-driven commercial reassurance">
                <TextCard value={result.guaranteeBlock} />
              </Panel>
              <Panel title="Niche pricing layout" eyebrow="How pricing is framed for this market">
                <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
                  <p className="text-sm font-black text-[#1e2521]">{result.pricingLayout.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{result.pricingLayout.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.pricingLayout.priceAnchors.map((anchor) => (
                      <span key={anchor} className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">{anchor}</span>
                    ))}
                  </div>
                </div>
              </Panel>
            </section>

            <section className="proposal-page-break rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
              <p className="text-xs font-black uppercase text-[#176b5d]">Reusable case-study blocks</p>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {result.caseStudyBlocks.map((block) => (
                  <div key={block.title} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-sm font-black text-[#1e2521]">{block.title}</p>
                    <p className="mt-2 text-xs font-black uppercase text-[#176b5d]">{block.outcome}</p>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{block.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="proposal-page-break grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Panel title="Call to action" eyebrow="How to close the proposal">
                <TextCard value={result.cta} />
              </Panel>
              <Panel title="Cover email" eyebrow="Send-ready intro note">
                <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
                  <p className="text-xs font-black uppercase text-[#176b5d]">{result.coverEmail.subject}</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#4f5a53]">{result.coverEmail.body}</p>
                </div>
              </Panel>
            </section>
            <section className="proposal-page-break rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
              <p className="text-xs font-black uppercase" style={{ color: branding.primaryColor }}>Brand and delivery notes</p>
              <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
                <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
                  <p className="text-sm font-black text-[#1e2521]">Commercial framing</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{branding.pricingFootnote}</p>
                </div>
                <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
                  <p className="text-sm font-black text-[#1e2521]">Signature block</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{branding.signoffName}</p>
                  <p className="text-sm leading-6 text-[#4f5a53]">{branding.contactEmail}</p>
                  <p className="text-sm leading-6 text-[#4f5a53]">{branding.websiteUrl}</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-6 text-[#687169]">{branding.legalFooter}</p>
            </section>
          </div>

          <section className="proposal-no-print rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
            <p className="text-xs font-black uppercase text-[#176b5d]">Proposal memory</p>
            <h3 className="mt-1 text-xl font-black">Save this proposal into the win/loss ledger</h3>
            <form action={saveProposalMemory} className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <input type="hidden" name="proposalTitle" value={result.proposalTitle} />
              <input type="hidden" name="clientName" value={result.clientName} />
              <input type="hidden" name="clientType" value={result.clientType} />
              <input type="hidden" name="templateName" value={result.templateName} />
              <input type="hidden" name="serviceLine" value={result.serviceLine} />
              <input type="hidden" name="niche" value={result.niche} />
              <input type="hidden" name="primaryPriceAnchor" value={result.pricingLayout.priceAnchors[0] ?? result.pricingOptions[0]?.price ?? "Custom"} />
              <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
                <p className="text-sm font-black text-[#1e2521]">{result.templateName}</p>
                <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{result.niche} • {result.pricingLayout.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{result.guaranteeBlock}</p>
              </div>
              <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
                <label className="block">
                  <span className="text-xs font-black uppercase text-[#687169]">Initial outcome</span>
                  <select name="outcome" defaultValue="OPEN" className="mt-1 h-11 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
                    <option value="OPEN">Open</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                    <option value="STALLED">Stalled</option>
                  </select>
                </label>
                <label className="mt-3 block">
                  <span className="text-xs font-black uppercase text-[#687169]">Notes</span>
                  <textarea name="notes" rows={4} placeholder="Why this proposal is strong, risky, or likely to win." className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 py-3 text-sm" />
                </label>
                <button className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-[#176b5d] px-4 text-sm font-black text-white">
                  Save to memory
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
        <p className="text-xs font-black uppercase text-[#176b5d]">Template performance memory</p>
        <h3 className="mt-1 text-xl font-black">Proposal wins and losses by template choice</h3>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {proposalMemory.map((record) => (
            <article key={record.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#1e2521]">{record.proposalTitle}</p>
                  <p className="mt-1 text-xs font-black uppercase text-[#176b5d]">{record.templateName} • {record.niche}</p>
                </div>
                <span className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">{record.outcome}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{record.notes || "No notes recorded yet."}</p>
              <p className="mt-3 text-xs uppercase text-[#687169]">{record.primaryPriceAnchor}</p>
              <form action={updateProposalMemoryOutcome} className="mt-4 grid gap-3">
                <input type="hidden" name="recordId" value={record.id} />
                <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
                  <select name="outcome" defaultValue={record.outcome} className="h-11 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
                    <option value="OPEN">Open</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                    <option value="STALLED">Stalled</option>
                  </select>
                  <input name="notes" defaultValue={record.notes} placeholder="Outcome note" className="h-11 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm" />
                </div>
                <button className="inline-flex h-10 items-center justify-center rounded-md border border-[#d9d2c1] px-4 text-sm font-black text-[#1e2521]">
                  Update memory
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ name, label, placeholder, required, defaultValue }: { name: string; label: string; placeholder: string; required?: boolean; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-[#687169]">{label}</span>
      <input name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} className="mt-1 h-12 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm" />
    </label>
  );
}

function QuickFact({ icon: Icon, title, detail }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-4">
      <Icon size={18} className="text-[#176b5d]" />
      <p className="mt-3 text-sm font-black text-[#1e2521]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{detail}</p>
    </div>
  );
}

function ExportChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/8 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/72">{label}</p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
      <p className="text-xs font-black uppercase text-[#176b5d]">{eyebrow}</p>
      <h2 className="mt-1 py-0.5 text-xl font-black leading-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
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

function TextCard({ value }: { value: string }) {
  return <div className="rounded-xl border border-[#e3dccd] bg-white p-4 text-sm leading-7 text-[#4f5a53]">{value}</div>;
}

function slugify(value: string) {
  return `${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "leadforge-proposal"}.html`;
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
