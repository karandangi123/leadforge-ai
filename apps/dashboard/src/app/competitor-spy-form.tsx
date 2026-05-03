"use client";

import { useActionState } from "react";
import { Crosshair, Flag, Radar, Sparkles, ArrowRight, Swords, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { createLeadFromInsight } from "@/app/actions/leads";
import { runCompetitorSpy, type CompetitorSpyState } from "@/app/actions/tools";
import { ToolJobStatus } from "@/components/dashboard/tool-job-status";
import { useAsyncToolJob } from "@/lib/use-async-tool-job";

const initialState: CompetitorSpyState = {
  message: "",
  jobId: null,
  result: null,
};

export function CompetitorSpyForm() {
  const [state, action, pending] = useActionState(runCompetitorSpy, initialState);
  const { job, result } = useAsyncToolJob(state);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-light)] bg-white p-10 md:p-14 shadow-xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--soft-cyan)] to-transparent opacity-30 pointer-events-none" />
        
        <div className="grid gap-12 xl:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--soft-cyan)] border border-[var(--accent-cyan)]/20 mb-8 text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
              <Sparkles size={14} /> Intelligence Lab
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.1] mb-8">
              Competitor <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--foreground)] to-[var(--text-secondary)]">
                Spy Brief.
              </span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10 max-w-xl">
              Uncover the positioning voids and messaging gaps in your competition. Get a high-fidelity brief on how to out-market and out-sell anyone in your niche.
            </p>
            
            <form action={action} className="relative max-w-2xl">
              <div className="flex flex-col md:flex-row gap-3 bg-[var(--soft-cyan)]/30 border border-[var(--border-light)] p-2 rounded-2xl">
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://competitor-site.com"
                  className="flex-1 h-14 px-5 rounded-xl border border-transparent bg-white text-sm focus:border-[var(--accent-teal)] outline-none shadow-sm transition-all"
                />
                <input
                  name="notes"
                  placeholder="e.g. Agency, SaaS..."
                  className="h-14 px-5 rounded-xl border border-transparent bg-white text-sm font-semibold text-[var(--foreground)] outline-none shadow-sm transition-all min-w-[200px]"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="h-14 px-8 rounded-xl bg-[var(--dark-bg)] text-white font-bold text-sm transition-all hover:bg-[var(--dark-card)] hover:shadow-[0_0_20px_rgba(0,209,193,0.3)] disabled:opacity-50"
                >
                  {pending ? "Analyzing..." : "Spy Now"}
                </button>
              </div>
              {state.message && (
                <p className="mt-4 text-sm font-semibold text-[var(--accent-teal)]">{state.message}</p>
              )}
            </form>
          </div>

          <div className="grid gap-4">
            <QuickFactCard 
              icon={Radar} 
              title="Positioning Audit" 
              detail="Deep analysis of how they frame their value and who they are actually targeting." 
            />
            <QuickFactCard 
              icon={Crosshair} 
              title="Strategic Gaps" 
              detail="Identifies precisely where their messaging is weak or their offer is vulnerable." 
            />
            <QuickFactCard 
              icon={Flag} 
              title="Attack Vector" 
              detail="Actionable hooks and counter-positioning angles you can use in your outbound." 
            />
          </div>
        </div>
      </section>

      {job ? (
        <div className="animate-fade-in">
          <ToolJobStatus job={job} title="Competitor Analysis in Progress..." />
        </div>
      ) : null}

      {result ? (
        <div className="space-y-10 animate-fade-in">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.45fr]">
            <div className="space-y-10">
              {/* Main Analysis */}
              <PremiumPanel title={`${result.competitorName} Brief`} eyebrow={result.url}>
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg leading-relaxed text-[var(--text-secondary)] font-medium">
                    {result.summary}
                  </p>
                </div>
              </PremiumPanel>

              {/* Strategic Void */}
              <section className="relative overflow-hidden rounded-[2.5rem] border border-[var(--accent-cyan)]/30 bg-[var(--dark-bg)] p-10 md:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Radar size={150} className="text-[var(--accent-teal)]" />
                </div>
                <div className="relative z-10">
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
                      <Target size={14} /> Competitive Void
                   </div>
                   <h3 className="text-3xl font-black text-white mb-6 tracking-tight leading-tight">The Opportunity Gap</h3>
                   <p className="text-xl text-[var(--soft-cyan)] leading-relaxed font-medium">
                      {result.strategicVoid}
                   </p>
                   <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-dashed border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)] mb-2">Recommended Attack Angle</p>
                      <p className="text-lg font-bold text-white tracking-tight">{result.differentiationMoves[0]}</p>
                   </div>
                </div>
              </section>

              {/* Positioning Snapshot */}
              <PremiumPanel title="Market Positioning" eyebrow="Observation Layer">
                <div className="grid gap-6 md:grid-cols-3">
                  <AnalysisBlock title="Offer Framing" value={result.offerPositioning} />
                  <AnalysisBlock title="CTA Intent" value={result.ctaStyle} />
                  <AnalysisBlock title="Funnel Logic" value={result.funnelObservation} />
                </div>
              </PremiumPanel>

              {/* Differentiation */}
              <PremiumPanel title="Differentiation Strategy" eyebrow="How to Out-Position">
                <div className="space-y-6">
                  <ul className="grid gap-4 md:grid-cols-2">
                    {result.differentiationMoves.map((move, idx) => (
                      <li key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--soft-cyan)]/10 border border-[var(--border-light)] hover:border-[var(--accent-teal)] transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border-light)] flex items-center justify-center shrink-0 group-hover:bg-[var(--accent-teal)] group-hover:text-white transition-colors">
                           <Swords size={16} />
                        </div>
                        <p className="text-sm font-semibold text-[var(--foreground)] leading-relaxed">{move}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="grid gap-6 md:grid-cols-3 pt-6 border-t border-[var(--border-light)]">
                    <AnalysisBlock title="Homepage Pivot" value={result.quickAttackPlan.homepageAngle} />
                    <AnalysisBlock title="Proof Upgrade" value={result.quickAttackPlan.proofStrategy} />
                    <AnalysisBlock title="CTA Handoff" value={result.quickAttackPlan.ctaStrategy} />
                  </div>
                </div>
              </PremiumPanel>
            </div>

            {/* Sidebar Results */}
            <aside className="space-y-8">
              <PremiumPanel title="Keyword Focus" eyebrow="Search & Intent">
                <div className="flex flex-wrap gap-2">
                   {result.keywordAngles.map(keyword => (
                     <span key={keyword} className="px-3 py-1.5 rounded-xl bg-[var(--soft-cyan)]/20 border border-[var(--border-light)] text-[11px] font-black text-[var(--foreground)] uppercase tracking-wider">
                       {keyword}
                     </span>
                   ))}
                </div>
              </PremiumPanel>

              <PremiumPanel title="Competitive Health" eyebrow="Strengths & Risks">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">Core Strengths</p>
                    <ul className="space-y-3">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-light)] bg-white shadow-sm font-medium text-sm text-[var(--text-secondary)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Known Weaknesses</p>
                    <ul className="space-y-3">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-light)] bg-white shadow-sm font-medium text-sm text-[var(--text-secondary)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </PremiumPanel>

              <PremiumPanel title="Pipeline Action" eyebrow="Deploy Intelligence">
                <form action={createLeadFromInsight} className="space-y-6">
                  <input type="hidden" name="company" value={result.competitorName} />
                  <input type="hidden" name="website" value={result.url} />
                  <input type="hidden" name="segment" value="Competitor Intel" />
                  <input type="hidden" name="source" value="competitor_spy" />
                  <input type="hidden" name="tags" value="competitor, market-intel, high-priority" />
                  <input
                    type="hidden"
                    name="notes"
                    value={`Summary: ${result.summary}\nAttack plan: ${result.quickAttackPlan.homepageAngle}`}
                  />
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Save this market context as a lead target to guide your team's outreach strategy.
                  </p>
                  <button className="w-full h-14 bg-[var(--accent-teal)] text-white font-bold rounded-2xl transition-all hover:bg-[var(--foreground)] hover:shadow-lg shadow-[0_4px_14px_0_rgba(0,163,145,0.39)]">
                    Save Intel Target
                  </button>
                </form>
              </PremiumPanel>
            </aside>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function QuickFactCard({ icon: Icon, title, detail }: { icon: any; title: string; detail: string }) {
  return (
    <div className="p-6 rounded-[2rem] border border-[var(--border-light)] bg-white/50 backdrop-blur-sm shadow-sm hover:border-[var(--accent-cyan)] transition-all">
      <div className="w-10 h-10 rounded-xl bg-[var(--soft-cyan)] flex items-center justify-center mb-4">
        <Icon size={20} className="text-[var(--accent-teal)]" />
      </div>
      <h4 className="text-sm font-black text-[var(--foreground)] mb-2 uppercase tracking-tight">{title}</h4>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{detail}</p>
    </div>
  );
}

function PremiumPanel({ title, eyebrow, children }: { title: string; eyebrow: string; children: any }) {
  return (
    <section className="p-8 md:p-12 rounded-[2.5rem] border border-[var(--border-light)] bg-white shadow-xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-teal)] mb-2">{eyebrow}</p>
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function AnalysisBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--soft-cyan)]/20 border border-[var(--border-light)] hover:border-[var(--accent-teal)] transition-all">
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">{title}</p>
      <p className="text-sm font-semibold text-[var(--foreground)] leading-relaxed">{value}</p>
    </div>
  );
}
