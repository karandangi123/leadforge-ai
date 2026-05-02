"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, ArrowRight, Target, Zap, ShieldCheck, Search, Activity, X, CheckCircle2, Clock } from "lucide-react";
import { Github } from "@/components/ui/BrandIcons";
import Link from "next/link";

export function DemoVideoSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tutorialSteps = [
    "Find your first 100 leads with granular search",
    "Enrich emails and LinkedIn company data",
    "Score buying intent with AI algorithms",
    "Generate 1:1 personalized outreach",
    "Launch your first automated sequence",
    "Track replies and pipeline growth"
  ];

  return (
    <section id="demo-section" className="py-32 relative overflow-hidden bg-white/5 border-y border-white/5">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col xl:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 w-full order-2 xl:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2.5rem] border border-white/10 bg-[#0D1117] overflow-hidden group cursor-pointer aspect-video flex items-center justify-center shadow-2xl"
              onClick={() => setIsModalOpen(true)}
            >
              {/* Thumbnail Placeholder */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-transparent to-transparent" />
              
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-[#22D3EE] text-[#05070D] flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-all duration-500">
                  <Play size={32} fill="currentColor" />
                </div>
                <div className="text-center">
                   <p className="text-xl font-black text-white mb-2">LeadForge AI Walkthrough</p>
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#22D3EE]">
                     <Clock size={12} /> 2:14 Demo
                   </div>
                </div>
              </div>

              {/* Interactive Status Overlay */}
              <div className="absolute bottom-6 right-6 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2 text-[10px] font-black uppercase text-white/60">
                 <div className="w-2 h-2 rounded-full bg-green-400" /> Interactive walkthrough
              </div>
            </motion.div>
          </div>

          <div className="flex-1 order-1 xl:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-xs font-black uppercase tracking-[0.2em] text-[#22D3EE]">
                <Sparkles size={14} /> Guided Product Tour
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8 leading-tight">
                See LeadForge build <br /> a pipeline in 2 minutes.
              </h2>
              <p className="text-[#94A3B8] text-lg mb-10 leading-relaxed font-medium">
                Watch how LeadForge AI discovers prospects, enriches contacts, scores intent, writes outreach, and prepares a campaign-ready pipeline.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-12">
                {tutorialSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#22D3EE]/20 transition-all group">
                     <div className="w-6 h-6 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                     </div>
                     <span className="text-[13px] font-bold text-[#94A3B8] group-hover:text-white transition-colors">{step}</span>
                  </div>
                ))}
              </div>

              <Link 
                href="/dashboard?view=dashboard&tour=true"
                className="group flex items-center justify-center sm:justify-start gap-3 text-[#22D3EE] text-sm font-black uppercase tracking-widest hover:gap-5 transition-all"
              >
                Start Guided Tour <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#05070D]/95 backdrop-blur-xl"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[1000px] aspect-video bg-black rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-20"
              >
                <X size={24} />
              </button>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                 <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-[#22D3EE] mb-8">
                    <Play size={40} fill="currentColor" />
                 </div>
                 <h3 className="text-3xl font-black text-white mb-4">Demo video coming soon</h3>
                 <p className="text-[#94A3B8] max-w-md">
                   We're currently finalizing the technical walkthrough. Use the guided tour buttons or explore the dashboard directly.
                 </p>
                 <div className="mt-8 px-6 py-3 rounded-xl border border-white/10 font-mono text-[10px] text-white/40">
                   // TODO: Replace with Loom/YouTube/MP4 URL
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
