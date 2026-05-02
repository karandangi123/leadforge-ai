import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, Mail, Sparkles } from "lucide-react";
import type { LeadDataState } from "@/lib/leads";
import type { GmailConnectionState } from "@/lib/integration-connections";
import { TrustLine } from "./shared";

export function Mailroom({
  approvalQueue,
  traceViewer,
  gmailConnection,
}: {
  approvalQueue: LeadDataState["approvalQueue"];
  traceViewer: LeadDataState["traceViewer"];
  gmailConnection: GmailConnectionState;
}) {
  const emailApprovals = approvalQueue.filter((item) => item.assetType === "EMAIL");
  const gmailDraftEvents = traceViewer.filter((trace) => trace.agentName === "Gmail Bridge");
  const gmailConfigured = gmailConnection.isActive;
  const gmailStatusLabel = gmailConnection.statusLabel;

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_0.8fr] animate-fade-in">
      <div className="space-y-6">
        <section className="premium-card p-6">
          <div className="mb-6 flex items-center justify-between border-b border-[#e3dccd] pb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf4ef] text-[#176b5d]">
                <Mail size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Mailroom</h2>
                <p className="text-sm text-[#687169]">Track approval-safe Gmail handoff without pretending to auto-send.</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${gmailConfigured ? "bg-[#edf9f3] text-[#176b5d]" : "bg-[#fff4eb] text-[#8a4b12]"}`}>
              {gmailConfigured ? "Gmail configured" : "Gmail not configured"}
            </span>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e3dccd] bg-white p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Approved email assets</p>
              <p className="mt-2 text-3xl font-black text-[#1e2521]">
                {emailApprovals.filter((item) => item.status === "APPROVED").length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e3dccd] bg-white p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Gmail bridge traces</p>
              <p className="mt-2 text-3xl font-black text-[#1e2521]">{gmailDraftEvents.length}</p>
            </div>
          </div>

          <div className="space-y-3">
            {emailApprovals.length > 0 ? (
              emailApprovals.map((draft) => (
                <div key={draft.id} className="rounded-2xl border border-[#e3dccd] bg-white p-5 transition-all hover:border-[#176b5d] hover:shadow-lg hover:shadow-black/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-[#1e2521]">{draft.leadName}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${draft.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                          {draft.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-bold text-[#4f5a53]">{draft.draftSubject ?? draft.requestedAction}</p>
                      <p className="mt-2 text-xs text-[#9a9488]">{draft.createdAt}</p>
                    </div>
                    <Link href={`/leads/${draft.leadId}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dccd] text-[#687169] transition-colors hover:bg-gray-50 hover:text-[#1e2521]">
                      {draft.status === "APPROVED" ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d2cab7] bg-white p-5 text-sm text-[#687169]">
                No email approvals are in the mailroom yet. Approve an outreach asset first, then push the draft from the lead detail page.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="premium-card bg-[#f9fafb]/50 p-6">
          <h3 className="text-lg font-black text-[#1e2521]">Gmail Connectivity</h3>
          <p className="mt-2 mb-6 text-sm text-[#687169]">Status of the first real external workflow</p>

          <div className="space-y-4">
            <TrustLine title="Drafts only" detail="LeadForge creates Gmail drafts after reviewer approval. It does not auto-send email in this phase." />
            <TrustLine title="OAuth connection" detail="Gmail access is connected through Google OAuth and stored per workspace so token refresh is handled safely." />
            <TrustLine title="Traceable handoff" detail="Every Gmail draft attempt writes sync state and a Gmail Bridge trace back into the lead record." />
          </div>

          <div className="mt-8 rounded-2xl border border-[#e3dccd] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${gmailConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <p className="text-sm font-bold">{gmailStatusLabel}</p>
            </div>
            <p className="mt-2 text-xs text-[#687169]">
              {gmailConfigured
                ? "Approved outreach can be turned into Gmail drafts from the lead detail page."
                : "Open Setup to inspect status and run the Gmail recovery flow before trying to create drafts."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#e3dccd] bg-[#fffdf8] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Labels</p>
                <p className="mt-1 text-lg font-black text-[#1e2521]">{gmailConnection.labelCount}</p>
              </div>
              <div className="rounded-xl border border-[#e3dccd] bg-[#fffdf8] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Recent drafts</p>
                <p className="mt-1 text-lg font-black text-[#1e2521]">{gmailConnection.recentDraftCount}</p>
              </div>
              <div className="rounded-xl border border-[#e3dccd] bg-[#fffdf8] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Snapshot</p>
                <p className="mt-1 text-sm font-black text-[#1e2521]">{gmailConnection.snapshotStatus ?? "Not started"}</p>
              </div>
            </div>
            {gmailConnection.lastError ? <p className="mt-3 text-xs font-bold uppercase text-[#b2412d]">{gmailConnection.lastError}</p> : null}
            {gmailConnection.snapshotError ? <p className="mt-3 text-xs font-bold uppercase text-[#b2412d]">{gmailConnection.snapshotError}</p> : null}
          </div>
        </section>

        <div className="relative overflow-hidden rounded-[24px] bg-[#1e2521] p-6 text-white">
          <Sparkles className="absolute -right-4 -top-4 opacity-10" size={120} />
          <h4 className="relative z-10 text-lg font-black">Approval Boundary</h4>
          <p className="relative z-10 mt-1 text-sm text-gray-400">Drafts can be created, reviewed in Gmail, and traced back into LeadForge, but outbound sending still requires explicit future product work.</p>
        </div>
      </div>
    </div>
  );
}
