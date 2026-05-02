"use client";

import { motion } from "framer-motion";
import { Sparkles, Play, ArrowRight, Target, Zap, ShieldCheck, Search, Activity } from "lucide-react";
import { Github } from "@/components/ui/BrandIcons";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden">
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-[#22D3EE]/10 via-transparent to-transparent blur-[120px] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-xs font-black uppercase tracking-[0.2em] text-[#22D3EE]">
                <Sparkles size={14} className="animate-pulse" /> AI Revenue OS for Modern Prospecting
              </div>
              
              <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-white tracking-tight leading-[1.05] mb-8">
                Turn cold leads <br className="hidden xl:block" />
                into a live <span className="text-[#22D3EE]">revenue pipeline.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-[#94A3B8] mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                LeadForge AI discovers prospects, enriches data, scores intent, and generates outreach—all from one autonomous command center built for speed.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link 
                  href="/dashboard?view=dashboard"
                  className="group flex items-center justify-center w-full sm:w-auto gap-3 bg-white text-[#05070D] px-10 py-5 rounded-2xl text-base font-black transition-all hover:bg-[#22D3EE] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] active:scale-95"
                >
                  Launch Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center justify-center w-full sm:w-auto gap-3 bg-white/5 text-white px-10 py-5 rounded-2xl text-base font-black transition-all hover:bg-white/10 border border-white/10 active:scale-95"
                >
                  <Play size={18} fill="currentColor" />
                  Watch Demo
                </button>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
                 <div className="text-[10px] font-black uppercase tracking-widest text-white">Trusted by teams from</div>
                 <div className="text-sm font-black text-white">Agencies</div>
                 <div className="text-sm font-black text-white">SaaS</div>
                 <div className="text-sm font-black text-white">Sales</div>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 w-full lg:w-auto relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Product Mockup Container */}
              <div className="relative rounded-3xl border border-white/10 bg-[#0D1117] p-2 shadow-2xl shadow-black/50 overflow-hidden group">
                 {/* Top Bar */}
                 <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                    <div className="flex gap-1.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                       <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                       <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Revenue Command Center</div>
                    <div className="w-10" />
                 </div>
                 
                 {/* App Content Preview */}
                 <div className="bg-[#05070D] h-[400px] md:h-[500px] flex">
                    <div className="w-16 border-r border-white/5 p-3 flex flex-col gap-4 items-center pt-8">
                       {[Search, Zap, Target, Activity].map((Icon, i) => (
                         <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? "bg-[#22D3EE]/20 text-[#22D3EE]" : "text-white/20"}`}>
                           <Icon size={16} />
                         </div>
                       ))}
                    </div>
                    <div className="flex-1 p-6">
                       <div className="flex justify-between items-center mb-8">
                          <div className="h-4 w-32 bg-white/10 rounded" />
                          <div className="h-8 w-24 bg-[#22D3EE] rounded-lg" />
                       </div>
                       <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/5">
                               <div className="w-10 h-10 rounded-lg bg-white/10" />
                               <div className="flex-1 space-y-2">
                                  <div className="h-3 w-1/3 bg-white/20 rounded" />
                                  <div className="h-2 w-1/2 bg-white/10 rounded" />
                               </div>
                               <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${i === 1 ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                                 {i === 1 ? "Hot" : "Warm"}
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Floating Cards */}
                 <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -top-6 -left-10 p-4 rounded-2xl bg-white text-[#05070D] shadow-2xl z-20 hidden md:block"
                 >
                    <p className="text-[10px] font-black uppercase text-[#64748B]">Leads Found</p>
                    <p className="text-xl font-black">142 verified</p>
                 </motion.div>

                 <motion.div 
                   animate={{ y: [0, 10, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute top-1/2 -right-8 p-4 rounded-2xl bg-[#22D3EE] text-[#05070D] shadow-2xl z-20 hidden md:block"
                 >
                    <p className="text-[10px] font-black uppercase text-[#05070D]/60">Pipeline Value</p>
                    <p className="text-xl font-black">$48,200</p>
                 </motion.div>

                 <motion.div 
                   animate={{ scale: [1, 1.05, 1] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute bottom-10 -left-6 p-4 rounded-2xl bg-[#0D1117] border border-white/10 text-white shadow-2xl z-20 hidden md:block"
                 >
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                       <span className="text-[10px] font-black uppercase text-white/60">AI Scoring Active</span>
                    </div>
                    <p className="text-xs font-bold">38 high-intent prospects identified</p>
                 </motion.div>
              </div>

              {/* Background Decoration */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#22D3EE]/20 to-[#8B5CF6]/20 blur-3xl opacity-30 -z-10 group-hover:opacity-50 transition-opacity" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
