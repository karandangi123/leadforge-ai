"use client";

import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Sparkles, Zap, ChevronRight, Activity, Command } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { GoogleIcon } from "@/components/icons";

function MagneticButton({ children, className, href }: { children: React.ReactNode; className: string; href: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.4);
    y.set((e.clientY - centerY) * 0.4);
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
      className="w-full sm:w-auto"
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

export function FinalCTA() {
  const { data: session, status } = useSession();
  return (
    <section className="py-56 relative overflow-hidden bg-[#02040a]">
      {/* Cinematic Background Infrastructure */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
      
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#3B82F6] opacity-[0.05] blur-[180px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#8B5CF6] opacity-[0.05] blur-[180px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-12 text-[10px] font-black uppercase tracking-[0.5em] text-[#22D3EE] backdrop-blur-2xl shadow-2xl"
          >
            <Activity size={14} className="animate-pulse" /> Final Protocol: Deployment
          </motion.div>
          
          <h2 className="text-7xl md:text-[7rem] font-black text-white tracking-tighter mb-12 leading-[0.82]">
            Your market is waiting. <br className="hidden md:block" />
            Launch the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] via-[#3B82F6] to-[#8B5CF6] drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">Machine.</span>
          </h2>
          
          <p className="text-2xl md:text-3xl text-[#94A3B8] mb-20 leading-relaxed font-medium max-w-4xl mx-auto italic">
            Stop manually prospecting. Scale your outbound with an autonomous AI engine designed for founders who value their time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            {status === "authenticated" && session?.user?.id !== "demo-user" ? (
              <MagneticButton 
                href="/dashboard?view=dashboard"
                className="group relative flex items-center justify-center gap-4 bg-[#22D3EE] text-[#05070D] px-16 py-8 rounded-[2.5rem] text-xl font-black transition-all shadow-[0_40px_80px_-20px_rgba(34,211,238,0.5)] overflow-hidden"
              >
                Return to Command Center
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </MagneticButton>
            ) : (
              <>
                <MagneticButton 
                  href="/login"
                  className="group relative flex items-center justify-center gap-4 bg-[#22D3EE] text-[#05070D] px-16 py-8 rounded-[2.5rem] text-xl font-black transition-all shadow-[0_40px_80px_-20px_rgba(34,211,238,0.5)] overflow-hidden"
                >
                  <GoogleIcon className="w-6 h-6" />
                  Initialize Global Sequence
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </MagneticButton>
                
                <MagneticButton 
                  href="/dashboard?view=dashboard"
                  className="group flex items-center justify-center gap-4 bg-white/5 text-white px-16 py-8 rounded-[2.5rem] text-xl font-black transition-all hover:bg-white/10 border border-white/10 backdrop-blur-3xl"
                >
                  <Command size={22} className="opacity-40" /> Trial Center
                </MagneticButton>
              </>
            )}
          </div>
          
          <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-10 max-w-5xl mx-auto">
             {[
               { label: "Deployment", value: "Instant Node", color: "text-[#22D3EE]" },
               { label: "Architecture", value: "High-Fidelity", color: "text-white" },
               { label: "Data Pipeline", value: "Verified IQ", color: "text-[#10B981]" },
               { label: "Growth Mode", value: "Autonomous", color: "text-[#F59E0B]" }
             ].map((stat, i) => (
               <motion.div 
                 key={stat.label} 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.5 + i * 0.1 }}
                 className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all"
               >
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 mb-3 group-hover:text-white/40 transition-colors">{stat.label}</p>
                  <p className={`text-xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
               </motion.div>
             ))}
          </div>
          
          <div className="mt-32 flex flex-col items-center gap-6">
             <p className="text-[11px] font-black uppercase tracking-[0.6em] text-white/15">
               LeadForge AI • The Revenue Operating System • 2026
             </p>
             <div className="flex gap-6 items-center">
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-white/10" />
                <div className="flex gap-4">
                   <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                   <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" style={{ animationDelay: '0.5s' }} />
                   <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-white/10" />
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
