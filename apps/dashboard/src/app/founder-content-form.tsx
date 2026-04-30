"use client";

import { useActionState } from "react";
import {
  Newspaper,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

import { runFounderContentEngine, type FounderContentState } from "@/app/actions";
import { ToolJobStatus } from "@/components/dashboard/tool-job-status";
import { useAsyncToolJob } from "@/lib/use-async-tool-job";

const initialState: FounderContentState = {
  message: "",
  jobId: null,
  result: null,
};

export function FounderContentForm() {
  const [state, action, pending] = useActionState(runFounderContentEngine, initialState);
  const { job, result } = useAsyncToolJob(state);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#d2cab7] bg-[#fffdf8] p-6 shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#cfe7de] bg-[#f3faf7] px-3 py-2 text-xs font-black uppercase text-[#176b5d]">
              <Sparkles size={14} /> Founder content engine
            </p>
            <h1 className="mt-4 py-1 text-3xl font-black leading-[1.08] sm:text-5xl">Build a founder-grade content system</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4f5a53] sm:text-base">
              Give LeadForge your business, buyer, offer, and content goal. It will generate positioning-led content pillars, LinkedIn and X drafts, a carousel outline, teardown script, weekly calendar, CTAs, and a repurposing loop you can actually use.
            </p>
            <form action={action} className="mt-6 space-y-4 rounded-2xl border border-[#e3dccd] bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="business" label="Business or brand" placeholder="LeadForge AI" required />
                <Field name="audience" label="Primary audience" placeholder="Founder-led B2B operators" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="offer" label="Offer or value theme" placeholder="Website teardown + outbound growth system" required />
                <Field name="contentGoal" label="Content goal" placeholder="Generate inbound conversations from LinkedIn" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="platforms" label="Platforms" placeholder="LinkedIn, X, founder website" />
                <Field name="tone" label="Tone" placeholder="Sharp, useful, founder-grade" />
              </div>
              <label className="block">
                <span className="text-xs font-black uppercase text-[#687169]">Proof assets</span>
                <textarea
                  name="proofAssets"
                  rows={4}
                  placeholder="Case studies, teardown lessons, client wins, objections, before/after examples"
                  className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 py-3 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#176b5d] px-5 text-sm font-black text-white transition hover:bg-[#115247] disabled:bg-[#9da59f]"
              >
                {pending ? "Submitting..." : "Generate content engine"}
              </button>
              {state.message ? <p className="text-sm font-medium text-[#4f5a53]">{state.message}</p> : null}
            </form>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <QuickFact
              icon={Target}
              title="Positioning-first"
              detail="The engine starts with what you stand for, not just random post ideas."
            />
            <QuickFact
              icon={Newspaper}
              title="Direct-use drafts"
              detail="Outputs LinkedIn posts, X posts, carousel structure, and teardown scripting in one pass."
            />
            <QuickFact
              icon={Workflow}
              title="System, not inspiration"
              detail="You also get a weekly publishing calendar, CTA library, and repurposing flow."
            />
          </div>
        </div>
      </section>

      {job ? <ToolJobStatus job={job} title="Founder content job" /> : null}

      {result ? (
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
            <p className="text-xs font-black uppercase text-[#176b5d]">Content mission</p>
            <h2 className="mt-1 py-0.5 text-2xl font-black leading-tight">{result.brandName}</h2>
            <p className="mt-3 text-sm leading-7 text-[#4f5a53]">{result.contentMission}</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <MetricCard label="Primary audience" value={result.primaryAudience} />
              <MetricCard label="Offer theme" value={result.offerTheme} />
              <MetricCard label="Positioning narrative" value={result.positioningNarrative} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <Panel title="Content pillars" eyebrow="What the founder should consistently talk about">
              <div className="space-y-4">
                {result.contentPillars.map((pillar) => (
                  <div key={pillar.title} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-sm font-black text-[#1e2521]">{pillar.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{pillar.angle}</p>
                    <p className="mt-3 text-xs font-black uppercase text-[#687169]">Why it works</p>
                    <p className="mt-1 text-sm leading-6 text-[#4f5a53]">{pillar.whyItWorks}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Proof angles and CTA library" eyebrow="What makes the content believable and actionable">
              <div className="grid gap-4 lg:grid-cols-2">
                <ListPanel title="Proof angles" items={result.proofAngles} />
                <ListPanel title="CTA library" items={result.ctaLibrary} />
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Panel title="LinkedIn posts" eyebrow="Long-form authority assets">
              <div className="space-y-4">
                {result.linkedinPosts.map((post) => (
                  <article key={post.title} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-sm font-black text-[#1e2521]">{post.title}</p>
                    <p className="mt-2 text-xs font-black uppercase text-[#176b5d]">{post.hook}</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#4f5a53]">{post.body}</p>
                    <p className="mt-3 rounded-lg bg-[#f7f5ef] px-3 py-3 text-sm leading-6 text-[#4f5a53]">
                      <span className="font-black text-[#1e2521]">CTA:</span> {post.cta}
                    </p>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel title="X posts" eyebrow="Short-form founder opinions">
              <div className="space-y-4">
                {result.xPosts.map((post) => (
                  <article key={post.hook} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <p className="text-xs font-black uppercase text-[#176b5d]">{post.hook}</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#4f5a53]">{post.post}</p>
                  </article>
                ))}
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Panel title="Carousel outline" eyebrow="Turn one idea into a structured visual asset">
              <MetricCard label="Asset" value={result.carouselOutline.title} />
              <div className="mt-4">
                <ListPanel title="Slides" items={result.carouselOutline.slides} />
              </div>
            </Panel>

            <Panel title="Teardown script" eyebrow="Reusable breakdown format for audits and commentary">
              <MetricCard label="Script" value={result.teardownScript.title} />
              <div className="mt-4">
                <ListPanel title="Sections" items={result.teardownScript.sections} />
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <Panel title="Weekly publishing calendar" eyebrow="How to operate the system each week">
              <div className="space-y-3">
                {result.weeklyCalendar.map((item) => (
                  <div key={`${item.day}-${item.topic}`} className="rounded-xl border border-[#e3dccd] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-[#1e2521]">{item.day}</p>
                      <span className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">
                        {item.assetType}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{item.topic}</p>
                    <p className="mt-3 text-xs font-black uppercase text-[#687169]">Distribution</p>
                    <p className="mt-1 text-sm leading-6 text-[#4f5a53]">{item.distribution}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Repurposing workflow" eyebrow="How to multiply one strong idea">
              <ListPanel title="Workflow" items={result.repurposingWorkflow} />
              <div className="mt-4 rounded-xl border border-[#e3dccd] bg-white p-4">
                <p className="text-sm font-black text-[#1e2521]">{result.mode === "openai" ? "Live AI pass" : "Fallback demo pass"}</p>
                <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{result.model}</p>
              </div>
            </Panel>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-[#687169]">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-1 h-12 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm"
      />
    </label>
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-xs font-black uppercase text-[#687169]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{value}</p>
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
