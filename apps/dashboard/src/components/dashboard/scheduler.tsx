"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mic,
  Phone,
  PhoneCall,
  PhoneOff,
  Plus,
  Video,
  X,
  Zap,
} from "lucide-react";
import { bookMeeting, scheduleOrInitiateCall } from "@/app/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type UpcomingEvent = {
  id: string;
  title: string;
  leadName: string;
  startAt: string;
  durationMinutes: number;
  status: string;
  meetingUrl?: string | null;
};

type PastCall = {
  id: string;
  contactPhone: string;
  leadName: string;
  status: string;
  durationSeconds?: number | null;
  startedAt?: string | null;
  notes?: string | null;
};

type SchedulerProps = {
  leadId?: string;
  leadName?: string;
  contactEmail?: string;
  contactPhone?: string;
  upcomingEvents?: UpcomingEvent[];
  pastCalls?: PastCall[];
  hasTwilio?: boolean;
  isDemo?: boolean;
};

// ─── Main export: split-panel, no tabs ───────────────────────────────────────

export function SchedulerAndDialer({
  leadId,
  leadName,
  contactEmail,
  contactPhone,
  upcomingEvents = [],
  pastCalls = [],
  hasTwilio = false,
  isDemo = false,
}: SchedulerProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2 animate-fade-in">
      {/* ── Left: Calendar Scheduler ─────────────────────────────────────── */}
      <CalendarPanel
        leadId={leadId}
        leadName={leadName}
        contactEmail={contactEmail}
        upcomingEvents={upcomingEvents}
      />

      {/* ── Right: Dialer ─────────────────────────────────────────────────── */}
      <DialerPanel
        leadId={leadId}
        leadName={leadName}
        contactPhone={contactPhone}
        pastCalls={pastCalls}
        hasTwilio={hasTwilio}
        isDemo={isDemo}
      />
    </div>
  );
}

// ─── Calendar panel (dark + teal gradient) ────────────────────────────────────

