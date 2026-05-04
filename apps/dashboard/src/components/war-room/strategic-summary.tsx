"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Zap, 
  BarChart3, 
  ShieldCheck,
  TrendingUp,
  Briefcase
} from "lucide-react";

interface StrategicSummaryProps {
  lead: {
    company: string;
    website: string;
    score: number;
    silverBulletHook: string;
    executiveSummary: string;
  };
  finding: {
    title: string;
    overallSendability: number;
    businessImpact: string;
  };
}

export function StrategicSummary({ lead, finding }: StrategicSummaryProps) {
  const score = Math.round((finding?.overallSendability || lead.score / 100) * 100);

  return (
    <div className="h-24 border-b border-steel bg-obsidian/80 backdrop-blur-xl px-8 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-8">
        {/* Identity Context */}
        <div className="flex items-center gap-4 border-r border-steel pr-8">
          <div className="w-12 h-12 rounded-2xl bg-steel flex items-center justify-center font-black text-sm border border-white/5">
             <Briefcase className="w-6 h-6 text-mist" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">{lead.company}</h1>
              <div className="px-2 py-0.5 rounded-md bg-emerald/10 border border-emerald/20 text-emerald text-[9px] font-black uppercase tracking-widest">
                High Priority
              </div>
            </div>
            <p className="text-xs text-mist font-medium mt-0.5">{lead.website}</p>
          </div>
        </div>

        {/* The Signal (The Story) */}
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-leadforge-blue" />
            <span className="text-[10px] font-black text-leadforge-blue uppercase tracking-widest">Strongest Angle</span>
          </div>
          <h2 className="text-sm font-bold text-white truncate">
            {finding?.title || lead.silverBulletHook || "Analyzing highest-conviction angle..."}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-10">
        {/* Impact Metric */}
        <div className="text-right lg:block hidden">
          <div className="flex items-center gap-2 justify-end mb-1 text-mist">
             <TrendingUp className="w-3.5 h-3.5" />
             <span className="text-[10px] font-black uppercase tracking-widest">Est. Impact</span>
          </div>
          <p className="text-sm font-bold text-white">High Revenue Risk</p>
        </div>

        {/* Global Sendability Gauge */}
        <div className="flex items-center gap-6 pl-10 border-l border-steel">
          <div className="text-right">
            <span className="text-[10px] font-black text-mist uppercase tracking-widest block mb-1">Sendability</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-4 rounded-sm transition-all duration-1000 ${i <= (score / 20) ? "bg-leadforge-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-steel"}`} 
                  />
                ))}
              </div>
              <span className="text-xl font-black tracking-tighter text-white">{score}%</span>
            </div>
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-leadforge-blue/10 flex items-center justify-center border border-leadforge-blue/20">
            <ShieldCheck className="w-6 h-6 text-leadforge-blue" />
          </div>
        </div>
      </div>
    </div>
  );
}
