"use client";

import React from "react";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

interface FeatureGateProps {
  feature: string;
  isEntitled: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  variant?: "inline" | "block" | "overlay";
}

export function FeatureGate({ 
  feature, 
  isEntitled, 
  children, 
  fallback, 
  variant = "block" 
}: FeatureGateProps) {
  if (isEntitled) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (variant === "overlay") {
    return (
      <div className="relative group">
        <div className="filter blur-[2px] pointer-events-none opacity-40">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#02040a]/40 backdrop-blur-sm rounded-[2rem] border border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mb-4">
            <Lock size={20} />
          </div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Pro Feature</h4>
          <p className="text-[10px] text-[#94A3B8] font-medium mb-4 max-w-[200px]">
            Upgrade to the Agency plan to unlock high-fidelity {feature} intelligence.
          </p>
          <Link 
            href="/dashboard?view=billing"
            className="px-4 py-2 rounded-xl bg-white text-[#02040a] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-[#94A3B8] cursor-help group relative">
        <Lock size={10} /> {feature} Locked
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-[#0D1117] border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
           <p className="normal-case tracking-normal text-[10px] text-white/60 font-medium">This requires an active LeadForge Pro subscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center">
       <Sparkles size={24} className="text-[#22D3EE] mb-4 opacity-20" />
       <p className="text-sm font-bold text-white/40 tracking-tight">
         {feature} is reserved for high-fidelity workspaces.
       </p>
       <Link href="/dashboard?view=billing" className="mt-4 text-[10px] font-black text-[#22D3EE] uppercase tracking-widest hover:underline">
         View Pro Options
       </Link>
    </div>
  );
}

export function ProBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
      <Sparkles size={10} /> Pro
    </div>
  );
}
