"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Calendar, Shield, Zap, CheckCircle2 } from "lucide-react";
import { AnnotatedScreenshot } from "../war-room/annotated-screenshot";

interface LeadPortalProps {
  companyName: string;
  videoUrl: string;
  screenshotUrl: string;
  annotations: any[];
  uxScore: number;
}

export function LeadPortal({ companyName, videoUrl, screenshotUrl, annotations, uxScore }: LeadPortalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header Branding */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold tracking-tighter text-xl">LeadForge AI</span>
          </div>
          <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Exclusive Forensic Audit for {companyName}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-12 items-start">
          {/* LEFT: Video & Teardown Stack */}
          <div className="col-span-8 space-y-8">
            <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 group">
              {/* The "Loom" Style Overlay Experience */}
              <div className="relative">
                {/* Background: The Annotated Teardown */}
                <div className={`transition-all duration-700 ${isPlaying ? 'opacity-40 scale-[0.98] blur-sm' : 'opacity-100'}`}>
                  <AnnotatedScreenshot 
                    imageUrl={screenshotUrl} 
                    annotations={annotations} 
                  />
                </div>

                {/* Foreground: The AI Avatar Video */}
                <div className={`absolute transition-all duration-700 ${isPlaying ? 'bottom-8 right-8 w-64 h-64 scale-100' : 'inset-0 w-full h-full scale-105'}`}>
                  <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl relative">
                    <video 
                      src={videoUrl} 
                      className="w-full h-full object-cover"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      controls={isPlaying}
                    />
                    {!isPlaying && (
                      <div 
                        onClick={() => setIsPlaying(true)}
                        className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer group-hover:bg-black/20 transition-all"
                      >
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-black fill-current" />
                        </div>
                        <p className="mt-6 font-bold text-xl tracking-tight">Watch your custom audit</p>
                        <p className="text-zinc-400 text-sm mt-1">Prepared by Alex @ LeadForge</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-emerald-500 mb-4">
                  <Shield className="w-5 h-5" />
                  <h4 className="font-bold uppercase text-xs tracking-widest">AI Verification</h4>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Our Llama 3.2 90B Vision agent identifies {annotations.length} critical friction points that are currently impacting your mobile conversion rate.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-amber-500 mb-4">
                  <Zap className="w-5 h-5" />
                  <h4 className="font-bold uppercase text-xs tracking-widest">Impact Prediction</h4>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Resolving these issues is projected to increase your checkout success rate by up to 14% based on similar industry benchmarks.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Conversion Sidebar */}
          <div className="col-span-4 space-y-6 sticky top-12">
            <div className="p-8 rounded-[32px] bg-gradient-to-br from-zinc-900 to-black border border-white/10 shadow-2xl space-y-8">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Forensic Health Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-bold text-emerald-500">{uxScore}</span>
                  <span className="text-zinc-600 font-bold text-xl mb-2">/ 100</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-xl tracking-tight">Ready to fix these?</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  We've already drafted the implementation plan for your engineering team to resolve these findings in under 48 hours.
                </p>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-95">
                  <Calendar className="w-5 h-5" /> Book 15-Min Strategy Call
                </button>
                <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2">
                  Download Full PDF Report
                </button>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-zinc-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Free Consultation Included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
