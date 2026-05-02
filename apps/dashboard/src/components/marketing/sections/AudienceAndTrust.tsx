"use client";

import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Building2, Rocket, Briefcase, UserSearch, Target, Globe, ChevronRight, Code2, Cpu, ShieldCheck, Database, Layout, Command, ArrowUpRight, Share2, Activity, Zap } from "lucide-react";
import { Github } from "@/components/ui/BrandIcons";
import Link from "next/link";

const AUDIENCES = [
  { title: "B2B Agencies", icon: Building2, desc: "Build lead lists and outbound campaigns for clients faster.", accent: "#22D3EE" },
  { title: "SaaS Startups", icon: Rocket, desc: "Find ICP accounts and launch founder-led sales campaigns.", accent: "#3B82F6" },
  { title: "Freelancers", icon: Briefcase, desc: "Create a repeatable prospecting system without manual research.", accent: "#8B5CF6" },
  { title: "Recruiters", icon: UserSearch, desc: "Find companies, hiring signals, and relevant decision makers.", accent: "#F59E0B" },
  { title: "Sales Teams", icon: Target, desc: "Prioritize accounts, personalize outreach, and track activity.", accent: "#10B981" },
  { title: "Growth Hackers", icon: Zap, desc: "Discover untapped markets and automate high-velocity experiments.", accent: "#EC4899" }
];

const TRUST_NODES = [
  { icon: Code2, title: "Open Source", desc: "Inspect our architecture on GitHub." },
  { icon: Cpu, title: "AI-First", desc: "High-fidelity LLM pipelines." },
  { icon: ShieldCheck, title: "Security", desc: "SOC2-ready & DNC protocols." },
  { icon: Database, title: "Verified", desc: "98.4% email deliverability." }
];

function AudienceCard({ item, index }: { item: typeof AUDIENCES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative p-10 rounded-[3rem] bg-[#0D1117] border border-white/5 hover:border-white/10 transition-all cursor-pointer overflow-hidden shadow-2xl"
    >
       <div 
         className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
         style={{ background: `radial-gradient(circle at top left, ${item.accent}, transparent 70%)` }}
       />
       
       <div className="relative z-10">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:rotate-6 group-hover:scale-110 shadow-2xl"
            style={{ backgroundColor: `${item.accent}15`, color: item.accent, border: `1px solid ${item.accent}30` }}
          >
             <item.icon size={28} />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:translate-x-1 transition-transform">{item.title}</h3>
          <p className="text-[#94A3B8] text-base font-medium leading-relaxed mb-8">{item.desc}</p>
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#22D3EE] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                Scale Outbound <ChevronRight size={14} />
             </div>
             <ArrowUpRight size={20} className="text-white/10 group-hover:text-white/50 transition-colors" />
          </div>
       </div>
    </motion.div>
  );
}

export function AudienceAndTrust() {
  return (
    <section className="py-48 bg-[#02040a] relative overflow-hidden">
      {/* Background Cinematic Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Audiences Header */}
        <div className="text-center max-w-4xl mx-auto mb-32">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.45em] text-[#22D3EE] mb-10 shadow-2xl"
           >
             <Share2 size={14} /> Global Adoption Protocol
           </motion.div>
           <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-12 leading-[0.85]">
             The standard for high-fidelity <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#3B82F6]">revenue operations.</span>
           </h2>
           <p className="text-[#94A3B8] text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
              From solo founders to elite agencies, LeadForge AI powers the world's most aggressive outbound engines.
           </p>
        </div>

        {/* Audiences Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-56">
           {AUDIENCES.map((a, i) => (
             <AudienceCard key={i} item={a} index={i} />
           ))}
        </div>

        {/* Neural Trust Infrastructure */}
        <div className="relative rounded-[5rem] bg-[#0D1117]/40 backdrop-blur-3xl border border-white/5 p-16 md:p-32 overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,211,238,0.05)_0%,transparent_60%)] pointer-events-none" />
           
           <div className="grid lg:grid-cols-[1fr_1.2fr] gap-24 lg:gap-40 items-center relative z-10">
              <div>
                 <div className="inline-flex items-center gap-3 text-[#22D3EE] mb-10">
                    <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 flex items-center justify-center border border-[#22D3EE]/20 shadow-2xl">
                       <ShieldCheck size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.4em]">System Trust v2</span>
                 </div>
                 <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-10 leading-tight">
                   Infrastructure built for <br />
                   <span className="italic">absolute precision.</span>
                 </h2>
                 <p className="text-[#94A3B8] text-xl mb-14 leading-relaxed font-medium max-w-xl">
                   LeadForge AI isn't just a wrapper. We maintain a high-fidelity data core and an open-source foundation that teams can actually trust.
                 </p>
                 <div className="flex flex-wrap gap-6">
                    <MagneticButton 
                      href="https://github.com/karandangi123" 
                      className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all shadow-2xl"
                    >
                      <Github size={20} /> Inspect Core Architecture
                    </MagneticButton>
                 </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8 relative">
                 {/* Neural Connection Lines (Visual Decor) */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <Activity size={300} className="text-[#22D3EE]/10" />
                 </div>

                 {TRUST_NODES.map((card, i) => (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     whileHover={{ y: -5, borderColor: "rgba(34,211,238,0.3)" }}
                     className="relative p-10 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-xl group transition-all shadow-2xl"
                   >
                     <div className="text-[#22D3EE] mb-8 group-hover:scale-110 transition-transform">
                        <card.icon size={36} />
                     </div>
                     <h4 className="text-xl font-black text-white mb-4 tracking-tight">{card.title}</h4>
                     <p className="text-sm text-[#94A3B8] leading-relaxed font-medium group-hover:text-white/70 transition-colors">{card.desc}</p>
                     
                     {/* Active Indicator Pulse */}
                     <div className="absolute top-8 right-8 w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse shadow-[0_0_15px_#22D3EE]" />
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

function MagneticButton({ children, className, href }: { children: React.ReactNode; className: string; href: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.12);
    y.set((e.clientY - centerY) * 0.12);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: mouseX, y: mouseY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <a href={href} target="_blank" className={className}>
        {children}
      </a>
    </motion.div>
  );
}
