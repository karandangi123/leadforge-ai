"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, ArrowRight, Search, Zap, Target, Mail, BarChart3, CheckCircle2, Database, Globe, MousePointer2, Activity, Terminal as TerminalIcon, Cpu, ShieldCheck } from "lucide-react";
import Link from "next/link";

const STAGES = [
  { id: "icp", label: "Input ICP", icon: Target, color: "#22D3EE", text: "Find SaaS founders in India hiring sales teams", metric: "428k Targets" },
  { id: "discovery", label: "Find Prospects", icon: Search, color: "#3B82F6", text: "Scanning global markets for intent signals...", metric: "1.2M Scanned" },
  { id: "enrich", label: "Enrich Data", icon: Database, color: "#8B5CF6", text: "Verifying contact records & direct dials...", metric: "99.4% Verified" },
  { id: "score", label: "Score Intent", icon: Sparkles, color: "#F59E0B", text: "Analyzing buying signals & fit probability...", metric: "High Intent" },
  { id: "outreach", label: "AI Outreach", icon: Mail, color: "#10B981", text: "Writing personalized founder-grade copy...", metric: "Draft Ready" },
  { id: "campaign", label: "Launch", icon: Zap, color: "#EC4899", text: "Queueing multi-channel sequence...", metric: "Node Active" },
  { id: "pipeline", label: "Pipeline Ready", icon: BarChart3, color: "#22D3EE", text: "New qualified opportunities identified.", metric: "$42k Identified" }
];

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
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

