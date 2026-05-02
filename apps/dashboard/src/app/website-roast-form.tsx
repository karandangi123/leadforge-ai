"use client";

import { useActionState, useState } from "react";
import { 
  Activity, AlertCircle, BarChart3, Brain, Check, Code, Copy, Eye, 
  FlaskConical, Gauge, HelpCircle, Layers, MessageCircle, Network, 
  Share2, Shield, Sparkles, Swords, Target, TrendingUp, Users, Wand2, Zap,
  ArrowRight, MousePointer2, Layout
} from "lucide-react";
import { motion } from "framer-motion";

import { createLeadFromInsight } from "@/app/actions/leads";
import { runWebsiteRoast, type WebsiteRoastState } from "@/app/actions/tools";
import { ToolJobStatus } from "@/components/dashboard/tool-job-status";
import { useAsyncToolJob } from "@/lib/use-async-tool-job";

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative mt-3 overflow-hidden rounded-[1.25rem] border border-[var(--border-light)] bg-[var(--dark-bg)] p-5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{language}</span>
        <button 
          onClick={copy}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-black text-white hover:bg-[var(--accent-cyan)]/20 hover:text-[var(--accent-cyan)] transition-all"
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "COPIED" : "COPY CODE"}
        </button>
      </div>
      <pre className="overflow-x-auto text-[13px] leading-relaxed text-[var(--soft-cyan)] custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const initialState: WebsiteRoastState = {
  message: "",
  jobId: null,
  result: null,
};

