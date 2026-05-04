"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Shield, 
  Smartphone, 
  Monitor,
  Eye
} from "lucide-react";

interface ForensicCanvasProps {
  imageUrl: string;
  findings: Array<{
    id: string;
    x: number;
    y: number;
    finding: string;
    severity: string;
  }>;
  activeFindingIdx: number;
  onFindingSelect: (idx: number) => void;
}

export function ForensicCanvas({ imageUrl, findings, activeFindingIdx, onFindingSelect }: ForensicCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="flex-1 flex flex-col bg-obsidian overflow-hidden">
      {/* Canvas Header */}
      <div className="h-14 border-b border-steel px-6 flex items-center justify-between forensic-glass">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-steel border border-white/5">
            <Eye className="w-3.5 h-3.5 text-leadforge-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Evidence View</span>
          </div>
          <div className="h-4 w-px bg-steel" />
          <div className="flex bg-steel/50 rounded-lg p-1">
            <button 
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded-md transition-all ${viewport === "desktop" ? "bg-leadforge-blue text-white shadow-lg" : "text-mist hover:text-white"}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded-md transition-all ${viewport === "mobile" ? "bg-leadforge-blue text-white shadow-lg" : "text-mist hover:text-white"}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 rounded-lg hover:bg-steel text-mist transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono text-mist w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 rounded-lg hover:bg-steel text-mist transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <div className="h-4 w-px bg-steel" />
          <button className="p-1.5 rounded-lg hover:bg-steel text-mist transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Workspace */}
      <div className="flex-1 relative overflow-auto p-12 scrollbar-hide bg-[radial-gradient(#1c1c1f_1px,transparent_1px)] [background-size:20px_20px]">
        <div 
          className="relative mx-auto transition-all duration-500 command-shadow rounded-[2rem] overflow-hidden bg-black"
          style={{ 
            width: viewport === "desktop" ? "100%" : "375px",
            maxWidth: viewport === "desktop" ? "1200px" : "375px",
            transform: `scale(${zoom})`,
            transformOrigin: "top center"
          }}
        >
          {/* Main Screenshot */}
          <img 
            src={imageUrl} 
            alt="Forensic Evidence" 
            className="w-full h-auto opacity-90 grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          />

          {/* Interactive SVG Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {findings.map((f, idx) => {
              const isActive = activeFindingIdx === idx;
              return (
                <g key={f.id} className="pointer-events-auto cursor-pointer" onClick={() => onFindingSelect(idx)}>
                  {/* Outer Pulse */}
                  <circle 
                    cx={`${f.x}%`} 
                    cy={`${f.y}%`} 
                    r={isActive ? "24" : "16"} 
                    className={`fill-none stroke-leadforge-blue/20 transition-all duration-500 ${isActive ? "stroke-[4px]" : "stroke-2"}`}
                  />
                  
                  {/* Core Marker */}
                  <circle 
                    cx={`${f.x}%`} 
                    cy={`${f.y}%`} 
                    r="8" 
                    className={`${isActive ? "fill-leadforge-blue" : "fill-white/20 stroke-white/50 stroke-1"} transition-all duration-300`}
                    filter="url(#glow)"
                  />

                  {/* Label (Visible on Active/Hover) */}
                  <AnimatePresence>
                    {isActive && (
                      <foreignObject x={`${f.x}%`} y={`${f.y}%`} width="200" height="100" className="overflow-visible">
                        <motion.div 
                          initial={{ opacity: 0, y: 10, x: 20 }}
                          animate={{ opacity: 1, y: -20, x: 20 }}
                          className="forensic-glass p-3 rounded-xl border border-leadforge-blue/30 shadow-2xl min-w-[180px]"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-leadforge-blue shadow-[0_0_8px_rgba(59,130,246,1)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-leadforge-blue">Marker ID: {f.id.slice(-4)}</span>
                          </div>
                          <p className="text-[11px] font-bold text-white leading-tight">{f.finding}</p>
                        </motion.div>
                      </foreignObject>
                    )}
                  </AnimatePresence>
                </g>
              );
            })}
          </svg>

          {/* Forensic Metadata Overlay */}
          <div className="absolute bottom-6 left-6 flex items-center gap-4 text-[10px] font-mono text-white/40">
            <div className="flex items-center gap-2">
              <span className="text-leadforge-blue">ISO:</span> 800
            </div>
            <div className="flex items-center gap-2">
              <span className="text-leadforge-blue">RES:</span> {viewport === "desktop" ? "1920x1080" : "375x812"}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-leadforge-blue">SIG:</span> VERIFIED
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="h-20 border-t border-steel px-8 flex items-center justify-between bg-zircon/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Active Findings</span>
            <div className="flex items-center gap-2 mt-1">
              {findings.map((f, idx) => (
                <button 
                  key={f.id}
                  onClick={() => onFindingSelect(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${activeFindingIdx === idx ? "bg-leadforge-blue scale-125 shadow-[0_0_8px_rgba(59,130,246,1)]" : "bg-steel hover:bg-mist"}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-mist font-medium italic">Click markers to inspect specific evidence points.</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian border border-white/5">
             <Shield className="w-3.5 h-3.5 text-emerald" />
             <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Secure Forensic Chain</span>
          </div>
        </div>
      </div>
    </div>
  );
}
