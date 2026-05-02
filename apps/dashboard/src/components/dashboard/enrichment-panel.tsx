"use client";

import React, { useState, useTransition } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Cpu,
  DollarSign,
  ExternalLink,
  Globe,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { enrichLead } from "@/app/actions";
import type { EnrichmentProfileSnapshot } from "@/app/actions/enrichment";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  leadId: string;
  company: string;
  profile: EnrichmentProfileSnapshot | null;
  isDemo?: boolean;
};

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "firmographic", label: "Firmographics", icon: Building2, color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  { id: "technographic", label: "Technographics", icon: Cpu, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { id: "funding", label: "Funding", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  { id: "hiring", label: "Hiring Signals", icon: Users, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { id: "intent", label: "Intent & Buying Signals", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  { id: "jobchanges", label: "Job Changes", icon: Briefcase, color: "text-pink-600", bg: "bg-pink-50 border-pink-200" },
  { id: "social", label: "Social & Reviews", icon: Activity, color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
  { id: "news", label: "Recent News", icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function EnrichmentPanel({ leadId, company, profile, isDemo }: Props) {
  const [open, setOpen] = useState<string | null>("firmographic");
  const [isPending, startTransition] = useTransition();

  const confidence = profile?.overallConfidence ?? 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header card */}
      <div className="premium-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-lg shadow-violet-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#687169]">Intelligence Layer</p>
              <h2 className="text-xl font-black text-[#1e2521]">Lead Enrichment</h2>
              <p className="text-xs text-[#687169]">Firmographics · Technographics · Funding · Hiring · Intent · Job Changes</p>
            </div>
          </div>

          <form action={enrichLead} onSubmit={() => startTransition(() => {})}>
            <input type="hidden" name="leadId" value={leadId} />
            <input type="hidden" name="forceRefresh" value="1" />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-purple-800 disabled:opacity-60 transition-all"
            >
              <RefreshCcw size={14} className={isPending ? "animate-spin" : ""} />
              {isPending ? "Enriching…" : profile ? "Re-enrich" : "Enrich Now"}
            </button>
          </form>
        </div>

        {/* Confidence bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-[#687169]">Data confidence</span>
            <span className={`text-sm font-black ${confidenceTextColor(confidence)}`}>
              {confidence}% — {confidenceLabel(confidence)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#f0ece3]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${confidenceBg(confidence)}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Provider waterfall badges */}
        {profile?.providers && profile.providers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.providers.map((p) => (
              <div key={p.provider} className="flex items-center gap-1.5 rounded-full border border-[#e3dccd] bg-white px-3 py-1 text-[10px] font-black text-[#687169]">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {p.provider} · {p.fieldsEnriched.length} fields
              </div>
            ))}
          </div>
        )}

        {profile?.lastEnrichedAt && (
          <p className="mt-3 text-[10px] text-[#9a9488]">
            Last enriched {new Date(profile.lastEnrichedAt).toLocaleString()}
            {isDemo && " · Demo data"}
          </p>
        )}
      </div>

      {/* Empty state */}
      {!profile && (
        <div className="premium-card p-10 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Sparkles size={28} />
          </div>
          <p className="mt-4 text-lg font-black text-[#1e2521]">No enrichment data yet</p>
          <p className="mt-2 text-sm text-[#687169]">
            Click <strong>Enrich Now</strong> to run the waterfall across {isDemo ? "demo" : "configured"} providers.
          </p>
        </div>
      )}

      {/* Signal sections */}
      {profile && SECTIONS.map((section) => (
        <SignalSection
          key={section.id}
          id={section.id}
          label={section.label}
          icon={section.icon}
          color={section.color}
          bg={section.bg}
          isOpen={open === section.id}
          onToggle={() => setOpen(open === section.id ? null : section.id)}
          profile={profile}
        />
      ))}
    </div>
  );
}

// ─── Signal section accordion ─────────────────────────────────────────────────

function SignalSection({
  id, label, icon: Icon, color, bg, isOpen, onToggle, profile,
}: {
  id: string; label: string; icon: React.ElementType; color: string; bg: string;
  isOpen: boolean; onToggle: () => void; profile: EnrichmentProfileSnapshot;
}) {
  const hasData = sectionHasData(id, profile);

  return (
    <div className="premium-card overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-5 text-left hover:bg-[#faf9f5] transition-colors">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${bg}`}>
          <Icon size={16} className={color} />
        </div>
        <span className="flex-1 text-sm font-black text-[#1e2521]">{label}</span>
        {!hasData && <span className="text-[10px] font-bold text-[#9a9488]">No data</span>}
        {hasData && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
        {isOpen ? <ChevronDown size={16} className="text-[#687169]" /> : <ChevronRight size={16} className="text-[#687169]" />}
      </button>

      {isOpen && (
        <div className="border-t border-[#e3dccd] px-5 pb-5 pt-4">
          {id === "firmographic" && <FirmographicSection profile={profile} />}
          {id === "technographic" && <TechnographicSection profile={profile} />}
          {id === "funding" && <FundingSection profile={profile} />}
          {id === "hiring" && <HiringSection profile={profile} />}
          {id === "intent" && <IntentSection profile={profile} />}
          {id === "jobchanges" && <JobChangesSection profile={profile} />}
          {id === "social" && <SocialSection profile={profile} />}
          {id === "news" && <NewsSection profile={profile} />}
        </div>
      )}
    </div>
  );
}

// ─── Section renderers ────────────────────────────────────────────────────────

function FirmographicSection({ profile }: { profile: EnrichmentProfileSnapshot }) {
  const fields = [
    { label: "Employees", value: profile.employeeRange ?? profile.employeeCount },
    { label: "Revenue", value: profile.revenueRange ?? formatCurrency(profile.annualRevenue) },
    { label: "Industry", value: profile.subIndustry ?? profile.industry },
    { label: "Founded", value: profile.foundedYear },
    { label: "HQ", value: [profile.headquartersCity, profile.headquartersCountry].filter(Boolean).join(", ") || null },
    { label: "Type", value: profile.companyType },
    { label: "Stock", value: profile.isPublic ? (profile.stockTicker ?? "Public") : null },
  ];

  return (
    <div className="space-y-3">
      {profile.description && (
        <p className="text-sm text-[#4f5a53] leading-6 rounded-xl bg-[#faf9f5] p-3">{profile.description}</p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {fields.filter(f => f.value != null).map(f => (
          <DataCell key={f.label} label={f.label} value={String(f.value)} />
        ))}
      </div>
    </div>
  );
}

function TechnographicSection({ profile }: { profile: EnrichmentProfileSnapshot }) {
  const CATEGORY_COLORS: Record<string, string> = {
    CRM: "bg-blue-100 text-blue-700 border-blue-200",
    Analytics: "bg-purple-100 text-purple-700 border-purple-200",
    Marketing: "bg-pink-100 text-pink-700 border-pink-200",
    Infrastructure: "bg-gray-100 text-gray-700 border-gray-200",
    Payments: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Support: "bg-orange-100 text-orange-700 border-orange-200",
    Other: "bg-[#f7f5ef] text-[#687169] border-[#e3dccd]",
  };

  const grouped = profile.techStack.reduce<Record<string, string[]>>((acc, t) => {
    const cat = t.category in CATEGORY_COLORS ? t.category : "Other";
    acc[cat] = [...(acc[cat] ?? []), t.name];
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {profile.crmPlatform && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">
          <Briefcase size={14} className="text-blue-600" />
          <span className="text-xs font-black text-blue-700">CRM: {profile.crmPlatform}</span>
        </div>
      )}
      <div className="space-y-2">
        {Object.entries(grouped).map(([cat, tools]) => (
          <div key={cat}>
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-[#687169]">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {tools.map(t => (
                <span key={t} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other}`}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FundingSection({ profile }: { profile: EnrichmentProfileSnapshot }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {profile.totalFunding != null && <DataCell label="Total Raised" value={formatCurrency(profile.totalFunding) ?? "—"} accent />}
        {profile.lastFundingRound && <DataCell label="Last Round" value={profile.lastFundingRound} />}
        {profile.lastFundingAmount != null && <DataCell label="Last Amount" value={formatCurrency(profile.lastFundingAmount) ?? "—"} />}
        {profile.lastFundingDate && <DataCell label="Last Date" value={new Date(profile.lastFundingDate).toLocaleDateString()} />}
        {profile.isPublic && <DataCell label="Status" value={profile.stockTicker ? `${profile.stockTicker} (Public)` : "Public"} accent />}
      </div>
      {profile.investors.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#687169]">Investors</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.investors.map(inv => (
              <span key={inv} className="rounded-full border border-[#e3dccd] bg-white px-2.5 py-1 text-[11px] font-bold text-[#4f5a53]">{inv}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HiringSection({ profile }: { profile: EnrichmentProfileSnapshot }) {
  const velocityColor = profile.hiringVelocity === "Growing" ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : profile.hiringVelocity === "Shrinking" ? "text-red-600 bg-red-50 border-red-200"
    : "text-[#687169] bg-[#f7f5ef] border-[#e3dccd]";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {profile.openRoles != null && <DataCell label="Open Roles" value={String(profile.openRoles)} accent />}
        {profile.hiringVelocity && (
          <div className="rounded-xl border p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#687169]">Velocity</p>
            <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-black ${velocityColor}`}>{profile.hiringVelocity}</span>
          </div>
        )}
      </div>
      {profile.topHiringDepts.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#687169]">Top Hiring Departments</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.topHiringDepts.map(dept => (
              <span key={dept} className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">{dept}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IntentSection({ profile }: { profile: EnrichmentProfileSnapshot }) {
  const intentBg = (profile.intentScore ?? 0) >= 70 ? "from-yellow-500 to-orange-500"
    : (profile.intentScore ?? 0) >= 40 ? "from-yellow-400 to-yellow-500"
    : "from-gray-400 to-gray-500";

  return (
    <div className="space-y-4">
      {profile.intentScore != null && (
        <div className="flex items-center gap-4">
          <div className={`flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${intentBg} text-white shadow-lg`}>
            <span className="text-xl font-black">{profile.intentScore}</span>
          </div>
          <div>
            <p className="text-sm font-black text-[#1e2521]">Intent Score</p>
            <p className="text-xs text-[#687169]">{profile.intentLevel ?? "Moderate"} buying intent detected</p>
          </div>
        </div>
      )}
      {profile.intentTopics.length > 0 && (
        <div className="space-y-2">
          {profile.intentTopics.map((t) => (
            <div key={t.topic} className="flex items-center gap-3 rounded-xl border border-[#e3dccd] bg-white p-3">
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1e2521]">{t.topic}</p>
                <p className="text-[10px] text-[#9a9488]">via {t.provider}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 overflow-hidden rounded-full bg-[#f0ece3]">
                  <div className="h-full rounded-full bg-yellow-500" style={{ width: `${t.score}%` }} />
                </div>
                <span className="text-xs font-black text-[#687169]">{t.score}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobChangesSection({ profile }: { profile: EnrichmentProfileSnapshot }) {
  if (profile.recentJobChanges.length === 0) {
    return <p className="text-sm text-[#9a9488]">No recent job changes detected.</p>;
  }
  return (
    <div className="space-y-2">
      {profile.recentJobChanges.map((jc, i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border border-pink-200 bg-pink-50 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
            <Briefcase size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[#1e2521]">{jc.name}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-[#687169]">
              <span className="line-through">{jc.oldRole}</span>
              <ArrowRight size={12} />
              <span className="font-bold text-pink-700">{jc.newRole}</span>
            </div>
            {jc.detectedAt && (
              <p className="mt-1 text-[10px] text-[#9a9488]">{new Date(jc.detectedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialSection({ profile }: { profile: EnrichmentProfileSnapshot }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {profile.linkedinFollowers != null && <DataCell label="LinkedIn" value={formatNumber(profile.linkedinFollowers)} />}
      {profile.twitterFollowers != null && <DataCell label="Twitter/X" value={formatNumber(profile.twitterFollowers)} />}
      {profile.g2Rating != null && <DataCell label="G2 Rating" value={`${profile.g2Rating}★`} accent />}
      {profile.g2Reviews != null && <DataCell label="G2 Reviews" value={formatNumber(profile.g2Reviews)} />}
    </div>
  );
}

function NewsSection({ profile }: { profile: EnrichmentProfileSnapshot }) {
  if (profile.recentNews.length === 0) {
    return <p className="text-sm text-[#9a9488]">No recent news found.</p>;
  }
  const SENTIMENT = {
    positive: "border-emerald-200 bg-emerald-50",
    neutral: "border-[#e3dccd] bg-[#faf9f5]",
    negative: "border-red-200 bg-red-50",
  };
  return (
    <div className="space-y-2">
      {profile.recentNews.map((n, i) => (
        <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
          className={`flex items-start gap-3 rounded-xl border p-4 transition-colors hover:opacity-80 ${SENTIMENT[n.sentiment as keyof typeof SENTIMENT] ?? SENTIMENT.neutral}`}>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#1e2521]">{n.headline}</p>
            <p className="mt-0.5 text-[10px] text-[#9a9488]">{n.source} · {new Date(n.date).toLocaleDateString()}</p>
          </div>
          <ExternalLink size={13} className="mt-0.5 shrink-0 text-[#9a9488]" />
        </a>
      ))}
    </div>
  );
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function DataCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? "border-violet-200 bg-violet-50" : "border-[#e3dccd] bg-white"}`}>
      <p className="text-[10px] font-black uppercase tracking-wider text-[#9a9488]">{label}</p>
      <p className={`mt-1 text-sm font-black ${accent ? "text-violet-700" : "text-[#1e2521]"}`}>{value}</p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sectionHasData(id: string, p: EnrichmentProfileSnapshot) {
  if (id === "firmographic") return Boolean(p.industry ?? p.employeeRange ?? p.companyType);
  if (id === "technographic") return p.techStack.length > 0;
  if (id === "funding") return p.totalFunding != null || Boolean(p.lastFundingRound);
  if (id === "hiring") return p.openRoles != null || Boolean(p.hiringVelocity);
  if (id === "intent") return p.intentScore != null || p.intentTopics.length > 0;
  if (id === "jobchanges") return p.recentJobChanges.length > 0;
  if (id === "social") return p.linkedinFollowers != null || p.g2Rating != null;
  if (id === "news") return p.recentNews.length > 0;
  return false;
}

function confidenceLabel(s: number) {
  if (s >= 85) return "High confidence";
  if (s >= 60) return "Medium confidence";
  if (s >= 35) return "Low confidence";
  return "Unverified";
}

function confidenceTextColor(s: number) {
  if (s >= 85) return "text-emerald-600";
  if (s >= 60) return "text-yellow-600";
  if (s >= 35) return "text-orange-600";
  return "text-red-500";
}

function confidenceBg(s: number) {
  if (s >= 85) return "bg-emerald-500";
  if (s >= 60) return "bg-yellow-400";
  if (s >= 35) return "bg-orange-400";
  return "bg-red-400";
}

function formatCurrency(n?: number | null) {
  if (!n) return null;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function formatNumber(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
