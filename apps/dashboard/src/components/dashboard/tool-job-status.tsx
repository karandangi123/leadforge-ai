"use client";

import type { AsyncJobSnapshot } from "@/lib/ai-jobs/types";
import { getRuntimeModeLabel } from "@/lib/runtime-mode";

export function ToolJobStatus({
  job,
  title,
}: {
  job: AsyncJobSnapshot;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-[#176b5d]">Execution status</p>
          <h2 className="mt-1 text-xl font-black leading-tight">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#4f5a53]">{job.message}</p>
        </div>
        <div className="grid gap-1 text-sm font-black text-[#1e2521] md:text-right">
          <span>{job.status}</span>
          <span className="text-xs uppercase text-[#687169]">{getRuntimeModeLabel(job.executionMode)}</span>
          <span className="text-xs uppercase text-[#687169]">Attempt {job.attemptCount}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <StatusMetric label="Queued" value={formatDateTime(job.queuedAt)} />
        <StatusMetric label="Started" value={formatDateTime(job.startedAt)} />
        <StatusMetric label="Completed" value={formatDateTime(job.completedAt)} />
      </div>
      <div className="mt-4 space-y-2">
        {job.events.slice(0, 4).map((event) => (
          <div key={event.id} className="rounded-xl border border-[#e3dccd] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-black uppercase text-[#176b5d]">{event.status}</span>
              <span className="text-[11px] font-bold uppercase text-[#687169]">{formatDateTime(event.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{event.message}</p>
          </div>
        ))}
      </div>
      {job.errorMessage ? <p className="mt-4 text-sm font-bold text-[#8a3528]">Latest error: {job.errorMessage}</p> : null}
    </section>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#687169]">{label}</p>
      <p className="mt-2 text-sm font-black text-[#1e2521]">{value}</p>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}
