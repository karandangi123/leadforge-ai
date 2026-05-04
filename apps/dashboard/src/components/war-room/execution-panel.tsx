"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Database, 
  Copy, 
  Edit3,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Target
} from "lucide-react";
import { Linkedin } from "@/components/ui/BrandIcons";

interface ExecutionPanelProps {
  finding: {
    id: string;
    title: string;
    businessImpact: string;
    whyThisFinding: string;
    fixSuggestion: string;
    outreachHook: string;
    overallSendability: number;
    detectionConfidence: number;
    evidenceStrength: number;
    businessImpactScore: number;
    outreachQualityScore: number;
  };
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onCRMExport: () => void;
}

export function ExecutionPanel({ finding, onApprove, onReject, onEdit, onCRMExport }: ExecutionPanelProps) {
  const [activeTab, setActiveTab] = useState<"email" | "linkedin" | "crm">("email");

  const scores = [
    { label: "Detection", value: finding?.detectionConfidence || 0.92 },
    { label: "Evidence", value: finding?.evidenceStrength || 0.88 },
    { label: "Impact", value: finding?.businessImpactScore || 0.95 },
    { label: "Quality", value: finding?.outreachQualityScore || 0.84 },
  ];

  return (
    <div className="w-[400px] border-l border-steel flex flex-col bg-zircon/50 backdrop-blur-3xl overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8">
        
        {/* Scoring Breakdown */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-mist uppercase tracking-[0.2em]">Forensic Signal Strength</h3>
            <div className="flex items-center gap-1.5 text-emerald">
               <Shield className="w-3 h-3" />
               <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {scores.map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-obsidian border border-white/5 space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-mist">
                  <span>{s.label}</span>
                  <span>{Math.round(s.value * 100)}%</span>
                </div>
                <div className="h-1 bg-steel rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value * 100}%` }}
                    className="h-full bg-leadforge-blue"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The Why & Impact */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-leadforge-blue">
            <Target className="w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Strategic Rationale</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-leadforge-blue/5 border border-leadforge-blue/20">
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                "{finding?.whyThisFinding || "High confidence signal anchored in multi-agent visual verification."}"
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-obsidian border border-white/5">
              <div className="w-5 h-5 rounded-lg bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-3 h-3 text-emerald" />
              </div>
              <p className="text-xs text-mist leading-relaxed">
                <span className="text-zinc-200 font-bold block mb-1">Business Impact:</span>
                {finding?.businessImpact || "Creates significant friction in the primary user flow, likely leading to premature exits."}
              </p>
            </div>
          </div>
        </section>

        {/* Outreach Bridge */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-mist uppercase tracking-[0.2em]">Execution Assets</h3>
            <div className="flex gap-1">
              <button 
                onClick={() => setActiveTab("email")}
                className={`p-1.5 rounded-lg transition-colors ${activeTab === "email" ? "bg-steel text-white" : "text-mist hover:text-white"}`}
              >
                <Mail className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setActiveTab("linkedin")}
                className={`p-1.5 rounded-lg transition-colors ${activeTab === "linkedin" ? "bg-steel text-white" : "text-mist hover:text-white"}`}
              >
                <Linkedin className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setActiveTab("crm")}
                className={`p-1.5 rounded-lg transition-colors ${activeTab === "crm" ? "bg-steel text-white" : "text-mist hover:text-white"}`}
              >
                <Database className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-leadforge-blue/20 to-emerald/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-all" />
            <div className="relative p-5 rounded-2xl bg-zircon border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-steel pb-3">
                <span className="text-[10px] font-mono text-zinc-500">Draft_{activeTab}.log</span>
                <button className="text-leadforge-blue hover:text-white transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs text-zinc-400 leading-relaxed min-h-[100px]">
                {finding?.outreachHook ? (
                  <>
                    <span className="text-leadforge-blue font-bold">"</span>
                    {finding.outreachHook}
                    <span className="text-leadforge-blue font-bold">"</span>
                  </>
                ) : (
                  <span className="italic">Generating context-aware hook...</span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-steel" />
                <button 
                  onClick={onEdit}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-mist hover:text-white transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  Inline Edit
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Primary Action Bar */}
      <div className="p-6 border-t border-steel bg-obsidian/80 backdrop-blur-xl">
        <div className="flex gap-3">
          <button 
            onClick={onReject}
            className="w-14 h-14 rounded-2xl border border-crimson/20 bg-crimson/5 text-crimson hover:bg-crimson hover:text-white transition-all flex items-center justify-center shrink-0"
          >
            <XCircle className="w-6 h-6" />
          </button>
          <button 
            onClick={activeTab === "crm" ? onCRMExport : onApprove}
            className="flex-1 h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-leadforge-blue hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl group"
          >
            {activeTab === "email" ? "Draft Gmail Message" : activeTab === "linkedin" ? "Copy LinkedIn DM" : "Export to CRM"}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <p className="text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest mt-4">
          Human verification required before execution
        </p>
      </div>
    </div>
  );
}
