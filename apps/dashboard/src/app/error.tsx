"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fdfdfc] p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600 shadow-xl shadow-red-100">
        <AlertTriangle size={40} />
      </div>
      
      <h1 className="mt-8 text-3xl font-black tracking-tight text-[#1e2521] sm:text-4xl">System exception detected</h1>
      <p className="mt-4 max-w-lg text-lg text-[#687169]">
        The command layer encountered an unexpected error. This has been logged for audit, but the operator session is currently interrupted.
      </p>
      
      {error.digest && (
        <div className="mt-6 rounded-lg bg-gray-50 px-4 py-2 font-mono text-xs text-gray-500">
          Trace ID: {error.digest}
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4">
        <button
          onClick={() => reset()}
          className="premium-button-primary h-12 px-6"
        >
          <RefreshCcw size={18} /> Re-initialise system
        </button>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="premium-button-secondary h-12 px-6 flex items-center gap-2"
        >
          <Home size={18} /> Return to dashboard
        </button>
      </div>
      
      <p className="mt-12 text-xs font-bold uppercase tracking-widest text-[#9a9488]">LeadForge AI • Operator Safety Protocol</p>
    </div>
  );
}
