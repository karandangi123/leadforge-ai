"use client";

import { useEffect, useState } from "react";
import type { AsyncJobSnapshot } from "@/lib/ai-jobs/types";

export type AsyncToolState<T> = {
  message: string;
  jobId: string | null;
  result: T | null;
};

export function useAsyncToolJob<T>(state: AsyncToolState<T>) {
  const [job, setJob] = useState<AsyncJobSnapshot | null>(null);
  const [result, setResult] = useState<T | null>(state.result);

  useEffect(() => {
    setResult(state.result);
  }, [state.result]);

  useEffect(() => {
    if (!state.jobId) {
      setJob(null);
      return;
    }

    const source = new EventSource(`/api/jobs/${state.jobId}/stream`);
    source.onmessage = (event) => {
      const next = JSON.parse(event.data) as AsyncJobSnapshot;
      setJob(next);
      if (next.status === "SUCCEEDED") {
        setResult(next.result as T);
        source.close();
      } else if (next.status === "FAILED" || next.status === "CANCELLED") {
        source.close();
      }
    };
    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [state.jobId]);

  return { job, result };
}