function CalendarPanel({
  leadId,
  leadName,
  contactEmail,
  upcomingEvents,
}: Pick<SchedulerProps, "leadId" | "leadName" | "contactEmail" | "upcomingEvents">) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const events = upcomingEvents ?? [];

  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  })();

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#0f1f1b] text-white shadow-2xl shadow-black/20">
      {/* Decorative gradient orb */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#176b5d]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-0 h-48 w-48 rounded-full bg-teal-400/10 blur-2xl" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 px-7 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#176b5d] to-teal-400 shadow-lg shadow-[#176b5d]/40">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-400">Calendar Scheduler</p>
            <h2 className="text-xl font-black leading-tight text-white">Book Meetings</h2>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 px-4 py-3 backdrop-blur-sm border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Upcoming</p>
            <p className="mt-1 text-2xl font-black text-white">{events.length}</p>
          </div>
          <div className="rounded-2xl bg-white/5 px-4 py-3 backdrop-blur-sm border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">This week</p>
            <p className="mt-1 text-2xl font-black text-teal-400">
              {events.filter(e => {
                const d = new Date(e.startAt);
                const now = new Date();
                const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return d >= now && d <= weekEnd;
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming events */}
      <div className="relative z-10 px-7 py-5 space-y-3">
        {events.length > 0 ? (
          events.map((evt) => (
            <div key={evt.id} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm hover:bg-white/8 transition-colors">
              <div className={`flex size-9 shrink-0 flex-col items-center justify-center rounded-xl text-center ${eventPalette(evt.status)}`}>
                <span className="text-[9px] font-black leading-none">{formatMonth(evt.startAt)}</span>
                <span className="text-base font-black leading-none">{formatDay(evt.startAt)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">{evt.title}</p>
                <p className="text-[11px] text-white/50">{formatTime(evt.startAt)} · {evt.durationMinutes}min</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {evt.meetingUrl && (
                  <a href={evt.meetingUrl} target="_blank" rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-xl bg-teal-400/15 text-teal-400 hover:bg-teal-400/25 transition-colors">
                    <Video size={13} />
                  </a>
                )}
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${statusBadge(evt.status)}`}>{evt.status}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
            <CalendarDays size={28} className="mx-auto text-white/20" />
            <p className="mt-2 text-sm text-white/40">No meetings scheduled yet</p>
          </div>
        )}

        {/* Book meeting */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-teal-400/30 py-3.5 text-sm font-black text-teal-400 transition-all hover:bg-teal-400/10 hover:border-teal-400/60"
          >
            <Plus size={16} /> Book a meeting
          </button>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black text-white">New meeting{leadName ? ` — ${leadName}` : ""}</p>
              <button onClick={() => setShowForm(false)} className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <form action={bookMeeting} onSubmit={() => setSubmitting(true)} className="space-y-3">
              <input type="hidden" name="leadId" value={leadId ?? ""} />
              <input
                name="title"
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-teal-400/60 focus:outline-none backdrop-blur-sm"
                placeholder={`Intro call${leadName ? ` — ${leadName}` : ""}`}
                required
              />
              <input
                name="startAtIso"
                type="datetime-local"
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white focus:border-teal-400/60 focus:outline-none"
                defaultValue={defaultDate}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select name="durationMinutes" className="rounded-xl border border-white/15 bg-[#0f1f1b] px-3 py-2.5 text-sm text-white focus:border-teal-400/60 focus:outline-none">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
                <input
                  name="meetingUrl"
                  className="rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-teal-400/60 focus:outline-none"
                  placeholder="Zoom/Meet URL"
                />
              </div>
              {contactEmail && (
                <input name="attendeeEmails" className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white focus:border-teal-400/60 focus:outline-none" defaultValue={contactEmail} />
              )}
              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#176b5d] to-teal-500 py-3 text-sm font-black text-white shadow-lg shadow-[#176b5d]/40 hover:from-[#115247] hover:to-teal-600 disabled:opacity-50 transition-all">
                <CalendarDays size={15} /> {submitting ? "Booking…" : "Confirm meeting"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dialer panel (warm orange-dark gradient) ─────────────────────────────────

function DialerPanel({
  leadId,
  leadName,
  contactPhone,
  pastCalls = [],
  hasTwilio = false,
  isDemo = false,
}: Pick<SchedulerProps, "leadId" | "leadName" | "contactPhone" | "pastCalls" | "hasTwilio" | "isDemo">) {
  const [phone, setPhone] = useState(contactPhone ?? "");
  const [note, setNote] = useState("");
  const [record, setRecord] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dialpadActive, setDialpadActive] = useState(false);

  const dialpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  function pressKey(k: string) {
    setPhone((prev) => prev + k);
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1a0e06] via-[#241208] to-[#1a0e06] text-white shadow-2xl shadow-black/20">
      {/* Glow effects */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-red-600/10 blur-2xl" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 px-7 pt-7 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/40">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">Outbound Dialer</p>
              <h2 className="text-xl font-black leading-tight text-white">Call Center</h2>
            </div>
          </div>
          {/* Connection status */}
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${hasTwilio ? "border-orange-400/30 bg-orange-400/10" : "border-white/10 bg-white/5"}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${hasTwilio ? "bg-orange-400 animate-pulse" : "bg-white/20"}`} />
            <span className={`text-[10px] font-black ${hasTwilio ? "text-orange-400" : "text-white/30"}`}>
              {hasTwilio ? "Twilio live" : "No connection"}
            </span>
          </div>
        </div>

        {/* Call stats */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Calls</p>
            <p className="mt-1 text-xl font-black text-white">{pastCalls.length}</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Answered</p>
            <p className="mt-1 text-xl font-black text-orange-400">
              {pastCalls.filter(c => c.status === "COMPLETED").length}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Missed</p>
            <p className="mt-1 text-xl font-black text-red-400">
              {pastCalls.filter(c => c.status === "NO_ANSWER").length}
            </p>
          </div>
        </div>
      </div>

      {/* Dialer body */}
      <div className="relative z-10 px-7 py-5 space-y-4">
        {/* Phone input with dialpad toggle */}
        <div className="relative">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
            className="w-full rounded-2xl border border-white/15 bg-white/8 px-5 py-4 pr-14 text-center font-mono text-2xl font-black tracking-widest text-white placeholder-white/20 focus:border-orange-400/50 focus:outline-none backdrop-blur-sm"
          />
          <button
            type="button"
            onClick={() => setDialpadActive(!dialpadActive)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-xl transition-all ${dialpadActive ? "bg-orange-400/20 text-orange-400" : "bg-white/10 text-white/40 hover:text-white"}`}
          >
            <Zap size={14} />
          </button>
        </div>

        {/* Animated dialpad */}
        {dialpadActive && (
          <div className="grid grid-cols-3 gap-2">
            {dialpadKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => pressKey(key)}
                className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-black text-white transition-all hover:bg-orange-400/15 hover:border-orange-400/30 hover:text-orange-400 active:scale-95"
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {/* Call controls */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/8 transition-colors">
            <div className={`flex size-8 items-center justify-center rounded-xl transition-all ${record ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/40"}`}>
              <Mic size={14} />
            </div>
            <div>
              <p className="text-xs font-black text-white">Record</p>
              <p className="text-[10px] text-white/40">{record ? "On" : "Off"}</p>
            </div>
            <input type="checkbox" className="sr-only" checked={record} onChange={e => setRecord(e.target.checked)} />
            <div className={`ml-auto h-5 w-9 rounded-full transition-colors ${record ? "bg-red-500" : "bg-white/20"} relative`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${record ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/8 transition-colors">
            <div className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-white/40">
              <PhoneCall size={14} />
            </div>
            <div>
              <p className="text-xs font-black text-white">Instant</p>
              <p className="text-[10px] text-white/40">{hasTwilio ? "Available" : "No Twilio"}</p>
            </div>
          </label>
        </div>

        {/* Note */}
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder={`Script or note for ${leadName ?? "this lead"}…`}
          className="w-full resize-none rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-orange-400/50 focus:outline-none"
        />

        {/* Action buttons */}
        <form action={scheduleOrInitiateCall} onSubmit={() => setSubmitting(true)}>
          <input type="hidden" name="leadId" value={leadId ?? ""} />
          <input type="hidden" name="contactPhone" value={phone} />
          <input type="hidden" name="note" value={note} />
          <input type="hidden" name="recordCall" value={record ? "1" : "0"} />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="submit"
              name="initiateNow"
              value="0"
              disabled={submitting || !phone.trim()}
              className="flex items-center justify-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-400/10 py-3.5 text-sm font-black text-orange-400 hover:bg-orange-400/20 transition-all disabled:opacity-40"
            >
              <Clock3 size={15} /> Schedule
            </button>
            <button
              type="submit"
              name="initiateNow"
              value={hasTwilio || isDemo ? "1" : "0"}
              disabled={submitting || !phone.trim()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-40 active:scale-95"
            >
              <PhoneCall size={15} /> {hasTwilio ? "Call now" : "Log call"}
            </button>
          </div>
        </form>

        {/* Call history */}
        {pastCalls.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Recent calls</p>
            {pastCalls.slice(0, 3).map((call) => (
              <div key={call.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${callChipStyle(call.status)}`}>
                  {call.status === "COMPLETED" ? <Phone size={12} /> : call.status === "FAILED" ? <PhoneOff size={12} /> : <Clock3 size={12} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-white">{call.contactPhone}</p>
                  {call.notes && <p className="truncate text-[10px] text-white/40">{call.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[10px] font-black uppercase ${callTextColor(call.status)}`}>{call.status}</p>
                  {call.durationSeconds && <p className="text-[10px] text-white/30">{formatDuration(call.durationSeconds)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasTwilio && (
          <div className="rounded-2xl border border-orange-400/15 bg-orange-400/5 p-4">
            <p className="text-xs font-black text-orange-400">Connect Twilio to enable live calls</p>
            <p className="mt-1 text-[11px] text-white/40">
              Set <code className="rounded bg-white/10 px-1">TWILIO_ACCOUNT_SID</code>, <code className="rounded bg-white/10 px-1">TWILIO_AUTH_TOKEN</code>, and <code className="rounded bg-white/10 px-1">TWILIO_FROM_NUMBER</code> in your environment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMonth(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short" }).toUpperCase();
}
function formatDay(iso: string) {
  return new Date(iso).getDate();
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
}
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function eventPalette(status: string) {
  if (status === "COMPLETED") return "bg-teal-400/15 text-teal-400";
  if (status === "CANCELLED") return "bg-red-400/15 text-red-400";
  return "bg-white/10 text-white";
}
function statusBadge(status: string) {
  if (status === "CONFIRMED" || status === "COMPLETED") return "bg-teal-400/15 text-teal-400";
  if (status === "CANCELLED") return "bg-red-400/15 text-red-400";
  return "bg-white/10 text-white/60";
}
function callChipStyle(status: string) {
  if (status === "COMPLETED") return "bg-teal-400/15 text-teal-400";
  if (status === "FAILED" || status === "NO_ANSWER") return "bg-red-400/15 text-red-400";
  return "bg-orange-400/15 text-orange-400";
}
function callTextColor(status: string) {
  if (status === "COMPLETED") return "text-teal-400";
  if (status === "FAILED" || status === "NO_ANSWER") return "text-red-400";
  return "text-orange-400";
}
