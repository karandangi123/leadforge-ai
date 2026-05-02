"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Stat {
  label: string;
  value: string;
  delta: string;
}

interface DashboardHeroProps {
  agentRuns: Stat[];
}

export function DashboardHero({ agentRuns }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-light)] bg-white p-10 md:p-14 shadow-xl">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--soft-cyan)] to-transparent opacity-40 pointer-events-none" />
      
      <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--soft-cyan)] border border-[var(--accent-cyan)]/20 mb-8 text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
            <Sparkles size={14} /> Revenue Command Layer
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.1] mb-8">
            Your entire outbound <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--foreground)] to-[var(--text-secondary)]">
              pipeline, centralized.
            </span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10 max-w-xl">
            Move from strategy to discovery to execution without friction. LeadForge AI manages the complexity while you maintain absolute human control.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard?view=roast" className="group flex items-center gap-2 bg-[var(--dark-bg)] text-white px-8 py-4 rounded-xl text-base font-bold transition-all hover:bg-[var(--dark-card)] border border-[var(--dark-bg)] hover:border-[var(--accent-cyan)] hover:shadow-[0_0_20px_rgba(0,209,193,0.3)]">
              Launch Roast Lab
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/dashboard?view=targeting" className="px-8 py-4 rounded-xl border border-[var(--border-light)] bg-white text-[var(--foreground)] text-base font-bold transition-all hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]">
              Build Playbook
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {agentRuns.map((item, idx) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-[var(--border-light)] shadow-sm hover:border-[var(--accent-cyan)] transition-all"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">{item.label}</p>
              <p className="text-4xl font-black text-[var(--foreground)]">{item.value}</p>
              <p className="mt-2 text-xs font-bold text-[var(--accent-teal)]">{item.delta}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
