"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Zap, Shield, Target } from "lucide-react";

type Annotation = {
  x: number;
  y: number;
  finding: string;
  recommendation: string;
  severity: "high" | "medium" | "low";
};

export function AnnotatedScreenshot({ imageUrl, annotations }: { imageUrl: string, annotations: Annotation[] }) {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-zinc-900">
      {/* The Screenshot */}
      <img 
        src={imageUrl} 
        alt="Website Audit" 
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
      />

      {/* Overlay Layer for Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {annotations.map((ann, idx) => (
          <div 
            key={idx}
            className="absolute pointer-events-auto cursor-pointer"
            style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
            onMouseEnter={() => setActiveId(idx)}
            onMouseLeave={() => setActiveId(null)}
          >
            {/* Pulsing Marker */}
            <div className="relative flex items-center justify-center">
              <div className={`w-6 h-6 rounded-full animate-ping absolute opacity-50 ${
                ann.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
              <div className={`w-3 h-3 rounded-full relative z-10 border-2 border-white shadow-lg ${
                ann.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
            </div>

            {/* Tooltip */}
            <AnimatePresence>
              {activeId === idx && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-4 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 pointer-events-none"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className={`w-4 h-4 ${ann.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Visual Pain Point</span>
                  </div>
                  <p className="text-xs font-bold text-white mb-1">{ann.finding}</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic">" {ann.recommendation} "</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer Branding Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">LeadForge AI Verified Audit</span>
        </div>
        <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
          Llama 3.2 90B Vision Analysis
        </div>
      </div>
    </div>
  );
}
