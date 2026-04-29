"use client";

import { useActionState } from "react";
import { Crosshair, Flag, Radar, Sparkles } from "lucide-react";

import { runCompetitorSpy, type CompetitorSpyState } from "@/app/actions";

const initialState: CompetitorSpyState = {
  message: "",
  result: null,
};

export function CompetitorSpyForm() {
  const [state, action, pending] = useActionState(runCompetitorSpy, initialState);
  const result = state.result;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#d2cab7] bg-[#fffdf8] p-6 shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#cfe7de] bg-[#f3faf7] px-3 py-2 text-xs font-black uppercase text-[#176b5d]">
              <Sparkles size={14} /> Market intel feature
            </p>
            <h1 className="mt-4 py-1 text-3xl font-black leading-[1.08] sm:text-5xl">Competitor Spy</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4f5a53] sm:text-base">
              Drop in a competitor URL and get a sharp brief on how they position the offer, where their funnel is strong, and how to beat them with clearer messaging.
            </p>
            <form action={action} className="mt-6 space-y-4 rounded-2xl border border-[#e3dccd] bg-white p-4">
              <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                <label className="block">
                  <span className="text-xs font-black uppercase text-[#687169]">Competitor URL</span>
                  <input
                    name="url"
                    type="url"
                    required
                    placeholder="https://competitor.com"
                    className="mt-1 h-12 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase text-[#687169]">Category or angle</span>
                  <input
                    name="notes"
                    placeholder="AI agency, B2B SaaS, recruiting..."
                    className="mt-1 h-12 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white transition hover:bg-[#115247] disabled:bg-[#9da59f]"
              >
                {pending ? "Scanning..." : "Generate competitor brief"}
              </button>
              {state.message ? <p className="text-sm font-medium text-[#4f5a53]">{state.message}</p> : null}
            </form>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <QuickFact
              icon={Radar}
              title="Positioning view"
              detail="Summarizes how the competitor likely frames the offer and what kind of buyer story they are telling."
            />
            <QuickFact
              icon={Crosshair}
              title="Attack angles"
              detail="Turns the analysis into concrete differentiation moves instead of abstract market commentary."
            />
            <QuickFact
              icon={Flag}
              title="Fast founder use"
              detail="Useful for landing pages, pitch decks, outbound hooks, and product messaging sessions."
            />
          </div>
        </div>
      </section>

      {result ? (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Panel title={`${result.competitorName} brief`} eyebrow={result.url}>
              <p className="text-sm leading-7 text-[#4f5a53]">{result.summary}</p>
            </Panel>

            <Panel title="Positioning snapshot" eyebrow="What the competitor seems to be doing">
              <div className="grid gap-4 lg:grid-cols-3">
                <MetricBlock title="Offer positioning" value={result.offerPositioning} />
                <MetricBlock title="CTA style" value={result.ctaStyle} />
                <MetricBlock title="Funnel" value={result.funnelObservation} />
              </div>
            </Panel>

            <Panel title="Keyword and category angles" eyebrow="Likely territory they are leaning into">
              <List items={result.keywordAngles} compact />
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Strengths" eyebrow="Why they may be winning attention">
              <List items={result.strengths} />
            </Panel>

            <Panel title="Weaknesses" eyebrow="Where the positioning can be outplayed">
              <List items={result.weaknesses} />
            </Panel>

            <Panel title="How to beat them" eyebrow="Differentiation moves">
              <List items={result.differentiationMoves} />
              <div className="mt-4 grid gap-4">
                <MetricBlock title="Homepage angle" value={result.quickAttackPlan.homepageAngle} />
                <MetricBlock title="Proof strategy" value={result.quickAttackPlan.proofStrategy} />
                <MetricBlock title="CTA strategy" value={result.quickAttackPlan.ctaStrategy} />
              </div>
            </Panel>

            <Panel title="Generation mode" eyebrow="How this result was produced">
              <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
                <p className="text-sm font-black text-[#1e2521]">{result.mode === "openai" ? "Live AI pass" : "Fallback demo pass"}</p>
                <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{result.model}</p>
              </div>
            </Panel>
          </div>
        </section>
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

function List({ items, compact }: { items: string[]; compact?: boolean }) {
  return (
    <ul className={compact ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
      {items.map((item) => (
        <li key={item} className="rounded-xl border border-[#e3dccd] bg-white p-4 text-sm leading-6 text-[#4f5a53]">
          {item}
        </li>
      ))}
    </ul>
  );
}
