"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Target, Mail, ArrowRight, CheckCircle2, BarChart3, Database, Sparkles, ChevronRight, Activity, Building2, UserSearch, Zap, Globe, Layers, MousePointer2, Play } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    id: "icp",
    title: "Define Your ICP",
    description: "Tell LeadForge AI who you want to reach — industry, role, location, company size, and growth signals.",
    icon: Target,
    accent: "#22D3EE",
    tag: "Targeting"
  },
  {
    id: "discovery",
    title: "Discover Prospects",
    description: "LeadForge AI scans your target market and builds a clean prospect list with relevant decision makers.",
    icon: Search,
    accent: "#3B82F6",
    tag: "Intelligence"
  },
  {
    id: "enrich",
    title: "Enrich and Verify",
    description: "Missing data gets completed automatically — emails, company context, role details, and buying signals.",
    icon: Database,
    accent: "#8B5CF6",
    tag: "Data Quality"
  },
  {
    id: "score",
    title: "Score Buying Intent",
    description: "AI prioritizes leads based on fit, signal strength, timing, and conversion probability.",
    icon: Sparkles,
    accent: "#F59E0B",
    tag: "Predictive"
  },
  {
    id: "outreach",
    title: "Generate Outreach",
    description: "LeadForge AI writes contextual email and LinkedIn openers based on each prospect's unique company signals.",
    icon: Mail,
    accent: "#10B981",
    tag: "Personalization"
  },
  {
    id: "pipeline",
    title: "Launch and Track",
    description: "Campaigns move into execution, replies are tracked, and pipeline performance becomes visible.",
    icon: BarChart3,
    accent: "#EC4899",
    tag: "Growth"
  }
];

