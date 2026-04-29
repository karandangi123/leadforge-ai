"use client";

import { useActionState } from "react";
import { BarChart3, BriefcaseBusiness, CalendarRange, Sparkles, Target, Workflow } from "lucide-react";

import { executeGrowthMode, type GrowthModeState } from "@/app/actions";

const initialState: GrowthModeState = {
  message: "",
  result: null,
};

export function GrowthModeForm() {
  const [state, action, pending] = useActionState(executeGrowthMode, initialState);
  const result = state.result;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#d2cab7] bg-[#fffdf8] p-6 shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#cfe7de] bg-[#f3faf7] px-3 py-2 text-xs font-black uppercase text-[#176b5d]">
              <Sparkles size={14} /> Founder strategy feature
            </p>
            <h1 className="mt-4 py-1 text-3xl font-black leading-[1.08] sm:text-5xl">One Prompt Growth Mode</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4f5a53] sm:text-base">
              Give LeadForge one business goal and get back an operator-grade growth brief: ICP, offer, lead sources, outreach, website fixes, daily execution, KPIs, and a 90-day plan.
            </p>
            <form action={action} className="mt-6 space-y-4 rounded-2xl border border-[#e3dccd] bg-white p-4">
              <label className="block">
                <span className="text-xs font-black uppercase text-[#687169]">Growth prompt</span>
                <textarea
                  name="prompt"
                  required
                  rows={4}
                  placeholder="Grow my AI agency to ₹5L/month"
                  className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 py-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase text-[#687169]">Optional context</span>
                <textarea
                  name="context"
                  rows={3}
                  placeholder="Current offer, niche, team size, geography, or constraints"
                  className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 py-3 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white transition hover:bg-[#115247] disabled:bg-[#9da59f]"
              >
                {pending ? "Planning..." : "Generate growth brief"}
              </button>
              {state.message ? <p className="text-sm font-medium text-[#4f5a53]">{state.message}</p> : null}
            </form>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <QuickFact
              icon={BriefcaseBusiness}
              title="Business-first"
              detail="Frames the strategy around buyer, offer, proof, and pipeline instead of generic motivation."
            />
            <QuickFact
              icon={Workflow}
              title="Execution-ready"
              detail="Breaks strategy into lead sourcing, outreach, website fixes, content, and daily operating rhythm."
            />
            <QuickFact
              icon={CalendarRange}
              title="90-day path"
              detail="Turns the prompt into a staged plan you can work through instead of a one-shot brainstorm."
            />
          </div>
        </div>
      </section>

      {result ? (
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
            <p className="text-xs font-black uppercase text-[#176b5d]">Target outcome</p>
            <h2 className="mt-1 py-0.5 text-2xl font-black leading-tight">{result.targetOutcome}</h2>
            <p className="mt-4 text-sm leading-7 text-[#4f5a53]">{result.summary}</p>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Panel title="ICP and offer" eyebrow="Who to sell to and what to sell">
              <MetricBlock title="Primary buyer" value={result.icp.primaryBuyer} />
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <ListPanel title="Pain points" items={result.icp.painPoints} />
                <ListPanel title="Industries" items={result.icp.industries} />
              </div>
              <div className="mt-4 grid gap-4">
                <MetricBlock title="Core offer" value={result.offer.coreOffer} />
                <MetricBlock title="Pricing angle" value={result.offer.pricingAngle} />
                <ListPanel title="Proof hooks" items={result.offer.proofHooks} />
              </div>
            </Panel>

            <Panel title="Outbound and website plan" eyebrow="How to create pipeline">
              <MetricBlock title="Opening angle" value={result.outreachPlan.openingAngle} />
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <ListPanel title="Channels" items={result.outreachPlan.channels} />
                <ListPanel title="Cadence" items={result.outreachPlan.cadence} />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <ListPanel title="Website fixes" items={result.websiteFixes} />
                <ListPanel title="Content plan" items={result.contentPlan} />
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Panel title="Lead sources" eyebrow="Where demand should come from first">
              <div className="space-y-4">
                {result.leadSources.map((source) => (
                  <div key={source.channel} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-sm font-black text-[#1e2521]">{source.channel}</p>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{source.whyItWorks}</p>
                    <p className="mt-3 text-xs font-black uppercase text-[#687169]">First move</p>
                    <p className="mt-1 text-sm leading-6 text-[#4f5a53]">{source.firstMove}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Execution dashboard" eyebrow="Daily rhythm and KPIs">
              <div className="grid gap-4 sm:grid-cols-2">
                {result.kpis.map((kpi) => (
                  <KpiCard key={kpi.label} label={kpi.label} target={kpi.target} />
                ))}
              </div>
              <div className="mt-4">
                <ListPanel title="Daily execution plan" items={result.dailyExecutionPlan} />
              </div>
            </Panel>
          </section>

          <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[#176b5d]" />
              <div>
                <p className="text-xs font-black uppercase text-[#176b5d]">90-day roadmap</p>
                <h2 className="mt-1 py-0.5 text-2xl font-black leading-tight">Operate the plan in stages</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              <RoadmapBlock title="Days 0-30" items={result.ninetyDayPlan.days0to30} />
              <RoadmapBlock title="Days 31-60" items={result.ninetyDayPlan.days31to60} />
              <RoadmapBlock title="Days 61-90" items={result.ninetyDayPlan.days61to90} />
            </div>
          </section>

          <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[#176b5d]" />
              <div>
                <p className="text-xs font-black uppercase text-[#176b5d]">Generation mode</p>
                <h2 className="mt-1 py-0.5 text-xl font-black leading-tight">{result.mode === "openai" ? "Live AI pass" : "Fallback demo pass"}</h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{result.model}</p>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function QuickFact({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-4">
      <Icon size={18} className="text-[#176b5d]" />
      <p className="mt-3 text-sm font-black text-[#1e2521]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{detail}</p>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
      <p className="text-xs font-black uppercase text-[#176b5d]">{eyebrow}</p>
      <h2 className="mt-1 py-0.5 text-xl font-black leading-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-xs font-black uppercase text-[#687169]">{title}</p>
      <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{value}</p>
    </div>
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

function KpiCard({ label, target }: { label: string; target: string }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#687169]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#1e2521]">{target}</p>
    </div>
  );
}

function RoadmapBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-sm font-black text-[#1e2521]">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4f5a53]">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
