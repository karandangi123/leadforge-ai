"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Shield, 
  Zap, 
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface TacticalBriefProps {
  lead: {
    id: string;
    company: string;
    website: string;
    score: number;
    status: string;
    executiveSummary: string;
    silverBulletHook: string;
    visualSignal?: string;
  };
  isActive: boolean;
  onSelect: () => void;
}

export function TacticalBriefCard({ lead, isActive, onSelect }: TacticalBriefProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "READY":
      case "HOT":
        return { color: "text-emerald", icon: CheckCircle, label: "ANALYSIS COMPLETE" };
      case "AUDIT":
      case "QUEUED":
        return { color: "text-leadforge-blue", icon: Clock, label: "FORENSICS IN PROGRESS" };
      default:
        return { color: "text-mist", icon: AlertCircle, label: "PENDING INGEST" };
    }
  };

  const config = getStatusConfig(lead.status);

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -2 }}
      className={`group relative p-6 rounded-[2rem] cursor-pointer transition-all duration-300 border ${
        isActive 
        ? "bg-zircon border-leadforge-blue/40 shadow-[0_20px_50px_rgba(0,0,0,0.4)]" 
        : "bg-obsidian border-steel hover:border-mist/20"
      }`}
    >
      {/* Selection Glow */}
      {isActive && (
        <div className="absolute inset-0 bg-leadforge-blue/5 rounded-[2rem] pointer-events-none" />
      )}

      <div className="space-y-5 relative">
        {/* Header: Identity & Score */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-steel flex items-center justify-center font-black text-xs border border-white/5 group-hover:border-leadforge-blue/30 transition-colors">
              {lead.company.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight leading-tight">{lead.company}</h3>
              <div className="flex items-center gap-2 text-xs text-mist font-medium mt-1">
                <span>{lead.website}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-leadforge-blue">
              <span className="text-xs font-black tracking-widest uppercase">Score</span>
              <span className="text-lg font-black tracking-tighter">{lead.score}%</span>
            </div>
            <div className="h-1 w-16 bg-white/5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-leadforge-blue shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                style={{ width: `${lead.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Primary Finding / Hook Preview */}
        <div className="p-4 rounded-2xl bg-zircon/50 border border-white/5 space-y-3 group-hover:bg-steel transition-colors">
          <div className="flex items-center gap-2 text-emerald">
            <Target className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Forensic Signal</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed font-medium line-clamp-2">
            {lead.silverBulletHook || lead.executiveSummary}
          </p>
        </div>

        {/* Status & Proof Meta */}
        <div className="flex items-center justify-between pt-2">
          <div className={`flex items-center gap-2 ${config.color}`}>
            <config.icon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {lead.status === "READY" && (
              <div className="flex -space-x-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-md bg-steel border-2 border-obsidian flex items-center justify-center">
                    <Shield className="w-2.5 h-2.5 text-mist" />
                  </div>
                ))}
              </div>
            )}
            <div className="w-8 h-8 rounded-xl bg-leadforge-blue/10 text-leadforge-blue flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
