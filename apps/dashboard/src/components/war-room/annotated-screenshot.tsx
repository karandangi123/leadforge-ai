"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Zap, Shield, Target, Eye } from "lucide-react";

export type Annotation = {
  x: number;
  y: number;
  finding: string;
  recommendation: string;
  severity: "high" | "medium" | "low";
  index?: number;
};

interface Props {
  imageUrl: string;
  annotations: Annotation[];
  onSelectFinding?: (idx: number) => void;
  activeFindingIdx?: number | null;
  zoom?: number;
}

export function AnnotatedScreenshot({ imageUrl, annotations, onSelectFinding, activeFindingIdx, zoom = 1 }: Props) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-zinc-950 transition-all duration-500">
      {/* The Screenshot Canvas */}
      <div 
        className="relative overflow-hidden cursor-crosshair"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.3s ease' }}
      >
        <img 
          src={imageUrl} 
          alt="Forensic Evidence" 
          className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
        />

        {/* Forensic Overlays */}
        <div className="absolute inset-0">
          {annotations.map((ann, idx) => {
            const isSelected = activeFindingIdx === idx;
            const isHovered = hoveredId === idx;
            const severityColor = ann.severity === 'high' ? 'red' : ann.severity === 'medium' ? 'amber' : 'blue';

            return (
              <div 
                key={idx}
                className="absolute pointer-events-auto"
                style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
              >
                {/* Clean Numbered Marker */}
                <button
                  onClick={() => onSelectFinding?.(idx)}
                  onMouseEnter={() => setHoveredId(idx)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                    ${isSelected ? 'scale-125 z-50 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'z-20'}
                    ${ann.severity === 'high' ? 'bg-red-500/20 border-red-500 text-red-500' : 
                      ann.severity === 'medium' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 
                      'bg-blue-500/20 border-blue-500 text-blue-500'}
                    ${isSelected ? 'bg-white border-white text-black' : ''}
                  `}
                >
                  <span className="text-[10px] font-black">{idx + 1}</span>
                  {(isSelected || isHovered) && (
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-40 bg-current`} />
                  )}
                </button>

                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 p-3 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 pointer-events-none"
                    >
                      <p className="text-[10px] font-black text-white uppercase tracking-widest leading-tight">{ann.finding}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic Metadata Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-black text-white tracking-[0.2em] uppercase">Visual Evidence Stream • LIVE</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-black/40 rounded-lg border border-white/5 backdrop-blur-md">
          <Eye className="w-3 h-3 text-zinc-500" />
          <span className="text-[8px] font-bold text-zinc-400">Analysis: {annotations.length} Signals Captured</span>
        </div>
      </div>
    </div>
  );
}
