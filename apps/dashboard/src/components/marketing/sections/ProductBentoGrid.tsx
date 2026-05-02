"use client";

import { motion } from "framer-motion";
import { Search, Zap, Target, Mail, BarChart3, Database, Sparkles, Filter, Users, Cpu, FileText, Send } from "lucide-react";

export function ProductBentoGrid() {
  const cards = [
    {
      size: "lg",
      icon: Search,
      title: "Hyper-Granular Discovery",
      desc: "Find founders, decision makers, and high-fit accounts with surgical precision. Filter by funding, tech stack, and hiring signals.",
      ui: (
        <div className="mt-8 space-y-3">
           <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Filter size={14} className="text-[#22D3EE]" />
              <span className="text-[10px] font-bold text-white/60">SaaS Founders in SF hiring Sales</span>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                 <p className="text-[10px] font-black uppercase text-white/40 mb-1">Found</p>
                 <p className="text-xl font-black text-white">3,482</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                 <p className="text-[10px] font-black uppercase text-white/40 mb-1">Verified</p>
                 <p className="text-xl font-black text-[#22D3EE]">98%</p>
              </div>
           </div>
        </div>
      )
    },
    {
      size: "sm",
      icon: Cpu,
      title: "AI Intent Scoring",
      desc: "Automatically prioritize leads based on fit, intent, and buying signals.",
      ui: (
        <div className="mt-6 flex flex-col gap-2">
           <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <span className="text-[10px] font-black text-green-400 uppercase">94 Hot</span>
              <div className="h-1 w-12 bg-green-500/30 rounded-full overflow-hidden">
                 <div className="h-full w-full bg-green-400" />
              </div>
           </div>
           <div className="p-2 rounded-lg bg-white/5 text-[8px] text-white/40 italic leading-tight">
              "Recently funded + Hiring SDRs"
           </div>
        </div>
      )
    },
    {
      size: "sm",
      icon: Mail,
      title: "1:1 Outreach Gen",
      desc: "Write personalized emails that actually get replies.",
      ui: (
        <div className="mt-6 space-y-2">
           <div className="h-3 w-full bg-white/10 rounded" />
           <div className="h-3 w-4/5 bg-white/5 rounded" />
           <div className="h-3 w-5/6 bg-white/10 rounded" />
        </div>
      )
    },
    {
      size: "sm",
      icon: BarChart3,
      title: "Pipeline Analytics",
      desc: "Track ROI and revenue attribution in real-time.",
      ui: (
        <div className="mt-6 flex items-end gap-1 h-12">
           {[40, 70, 45, 90, 65].map((h, i) => (
             <div key={i} className="flex-1 bg-[#22D3EE]/20 rounded-t-sm relative group">
                <div 
                  className="absolute bottom-0 w-full bg-[#22D3EE] rounded-t-sm transition-all" 
                  style={{ height: `${h}%` }}
                />
             </div>
           ))}
        </div>
      )
    },
    {
      size: "lg",
      icon: Send,
      title: "Automated Sequences",
      desc: "Design multi-channel outbound flows that scale your human-in-the-loop outreach across Email, LinkedIn, and SMS.",
      ui: (
        <div className="mt-8 space-y-3">
           <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0D1117] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                 <Mail size={20} />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-white mb-1">Day 1: Personal Intro</p>
                 <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-[#22D3EE]" />
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                 <Zap size={20} />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-white/60 mb-1">Day 3: Social Follow-up</p>
                 <div className="h-1.5 w-full bg-white/5 rounded-full" />
              </div>
           </div>
        </div>
      )
    },
    {
      size: "sm",
      icon: Database,
      title: "CRM Sync",
      desc: "Push leads directly to your existing sales stack.",
      ui: (
        <div className="mt-6 p-4 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/20">
           <Database size={24} />
        </div>
      )
    }
  ];

  return (
    <section id="features" className="py-32 relative overflow-hidden bg-[#05070D]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
           <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-xs font-black uppercase tracking-[0.2em] text-[#22D3EE]">
                <Sparkles size={14} /> Comprehensive Feature Set
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                Enterprise-grade intelligence <br /> for high-growth teams.
              </h2>
           </div>
           <p className="text-[#94A3B8] text-lg max-w-sm font-medium pb-4">
             Everything you need to find, enrich, and convert leads into revenue at scale.
           </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-[2.5rem] bg-[#0D1117] border border-white/5 hover:border-[#22D3EE]/30 transition-all group flex flex-col ${card.size === "lg" ? "lg:col-span-2" : ""}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-8 group-hover:bg-[#22D3EE] group-hover:text-[#05070D] transition-all">
                <card.icon size={24} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{card.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed max-w-md font-medium">
                {card.desc}
              </p>
              
              <div className="mt-auto">
                {card.ui}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