export function WebsiteRoastForm() {
  const [state, action, pending] = useActionState(runWebsiteRoast, initialState);
  const { job, result } = useAsyncToolJob(state);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-light)] bg-white p-10 md:p-14 shadow-xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--soft-cyan)] to-transparent opacity-30 pointer-events-none" />
        
        <div className="grid gap-12 xl:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--soft-cyan)] border border-[var(--accent-cyan)]/20 mb-8 text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
              <Sparkles size={14} /> Viral Growth Lab
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.1] mb-8">
              Roast My <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--foreground)] to-[var(--text-secondary)]">
                Website.
              </span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10 max-w-xl">
              Drop a URL and get a brutal, data-backed teardown of your conversion architecture. AI-powered audits for founders who care about revenue, not feelings.
            </p>
            
            <form action={action} className="relative max-w-2xl">
              <div className="flex flex-col md:flex-row gap-3 bg-[var(--soft-cyan)]/30 border border-[var(--border-light)] p-2 rounded-2xl">
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://your-site.com"
                  className="flex-1 h-14 px-5 rounded-xl border border-transparent bg-white text-sm focus:border-[var(--accent-teal)] outline-none shadow-sm transition-all"
                />
                <select
                  name="persona"
                  className="h-14 px-4 rounded-xl border border-transparent bg-white text-sm font-bold text-[var(--foreground)] outline-none shadow-sm transition-all min-w-[180px]"
                >
                  <option value="founder">The Visionary</option>
                  <option value="cfo">The Skeptical CFO</option>
                  <option value="dev">The Impatient Dev</option>
                  <option value="marketing">The Results Marketer</option>
                </select>
                <button
                  type="submit"
                  disabled={pending}
                  className="h-14 px-8 rounded-xl bg-[var(--dark-bg)] text-white font-bold text-sm transition-all hover:bg-[var(--dark-card)] hover:shadow-[0_0_20px_rgba(0,209,193,0.3)] disabled:opacity-50"
                >
                  {pending ? "Analyzing..." : "Run Roast"}
                </button>
              </div>
              {state.message && (
                <p className="mt-4 text-sm font-semibold text-[var(--accent-teal)]">{state.message}</p>
              )}
            </form>
          </div>

          <div className="grid gap-4">
            <QuickFactCard 
              icon={Gauge} 
              title="10-Second Clarity" 
              detail="Instant understanding of your value proposition and conversion bottlenecks." 
            />
            <QuickFactCard 
              icon={BarChart3} 
              title="Visual Scorecards" 
              detail="Multi-dimensional scores across Design, Trust, Speed, SEO, and Conversion." 
            />
            <QuickFactCard 
              icon={TrendingUp} 
              title="Revenue Modeling" 
              detail="Estimated revenue lift based on suggested conversion improvements." 
            />
          </div>
        </div>
      </section>

      {job ? (
        <div className="animate-fade-in">
          <ToolJobStatus job={job} title="Roast in Progress..." />
        </div>
      ) : null}

      {result ? (
        <div className="space-y-10 animate-fade-in">
          {/* Metrics Grid */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <PremiumScoreCard label="Overall" value={result.overallScore} variant="primary" />
            <PremiumScoreCard label="Design" value={result.designScore} />
            <PremiumScoreCard label="Trust" value={result.trustScore} />
            <PremiumScoreCard label="Speed" value={result.speedScore} />
            <PremiumScoreCard label="SEO" value={result.seoScore} />
            <PremiumScoreCard label="Conversion" value={result.conversionScore} />
          </section>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.45fr]">
            <div className="space-y-10">
              {/* Main Analysis */}
              <PremiumPanel title={`${result.companyName} Analysis`} eyebrow={result.url}>
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg leading-relaxed text-[var(--text-secondary)] font-medium">
                    {result.summary}
                  </p>
                </div>
              </PremiumPanel>

              {/* Strategic Void */}
              <section className="relative overflow-hidden rounded-[2.5rem] border border-[var(--accent-cyan)]/30 bg-[var(--soft-cyan)]/20 p-10 md:p-12">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <Target size={120} className="text-[var(--accent-teal)]" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[var(--accent-cyan)]/20 mb-8 text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
                    <Target size={14} /> The Strategic Void
                  </div>
                  <h3 className="text-3xl font-black text-[var(--foreground)] mb-10 tracking-tight">Unclaimed Market Messaging Angle</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-white rounded-2xl p-8 border border-[var(--border-light)] shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">Detected Gap</p>
                      <p className="text-base font-semibold text-[var(--foreground)] leading-relaxed">{result.strategicVoid.marketGap}</p>
                    </div>
                    <div className="bg-[var(--dark-bg)] rounded-2xl p-8 border border-[var(--accent-cyan)]/30 shadow-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)] mb-3">Winning Angle</p>
                      <p className="text-xl font-black text-white leading-tight">{result.strategicVoid.unclaimedMessagingAngle}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center gap-4 p-5 rounded-2xl bg-white/50 border border-dashed border-[var(--accent-teal)]">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-teal)] flex items-center justify-center shrink-0">
                      <Zap size={20} className="text-white" fill="white" />
                    </div>
                    <p className="text-sm font-bold text-[var(--accent-teal)] uppercase tracking-wider">
                      Recommended Move: <span className="text-[var(--foreground)]">{result.strategicVoid.recommendedMove}</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Copy Rewrites */}
              <PremiumPanel title="Strategic Copy Rewrites" eyebrow="Before & After Snapshot">
                <div className="grid gap-6 md:grid-cols-3">
                  <RewriteCard title="Headline" value={result.headlineRewrite} />
                  <RewriteCard title="Subheadline" value={result.subheadlineRewrite} />
                  <RewriteCard title="Primary CTA" value={result.ctaRewrite} />
                </div>
              </PremiumPanel>

              {/* Psychological Audit */}
              <PremiumPanel title="Conversion Anatomy" eyebrow="Psychological Friction Analysis">
                <div className="grid gap-8 md:grid-cols-2">
                  <AuditList title="Trust Deficits" items={result.conversionAnatomy.trustGaps} type="negative" />
                  <AuditList title="Friction Points" items={result.conversionAnatomy.frictionPoints} type="warning" />
                </div>
                
                <div className="mt-10 p-8 rounded-3xl bg-[var(--soft-cyan)]/10 border border-[var(--border-light)]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-base font-black text-[var(--foreground)] mb-1 uppercase tracking-wider">Cognitive Load Index</h4>
                      <p className="text-sm text-[var(--text-secondary)]">Reading effort vs. conceptual complexity</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-4xl font-black ${result.conversionAnatomy.cognitiveLoadScore > 70 ? "text-rose-500" : "text-[var(--accent-teal)]"}`}>
                        {result.conversionAnatomy.cognitiveLoadScore}%
                      </span>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-white rounded-full border border-[var(--border-light)] p-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.conversionAnatomy.cognitiveLoadScore}%` }}
                      className={`h-full rounded-full ${result.conversionAnatomy.cognitiveLoadScore > 70 ? "bg-rose-500" : "bg-[var(--accent-teal)]"}`}
                    />
                  </div>
                </div>
              </PremiumPanel>

              {/* Remediation Lab */}
              <PremiumPanel title="Remediation Lab" eyebrow="Direct One-Click Fixes">
                <div className="space-y-8">
                  {result.remediationLab.fixes.map((fix, idx) => (
                    <div key={idx} className="group p-8 rounded-3xl border border-[var(--border-light)] bg-white hover:border-[var(--accent-teal)] transition-all">
                      <div className="flex items-start justify-between mb-6">
                        <div className="max-w-xl">
                          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">{fix.finding}</h4>
                          <p className="text-sm text-[var(--text-secondary)]">{fix.problem}</p>
                        </div>
                        <span className="px-4 py-2 rounded-xl bg-[var(--soft-cyan)] text-[10px] font-black uppercase text-[var(--accent-teal)] border border-[var(--accent-cyan)]/20">
                          {fix.solution}
                        </span>
                      </div>
                      <CodeBlock code={fix.codeSnippet.code} language={fix.codeSnippet.language} />
                    </div>
                  ))}
                </div>
              </PremiumPanel>
            </div>

            {/* Sidebar Results */}
            <aside className="space-y-8">
              <PremiumPanel title="Revenue Impact" eyebrow="Opportunity Model">
                <div className="space-y-4">
                  <SidebarMetric label="Monthly Reach" value={numberWithCommas(result.revenueOpportunity.estimatedMonthlyVisitors)} />
                  <div className="grid grid-cols-2 gap-3">
                    <SidebarMetric label="Current CVR" value={`${result.revenueOpportunity.currentConversionRate}%`} />
                    <SidebarMetric label="Target CVR" value={`${result.revenueOpportunity.improvedConversionRate}%`} />
                  </div>
                  <div className="p-6 rounded-2xl bg-[var(--dark-bg)] text-white shadow-2xl border border-[var(--accent-cyan)]/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)] mb-3">Est. Monthly Upside</p>
                    <p className="text-4xl font-black">${numberWithCommas(result.revenueOpportunity.estimatedMonthlyRevenueLiftUsd)}</p>
                  </div>
                </div>
              </PremiumPanel>

              <PremiumPanel title="Quick Win Checklist" eyebrow="High-Impact, Low-Effort">
                <ul className="space-y-4">
                  {result.quickWins.map((win, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-light)] bg-white shadow-sm">
                      <div className="w-6 h-6 rounded-lg bg-[var(--soft-cyan)] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="text-[var(--accent-teal)]" strokeWidth={3} />
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)] leading-relaxed">{win}</p>
                    </li>
                  ))}
                </ul>
              </PremiumPanel>

              <PremiumPanel title="Pipeline Handoff" eyebrow="Convert to Growth Lead">
                <form action={createLeadFromInsight} className="space-y-6">
                  <input type="hidden" name="company" value={result.companyName} />
                  <input type="hidden" name="website" value={result.url} />
                  <input type="hidden" name="segment" value="Website Roast Lead" />
                  <input type="hidden" name="source" value="website_roast" />
                  <input type="hidden" name="tags" value="roast, growth-lab, high-priority" />
                  <input
                    type="hidden"
                    name="notes"
                    value={`Roast summary: ${result.summary}\nQuick wins: ${result.quickWins.join("; ")}`}
                  />
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Automatically bridge this analysis into your primary outbound workspace.
                  </p>
                  <button className="w-full h-14 bg-[var(--accent-teal)] text-white font-bold rounded-2xl transition-all hover:bg-[var(--foreground)] hover:shadow-lg shadow-[0_4px_14px_0_rgba(0,163,145,0.39)]">
                    Create Growth Lead
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

