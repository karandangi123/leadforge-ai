"use client";

import { useActionState } from "react";
import { BarChart3, Gauge, Sparkles, TrendingUp } from "lucide-react";

import { createLeadFromInsight, runWebsiteRoast, type WebsiteRoastState } from "@/app/actions";
import { ToolJobStatus } from "@/components/dashboard/tool-job-status";
import { useAsyncToolJob } from "@/lib/use-async-tool-job";

const initialState: WebsiteRoastState = {
  message: "",
  jobId: null,
  result: null,
};

export function WebsiteRoastForm() {
  const [state, action, pending] = useActionState(runWebsiteRoast, initialState);
  const { job, result } = useAsyncToolJob(state);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#d2cab7] bg-[#fffdf8] p-6 shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#cfe7de] bg-[#f3faf7] px-3 py-2 text-xs font-black uppercase text-[#176b5d]">
              <Sparkles size={14} /> Viral demo feature
            </p>
            <h1 className="mt-4 py-1 text-3xl font-black leading-[1.08] sm:text-5xl">Roast My Website</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4f5a53] sm:text-base">
              Drop in a homepage URL and get a founder-friendly teardown: scorecards, sharp findings, rewritten copy, and an estimated revenue opportunity.
            </p>
            <form action={action} className="mt-6 space-y-4 rounded-2xl border border-[#e3dccd] bg-white p-4">
              <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                <label className="block">
                  <span className="text-xs font-black uppercase text-[#687169]">Website URL</span>
                  <input
                    name="url"
                    type="url"
                    required
                    placeholder="https://example.com"
                    className="mt-1 h-12 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase text-[#687169]">Optional angle</span>
                  <input
                    name="notes"
                    placeholder="SaaS, agency, local business..."
                    className="mt-1 h-12 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white transition hover:bg-[#115247] disabled:bg-[#9da59f]"
              >
                {pending ? "Submitting..." : "Generate roast"}
              </button>
              {state.message ? <p className="text-sm font-medium text-[#4f5a53]">{state.message}</p> : null}
            </form>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <QuickFact
              icon={Gauge}
              title="10-second clarity"
              detail="Designed to explain value fast enough for screenshots, GIFs, and social posts."
            />
            <QuickFact
              icon={BarChart3}
              title="Visual output"
              detail="Shows scorecards, copy rewrites, and opportunity numbers in one pass."
            />
            <QuickFact
              icon={TrendingUp}
              title="Growth-oriented"
              detail="Optimized for founders who want practical conversion improvements, not generic critique."
            />
          </div>
        </div>
      </section>

      {job ? <ToolJobStatus job={job} title="Website roast job" /> : null}

      {result ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <ScoreCard label="Overall" value={result.overallScore} accent />
            <ScoreCard label="Design" value={result.designScore} />
            <ScoreCard label="Trust" value={result.trustScore} />
            <ScoreCard label="Speed" value={result.speedScore} />
            <ScoreCard label="SEO" value={result.seoScore} />
            <ScoreCard label="Conversion" value={result.conversionScore} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <Panel title={`${result.companyName} roast`} eyebrow={result.url}>
                <p className="text-sm leading-7 text-[#4f5a53]">{result.summary}</p>
              </Panel>

              <Panel title="Before / after homepage copy" eyebrow="Rewritten messaging">
                <div className="grid gap-4 lg:grid-cols-3">
                  <RewriteBlock title="Headline" value={result.headlineRewrite} />
                  <RewriteBlock title="Subheadline" value={result.subheadlineRewrite} />
                  <RewriteBlock title="CTA" value={result.ctaRewrite} />
                </div>
              </Panel>

              <Panel title="Top findings" eyebrow="What is likely holding the page back">
                <List items={result.topFindings} />
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel title="Revenue opportunity" eyebrow="Estimated upside model">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Metric label="Monthly visitors" value={numberWithCommas(result.revenueOpportunity.estimatedMonthlyVisitors)} />
                  <Metric label="Current CVR" value={`${result.revenueOpportunity.currentConversionRate}%`} />
                  <Metric label="Improved CVR" value={`${result.revenueOpportunity.improvedConversionRate}%`} />
                  <Metric label="Extra leads" value={String(result.revenueOpportunity.estimatedAdditionalMonthlyLeads)} />
                </div>
                <div className="mt-4 rounded-2xl border border-[#cfe7de] bg-[#f3faf7] p-4">
                  <p className="text-xs font-black uppercase text-[#176b5d]">Estimated monthly lift</p>
                  <p className="mt-2 text-3xl font-black text-[#1e2521]">
                    ${numberWithCommas(result.revenueOpportunity.estimatedMonthlyRevenueLiftUsd)}
                  </p>
                </div>
              </Panel>

              <Panel title="Quick wins" eyebrow="The fastest improvements to try first">
                <List items={result.quickWins} />
              </Panel>

              <Panel title="Turn this into pipeline work" eyebrow="Convert the roast into a real lead">
                <div className="grid gap-3 sm:grid-cols-2">
                  <form action={createLeadFromInsight} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <input type="hidden" name="company" value={result.companyName} />
                    <input type="hidden" name="website" value={result.url} />
                    <input type="hidden" name="segment" value="Website roast lead" />
                    <input type="hidden" name="source" value="website_roast" />
                    <input type="hidden" name="tags" value="roast, inbound, growth-lab" />
                    <input
                      type="hidden"
                      name="notes"
                      value={`Roast summary: ${result.summary}\nQuick wins: ${result.quickWins.join("; ")}`}
                    />
                    <p className="text-sm font-black text-[#1e2521]">Save as lead</p>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a53]">Create a pipeline lead from this website analysis and route it into research and outreach.</p>
                    <button className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-[#176b5d] px-4 text-sm font-black text-white">
                      Save to pipeline
                    </button>
                  </form>
                  <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-sm font-black text-[#1e2521]">Next moves</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4f5a53]">
                      <li>• Open Competitor Spy to sharpen the positioning angle behind these rewrites.</li>
                      <li>• Use Growth Mode to turn the roast into a weekly execution plan.</li>
                      <li>• Move into the pipeline when you want research, approval, and outcome tracking.</li>
                    </ul>
                  </div>
                </div>
              </Panel>

              <Panel title="Generation mode" eyebrow="How this result was produced">
                <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
                  <p className="text-sm font-black text-[#1e2521]">{result.mode === "openai" ? "Live AI pass" : "Fallback demo pass"}</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{result.model ?? "demo-v1"}</p>
                </div>
              </Panel>
            </div>
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

function ScoreCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-[#176b5d] bg-[#f3faf7]" : "border-[#d2cab7] bg-[#fffdf8]"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#1e2521]">{value}</p>
    </div>
  );
}

function RewriteBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-xs font-black uppercase text-[#687169]">{title}</p>
      <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#687169]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#1e2521]">{value}</p>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="rounded-xl border border-[#e3dccd] bg-white p-4 text-sm leading-6 text-[#4f5a53]">
          {item}
        </li>
      ))}
    </ul>
  );
}

function numberWithCommas(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
