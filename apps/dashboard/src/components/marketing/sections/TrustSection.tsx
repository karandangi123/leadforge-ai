"use client";

import { motion } from "framer-motion";
import { Check, X, ShieldCheck, Code2, Cpu, Database, Layout, Command } from "lucide-react";
import { Github } from "@/components/ui/BrandIcons";

export function TrustSection() {
  const trustCards = [
    { icon: Code2, title: "Open Source Foundation", desc: "Inspect our core architecture on GitHub." },
    { icon: Cpu, title: "AI-First Engine", desc: "Built on high-fidelity LLM research pipelines." },
    { icon: ShieldCheck, title: "Enterprise Security", desc: "SOC2-ready protocols and DNC suppression." },
    { icon: Database, title: "Verified Data", desc: "98% email deliverability on enriched leads." },
    { icon: Layout, title: "Unified Workflow", desc: "No more tab-switching between 5 different tools." },
    { icon: Command, title: "Built for Speed", desc: "Compressed lead-to-campaign lifecycle." }
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-[#05070D]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-32">
          <div className="flex-1">
             <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
               Built for teams who need <br className="hidden md:block" />
               speed without complexity.
             </h2>
             <p className="text-[#94A3B8] text-lg mb-10 leading-relaxed font-medium">
               LeadForge AI is an open-core revenue intelligence platform designed for founders, agencies, and builders. No fake claims, just high-fidelity prospecting tools.
             </p>
             <div className="flex flex-wrap gap-4">
                <a 
                  href="https://github.com/karandangi123" 
                  target="_blank"
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <Github size={18} /> View on GitHub
                </a>
             </div>
          </div>
          <div className="flex-1 grid sm:grid-cols-2 gap-6 w-full lg:w-auto">
             {trustCards.map((card, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.05 }}
                 className="p-6 rounded-2xl bg-white/5 border border-white/5"
               >
                 <div className="text-[#22D3EE] mb-4">
                    <card.icon size={24} />
                 </div>
                 <h4 className="text-sm font-black text-white mb-2">{card.title}</h4>
                 <p className="text-[11px] text-[#94A3B8] leading-relaxed font-medium">{card.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>

        {/* Comparison Block */}
        <div className="relative rounded-[3rem] border border-white/10 bg-[#0D1117] overflow-hidden p-8 md:p-16">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
           
           <div className="relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-24">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-400 mb-8">
                   Before LeadForge
                 </div>
                 <h3 className="text-3xl font-black text-white mb-10 tracking-tight">Fragile, manual prospecting.</h3>
                 <div className="space-y-6">
                    {[
                      "Manual LinkedIn scraping for hours",
                      "Spreadsheet chaos and data silos",
                      "Unverified, bounced emails",
                      "Generic, low-conversion cold emails",
                      "No account intent or lead scoring",
                      "Zero visibility into campaign ROI"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-4 opacity-40">
                         <div className="shrink-0 text-red-500"><X size={18} /></div>
                         <span className="text-sm font-bold text-white tracking-tight">{item}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="relative">
                 <div className="absolute -inset-10 bg-[#22D3EE]/10 blur-[80px] -z-10" />
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[10px] font-black uppercase tracking-widest text-[#22D3EE] mb-8">
                   After LeadForge
                 </div>
                 <h3 className="text-3xl font-black text-white mb-10 tracking-tight">Autonomous revenue pipeline.</h3>
                 <div className="space-y-6">
                    {[
                      "AI-powered discovery in seconds",
                      "Enriched, campaign-ready data",
                      "98% verified email delivery",
                      "1:1 personalized AI outreach",
                      "Intent-based lead prioritization",
                      "End-to-end pipeline analytics"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-4">
                         <div className="shrink-0 text-[#22D3EE]"><Check size={18} /></div>
                         <span className="text-sm font-bold text-white tracking-tight">{item}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
