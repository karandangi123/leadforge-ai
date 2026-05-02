"use client";

import React, { useState } from "react";
import {
  Activity,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  Play,
  Plus,
  RefreshCcw,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { SequenceSummary, ChannelStats } from "@/lib/sequence-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

type MultiChannelProps = {
  sequences: SequenceSummary[];
  channelStats: ChannelStats[];
  isDemo: boolean;
  hasTwilio: boolean;
  hasLinkedIn: boolean;
  hasSalesNavigator: boolean;
};

type StepKind = "EMAIL" | "LINKEDIN_CONNECTION" | "LINKEDIN_MESSAGE" | "SMS" | "PHONE_CALL" | "WAIT" | "TASK";

type BuilderStep = {
  id: string;
  stepNumber: number;
  kind: StepKind;
  delayDays: number;
  delayHours: number;
  subject: string;
  bodyTemplate: string;
  taskNote: string;
};

// ─── Channel config ───────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<StepKind, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  EMAIL:                { label: "Email",            icon: <Mail size={14} />,        color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  LINKEDIN_CONNECTION:  { label: "LinkedIn Connect", icon: <Briefcase size={14} />,   color: "text-blue-600",    bg: "bg-blue-50 border-blue-200" },
  LINKEDIN_MESSAGE:     { label: "LinkedIn DM",      icon: <MessageSquare size={14}/>, color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  SMS:                  { label: "SMS",              icon: <MessageSquare size={14}/>, color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  PHONE_CALL:           { label: "Phone Call",       icon: <Phone size={14} />,       color: "text-orange-600",  bg: "bg-orange-50 border-orange-200" },
  WAIT:                 { label: "Wait",             icon: <Clock3 size={14} />,      color: "text-gray-500",    bg: "bg-gray-50 border-gray-200" },
  TASK:                 { label: "Manual Task",      icon: <CheckCircle2 size={14}/>, color: "text-gray-600",    bg: "bg-gray-50 border-gray-200" },
};

// ─── Main component ───────────────────────────────────────────────────────────

export function MultiChannelCommandCenter({
  sequences,
  channelStats,
  isDemo,
  hasTwilio,
  hasLinkedIn,
}: MultiChannelProps) {
  const [activeTab, setActiveTab] = useState<"sequences" | "builder" | "analytics">("sequences");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <section className="premium-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#176b5d] to-[#1a4d8f] text-white shadow-lg">
                <Zap size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#1e2521]">
                  Multi-Channel Outreach
                </h2>
                <p className="text-sm text-[#687169]">
                  Email · LinkedIn · SMS · Phone · Calendar — all approval-gated.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ChannelBadge icon={<Mail size={12} />} label="Email" active />
            <ChannelBadge icon={<Briefcase size={12} />} label="LinkedIn" active={hasLinkedIn} />
            <ChannelBadge icon={<MessageSquare size={12} />} label="SMS" active={hasTwilio} />
            <ChannelBadge icon={<Phone size={12} />} label="Dialer" active={hasTwilio} />
            <ChannelBadge icon={<CalendarDays size={12} />} label="Calendar" active />
          </div>
        </div>

        {isDemo && (
          <div className="mt-4 rounded-xl border border-[#cfe7de] bg-[#f3faf7] px-4 py-3 text-sm text-[#176b5d]">
            <span className="font-black">Demo mode</span> — sequences and channel data are seeded examples. Connect a database and Google/Twilio/LinkedIn to enable live sending.
          </div>
        )}
      </section>

      {/* Channel Stats Row */}
      <ChannelStatsRow stats={channelStats} />

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-2xl border border-[#e3dccd] bg-white p-1.5">
        {(["sequences", "builder", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-black capitalize transition-all ${
              activeTab === tab
                ? "bg-[#1e2521] text-white shadow-lg"
                : "text-[#687169] hover:text-[#1e2521]"
            }`}
          >
            {tab === "sequences" ? "Active Sequences" : tab === "builder" ? "Sequence Builder" : "Analytics"}
          </button>
        ))}
      </div>

      {activeTab === "sequences" && <SequenceList sequences={sequences} />}
      {activeTab === "builder" && <SequenceBuilder />}
      {activeTab === "analytics" && <ChannelAnalytics stats={channelStats} />}
    </div>
  );
}

// ─── Channel badge ────────────────────────────────────────────────────────────

function ChannelBadge({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
      active ? "border-[#cfe7de] bg-[#f3faf7] text-[#176b5d]" : "border-[#e3dccd] bg-white text-[#9a9488]"
    }`}>
      {icon} {label}
      {active && <div className="h-1 w-1 rounded-full bg-[#176b5d] animate-pulse" />}
    </div>
  );
}

// ─── Channel stats row ────────────────────────────────────────────────────────

function ChannelStatsRow({ stats }: { stats: ChannelStats[] }) {
  const icons: Record<string, React.ReactNode> = {
    EMAIL: <Mail size={20} />,
    LINKEDIN: <Briefcase size={20} />,
    SMS: <MessageSquare size={20} />,
    PHONE: <Phone size={20} />,
  };
  const colors: Record<string, string> = {
    EMAIL: "from-emerald-500 to-teal-600",
    LINKEDIN: "from-blue-500 to-blue-700",
    SMS: "from-violet-500 to-purple-700",
    PHONE: "from-orange-500 to-red-600",
  };

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.channel} className="premium-card p-5">
          <div className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors[stat.channel] ?? "from-gray-400 to-gray-600"} text-white shadow-lg`}>
            {icons[stat.channel]}
          </div>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">{stat.label}</p>
          <p className="mt-1 text-3xl font-black text-[#1e2521]">{stat.sent}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#687169]">{stat.replied} replied</span>
            <span className="rounded-full bg-[#f3faf7] px-2 py-0.5 text-[10px] font-black text-[#176b5d]">{stat.replyRate}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sequence list ────────────────────────────────────────────────────────────

function SequenceList({ sequences }: { sequences: SequenceSummary[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (sequences.length === 0) {
    return (
      <div className="premium-card p-10 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#f3faf7] text-[#176b5d]">
          <Sparkles size={28} />
        </div>
        <p className="mt-4 text-lg font-black text-[#1e2521]">No sequences yet</p>
        <p className="mt-2 text-sm text-[#687169]">Use the Sequence Builder tab to create your first multi-channel sequence.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sequences.map((seq) => (
        <div key={seq.id} className="premium-card overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === seq.id ? null : seq.id)}
            className="w-full p-5 text-left"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${seq.isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#1e2521]">{seq.name}</p>
                  <p className="mt-0.5 text-xs text-[#687169]">{seq.stepCount} steps · {seq.targetSegment ?? "All segments"}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden items-center gap-3 sm:flex">
                  <Pill label={`${seq.totalEnrolled} enrolled`} />
                  <Pill label={`${seq.replyRate} reply`} positive />
                </div>
                <div className="flex gap-1">
                  {seq.channels.slice(0, 4).map((ch) => (
                    <div key={ch} className={`flex size-6 items-center justify-center rounded-md border text-[10px] ${CHANNEL_CONFIG[ch]?.bg ?? "bg-gray-50 border-gray-200"} ${CHANNEL_CONFIG[ch]?.color ?? "text-gray-500"}`}>
                      {CHANNEL_CONFIG[ch]?.icon}
                    </div>
                  ))}
                  {seq.channels.length > 4 && (
                    <div className="flex size-6 items-center justify-center rounded-md border border-[#e3dccd] bg-white text-[9px] font-black text-[#687169]">
                      +{seq.channels.length - 4}
                    </div>
                  )}
                </div>
                {expanded === seq.id ? <ChevronDown size={16} className="text-[#687169]" /> : <ChevronRight size={16} className="text-[#687169]" />}
              </div>
            </div>
          </button>

          {expanded === seq.id && (
            <div className="border-t border-[#e3dccd] px-5 pb-5">
              {seq.description && (
                <p className="mt-4 text-sm text-[#687169]">{seq.description}</p>
              )}
              <div className="mt-4 space-y-2">
                {seq.steps.map((step) => {
                  const cfg = CHANNEL_CONFIG[step.kind as StepKind];
                  return (
                    <div key={step.stepNumber} className={`flex items-start gap-3 rounded-xl border p-3 ${cfg?.bg ?? "bg-gray-50 border-gray-200"}`}>
                      <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg border bg-white text-[10px] font-black ${cfg?.color ?? "text-gray-500"}`}>
                        {step.stepNumber}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${cfg?.color ?? "text-gray-500"}`}>{cfg?.label}</span>
                          {(step.delayDays > 0 || step.delayHours > 0) && (
                            <span className="text-[10px] text-[#9a9488]">
                              after {step.delayDays > 0 ? `${step.delayDays}d ` : ""}{step.delayHours > 0 ? `${step.delayHours}h` : ""}
                            </span>
                          )}
                        </div>
                        {step.subject && <p className="mt-0.5 text-xs font-bold text-[#1e2521] truncate">{step.subject}</p>}
                        {(step.bodyTemplate || step.taskNote) && (
                          <p className="mt-0.5 text-xs text-[#4f5a53] line-clamp-2">{step.bodyTemplate ?? step.taskNote}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#176b5d] px-4 text-xs font-black text-white hover:bg-[#115247]">
                  <Users size={13} /> Enroll leads
                </button>
                <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d9d2c1] bg-white px-4 text-xs font-black text-[#1e2521] hover:bg-gray-50">
                  <Activity size={13} /> View activity
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Sequence builder ─────────────────────────────────────────────────────────

function SequenceBuilder() {
  const [steps, setSteps] = useState<BuilderStep[]>([
    { id: "1", stepNumber: 1, kind: "EMAIL", delayDays: 0, delayHours: 0, subject: "", bodyTemplate: "", taskNote: "" },
  ]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [segment, setSegment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function addStep() {
    const last = steps[steps.length - 1];
    setSteps([...steps, {
      id: String(Date.now()),
      stepNumber: steps.length + 1,
      kind: "EMAIL",
      delayDays: 2,
      delayHours: 0,
      subject: "",
      bodyTemplate: "",
      taskNote: "",
    }]);
  }

  function removeStep(id: string) {
    setSteps(steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, stepNumber: i + 1 })));
  }

  function updateStep(id: string, field: keyof BuilderStep, value: string | number) {
    setSteps(steps.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  const stepsJson = JSON.stringify(steps.map(({ id, ...rest }) => rest));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="premium-card p-6">
        <h3 className="text-lg font-black text-[#1e2521]">Build a Sequence</h3>
        <p className="mt-1 text-sm text-[#687169]">Stack steps across channels. Each step is approval-gated before execution.</p>

        <form action="/api/actions/create-sequence" method="POST" onSubmit={() => setSubmitted(true)} className="mt-6 space-y-4">
          <input type="hidden" name="stepsJson" value={stepsJson} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#687169]">Sequence name</label>
              <input className="premium-input" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cold Outreach — SaaS Q2" required />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#687169]">Target segment</label>
              <input className="premium-input" name="targetSegment" value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="e.g. SaaS / B2B" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[#687169]">Description</label>
            <textarea className="premium-input min-h-[72px] resize-none py-3" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief goal for this sequence…" />
          </div>

          {/* Steps */}
          <div className="space-y-3 pt-2">
            {steps.map((step) => (
              <BuilderStepCard key={step.id} step={step} onUpdate={updateStep} onRemove={removeStep} canRemove={steps.length > 1} />
            ))}
          </div>

          <button type="button" onClick={addStep} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d9d2c1] py-3 text-sm font-black text-[#687169] transition hover:border-[#176b5d] hover:text-[#176b5d]">
            <Plus size={16} /> Add step
          </button>

          <button type="submit" disabled={!name.trim() || submitted} className="premium-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
            <Sparkles size={16} /> {submitted ? "Creating…" : "Create sequence"}
          </button>
        </form>
      </section>

      {/* Preview panel */}
      <aside className="space-y-4">
        <div className="premium-card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Sequence preview</p>
          <p className="mt-2 text-xl font-black text-[#1e2521]">{name || "Untitled sequence"}</p>
          {segment && <p className="mt-1 text-xs text-[#687169]">Target: {segment}</p>}
          <div className="mt-4 space-y-2">
            {steps.map((step, i) => {
              const cfg = CHANNEL_CONFIG[step.kind];
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={`flex size-6 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black ${cfg?.bg} ${cfg?.color}`}>{i + 1}</div>
                  <span className={`text-xs font-bold ${cfg?.color}`}>{cfg?.label}</span>
                  {(step.delayDays > 0 || step.delayHours > 0) && (
                    <span className="text-[10px] text-[#9a9488]">+{step.delayDays}d {step.delayHours > 0 ? `${step.delayHours}h` : ""}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-[#e3dccd] pt-4 text-xs text-[#687169]">
            {steps.length} steps · {[...new Set(steps.map((s) => s.kind))].length} channels
          </div>
        </div>

        <div className="rounded-2xl bg-[#1e2521] p-5 text-white">
          <Sparkles size={18} className="text-[#176b5d]" />
          <p className="mt-3 text-sm font-black">Approval boundary</p>
          <p className="mt-1 text-xs text-gray-400">Every step requires explicit operator approval before reaching a real channel. No auto-send.</p>
        </div>
      </aside>
    </div>
  );
}

function BuilderStepCard({ step, onUpdate, onRemove, canRemove }: {
  step: BuilderStep;
  onUpdate: (id: string, field: keyof BuilderStep, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const cfg = CHANNEL_CONFIG[step.kind];
  const showBody = ["EMAIL", "LINKEDIN_MESSAGE", "SMS"].includes(step.kind);
  const showSubject = step.kind === "EMAIL";
  const showNote = ["TASK", "PHONE_CALL", "LINKEDIN_CONNECTION", "WAIT"].includes(step.kind);

  return (
    <div className={`rounded-2xl border p-4 ${cfg?.bg}`}>
      <div className="flex items-center gap-3">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg border bg-white text-[10px] font-black ${cfg?.color}`}>{step.stepNumber}</span>
        <select
          value={step.kind}
          onChange={(e) => onUpdate(step.id, "kind", e.target.value)}
          className={`flex-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-bold ${cfg?.color} border-current/20`}
        >
          {(Object.keys(CHANNEL_CONFIG) as StepKind[]).map((k) => (
            <option key={k} value={k}>{CHANNEL_CONFIG[k].label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={365}
            value={step.delayDays}
            onChange={(e) => onUpdate(step.id, "delayDays", parseInt(e.target.value, 10) || 0)}
            className="w-12 rounded-lg border border-[#d9d2c1] bg-white px-2 py-1.5 text-center text-xs font-bold"
          />
          <span className="text-[10px] text-[#687169]">d</span>
        </div>
        {canRemove && (
          <button type="button" onClick={() => onRemove(step.id)} className="text-[#9a9488] hover:text-red-500">✕</button>
        )}
      </div>
      {showSubject && (
        <input className="mt-3 premium-input text-xs" placeholder="Email subject…" value={step.subject} onChange={(e) => onUpdate(step.id, "subject", e.target.value)} />
      )}
      {showBody && (
        <textarea
          className="mt-2 w-full rounded-xl border border-[#d9d2c1] bg-white/80 px-3 py-2 text-xs leading-5 resize-none focus:border-[#176b5d] focus:outline-none"
          rows={3}
          placeholder={`Message template… Use {{name}}, {{company}}`}
          value={step.bodyTemplate}
          onChange={(e) => onUpdate(step.id, "bodyTemplate", e.target.value)}
        />
      )}
      {showNote && (
        <input className="mt-3 premium-input text-xs" placeholder={step.kind === "WAIT" ? "Optional note for this pause…" : "Task instructions…"} value={step.taskNote} onChange={(e) => onUpdate(step.id, "taskNote", e.target.value)} />
      )}
    </div>
  );
}

// ─── Channel analytics ────────────────────────────────────────────────────────

function ChannelAnalytics({ stats }: { stats: ChannelStats[] }) {
  const totalSent = stats.reduce((a, b) => a + b.sent, 0);
  const totalReplied = stats.reduce((a, b) => a + b.replied, 0);
  const overallRate = totalSent > 0 ? `${Math.round((totalReplied / totalSent) * 100)}%` : "0%";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="premium-card p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Channel breakdown</p>
        <div className="mt-4 space-y-4">
          {stats.map((stat) => {
            const pct = totalSent > 0 ? Math.round((stat.sent / totalSent) * 100) : 0;
            const barColors: Record<string, string> = {
              EMAIL: "bg-emerald-500",
              LINKEDIN: "bg-blue-500",
              SMS: "bg-violet-500",
              PHONE: "bg-orange-500",
            };
            return (
              <div key={stat.channel}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-black text-[#1e2521]">{stat.label}</span>
                  <span className="text-xs text-[#687169]">{stat.sent} sent · {stat.replyRate} reply rate</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f0ece3]">
                  <div
                    className={`h-full rounded-full ${barColors[stat.channel] ?? "bg-gray-400"} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="premium-card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Total sent</p>
          <p className="mt-2 text-4xl font-black text-[#1e2521]">{totalSent}</p>
          <p className="mt-1 text-xs text-[#176b5d] font-bold">across all channels</p>
        </div>
        <div className="premium-card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687169]">Overall reply rate</p>
          <p className="mt-2 text-4xl font-black text-[#176b5d]">{overallRate}</p>
          <p className="mt-1 text-xs text-[#687169]">{totalReplied} replies logged</p>
        </div>
      </div>
    </div>
  );
}

// ─── Pill helper ──────────────────────────────────────────────────────────────

function Pill({ label, positive }: { label: string; positive?: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${positive ? "bg-[#f3faf7] text-[#176b5d]" : "bg-[#f7f5ef] text-[#687169]"}`}>
      {label}
    </span>
  );
}
