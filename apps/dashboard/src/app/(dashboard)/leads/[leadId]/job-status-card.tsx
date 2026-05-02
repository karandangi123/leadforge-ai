"use client";

import { useEffect, useState } from "react";
import type { AsyncJobSnapshot } from "@/lib/ai-jobs/types";

export default function JobStatusCard({
  initialJob,
  runtimeLabel,
}: {
  initialJob: AsyncJobSnapshot;
  runtimeLabel: string;
}) {
  const [job, setJob] = useState(initialJob);

  useEffect(() => {
    if (job.status === "SUCCEEDED" || job.status === "FAILED" || job.status === "CANCELLED") {
      return;
    }

    const source = new EventSource(`/api/jobs/${job.id}/stream`);
    source.onmessage = (event) => {
      const next = JSON.parse(event.data) as AsyncJobSnapshot;
      setJob(next);
      if (next.status === "SUCCEEDED" || next.status === "FAILED" || next.status === "CANCELLED") {
        source.close();
      }
    };
    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [job.id, job.status]);

  const tone =
    job.status === "FAILED"
      ? "border-[#e6b8b1] bg-[#fff5f2] text-[#8a3528]"
      : job.status === "SUCCEEDED"
        ? "border-[#b9ddcf] bg-[#eaf4ef] text-[#176b5d]"
        : "border-[#d7d0bf] bg-[#fffdf8] text-[#1e2521]";

  return (
    <div className={`mt-4 rounded-2xl border px-4 py-4 ${tone}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">Execution status</p>
          <h2 className="mt-2 text-lg font-black">{formatKind(job.kind)} job</h2>
          <p className="mt-2 text-sm font-semibold">{job.message}</p>
        </div>
        <div className="grid gap-2 text-xs font-black uppercase md:text-right">
          <span>{job.status}</span>
          <span>{runtimeLabel}</span>
          <span>Attempt {job.attemptCount}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Meta label="Queued" value={formatTime(job.queuedAt)} />
        <Meta label="Started" value={formatTime(job.startedAt)} />
        <Meta label="Completed" value={formatTime(job.completedAt)} />
      </div>

      <div className="mt-4 space-y-2">
        {job.events.slice(0, 4).map((event) => (
          <div key={event.id} className="rounded-xl border border-black/5 bg-white/70 px-3 py-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-black uppercase text-[11px]">{event.status}</span>
              <span className="text-[11px] font-bold uppercase opacity-60">{formatTime(event.createdAt)}</span>
            </div>
            <p className="mt-2 leading-6">{event.message}</p>
          </div>
        ))}
      </div>

      {job.errorMessage ? <p className="mt-4 text-sm font-semibold">Latest error: {job.errorMessage}</p> : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white/70 px-3 py-3">
      <p className="text-[11px] font-black uppercase opacity-60">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function formatKind(kind: AsyncJobSnapshot["kind"]) {
  return kind.replaceAll("_", " ");
}

function formatTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}