export function HeroRevenueFlow() {
  const [currentStage, setCurrentStage] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [logs, setLogs] = useState<string[]>(["Revenue System Online", "Awaiting Protocol..."]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse tilt effect for the main engine card - REDUCED INTENSITY
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const rotateX = useSpring(useTransform(cardY, [-300, 300], [2.5, -2.5]), { stiffness: 100, damping: 35 });
  const rotateY = useSpring(useTransform(cardX, [-300, 300], [-2.5, 2.5]), { stiffness: 100, damping: 35 });

  const handleCardMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    cardX.set(e.clientX - centerX);
    cardY.set(e.clientY - centerY);
  };

  const handleCardMouseLeave = () => {
    cardX.set(0);
    cardY.set(0);
  };

  useEffect(() => {
    if (manualMode) return;

    const interval = setInterval(() => {
      const nextStage = (currentStage + 1) % STAGES.length;
      setCurrentStage(nextStage);
      setLogs(prev => [...prev.slice(-4), `Executing Stage: ${STAGES[nextStage].label}...`, `Metric: ${STAGES[nextStage].metric}`]);
    }, 3000); 
    return () => clearInterval(interval);
  }, [manualMode, currentStage]);

  const handleStageClick = (index: number) => {
    setCurrentStage(index);
    setManualMode(true);
    setLogs(prev => [...prev.slice(-4), `Manual Override: Stage ${index + 1} Active`]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setManualMode(false);
    }, 5000);
  };

  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-[#02040a]">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#22D3EE_1px,transparent_1px),linear-gradient(to_bottom,#22D3EE_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.03] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Intense Cinematic Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#3B82F6] opacity-[0.08] blur-[180px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#22D3EE] opacity-[0.06] blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '3s' }} />
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 xl:gap-24 items-center">
          
          {/* Left: Copy */}
          <div className="max-w-2xl py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-10 text-[10px] font-black uppercase tracking-[0.45em] text-[#22D3EE] backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.15)] group cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-[#22D3EE] animate-ping" />
              <Activity size={14} className="group-hover:rotate-12 transition-transform" />
              Autonomous Revenue Intelligence v4.0
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="text-7xl lg:text-[6.5rem] font-black text-white tracking-tighter leading-[0.82] mb-10"
            >
              The Machine <br />
              that builds <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] via-[#3B82F6] to-[#8B5CF6] drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">Pipeline.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-2xl text-[#94A3B8] mb-14 leading-relaxed font-medium max-w-xl"
            >
              LeadForge AI isn't just another tool. It's an autonomous engine that discovers, enriches, and qualifies your entire market.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6"
            >
              <MagneticButton 
                href="/dashboard?view=intelligence"
                className="group relative flex items-center gap-4 bg-[#22D3EE] text-[#05070D] px-12 py-6 rounded-2xl text-base font-black transition-all shadow-[0_30px_60px_-15px_rgba(34,211,238,0.4)]"
              >
                Initialize Engine
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              </MagneticButton>
              
              <MagneticButton 
                href="/dashboard?view=dashboard"
                className="group flex items-center gap-4 bg-white/5 text-white px-12 py-6 rounded-2xl text-base font-black transition-all hover:bg-white/10 border border-white/10 backdrop-blur-xl"
              >
                Command Center
              </MagneticButton>
            </motion.div>
            
            <div className="mt-24 pt-12 border-t border-white/5 grid grid-cols-3 gap-16">
               {[
                 { label: "Market Coverage", value: "420M+", icon: Globe },
                 { label: "AI Precision", value: "99.4%", icon: Cpu },
                 { label: "System Health", value: "Optimal", icon: ShieldCheck }
               ].map((stat, i) => (
                 <motion.div 
                   key={stat.label}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.4 + i * 0.1 }}
                   className="space-y-3"
                 >
                    <div className="flex items-center gap-2 text-white/30">
                       <stat.icon size={14} />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                    </div>
                    <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* Right: Interactive Revenue Machine */}
          <div 
            className="relative py-12 group/card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative rounded-[5rem] border border-white/10 bg-[#0D1117]/95 backdrop-blur-3xl p-12 md:p-16 shadow-[0_80px_160px_rgba(0,0,0,1)] overflow-hidden min-h-[640px] flex flex-col justify-center"
            >
              {/* Dynamic Aura following the stage */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000 blur-[100px]"
                style={{ background: `radial-gradient(circle at 50% 50%, ${STAGES[currentStage].color}, transparent 80%)` }} 
              />
              
              {/* Interactive Terminal in Corner */}
              <div className="absolute top-12 right-12 w-48 hidden xl:block opacity-40">
                 <div className="flex items-center gap-2 text-[10px] font-mono text-[#22D3EE] mb-3 uppercase tracking-widest">
                    <TerminalIcon size={12} />
                    Live Protocol
                 </div>
                 <div className="space-y-1 font-mono text-[9px] text-[#94A3B8]">
                    {logs.map((log, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className="truncate"
                      >
                         {`> ${log}`}
                      </motion.div>
                    ))}
                 </div>
              </div>

              <div className="relative z-10 space-y-16">
                {/* Header with Morphing Stage Selectors */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                         <motion.div
                           animate={{ rotate: [0, 360] }}
                           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                         >
                            <Sparkles size={32} className="text-[#22D3EE]" />
                         </motion.div>
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-white uppercase tracking-[0.25em]">LeadForge AI Engine</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-[#94A3B8] font-black uppercase tracking-widest">
                           <div className={`w-2.5 h-2.5 rounded-full ${manualMode ? 'bg-yellow-500' : 'bg-[#10B981] animate-pulse'}`} />
                           {manualMode ? 'Protocol Interrupted' : 'Active Cycle'}
                        </div>
                      </div>
                   </div>
                   
                   {/* Morphing Stage Selectors */}
                   <div className="flex flex-nowrap items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5 shadow-inner">
                      {STAGES.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleStageClick(i)}
                          className="relative w-10 h-10 flex items-center justify-center group"
                        >
                          {i === currentStage && (
                            <motion.div 
                              layoutId="hero-active-bg"
                              className="absolute inset-0 bg-[#22D3EE] rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                            />
                          )}
                          <span className={`relative z-10 font-black text-[12px] transition-colors duration-500 ${
                            i === currentStage ? "text-[#05070D]" : "text-white/20 group-hover:text-white"
                          }`}>
                            {i + 1}
                          </span>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Main Content Area */}
                <div className="min-h-[280px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStage}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.05, y: -20 }}
                      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                      className="space-y-12"
                    >
                      <div className="flex items-center gap-10">
                        <div 
                          className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-3xl relative overflow-hidden group/icon"
                          style={{ backgroundColor: `${STAGES[currentStage].color}10`, color: STAGES[currentStage].color, border: `2px solid ${STAGES[currentStage].color}25` }}
                        >
                          <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative z-10"
                          >
                             {React.createElement(STAGES[currentStage].icon, { size: 48 })}
                          </motion.div>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                        </div>
                        <div>
                           <p className="text-[12px] font-black uppercase tracking-[0.5em] text-[#22D3EE]/40 mb-3">Protocol Phase 0{currentStage + 1}</p>
                           <h3 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none italic">{STAGES[currentStage].label}</h3>
                        </div>
                      </div>

                      <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl relative overflow-hidden group/text">
                         <div className="absolute top-0 left-0 w-2 h-full transition-all duration-700" style={{ backgroundColor: STAGES[currentStage].color }} />
                         <div className="flex justify-between items-start gap-8">
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-2xl font-bold text-white leading-relaxed max-w-lg"
                            >
                              {STAGES[currentStage].text}
                            </motion.p>
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Status</p>
                               <p className="text-lg font-black text-white tracking-tight" style={{ color: STAGES[currentStage].color }}>{STAGES[currentStage].metric}</p>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* System Efficiency Bar */}
                <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                   <div className="space-y-4 flex-1 max-w-sm">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/20">
                         <span>Engine Efficiency</span>
                         <span style={{ color: STAGES[currentStage].color }}>Optimal Flow</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[2px]">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: "94%" }}
                           className="h-full rounded-full transition-all duration-1000"
                           style={{ backgroundColor: STAGES[currentStage].color, boxShadow: `0 0 20px ${STAGES[currentStage].color}` }}
                         />
                      </div>
                   </div>
                   <div className="pl-12 flex flex-col items-end">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Live Node</p>
                      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                         <span className="text-2xl font-black text-white tracking-tighter">Ready</span>
                         <ArrowRight size={18} className="text-[#22D3EE] animate-pulse" />
                      </div>
                   </div>
                </div>
              </div>

              {/* Decorative Floating Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#22D3EE]/10 blur-[80px] rounded-full"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
