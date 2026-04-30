import React from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import { 
  type DashboardLead, 
  type LeadDataState, 
  type PipelineColumn 
} from "@/lib/leads";
import { moveLeadStage } from "@/app/actions";
import { Metric, EmptyState } from "./shared";

export function PipelineFilterBar({
  leadState,
  currentFilter,
}: {
  leadState: LeadDataState;
  currentFilter: {
    search: string;
    stage: string;
    source: string;
    fitBand: string;
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
      <select name="fit" defaultValue={currentFilter.fitBand} className="h-10 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
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

export function PipelineColumnView({
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

export function LeadCard({
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

function getAdjacentStage(status: DashboardLead["status"], offset: -1 | 1) {
  const statuses = ["NEW", "RESEARCH", "AUDIT", "DRAFTED", "APPROVAL", "READY", "SYNCED", "REJECTED"] as const;
  const index = statuses.indexOf(status);
  const target = statuses[index + offset];
  return target ?? null;
}