function PremiumScoreCard({ label, value, variant }: { label: string; value: number; variant?: "primary" }) {
  return (
    <div className={`p-6 rounded-[1.5rem] border ${variant === "primary" ? "border-[var(--accent-teal)] bg-[var(--soft-cyan)]/30" : "border-[var(--border-light)] bg-white"} shadow-sm text-center relative overflow-hidden group`}>
      {variant === "primary" && (
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Sparkles size={40} className="text-[var(--accent-teal)]" />
        </div>
      )}
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3">{label}</p>
      <p className={`text-4xl font-black ${variant === "primary" ? "text-[var(--accent-teal)]" : "text-[var(--foreground)]"}`}>{value}</p>
      <div className="mt-3 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div 
            key={lvl} 
            className={`h-1 w-4 rounded-full ${value >= lvl * 20 ? "bg-[var(--accent-teal)]" : "bg-[var(--border-light)]"}`}
          />
        ))}
      </div>
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

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 rounded-2xl border border-[var(--border-light)] bg-white">
      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">{label}</p>
      <p className="text-xl font-black text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function RewriteCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--soft-cyan)]/20 border border-[var(--border-light)] hover:border-[var(--accent-teal)] transition-all">
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">{title}</p>
      <p className="text-sm font-bold text-[var(--foreground)] leading-relaxed italic">&ldquo;{value}&rdquo;</p>
    </div>
  );
}

function AuditList({ title, items, type }: { title: string; items: string[]; type: "negative" | "warning" }) {
  return (
    <div className="space-y-5">
      <h4 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
        {type === "negative" ? <AlertCircle size={16} className="text-rose-500" /> : <Activity size={16} className="text-amber-500" />}
        {title}
      </h4>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[var(--border-light)] shadow-sm">
             <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${type === "negative" ? "bg-rose-500" : "bg-amber-500"}`} />
             <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
