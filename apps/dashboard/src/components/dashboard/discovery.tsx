import React from "react";
import { 
  type DiscoveryState, 
  type LeadDataState 
} from "@/lib/leads";
import { runLeadDiscovery, saveCandidateLead } from "@/app/actions";
import { EmptyState } from "./shared";

export function LeadDiscoveryPanel({ discovery, databaseStatus }: { discovery: DiscoveryState; databaseStatus: LeadDataState["status"] }) {
  const disabled = databaseStatus !== "connected";
  return (
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-6">
      <p className="text-xs font-black uppercase text-[#176b5d]">Discovery</p>
      <h2 className="mt-1 text-2xl font-black">Autonomous lead discovery</h2>
      <p className="mt-2 text-sm text-[#687169]">Generate a compliant query plan, inspect candidate evidence, then save only the leads worth moving into the pipeline.</p>

      <form action={runLeadDiscovery} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="targetMarket" defaultValue={discovery.targetMarket} disabled={disabled} placeholder="Target market (e.g. Healthcare SaaS)" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
          <input name="geography" disabled={disabled} placeholder="Geography (e.g. US, India, UK)" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input name="companySize" disabled={disabled} placeholder="Company size range" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
          <input name="sector" disabled={disabled} placeholder="Sector or niche" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
          <input name="painFocus" disabled={disabled} placeholder="Pain-based targeting" className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
          <select name="websiteQualityBias" disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm">
            <option value="">Website quality bias</option>
            <option value="high-converting">Prioritize strong websites</option>
            <option value="weak-messaging">Prioritize weak messaging sites</option>
            <option value="founder-led">Prioritize founder-led sites</option>
          </select>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <select name="icpStrictness" disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm md:w-72">
            <option value="">ICP strictness</option>
            <option value="strict">Strict</option>
            <option value="balanced">Balanced</option>
            <option value="broad">Broad</option>
          </select>
          <button type="submit" disabled={disabled} className="inline-flex h-12 items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white disabled:bg-[#9da59f]">
            Find leads
          </button>
        </div>
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
                  {candidate.sourceUrl ? (
                    <a href={candidate.sourceUrl} target="_blank" className="mt-2 inline-flex text-xs font-black text-[#176b5d]">
                      View source
                    </a>
                  ) : null}
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
                  <p className="mt-2 text-[10px] font-bold uppercase text-[#687169]">
                    {candidate.confidence ? `${Math.round(candidate.confidence * 100)}% confidence` : "Confidence pending"}
                  </p>
                  {candidate.auditHintScore != null ? (
                    <p className="mt-1 text-[10px] font-bold uppercase text-[#687169]">Audit hint {candidate.auditHintScore}</p>
                  ) : null}
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

      <div className="mt-6 rounded-xl border border-[#e3dccd] bg-white p-4">
        <p className="text-xs font-black uppercase text-[#687169]">Discovery history</p>
        <p className="mt-2 text-sm leading-6 text-[#4f5a53]">
          Current run summary: {discovery.summary || "No discovery run yet. Once you run discovery, the app will keep candidate evidence and save-to-pipeline state here."}
        </p>
      </div>
    </section>
  );
}
