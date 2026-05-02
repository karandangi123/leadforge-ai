"use client";

import React, { useState } from "react";
import { Check, ShieldCheck, Sparkles, Building2, Zap, ArrowRight, Lock, CreditCard } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/billing";
import { motion } from "framer-motion";

interface BillingProps {
  currentPlan: string;
  isDemo: boolean;
}

export function BillingPanel({ currentPlan, isDemo }: BillingProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleSubscribe = async (plan: "PRO" | "AGENCY") => {
    if (isDemo) {
      alert("Billing is disabled in the demo workspace. Please sign in.");
      return;
    }
    setIsProcessing(plan);
    try {
      const url = await createCheckoutSession(plan);
      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      alert("Failed to initiate checkout. Please check your Stripe keys.");
      setIsProcessing(null);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="text-center mb-16 relative">
         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--soft-cyan)] border border-[var(--accent-cyan)]/20 mb-8 text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
           <CreditCard size={14} /> Subscription Management
         </div>
         <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight mb-6">Upgrade your <span className="text-[var(--accent-teal)]">RevOps</span> Engine.</h2>
         <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
           Scale your outbound sequences, unlock white-labeled reporting, and automate native deliverability warmup across your entire organization.
         </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Pro Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative flex flex-col rounded-[2.5rem] p-10 border-2 transition-all ${currentPlan === "PRO" ? "border-[var(--accent-teal)] bg-[var(--soft-cyan)]/20 shadow-xl" : "border-[var(--border-light)] bg-white hover:border-[var(--accent-cyan)] shadow-sm hover:shadow-lg"}`}
        >
          {currentPlan === "PRO" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent-teal)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
              Current Active Plan
            </div>
          )}
          
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--soft-cyan)] flex items-center justify-center">
                  <Sparkles size={20} className="text-[var(--accent-teal)]" />
                </div>
                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Pro</h3>
              </div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">For scaling teams</p>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-[var(--foreground)] tracking-tighter">$99</span>
              <span className="text-sm font-bold text-[var(--text-secondary)]">/mo</span>
            </div>
          </div>

          <div className="flex-1 space-y-5 mb-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">Capabilities included</p>
            <ul className="space-y-4">
               <PlanFeature label="Unlimited AI research dossiers" />
               <PlanFeature label="Multi-channel Sequence Builder" />
               <PlanFeature label="Native Deliverability & IP Warmup" bold />
               <PlanFeature label="Up to 5 Sender Domains" />
               <PlanFeature label="Standard API Access" />
            </ul>
          </div>

          <button 
            onClick={() => handleSubscribe("PRO")}
            disabled={currentPlan === "PRO" || isProcessing !== null}
            className={`w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
              currentPlan === "PRO" 
                ? "bg-[var(--soft-cyan)] text-[var(--accent-teal)] cursor-not-allowed border border-[var(--accent-cyan)]/20"
                : "bg-[var(--dark-bg)] text-white hover:bg-[var(--dark-card)] hover:shadow-xl shadow-lg shadow-black/10"
            }`}
          >
            {isProcessing === "PRO" ? "Connecting..." : currentPlan === "PRO" ? "Active Plan" : "Upgrade to Pro"}
          </button>
        </motion.div>

        {/* Agency Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative flex flex-col rounded-[2.5rem] p-10 border-2 transition-all ${currentPlan === "AGENCY" ? "border-[var(--accent-teal)] bg-[var(--dark-bg)] shadow-2xl" : "border-transparent bg-[var(--dark-bg)] shadow-2xl overflow-hidden"}`}
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--accent-teal)] opacity-10 blur-[80px] pointer-events-none" />
          
          {currentPlan === "AGENCY" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent-teal)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
              Current Active Plan
            </div>
          )}

          <div className="relative z-10 flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Building2 size={20} className="text-[var(--accent-teal)]" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Agency</h3>
              </div>
              <p className="text-xs font-bold text-[var(--soft-cyan)] uppercase tracking-wider opacity-60">For RevOps consultancies</p>
            </div>
            <div className="text-right text-white">
              <span className="text-5xl font-black tracking-tighter">$299</span>
              <span className="text-sm font-bold opacity-60">/mo</span>
            </div>
          </div>

          <div className="relative z-10 flex-1 space-y-5 mb-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">Enterprise Capabilities</p>
            <ul className="space-y-4">
               <PlanFeature label="Everything in Pro" dark />
               <PlanFeature label="Unlimited Client Workspaces" dark bold />
               <PlanFeature label="Branded White-Label Reporting" dark bold />
               <PlanFeature label="Two-way CRM Sync (HubSpot / SFDC)" dark />
               <PlanFeature label="Custom Domain CNAME" dark />
               <PlanFeature label="Priority Engineering Support" dark />
            </ul>
          </div>

          <button 
            onClick={() => handleSubscribe("AGENCY")}
            disabled={currentPlan === "AGENCY" || isProcessing !== null}
            className={`relative z-10 w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              currentPlan === "AGENCY" 
                ? "bg-[var(--accent-teal)] text-white cursor-not-allowed border border-[var(--accent-teal)]/20"
                : "bg-white text-[var(--dark-bg)] hover:bg-[var(--soft-cyan)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            }`}
          >
            {isProcessing === "AGENCY" ? "Connecting..." : currentPlan === "AGENCY" ? "Active Plan" : "Upgrade to Agency"}
            {currentPlan !== "AGENCY" && !isProcessing && <ArrowRight size={18} />}
          </button>
        </motion.div>
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-white border border-[var(--border-light)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--soft-cyan)] flex items-center justify-center text-[var(--accent-teal)] shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h4 className="text-base font-black text-[var(--foreground)] tracking-tight">Enterprise-Grade Security</h4>
            <p className="text-sm text-[var(--text-secondary)] mt-1">All transactions are processed via Stripe PCI-compliant infrastructure. Cancel or downgrade at any time with a single click.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 opacity-40 grayscale group-hover:grayscale-0 transition-all">
           {/* Placeholder for payment provider logos if needed */}
           <div className="h-6 w-12 bg-[var(--text-secondary)] rounded opacity-20" />
           <div className="h-6 w-12 bg-[var(--text-secondary)] rounded opacity-20" />
           <div className="h-6 w-12 bg-[var(--text-secondary)] rounded opacity-20" />
        </div>
      </div>
    </div>
  );
}

function PlanFeature({ label, dark, bold }: { label: string; dark?: boolean; bold?: boolean }) {
  return (
    <li className="flex items-start gap-3 group">
      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${dark ? "bg-white/10 text-[var(--accent-teal)]" : "bg-[var(--soft-cyan)] text-[var(--accent-teal)]"}`}>
        <Check size={14} strokeWidth={3} />
      </div>
      <span className={`text-[13px] leading-relaxed transition-colors ${dark ? "text-[var(--soft-cyan)]" : "text-[var(--text-secondary)]"} ${bold ? "font-bold text-[var(--foreground)]" : "font-medium"}`}>
        {label}
      </span>
    </li>
  );
}
