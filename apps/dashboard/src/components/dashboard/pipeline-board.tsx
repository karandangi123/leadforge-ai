"use client";

import React from "react";
import Link from "next/link";
import { Filter, Search, ChevronRight, ChevronLeft, MoreHorizontal, Sparkles } from "lucide-react";
import { 
  type DashboardLead, 
  type LeadDataState, 
  type PipelineColumn 
} from "@/lib/leads";
import { moveLeadStage } from "@/app/actions";
import { Metric, EmptyState } from "./shared";
import { motion } from "framer-motion";

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
    <form className="flex flex-wrap gap-3 items-center bg-white border border-[var(--border-light)] p-2 rounded-2xl shadow-sm">
      <input type="hidden" name="view" value="dashboard" />
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          name="search"
          defaultValue={currentFilter.search}
          placeholder="Search leads..."
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--border-light)] bg-[var(--soft-cyan)]/30 text-sm focus:border-[var(--accent-teal)] transition-colors outline-none"
        />
      </div>
      <div className="flex gap-2 items-center">
        <select name="stage" defaultValue={currentFilter.stage} className="h-10 rounded-xl border border-[var(--border-light)] bg-white px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--accent-teal)]">
          <option value="ALL">All Stages</option>
          {leadState.filters.stages.map((stage) => (
            <option key={stage.value} value={stage.value}>{stage.label}</option>
          ))}
        </select>
        <select name="source" defaultValue={currentFilter.source} className="h-10 rounded-xl border border-[var(--border-light)] bg-white px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--accent-teal)]">
          <option value="ALL">All Sources</option>
          {leadState.filters.sources.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border-light)] bg-white px-4 text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--soft-cyan)]/30 transition-colors">
          <input type="checkbox" name="pending" value="1" defaultChecked={currentFilter.pendingOnly} className="accent-[var(--accent-teal)]" />
          Pending
        </label>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--dark-bg)] px-5 text-sm font-bold text-white hover:bg-[var(--dark-card)] transition-all">
          <Filter size={14} /> Apply
        </button>
      </div>
    </form>
  );
}

export function PipelineColumnView({
  column,
}: {
  column: PipelineColumn;
}) {
  return (
    <section className="flex flex-col rounded-[2rem] border border-[var(--border-light)] bg-white/50 backdrop-blur-sm min-w-[320px] max-w-[320px] shadow-sm">
      <div className="p-6 border-b border-[var(--border-light)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.2em]">{column.label}</h3>
          <span className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-lg bg-[var(--soft-cyan)] text-[10px] font-black text-[var(--accent-teal)] border border-[var(--accent-cyan)]/20">
            {column.count}
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-5 font-medium">{column.description}</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/70 border border-[var(--border-light)] px-2 py-2 text-center shadow-sm">
            <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Fit</p>
            <p className="text-[11px] font-black text-[var(--foreground)]">{column.avgFit}</p>
          </div>
          <div className="rounded-xl bg-white/70 border border-[var(--border-light)] px-2 py-2 text-center shadow-sm">
            <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Audit</p>
            <p className="text-[11px] font-black text-[var(--foreground)]">{column.avgAudit}</p>
          </div>
          <div className="rounded-xl bg-white/70 border border-[var(--border-light)] px-2 py-2 text-center shadow-sm">
            <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Pend.</p>
            <p className="text-[11px] font-black text-[var(--foreground)]">{column.pendingApprovals}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 overflow-y-auto max-h-[calc(100vh-450px)] custom-scrollbar">
        {column.leads.length > 0 ? (
          column.leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        ) : (
          <EmptyState text="No leads" compact />
        )}
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
    <motion.article 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative rounded-2xl border border-[var(--border-light)] bg-white p-5 shadow-sm transition-all hover:border-[var(--accent-teal)] hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <Link href={`/leads/${lead.id}`} className="text-[15px] font-bold text-[var(--foreground)] hover:text-[var(--accent-teal)] transition-colors truncate block tracking-tight">
            {lead.company}
          </Link>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em]">{lead.segment}</p>
             {lead.hasPendingApproval && (
               <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse" />
             )}
          </div>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-[var(--soft-cyan)] transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal size={14} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {lead.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-md bg-[var(--soft-cyan)]/50 border border-[var(--accent-cyan)]/10 text-[9px] font-black text-[var(--accent-teal)] uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="rounded-xl bg-[var(--soft-cyan)]/20 border border-[var(--accent-cyan)]/5 px-3 py-2.5">
          <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Fit</p>
          <p className="text-sm font-black text-[var(--foreground)]">{lead.fit ?? "-"}</p>
        </div>
        <div className="rounded-xl bg-[var(--soft-cyan)]/20 border border-[var(--accent-cyan)]/5 px-3 py-2.5">
          <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Audit</p>
          <p className="text-sm font-black text-[var(--foreground)]">{lead.audit ?? "-"}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 p-2 rounded-lg bg-[var(--soft-cyan)]/10 border border-dashed border-[var(--border-light)]">
        <Sparkles size={12} className="text-[var(--accent-teal)] shrink-0" />
        <p className="text-[10px] font-semibold text-[var(--text-secondary)] line-clamp-1 italic tracking-tight">{lead.next}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link 
          href={`/leads/${lead.id}`} 
          className="flex-1 flex items-center justify-center h-10 rounded-xl border border-[var(--border-light)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-all bg-white"
        >
          View Lead
        </Link>
        <div className="flex items-center gap-1.5">
          {previousStage && (
            <form action={moveLeadStage}>
              <input type="hidden" name="leadId" value={lead.id} />
              <input type="hidden" name="status" value={previousStage} />
              <input type="hidden" name="manualStatusReason" value="Moved backward." />
              <input type="hidden" name="returnTo" value="/dashboard?view=dashboard" />
              <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-all bg-white">
                <ChevronLeft size={16} />
              </button>
            </form>
          )}
          {nextStage && (
            <form action={moveLeadStage}>
              <input type="hidden" name="leadId" value={lead.id} />
              <input type="hidden" name="status" value={nextStage} />
              <input type="hidden" name="manualStatusReason" value="Moved forward." />
              <input type="hidden" name="returnTo" value="/dashboard?view=dashboard" />
              <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--dark-bg)] text-white hover:bg-[var(--dark-card)] transition-all shadow-lg hover:shadow-[0_0_15px_rgba(0,209,193,0.3)]">
                <ChevronRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function getAdjacentStage(status: DashboardLead["status"], offset: -1 | 1) {
  const statuses = ["NEW", "RESEARCH", "AUDIT", "DRAFTED", "APPROVAL", "READY", "SYNCED", "REJECTED"] as const;
  const index = statuses.indexOf(status);
  const target = statuses[index + offset];
  return target ?? null;
}
