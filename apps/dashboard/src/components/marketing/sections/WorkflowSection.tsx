"use client";

import { motion } from "framer-motion";
import { Search, Zap, Target, Mail, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";

export function WorkflowSection() {
  const steps = [
    {
      icon: Search,
      title: "Discover",
      desc: "Search companies, roles, industries, and high-intent buyer personas.",
      ui: "3,482 leads found"
    },
    {
      icon: Zap,
      title: "Enrich",
      desc: "Add verified emails, LinkedIn profiles, and deep company intelligence.",
      ui: "Emails verified"
    },
    {
      icon: Target,
      title: "Prioritize",
      desc: "AI scores prospects by fit, intent, and conversion probability.",
      ui: "Score: 92 (Hot)"
    },
    {
      icon: Mail,
      title: "Engage",
      desc: "Generate personalized outreach and automate multi-channel follow-ups.",
      ui: "Drafting 1:1 email"
    }
  ];

  return (
    <section id="workflow" className="py-32 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-xs font-black uppercase tracking-[0.2em] text-[#22D3EE]">
              <Layers size={14} /> Strategic Revenue Engine
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
              From target market to booked meetings <br /> in one AI workflow.
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto font-medium">
              LeadForge AI compresses the entire prospecting lifecycle into a single, high-fidelity command center for growth teams.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Connecting Path (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 hidden lg:block" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-[#0D1117] border border-white/10 flex items-center justify-center text-white mb-8 group-hover:border-[#22D3EE]/50 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all relative">
                   <step.icon size={32} className="group-hover:text-[#22D3EE] transition-colors" />
                   <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#05070D] border border-white/10 flex items-center justify-center text-[10px] font-black text-[#22D3EE]">
                     0{i + 1}
                   </div>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed mb-8 px-4 font-medium">
                  {step.desc}
                </p>

                <div className="mt-auto w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
                   <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{step.ui}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-24 p-12 rounded-[3rem] bg-gradient-to-br from-[#0D1117] to-[#05070D] border border-white/10 text-center relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03]" />
           <div className="relative z-10">
              <h3 className="text-3xl font-black text-white mb-6">Experience the AI Velocity</h3>
              <p className="text-[#94A3B8] max-w-xl mx-auto mb-10 leading-relaxed font-medium">
                Traditional lead generation takes weeks of manual scraping and generic emailing. LeadForge AI does it in hours with 1:1 personalization.
              </p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-3 bg-[#22D3EE] text-[#05070D] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all"
              >
                Start Your First Workflow <ArrowRight size={18} />
              </Link>
           </div>
        </motion.div>
      </div>
    </section>
  );
}