export function ScrollProductStory() {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-loop logic
  useEffect(() => {
    if (manualMode) return; 
    if (isHovered) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, [isHovered, manualMode]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setManualMode(true);
    
    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current);
    }

    // Pause for 5 seconds on click, then resume
    manualTimeoutRef.current = setTimeout(() => {
      setManualMode(false);
    }, 5000);
  };

  const resumeEngineNow = () => {
    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current);
    }
    setManualMode(false);
  };

  return (
    <section className="py-32 bg-[#02040a] relative overflow-hidden" id="demo-section">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.08)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-6 w-full relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 xl:gap-24 items-center">
          
          {/* Left: Tactical Workflow Narrative */}
          <div 
            className="relative" 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
          >
             <div className="mb-24">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-[#22D3EE] shadow-2xl">
                      <Activity size={14} className="animate-pulse" /> Autonomous Engine
                   </div>
                   
                   {manualMode && (
                     <motion.button
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       onClick={resumeEngineNow}
                       className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[9px] font-black uppercase tracking-widest text-[#22D3EE] hover:bg-[#22D3EE] hover:text-[#05070D] transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                     >
                        Paused (Resumes in 5s)
                     </motion.button>
                   )}
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.85] mb-10">
                  The Revenue <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#3B82F6]">Machine.</span>
                </h2>
                <p className="text-[#94A3B8] text-xl font-medium max-w-md leading-relaxed">
                  Every stage of your growth journey, automated with high-fidelity precision.
                </p>
             </div>

             <div className="space-y-4 relative">
                {/* Vertical Timeline Track */}
                <div className="absolute left-[13px] top-10 bottom-10 w-[2px] bg-white/[0.03] rounded-full" />
                
                {STEPS.map((step, i) => (
                  <motion.div
                    key={step.id}
                    onClick={() => handleStepClick(i)}
                    className="relative pl-16 cursor-pointer group"
                  >
                     {/* Bright Glowing 'Cool Flow' Dots */}
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8">
                        <motion.div 
                          animate={{ 
                            scale: activeStep === i ? [1, 1.5, 1] : 1,
                            backgroundColor: activeStep === i ? "#22D3EE" : "rgba(255,255,255,0.05)",
                            boxShadow: activeStep === i 
                              ? ["0 0 20px #22D3EE", "0 0 50px #22D3EE", "0 0 20px #22D3EE"] 
                              : "0 0 0px transparent"
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className={`w-4 h-4 rounded-full transition-all duration-700 z-20 ${activeStep === i ? "" : "group-hover:bg-white/20"}`}
                        />
                        
                        {/* High-Visibility Expanding Aura (Liquid Ripple) */}
                        <AnimatePresence>
                          {activeStep === i && (
                            <>
                              <motion.div 
                                 initial={{ scale: 0.5, opacity: 0 }}
                                 animate={{ scale: 4.5, opacity: 0 }}
                                 exit={{ opacity: 0 }}
                                 transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                                 className="absolute inset-0 rounded-full border-[3px] border-[#22D3EE] pointer-events-none blur-[1px]"
                              />
                              <motion.div 
                                 initial={{ scale: 0.5, opacity: 0 }}
                                 animate={{ scale: 2.8, opacity: 0 }}
                                 exit={{ opacity: 0 }}
                                 transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                                 className="absolute inset-0 rounded-full bg-[#22D3EE]/30 pointer-events-none blur-[4px]"
                              />
                              <motion.div 
                                 initial={{ scale: 0.5, opacity: 0 }}
                                 animate={{ scale: 6, opacity: 0 }}
                                 exit={{ opacity: 0 }}
                                 transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                                 className="absolute inset-0 rounded-full border border-[#22D3EE]/40 pointer-events-none blur-[2px]"
                              />
                            </>
                          )}
                        </AnimatePresence>
                     </div>
                     
                     <div className="py-6">
                        <div className="flex items-center gap-4 mb-3">
                           <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-700 ${activeStep === i ? "text-[#22D3EE]" : "text-white/5"}`}>Protocol Sequence</span>
                           <AnimatePresence mode="popLayout">
                              {activeStep === i && (
                                <motion.div 
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, x: 10 }}
                                   className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                >
                                   {step.tag}
                                </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                        <h3 className={`text-3xl md:text-5xl font-black transition-all duration-700 ${activeStep === i ? "text-white translate-x-3" : "text-white/5 group-hover:text-white/20"}`}>
                           {step.title}
                        </h3>
                        <AnimatePresence mode="wait">
                           {activeStep === i && (
                             <motion.div
                               initial={{ height: 0, opacity: 0, y: -5 }}
                               animate={{ height: "auto", opacity: 1, y: 0 }}
                               exit={{ height: 0, opacity: 0, y: 5 }}
                               transition={{ duration: 0.5, ease: "circOut" }}
                               className="overflow-hidden"
                             >
                               <p className="text-lg text-[#94A3B8] font-medium leading-relaxed mt-6 max-w-md">
                                 {step.description}
                               </p>
                             </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Right: Dynamic High-Fidelity UI Terminal */}
          <div className="relative">
             <motion.div 
               animate={{ 
                 backgroundColor: STEPS[activeStep].accent,
                 scale: [1, 1.1, 1],
                 opacity: [0.15, 0.25, 0.15]
               }}
               transition={{ duration: 4, repeat: Infinity }}
               className="absolute inset-0 blur-[200px] rounded-full transition-colors duration-1000"
             />
             
             <div className="relative rounded-[4.5rem] bg-[#0D1117]/90 backdrop-blur-3xl border border-white/10 shadow-[0_80px_160px_rgba(0,0,0,0.9)] overflow-hidden">
                <div className="h-24 border-b border-white/5 bg-white/[0.02] flex items-center px-14 justify-between">
                   <div className="flex gap-4">
                      <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/10 shadow-inner" />
                      <div className="w-4 h-4 rounded-full bg-yellow-500/20 border border-yellow-500/10 shadow-inner" />
                      <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/10 shadow-inner" />
                   </div>
                   <div className="flex items-center gap-10">
                      <div className="hidden md:flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-[#22D3EE]/5 border border-[#22D3EE]/20 text-[11px] font-black uppercase tracking-widest text-[#22D3EE]">
                         <Activity size={16} className="animate-pulse" /> 
                         System Active
                      </div>
                   </div>
                </div>

                <div className="h-[680px] p-20 relative overflow-hidden flex flex-col justify-center">
                   <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, scale: 0.94, filter: "blur(30px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.06, filter: "blur(30px)" }}
                        transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                        className="w-full"
                      >
                         {activeStep === 0 && (
                           <div className="space-y-12">
                              <div className="flex items-center justify-between">
                                 <div className="space-y-3">
                                    <h4 className="text-5xl font-black text-white tracking-tight">ICP Builder</h4>
                                    <p className="text-[14px] text-[#22D3EE] font-black uppercase tracking-[0.4em]">Autonomous Setup v1.0</p>
                                 </div>
                                 <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 rounded-[2.5rem] bg-[#22D3EE]/10 flex items-center justify-center text-[#22D3EE] border-2 border-[#22D3EE]/20 shadow-[0_0_60px_rgba(34,211,238,0.4)]"
                                 >
                                    <Target size={48} />
                                 </motion.div>
                              </div>
                              <div className="grid gap-6">
                                 {[
                                   { label: "Target Industry", value: "SaaS / Fintech", icon: Layers },
                                   { label: "HQ Region", value: "India / APAC", icon: Globe },
                                   { label: "Size Tier", value: "11-50 Employees", icon: Building2 },
                                   { label: "Key Persona", value: "Founder / VP Sales", icon: UserSearch }
                                 ].map((f, idx) => (
                                   <div key={f.label} className="p-7 rounded-[2rem] bg-white/[0.02] border border-white/5 flex justify-between items-center hover:bg-white/[0.06] transition-all">
                                      <div className="flex items-center gap-6">
                                         <f.icon size={22} className="text-[#22D3EE]/30" />
                                         <span className="text-[14px] font-bold text-[#94A3B8]">{f.label}</span>
                                      </div>
                                      <span className="text-[14px] font-black text-white tracking-tight">{f.value}</span>
                                   </div>
                                 ))}
                              </div>
                           </div>
                         )}

                         {activeStep === 1 && (
                           <div className="space-y-12">
                              <div className="flex justify-between items-center">
                                 <div className="space-y-3">
                                    <h4 className="text-5xl font-black text-white tracking-tight">Discovery</h4>
                                    <p className="text-[14px] text-[#3B82F6] font-black uppercase tracking-[0.4em]">Scanning 420M+ Profiles</p>
                                 </div>
                                 <span className="text-sm font-black text-white bg-[#3B82F6] px-8 py-4 rounded-2xl shadow-[0_25px_50px_rgba(59,130,246,0.5)]">128 Found</span>
                              </div>
                              <div className="space-y-6">
                                 {[
                                   { name: "NovaStack AI", role: "Founder", signal: "Hiring SDRs" },
                                   { name: "CloudMint", role: "VP Sales", signal: "Series A" },
                                   { name: "UrbanScale", role: "Growth Lead", signal: "Traffic Spike" }
                                 ].map((lead, i) => (
                                   <motion.div 
                                     key={lead.name}
                                     initial={{ opacity: 0, x: 50 }}
                                     animate={{ opacity: 1, x: 0 }}
                                     className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-between group shadow-sm hover:border-[#3B82F6]/50 transition-all"
                                   >
                                      <div className="flex items-center gap-7">
                                         <div className="w-18 h-18 rounded-3xl bg-white/5 flex items-center justify-center font-black text-2xl text-[#3B82F6] group-hover:bg-[#3B82F6]/20 transition-all">
                                            {lead.name[0]}
                                         </div>
                                         <div>
                                            <p className="text-xl font-black text-white">{lead.name}</p>
                                            <p className="text-[14px] text-[#94A3B8] font-bold">{lead.role}</p>
                                         </div>
                                      </div>
                                      <div className="px-6 py-3 rounded-full bg-[#3B82F6]/10 text-[11px] font-black text-[#3B82F6] uppercase tracking-[0.3em] border border-[#3B82F6]/20">{lead.signal}</div>
                                   </motion.div>
                                 ))}
                              </div>
                           </div>
                         )}

                         {activeStep === 2 && (
                           <div className="space-y-12">
                              <h4 className="text-5xl font-black text-white tracking-tight">Enrichment Layer</h4>
                              <div className="p-16 rounded-[4.5rem] bg-[#05070D] border border-[#8B5CF6]/40 relative overflow-hidden shadow-2xl">
                                 <div className="absolute -top-48 -right-48 w-[28rem] h-[28rem] bg-[#8B5CF6]/15 blur-[150px] rounded-full" />
                                 <div className="space-y-16 relative z-10">
                                    <div className="flex items-center gap-14">
                                       <motion.div 
                                          animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                                          transition={{ duration: 6, repeat: Infinity }}
                                          className="w-36 h-36 rounded-[3rem] bg-gradient-to-br from-[#8B5CF6] via-[#6D28D9] to-[#4C1D95] flex items-center justify-center text-white shadow-[0_0_100px_rgba(139,92,246,0.6)]"
                                       >
                                          <Database size={72} />
                                       </motion.div>
                                       <div>
                                          <p className="text-6xl font-black text-white tracking-tighter">NovaStack AI</p>
                                          <p className="text-[16px] text-[#8B5CF6] font-black uppercase tracking-[0.5em] mt-5 flex items-center gap-5">
                                             <div className="w-4 h-4 rounded-full bg-[#8B5CF6] animate-ping shadow-[0_0_20px_#8B5CF6]" /> Verified IQ • 99.4%
                                          </p>
                                       </div>
                                    </div>
                                    <div className="grid gap-12">
                                       {[
                                         { label: "Verified Email", value: "alex@novastack.ai", mono: true },
                                         { label: "Direct Dial", value: "+91 9872...", mono: true }
                                       ].map((item) => (
                                         <div key={item.label} className="flex justify-between items-center border-b border-white/5 pb-10">
                                            <span className="text-[14px] font-black uppercase tracking-[0.6em] text-white/20">{item.label}</span>
                                            <span className={`text-2xl text-white ${item.mono ? 'font-mono' : 'font-black'}`}>{item.value}</span>
                                         </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                         )}

                         {activeStep === 3 && (
                           <div className="space-y-12">
                              <h4 className="text-5xl font-black text-white tracking-tight">Intent Scoring</h4>
                              <div className="grid gap-10">
                                 {[
                                   { name: "NovaStack AI", score: 94, reason: "Hiring SDRs + Series A" },
                                   { name: "CloudMint", score: 87, reason: "Traffic Spike + Tech Shift" }
                                 ].map((s, i) => (
                                   <motion.div 
                                     key={s.name} 
                                     initial={{ opacity: 0, scale: 0.9 }}
                                     animate={{ opacity: 1, scale: 1 }}
                                     className="p-14 rounded-[4rem] bg-white/[0.03] border border-white/5 relative overflow-hidden group hover:border-[#F59E0B]/50 transition-all shadow-2xl"
                                   >
                                      <div className="flex justify-between items-center mb-12 relative z-10">
                                         <p className="text-4xl font-black text-white tracking-tight">{s.name}</p>
                                         <div className="text-8xl font-black text-[#F59E0B] italic tracking-tighter">{s.score}</div>
                                      </div>
                                      <div className="h-5 bg-white/5 rounded-full overflow-hidden relative">
                                         <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.score}%` }}
                                            className="h-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#F59E0B] bg-[length:200%_100%] animate-gradient shadow-[0_0_40px_rgba(245,158,11,0.6)]" 
                                         />
                                      </div>
                                   </motion.div>
                                 ))}
                              </div>
                           </div>
                         )}

                         {activeStep === 4 && (
                           <div className="space-y-12">
                              <h4 className="text-5xl font-black text-white tracking-tight">AI Outreach</h4>
                              <div className="rounded-[4.5rem] bg-[#05070D] border border-white/10 p-16 space-y-16 shadow-2xl relative">
                                 <div className="absolute top-0 right-0 p-16 opacity-[0.06]">
                                    <Mail size={200} className="text-[#10B981]" />
                                 </div>
                                 <div className="space-y-14 relative z-10">
                                    <div>
                                       <p className="text-[13px] font-black uppercase tracking-[0.6em] text-[#10B981] mb-8">Generated Subject</p>
                                       <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-lg text-white font-black italic shadow-inner">
                                         Idea for scaling outbound at NovaStack
                                      </div>
                                    </div>
                                    <div>
                                       <p className="text-[13px] font-black uppercase tracking-[0.6em] text-[#10B981] mb-8">AI Blueprint Preview</p>
                                       <div className="p-14 rounded-3xl bg-white/5 border border-white/10 text-[20px] leading-relaxed text-[#F8FAFC] font-bold shadow-inner">
                                         Hi Alex, noticed NovaStack is hiring SDRs. <span className="text-[#10B981] font-black underline decoration-[5px] underline-offset-[10px]">LeadForge AI</span> could help your team automate...
                                      </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                         )}

                         {activeStep === 5 && (
                           <div className="h-full flex flex-col justify-center items-center text-center">
                              <div className="relative mb-28">
                                 <div className="absolute inset-0 bg-[#EC4899]/50 blur-[180px] rounded-full" />
                                 <motion.div 
                                    animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="w-64 h-64 rounded-[5rem] bg-gradient-to-br from-[#EC4899] via-[#BE185D] to-[#9D174D] flex items-center justify-center relative z-10 shadow-2xl border-8 border-white/10"
                                 >
                                    <BarChart3 size={140} className="text-white" />
                                 </motion.div>
                              </div>
                              <h4 className="text-8xl font-black text-white tracking-tight mb-10">Pipeline Live</h4>
                              <p className="text-[#94A3B8] text-4xl max-w-lg mb-28 font-black leading-tight tracking-tight">
                                 Revenue engine operational.
                              </p>
                              <div className="grid grid-cols-2 gap-16 w-full max-w-3xl">
                                 <div className="p-14 rounded-[4rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl">
                                    <p className="text-[15px] font-black text-white/30 uppercase tracking-[0.6em] mb-6">Meetings</p>
                                    <p className="text-7xl font-black text-white">14</p>
                                 </div>
                                 <div className="p-14 rounded-[4rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl">
                                    <p className="text-[15px] font-black text-white/30 uppercase tracking-[0.6em] mb-6">Value</p>
                                    <p className="text-7xl font-black text-[#EC4899]">$42k</p>
                                 </div>
                              </div>
                           </div>
                         )}
                      </motion.div>
                   </AnimatePresence>
                </div>
                
                {/* Continuous Looping Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-white/5">
                   <motion.div 
                      className="h-full bg-[#22D3EE] shadow-[0_0_30px_#22D3EE]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
                      transition={{ duration: 0.6, ease: "circOut" }}
                   />
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </section>
  );
}
