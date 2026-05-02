import React from "react";
import Link from "next/link";
import { Activity, Filter, ShieldCheck, Sparkles } from "lucide-react";
import { 
  type LeadDataState 
} from "@/lib/leads";
import { createTraceSavedView } from "@/app/actions";
import { EmptyState, TrustLine } from "./shared";

export function TraceFilterBar({
  traces,
  currentFilter,
}: {
  traces: LeadDataState["traceViewer"];
  currentFilter: { search: string; agent: string; status: string };
}) {
  const agents = Array.from(new Set(traces.map((trace) => trace.agentName))).sort();
  const statuses = Array.from(new Set(traces.map((trace) => trace.status))).sort();
  return (
    <form className="mb-6 grid gap-3 rounded-2xl border border-[#e3dccd] bg-[#fdfdfc] p-4 lg:grid-cols-[1.5fr_1fr_1fr_auto] animate-fade-in">
      <input type="hidden" name="view" value="traces" />
      <div className="relative">
        <input name="traceSearch" defaultValue={currentFilter.search} placeholder="Search lead, preview, model, or eval..." className="premium-input pl-10" />
        <Filter className="absolute left-3.5 top-3.5 text-[#9a9488]" size={14} />
      </div>
      <select name="traceAgent" defaultValue={currentFilter.agent} className="premium-input appearance-none">
        <option value="ALL">All agents</option>
        {agents.map((agent) => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>
      <select name="traceStatus" defaultValue={currentFilter.status} className="premium-input appearance-none">
        <option value="ALL">All statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button className="premium-button-primary">
        Apply filter
      </button>
    </form>
  );
}

export function TraceViewer({ 
  leadState, 
  traceFilter, 
  visibleTraces 
}: { 
  leadState: LeadDataState; 
  traceFilter: { search: string; agent: string; status: string };
  visibleTraces: LeadDataState["traceViewer"];
}) {
  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] animate-fade-in">
      <div className="space-y-6">
        <section className="premium-card p-6">
          <div className="flex items-center gap-3 border-b border-[#e3dccd] pb-6 mb-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf4ef] text-[#176b5d]">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Trace Engine</h2>
              <p className="text-sm text-[#687169]">Real-time visibility into autonomous RevOps executions</p>
            </div>
          </div>

          <TraceFilterBar traces={leadState.traceViewer} currentFilter={traceFilter} />

          {leadState.traceSavedViews.length > 0 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {leadState.traceSavedViews
                .slice()
                .sort((left, right) => Number(right.pinned) - Number(left.pinned))
                .map((view) => (
                  <Link
                    key={view.id}
                    href={`/?view=traces&traceSearch=${encodeURIComponent(view.search)}&traceAgent=${encodeURIComponent(view.agent)}&traceStatus=${encodeURIComponent(view.status)}`}
                    className="group relative flex flex-col gap-1 rounded-2xl border border-[#e3dccd] bg-white px-4 py-3 transition-all hover:border-[#176b5d] hover:bg-[#f9fffc]"
                  >
                    <span className="text-sm font-bold text-[#1e2521]">{view.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#687169]">
                      {view.pinned ? "📌 Pinned" : "Saved"} • {view.agent}
                    </span>
                  </Link>
                ))}
            </div>
          ) : null}

          <div className="space-y-4">
            {visibleTraces.length > 0 ? visibleTraces.map((trace) => (
              <div key={trace.id} className="group relative rounded-2xl border border-[#e3dccd] bg-white p-5 transition-all hover:border-[#176b5d] hover:shadow-xl hover:shadow-[#176b5d]/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${trace.status === "SUCCEEDED" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <div>
                      <h4 className="font-black text-[#1e2521] group-hover:text-[#176b5d] transition-colors">{trace.agentName}</h4>
                      <p className="mt-1 text-xs font-bold text-[#687169]">
                        {trace.leadName} <span className="mx-1.5 opacity-30">•</span> {trace.model ?? "Generic Model"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#9a9488]">{trace.timestamp}</span>
                </div>
                
                <div className="mt-4 rounded-xl bg-gray-50/80 p-4 text-sm leading-relaxed text-[#4f5a53] border border-gray-100/50">
                  {trace.preview}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="rounded-lg bg-white border border-[#e3dccd] px-2 py-1 text-[10px] font-black text-[#176b5d]">{trace.latencyMs ?? "0"}ms</span>
                    <span className="rounded-lg bg-white border border-[#e3dccd] px-2 py-1 text-[10px] font-black text-[#176b5d]">{trace.tokenCount ?? "0"} tok</span>
                    <span className="rounded-lg bg-white border border-[#e3dccd] px-2 py-1 text-[10px] font-black text-[#176b5d]">{trace.costCents == null ? "0" : `${trace.costCents}`}¢</span>
                  </div>
                  
                  <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/leads/${trace.leadId}?trace=${trace.id}`} className="premium-button h-8 bg-[#1e2521] text-white px-3 text-[10px] uppercase tracking-widest">
                      Drilldown
                    </Link>
                    <Link href={`/leads/${trace.leadId}`} className="premium-button h-8 border border-[#d9d2c1] bg-white text-[#1e2521] px-3 text-[10px] uppercase tracking-widest">
                      View Lead
                    </Link>
                  </div>
                </div>

                {trace.evaluationSummary.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-gray-50 pt-4">
                    {trace.evaluationSummary.map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[#f3faf7] px-2.5 py-0.5 text-[10px] font-black text-[#176b5d]">
                        <ShieldCheck size={10} /> {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )) : <EmptyState text="No traces match the current search or filters. Broaden the filter to inspect more runs." />}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="premium-card p-6 bg-[#f9fafb]/50">
          <h3 className="text-lg font-black text-[#1e2521]">Interpretation Guide</h3>
          <p className="mt-2 text-sm text-[#687169] mb-6">How to use the Trace Engine operationally</p>
          
          <div className="space-y-4">
            <TrustLine title="Low-signal patterns" detail="Short or vague previews often indicate weak prompts or thin lead context." />
            <TrustLine title="Latency & Token spikes" detail="Reveal prompts that are getting bloated or doing too much at once." />
            <TrustLine title="Quality Center linkage" detail="When evals fail, traces help you see where the weakness was introduced." />
          </div>

          <div className="mt-8 pt-8 border-t border-[#e3dccd]">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#176b5d] mb-4">Save Filter View</h4>
            <form action={createTraceSavedView} className="space-y-3">
              <input name="name" placeholder="Name your view (e.g. 'Failed Outreach')" className="premium-input" />
              <input type="hidden" name="search" value={traceFilter.search} />
              <input type="hidden" name="agent" value={traceFilter.agent} />
              <input type="hidden" name="status" value={traceFilter.status} />
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="flex h-5 w-5 items-center justify-center rounded border border-[#d9d2c1] bg-white transition-colors group-hover:border-[#176b5d]">
                  <input type="checkbox" name="pinned" value="1" className="sr-only peer" />
                  <div className="h-2.5 w-2.5 rounded-sm bg-[#176b5d] opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-semibold text-[#4f5a53]">Pin for all operators</span>
              </label>
              <button className="premium-button-primary w-full mt-2">
                Save current view
              </button>
            </form>
          </div>
        </section>

        <div className="rounded-[24px] bg-[#1e2521] p-6 text-white overflow-hidden relative">
          <Sparkles className="absolute -right-4 -top-4 opacity-10" size={120} />
          <h4 className="text-lg font-black relative z-10">System Health</h4>
          <p className="mt-1 text-sm text-gray-400 relative z-10">Trace engine is currently monitoring 8 autonomous agents.</p>
          <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Uptime</p>
              <p className="mt-1 text-xl font-black">99.9%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Avg Latency</p>
              <p className="mt-1 text-xl font-black">1.2s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
