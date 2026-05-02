"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Search, Database, Sparkles, Mail, Zap, BarChart3, ChevronRight, X, Check, Activity, ShieldCheck, Cpu, Globe, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    title: "Lead Discovery",
    headline: "Identify high-fit accounts.",
    desc: "Autonomous market scanning for industry signals, growth indicators, and custom intent.",
    icon: Search,
    color: "#22D3EE",
    ui: "128 leads found",
    tag: "Autonomous",
    grid: "col-span-1 lg:col-span-2 h-[450px]"
  },
  {
    title: "Enrichment",
    headline: "Zero-bounce contact data.",
    desc: "Complete profiles with verified emails and direct dials.",
    icon: Database,
    color: "#3B82F6",
    ui: "alex@novastack.ai",
    tag: "98% Accuracy",
    grid: "col-span-1 h-[450px]"
  },
  {
    title: "AI Scoring",
    headline: "Prioritize hot intent.",
    desc: "AI ranks leads based on real-time buying signals and profile fit.",
    icon: Sparkles,
    color: "#F59E0B",
    ui: "94 Hot Intent",
    tag: "Predictive",
    grid: "col-span-1 h-[450px]"
  },
  {
    title: "Outreach Writer",
    headline: "Founder-grade copy.",
    desc: "Contextual outreach tailored to specific news and roles.",
    icon: Mail,
    color: "#10B981",
    ui: "Drafting...",
    tag: "Personalized",
    grid: "col-span-1 lg:col-span-2 h-[450px]"
  }
];

function BentoCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className={`group relative rounded-[4rem] bg-[#0D1117]/60 backdrop-blur-3xl border border-white/5 overflow-hidden transition-all p-12 flex flex-col hover:border-white/20 ${feature.grid}`}
    >
      {/* Spotlight Effect */}
      <motion.div 
        className="absolute -inset-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ 
          background: useTransform(
            [mouseX, mouseY], 
            ([mx, my]) => `radial-gradient(600px circle at ${mx}px ${my}px, ${feature.color}15, transparent 80%)`
          ) 
        }}
      />

      <div className="flex justify-between items-start mb-12 relative z-10">
         <div 
           className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3"
           style={{ backgroundColor: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}30` }}
         >
            {React.createElement(feature.icon, { size: 40 })}
         </div>
         <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white transition-colors">
            {feature.tag}
         </div>
      </div>

      <div className="mb-8 relative z-10">
         <h3 className="text-3xl font-black text-white tracking-tight mb-5 group-hover:translate-x-2 transition-transform duration-500">{feature.headline}</h3>
         <p className="text-[#94A3B8] text-lg font-medium leading-relaxed max-w-md">{feature.desc}</p>
      </div>

      <div className="mt-auto relative z-10">
         <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Protocol Node</span>
            <div className="h-[1px] flex-1 bg-white/5" />
         </div>
         
         <div className="flex items-center justify-between p-7 rounded-[2.5rem] bg-black/40 border border-white/5 shadow-2xl group-hover:border-white/15 transition-all">
            <div className="flex items-center gap-6">
               <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_#22D3EE]" style={{ backgroundColor: feature.color }} />
               <span className="text-sm font-mono font-black text-white tracking-tight">{feature.ui}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#22D3EE] opacity-0 group-hover:opacity-100 transition-opacity">
               Explore <ArrowRight size={14} />
            </div>
         </div>
      </div>
    </motion.div>
  );
}

export function FeatureBentoGrid() {
  return (
    <section className="py-48 bg-[#02040a] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[60%] h-[60%] bg-[#3B82F6]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[60%] h-[60%] bg-[#8B5CF6]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.45em] text-[#22D3EE] mb-10 shadow-2xl"
          >
            <Cpu size={14} /> Modular Growth Intelligence
          </motion.div>
          <h2 className="text-6xl md:text-[5.5rem] font-black text-white tracking-tighter mb-12 leading-[0.85]">
            Consolidate your stack. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#3B82F6]">Automate everything.</span>
          </h2>
          <p className="text-[#94A3B8] text-2xl font-medium leading-relaxed max-w-3xl mx-auto italic">
             LeadForge AI replaces fragmented legacy tools with a single, high-fidelity revenue engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {FEATURES.map((f, i) => (
             <BentoCard key={i} feature={f} index={i} />
           ))}
        </div>

        {/* Cinematic Comparison Section */}
        <div className="mt-48 relative rounded-[5rem] border border-white/10 bg-[#080B12] overflow-hidden p-16 md:p-32 shadow-[0_100px_200px_rgba(0,0,0,0.9)] group/compare">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(34,211,238,0.08)_0%,transparent_70%)] pointer-events-none" />
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
           
           <div className="grid lg:grid-cols-2 gap-32 lg:gap-56 relative z-10 items-center">
              {/* Before */}
              <div className="opacity-25 grayscale blur-[1px] hover:grayscale-0 hover:blur-0 hover:opacity-100 transition-all duration-1000 cursor-help">
                 <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-red-400 mb-14">
                    <X size={14} /> Manual Fragmentation
                 </div>
                 <h3 className="text-5xl font-black text-white mb-14 tracking-tighter leading-tight">Disconnected, <br /> slow, and fragile.</h3>
                 <div className="space-y-10">
                    {[
                      "Manual spreadsheet merging",
                      "Guessing intent & timing",
                      "Fragmented legacy tools",
                      "Low-quality generic data",
                      "Human error in outreach"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-6 py-4 border-b border-white/5">
                         <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/40 border border-red-500/5"><X size={14} /></div>
                         <span className="text-lg font-bold text-white/30 tracking-tight">{item}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* After */}
              <div className="relative">
                 <div className="absolute -inset-48 bg-[#22D3EE]/15 blur-[160px] -z-10 animate-pulse" />
                 <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[10px] font-black uppercase tracking-[0.4em] text-[#22D3EE] mb-14 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                    <Zap size={14} /> The Autonomous Standard
                 </div>
                 <h3 className="text-5xl font-black text-white mb-14 tracking-tighter leading-tight">Unified, <br /> intelligent, and live.</h3>
                 <div className="space-y-10">
                    {[
                      "End-to-end revenue automation",
                      "High-fidelity intent tracking",
                      "Consolidated intelligence hub",
                      "Founder-grade AI copy",
                      "SLA-backed data accuracy"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-6 py-4 border-b border-[#22D3EE]/15 group/item">
                         <div className="w-8 h-8 rounded-full bg-[#22D3EE]/10 flex items-center justify-center text-[#22D3EE] border border-[#22D3EE]/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]"><Check size={16} /></div>
                         <span className="text-lg font-black text-white tracking-tight group-hover/item:translate-x-1 transition-transform">{item}</span>
                      </div>
                    ))}
                 </div>
                 <div className="mt-20 flex items-center gap-8">
                    <div className="flex -space-x-4">
                       {[...Array(4)].map((_, i) => (
                         <div key={i} className="w-12 h-12 rounded-full border-4 border-[#080B12] bg-[#0D1117] flex items-center justify-center text-[11px] font-black text-white/40 shadow-2xl">
                           {String.fromCharCode(65 + i)}
                         </div>
                       ))}
                    </div>
                    <div>
                       <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#22D3EE]">Engine Operational</p>
                       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">SLA Verified • 2026</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
