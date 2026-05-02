"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface CategoryViewProps {
  title: string;
  subtitle: string;
  description: string;
  items: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    detail: string;
    href: string;
  }[];
  accentColor?: string;
}

export function CategoryView({ title, subtitle, description, items, accentColor = "var(--accent-teal)" }: CategoryViewProps) {
  return (
    <div className="max-w-[1400px] mx-auto py-10">
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--soft-cyan)] border border-[var(--accent-cyan)]/20 mb-8 text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
          <Sparkles size={14} /> {subtitle}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.1] mb-8">
          {title}
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link 
              href={item.href}
              className="group block h-full p-8 rounded-[2.5rem] bg-white border border-[var(--border-light)] shadow-sm hover:shadow-xl hover:border-[var(--accent-cyan)] transition-all relative overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--soft-cyan)] opacity-0 group-hover:opacity-40 blur-[50px] transition-opacity pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[var(--soft-cyan)]/50 flex items-center justify-center text-[var(--foreground)] mb-8 group-hover:bg-[var(--accent-teal)] group-hover:text-white transition-all shadow-sm">
                  <item.icon size={24} />
                </div>
                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight mb-4">{item.label}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-8 line-clamp-3">
                  {item.detail}
                </p>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--accent-teal)] group-hover:gap-3 transition-all">
                  Launch Tool <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Strategic Bottom Section */}
      <div className="mt-16 p-12 rounded-[3rem] bg-[var(--dark-bg)] text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
               <h2 className="text-3xl font-black mb-4">Enterprise Automation Readiness</h2>
               <p className="text-sm text-white/60 leading-relaxed">
                 LeadForge categories are designed to work in synergy. Data enriched in the Intelligence hub automatically powers personalizations in the Growth Lab.
               </p>
            </div>
            <button className="h-14 px-10 rounded-2xl bg-white text-[var(--dark-bg)] font-black text-sm uppercase tracking-widest hover:bg-[var(--soft-cyan)] transition-all shrink-0">
               Audit {title} Logic
            </button>
         </div>
      </div>
    </div>
  );
}
