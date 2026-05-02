"use client";

import React from "react";
import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fdfdfc] p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f3faf7] text-[#176b5d] shadow-xl shadow-[#176b5d]/10">
        <Search size={40} />
      </div>
      
      <h1 className="mt-8 text-3xl font-black tracking-tight text-[#1e2521] sm:text-4xl">Resource not found</h1>
      <p className="mt-4 max-w-lg text-lg text-[#687169]">
        The lead or view you are looking for does not exist in the current workspace universe.
      </p>
      
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/dashboard"
          className="premium-button-primary h-12 px-6"
        >
          <Home size={18} /> Dashboard
        </Link>
        <button
          className="premium-button-secondary h-12 px-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={18} /> Go back
        </button>
      </div>
      
      <p className="mt-12 text-xs font-bold uppercase tracking-widest text-[#9a9488]">LeadForge AI • 404 Exception</p>
    </div>
  );
}
