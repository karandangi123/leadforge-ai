"use client";

import React from "react";
import { motion } from "framer-motion";
import { Database, Cpu, Mail, Zap, Sparkles, ChevronRight, Activity, Network } from "lucide-react";

const PILLARS = [
  {
    id: "data",
    title: "Data Engine",
    icon: Database,
    color: "#3B82F6",
    items: ["Find companies", "Decision makers", "Enrich contacts", "Validate lead data"]
  },
  {
    id: "intel",
    title: "Intelligence Layer",
    icon: Cpu,
    color: "#8B5CF6",
    items: ["ICP matching", "AI lead scoring", "Buying signals", "Priority ranking"]
  },
  {
    id: "outreach",
    title: "Outreach Engine",
    icon: Mail,
    color: "#10B981",
    items: ["AI email writer", "LinkedIn opener", "Follow-up logic", "Personalization"]
  },
  {
    id: "automation",
    title: "Pipeline Automation",
    icon: Zap,
    color: "#EC4899",
    items: ["Campaign queue", "Reply tracking", "CRM export", "Pipeline analytics"]
  }
];

export function RevenueEngineDiagram() {
  const particles = React.useMemo(() => 
    [...Array(6)].map((_, i) => ({
      x: Math.random() * 100 + "%",
      duration: Math.random() * 10 + 10,
      delay: i * 2
    })), []);

  return (
    <section className="py-32 bg-[#02040a] relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#8B5CF6] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      
      {/* Subtle Data Particles (Pure CSS for performance) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         {particles.map((p, i) => (
           <motion.div
             key={i}
             initial={{ x: p.x, y: "100%" }}
             animate={{ y: "-10%" }}
             transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
             className="absolute w-[1px] h-20 bg-gradient-to-t from-transparent via-[#22D3EE] to-transparent"
           />
         ))}
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[10px] font-black uppercase tracking-widest text-[#3B82F6] mb-8"
          >
            <Network size={14} /> Connected Ecosystem
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
            The AI revenue engine behind <br className="hidden md:block" />
            every qualified lead.
          </h2>
          <p className="text-[#94A3B8] text-xl font-medium leading-relaxed">
            LeadForge AI connects data, scoring, outreach, and automation into one continuous, high-fidelity prospecting workflow.
          </p>
        </div>

        <div className="relative">
          {/* Main Visual System */}
          <div className="relative flex flex-col items-center">
            {/* Center Hub */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative z-30 w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-[#0D1117] border border-white/10 flex flex-col items-center justify-center group"
            >
               <div className="absolute inset-0 rounded-[3rem] bg-[#22D3EE]/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
               
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#22D3EE]/10 flex items-center justify-center mb-4 border border-[#22D3EE]/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <Sparkles size={32} className="text-[#22D3EE]" />
                  </div>
                  <span className="text-sm font-black text-white tracking-[0.3em] uppercase">Core Engine</span>
                  <div className="flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                     <span className="text-[9px] font-black text-[#94A3B8] uppercase">Active State</span>
                  </div>
               </div>
            </motion.div>

            {/* Pillars Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 w-full lg:mt-32">
               {PILLARS.map((pillar, i) => (
                 <motion.div
                   key={pillar.id}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="relative group"
                 >
                   <div 
                     className="absolute -inset-1 rounded-[2.5rem] blur-[20px] opacity-0 group-hover:opacity-10 transition duration-500"
                     style={{ backgroundColor: pillar.color }}
                   />
                   <div className="relative h-full p-10 rounded-[2.5rem] bg-[#0D1117]/50 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all flex flex-col group-hover:bg-[#0D1117]/80">
                     <div 
                       className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl transition-transform group-hover:scale-110"
                       style={{ backgroundColor: `${pillar.color}15`, color: pillar.color, border: `1px solid ${pillar.color}30` }}
                     >
                       <pillar.icon size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-white tracking-tight mb-8 leading-tight">{pillar.title}</h3>
                     
                     <div className="space-y-5">
                        {pillar.items.map((item) => (
                          <div key={item} className="flex items-center gap-3 text-[#94A3B8] group/item hover:text-white transition-colors cursor-default">
                             <div 
                               className="w-1 h-1 rounded-full opacity-40 group-hover/item:opacity-100 transition-opacity"
                               style={{ backgroundColor: pillar.color }}
                             />
                             <span className="text-sm font-semibold tracking-tight">{item}</span>
                          </div>
                        ))}
                     </div>

                     <div className="mt-10 pt-8 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: pillar.color }}>
                           Optimize Flow <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                     </div>
                   </div>
                 </motion.div>
               ))}
            </div>

            {/* Connecting Lines (Improved SVG) */}
            <div className="absolute inset-0 -z-10 pointer-events-none hidden lg:block">
               <svg width="100%" height="100%" viewBox="0 0 1200 600" className="opacity-20 overflow-visible">
                  <defs>
                     <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
                        <stop offset="50%" stopColor="#22D3EE" stopOpacity="1" />
                        <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                     </linearGradient>
                  </defs>
                  {/* These lines need to match the center node and pillars */}
                  <path d="M600 200 L150 400" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="5 5" />
                  <path d="M600 200 L450 400" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="5 5" />
                  <path d="M600 200 L750 400" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="5 5" />
                  <path d="M600 200 L1050 400" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="5 5" />
               </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
