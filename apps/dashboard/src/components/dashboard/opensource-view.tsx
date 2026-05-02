"use client";

import React from "react";
import { motion } from "framer-motion";
import { GitPullRequest, GitFork, Star, CircleDot, ArrowRight, BookOpen, ShieldCheck, Heart } from "lucide-react";
import { Github } from "@/components/ui/BrandIcons";

export function OpenSourceView() {
  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="text-center mb-16 relative">
         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--soft-cyan)] border border-[var(--accent-cyan)]/20 mb-8 text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
           <Github size={14} /> Open Architecture
         </div>
         <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight mb-6">Built in the <span className="text-[var(--accent-teal)]">Open</span>.</h2>
         <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
           LeadForge AI is an open-core platform. We believe revenue infrastructure should be auditable, transparent, and built in collaboration with the community.
         </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_0.8fr] gap-8">
        <div className="space-y-8">
           {/* GitHub Card */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-[var(--dark-bg)] rounded-[2.5rem] p-10 border border-[var(--accent-cyan)]/20 shadow-2xl relative overflow-hidden group"
           >
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Github size={200} />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Github size={32} className="text-white" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">karandangi123/leadforge-ai</h3>
                      <p className="text-sm font-bold text-[var(--accent-teal)] uppercase tracking-wider">Community Edition</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                   <StatCard icon={Star} label="Stars" value="2.4k" />
                   <StatCard icon={GitFork} label="Forks" value="128" />
                   <StatCard icon={CircleDot} label="Issues" value="14" />
                   <StatCard icon={GitPullRequest} label="PRs" value="6" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                   <a 
                     href="https://github.com/karandangi123/leadforge-ai" 
                     target="_blank" 
                     className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl bg-white text-[var(--dark-bg)] font-black text-sm uppercase tracking-widest hover:bg-[var(--soft-cyan)] transition-all"
                   >
                     View Repository <ArrowRight size={18} />
                   </a>
                   <a 
                     href="https://docs.leadforge.ai" 
                     target="_blank" 
                     className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                   >
                     Documentation <BookOpen size={18} />
                   </a>
                </div>
             </div>
           </motion.div>

           {/* Why Open Source */}
           <div className="grid md:grid-cols-2 gap-6">
              <FeatureCard 
                icon={ShieldCheck} 
                title="Auditable Privacy" 
                detail="Inspect every line of code that handles your lead data and Gmail interactions. No black-box secrets." 
              />
              <FeatureCard 
                icon={Heart} 
                title="Community Driven" 
                detail="Our roadmap is public. We prioritize features based on what real operators and agencies actually need." 
              />
           </div>
        </div>

        <aside className="space-y-8">
           {/* Terminal Section */}
           <div className="bg-[#0b1220] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                 </div>
                 <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Deploy Console</span>
              </div>
              <div className="p-8 font-mono text-sm space-y-4">
                 <div className="flex gap-4">
                    <span className="text-white/30 select-none">$</span>
                    <span className="text-[var(--accent-teal)]">git clone</span>
                    <span className="text-white">leadforge/core.git</span>
                 </div>
                 <div className="flex gap-4">
                    <span className="text-white/30 select-none">$</span>
                    <span className="text-[var(--accent-teal)]">npm</span>
                    <span className="text-white">install</span>
                 </div>
                 <div className="flex gap-4 text-white/40 italic text-xs">
                    <span>... installed 1,248 dependencies</span>
                 </div>
                 <div className="flex gap-4">
                    <span className="text-white/30 select-none">$</span>
                    <span className="text-[var(--accent-teal)]">npm</span>
                    <span className="text-white">run dev:infra</span>
                 </div>
                 <div className="pt-4 text-[var(--accent-teal)] font-bold">
                    &gt; Revenue OS Initialized.
                 </div>
                 <div className="text-emerald-500">
                    &gt; All agents online. http://localhost:3000
                 </div>
              </div>
           </div>

           <div className="p-8 rounded-[2rem] border border-[var(--border-light)] bg-white shadow-sm">
              <h4 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest mb-6">The Trust Manifesto</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                Most lead generation tools are walled gardens. We believe the future of B2B outreach is sovereign infrastructure where YOU own the logic, the data, and the delivery network.
              </p>
              <button className="w-full h-12 rounded-xl border border-[var(--border-light)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-all">
                Read the Manifesto
              </button>
           </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
       <Icon size={14} className="text-[var(--accent-teal)] mx-auto mb-2 opacity-60" />
       <p className="text-lg font-black text-white">{value}</p>
       <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, detail }: { icon: any; title: string; detail: string }) {
  return (
    <div className="p-8 rounded-[2rem] border border-[var(--border-light)] bg-white shadow-sm hover:border-[var(--accent-teal)] transition-all group">
       <div className="w-12 h-12 rounded-xl bg-[var(--soft-cyan)] flex items-center justify-center text-[var(--accent-teal)] mb-6 group-hover:scale-110 transition-transform">
          <Icon size={24} />
       </div>
       <h4 className="text-base font-black text-[var(--foreground)] tracking-tight mb-3">{title}</h4>
       <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{detail}</p>
    </div>
  );
}
