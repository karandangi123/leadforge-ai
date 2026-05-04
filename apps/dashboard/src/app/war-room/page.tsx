"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Zap, 
  Target, 
  Eye, 
  TrendingUp, 
  MessageSquare, 
  ArrowRight,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  User,
  Radar
} from "lucide-react";
import { getWarRoomLeads, getLeadForensicData, getLeadSynthesis } from "@/app/actions/war-room";
import { runVisionAudit, getVisionJobStatus, fastAudit, cancelVisionAudit } from "@/app/actions/vision-audit";
import { AnnotatedScreenshot } from "@/components/war-room/annotated-screenshot";

// Mock data for initial rendering
const MOCK_BRIEFS = [
  {
    id: "seed-1",
    company: "Acme Corp",
    website: "acme.com",
    score: 98,
    executiveSummary: "Acme is aggressively scaling their cloud infra but missing core security headers (CSP).",
    silverBulletHook: "I noticed your HSTS headers are missing on acme.com/pricing.",
    competitorGap: "Currently using Apollo. Ready for higher-fidelity outreach.",
    status: "HOT"
  }
];

export default function WarRoom() {
  const [briefs, setBriefs] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditStep, setAuditStep] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [fastUrl, setFastUrl] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [forensicLoading, setForensicLoading] = useState(false);
  const [synthesisLoading, setSynthesisLoading] = useState(false);

  const notify = (msg: string) => {
    console.log(`[WarRoom] ${msg}`);
  };

  const startDeepAudit = async (leadId: string) => {
    if (leadId.startsWith('seed-')) {
      alert("Note: This is a demo lead. Real infrastructure actions are disabled for seeds.");
      return;
    }

    // Singleton Research Policy
    const ongoingAudit = briefs.find(b => b.status === 'AUDIT');
    if (isAuditing || ongoingAudit) {
      alert("1 RESEARCH IN PROGRESS, WAIT FOR COMPLETION. We limit concurrent forensic scans to ensure 100% accuracy.");
      return;
    }

    setIsAuditing(true);
    setAuditProgress(5);
    setTimeLeft(45);
    setAuditStep("Connecting to LeadForge Infrastructure...");
    
    try {
      const res = await runVisionAudit(leadId);
      if (res.success && res.trackingId) {
        setTrackingId(res.trackingId);
        notify("Audit engine engaged.");
      } else {
        alert(res.error || "Audit engine is currently at capacity.");
        setIsAuditing(false);
      }
    } catch (e) {
      setIsAuditing(false);
    }
  };

  const handleFastIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastUrl.includes('.')) {
      alert("Please enter a valid website URL.");
      return;
    }

    // Singleton Research Policy
    const ongoingAudit = briefs.find(b => b.status === 'AUDIT');
    if (isAuditing || ongoingAudit) {
      alert("1 RESEARCH IN PROGRESS, WAIT FOR COMPLETION. Please allow the current forensic scan to finish before ingesting new targets.");
      return;
    }
    
    setIsIngesting(true);
    try {
      const res = await fastAudit(fastUrl);
      if (res.success && res.trackingId) {
        setTrackingId(res.trackingId);
        setIsAuditing(true);
        setFastUrl("");
        // Refresh leads
        const data = await getWarRoomLeads();
        setBriefs(data.length > 0 ? data : MOCK_BRIEFS);
        if (data[0]) handleSelectLead(data[0]);
      } else {
        alert(res.error || "Ingest failed.");
      }
    } finally {
      setIsIngesting(false);
    }
  };

  // Real-time Job Tracking Loop
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let timerInterval: NodeJS.Timeout;

    if (isAuditing && trackingId) {
      // Countdown timer
      timerInterval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);

      pollInterval = setInterval(async () => {
        const statusRes = await getVisionJobStatus(trackingId);
        
        if (statusRes.status === "COMPLETED" || statusRes.status === "SUCCEEDED") {
          cleanup();
          const data = await getWarRoomLeads();
          setBriefs(data.length > 0 ? data : MOCK_BRIEFS);
          const updated = data.find(l => l.id === selectedLead?.id);
          if (updated) handleSelectLead(updated);
        } else if (statusRes.status === "FAILED") {
          cleanup();
          alert("Forensic audit failed: Internal timeout.");
        } else if (statusRes.progress) {
          setAuditProgress(statusRes.progress);
          setAuditStep(statusRes.step || "Processing...");
        }
      }, 2000);
    }

    const cleanup = () => {
      setIsAuditing(false);
      setTrackingId(null);
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [isAuditing, trackingId, selectedLead?.id]);

  const stopAudit = async () => {
    if (!trackingId || !selectedLead) return;
    const confirmStop = confirm("Are you sure you want to stop this forensic audit?");
    if (!confirmStop) return;

    await cancelVisionAudit(trackingId, selectedLead.id);
    setIsAuditing(false);
    setTrackingId(null);
    notify("Audit cancelled.");
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getWarRoomLeads();
        const finalData = data.length > 0 ? data : MOCK_BRIEFS;
        setBriefs(finalData);
        handleSelectLead(finalData[0]);
      } catch (e) {
        console.error("War Room Load Error:", e);
        setBriefs(MOCK_BRIEFS);
        handleSelectLead(MOCK_BRIEFS[0]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectLead = async (lead: any) => {
    setSelectedLead(lead);
    if (!lead || lead.id.startsWith('seed-')) return;
    
    // 1. Fetch Forensic Data
    setForensicLoading(true);
    getLeadForensicData(lead.id).then(forensic => {
      if (forensic) {
        setSelectedLead((prev: any) => {
          if (prev?.id !== lead.id) return prev;
          return {
            ...prev,
            screenshotUrl: forensic.screenshotUrl,
            findings: forensic.findings
          };
        });
      }
    }).finally(() => setForensicLoading(false));

    // 2. Fetch Synthesis if pending
    if (lead.isPending) {
      setSynthesisLoading(true);
      getLeadSynthesis(lead.id).then(synthesis => {
        if (synthesis) {
          setSelectedLead((prev: any) => {
            if (prev?.id !== lead.id) return prev;
            return {
              ...prev,
              ...synthesis,
              isPending: false
            };
          });
          // Update the list too
          setBriefs(prev => prev.map(b => b.id === lead.id ? { ...b, ...synthesis, isPending: false } : b));
        }
      }).finally(() => setSynthesisLoading(false));
    }
  };

  const filteredBriefs = briefs.filter(b => 
    b.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Zap className="w-12 h-12 text-emerald-500 animate-pulse" />
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      <div className="w-[400px] border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-zinc-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-white">War Room</h1>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-500/20">Live Intelligence</span>
          </div>

          {/* Fast Ingest Bar */}
          <form onSubmit={handleFastIngest} className="relative group">
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <input 
              type="text" 
              placeholder="Paste URL for Instant Audit..."
              value={fastUrl}
              onChange={(e) => setFastUrl(e.target.value)}
              className="relative w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder:text-zinc-600 focus:border-emerald-500/50 outline-none transition-all shadow-2xl"
            />
            <button 
              type="submit"
              disabled={isIngesting || !fastUrl}
              className="absolute right-2 top-1.5 p-1.5 bg-emerald-500 rounded-lg text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {isIngesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 ring-emerald-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredBriefs.map((brief) => (
            <motion.button
              key={brief.id}
              onClick={() => handleSelectLead(brief)}
              whileHover={{ x: 4 }}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${
                selectedLead?.id === brief.id 
                  ? "bg-zinc-800/50 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                  : "border-transparent hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-zinc-100">{brief.company}</span>
                {brief.isPending && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">Syncing...</span>
                )}
              </div>
              <div className="text-xs text-zinc-500 truncate mb-3">{brief.executiveSummary}</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Fit: {brief.score || brief.fitScore}%</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,_#111_0%,_#000_100%)]">
        <AnimatePresence mode="wait">
          {selectedLead && (
            <motion.div 
              key={selectedLead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-12 max-w-5xl mx-auto space-y-12"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 flex items-center justify-center text-3xl shadow-2xl">
                      {selectedLead.company[0]}
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold tracking-tight text-white">{selectedLead.company}</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                          <Globe className="w-4 h-4" /> {selectedLead.website}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isAuditing || selectedLead.status === 'AUDIT'}
                      onClick={() => startDeepAudit(selectedLead.id)}
                      className={`relative overflow-hidden group px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-3 ${
                        isAuditing || selectedLead.status === 'AUDIT' 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]'
                      }`}
                    >
                      {isAuditing || selectedLead.status === 'AUDIT' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Radar className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                      )}
                      <span className="relative z-10">
                        {isAuditing || selectedLead.status === 'AUDIT' ? "Analyzing..." : "Generate Forensic Proof"}
                      </span>
                    </motion.button>

                    <button className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-2xl border border-white/10 transition-all flex items-center gap-2 group">
                      <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" /> Send Video Outreach
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 p-6 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Ideal Fit Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter text-white">{selectedLead.score || selectedLead.fitScore}</span>
                      <span className="text-xl font-bold text-zinc-600">%</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Visual Health</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter text-white">{selectedLead.auditScore || "--"}</span>
                      {selectedLead.auditScore && <span className="text-xl font-bold text-zinc-600">/100</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 relative">
                {(isAuditing || selectedLead.status === 'AUDIT') && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl z-50 flex flex-col items-center justify-center rounded-[3rem] border border-white/10 shadow-2xl p-10 text-center">
                    <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] mb-8 relative overflow-hidden">
                      <Radar className="w-10 h-10 text-amber-500 animate-spin" />
                    </div>
                    
                    <div className="mb-8">
                      <p className="text-3xl font-black text-white tracking-tighter mb-2">{auditStep}</p>
                      <div className="flex items-center justify-center gap-2 text-zinc-500">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Estimated Completion: {timeLeft}s remaining</span>
                      </div>
                    </div>

                    <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden mb-12">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${auditProgress}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      />
                    </div>

                    <button 
                      onClick={stopAudit}
                      className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-zinc-900 border border-white/5 hover:border-red-500/50 transition-all"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-red-500">Terminate Research Session</span>
                    </button>
                  </div>
                )}

                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 relative overflow-hidden group">
                  {synthesisLoading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Winning Hook Signature</h4>
                  </div>
                  <p className="text-xl font-medium leading-relaxed text-zinc-100 italic">
                    "{selectedLead.silverBulletHook}"
                  </p>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 relative overflow-hidden">
                  {synthesisLoading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Positioning Advantage</h4>
                  </div>
                  <p className="text-lg leading-relaxed text-zinc-300">
                    {selectedLead.competitorGap}
                  </p>
                </div>

                <div className="col-span-2">
                  {forensicLoading ? (
                    <div className="p-20 rounded-[3rem] bg-zinc-950/50 border border-white/5 flex flex-col items-center justify-center text-center">
                      <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Retrieving Forensic Evidence...</p>
                    </div>
                  ) : selectedLead.screenshotUrl ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-amber-400">
                          <Radar className="w-5 h-5" />
                          <h4 className="text-xs font-black uppercase tracking-[0.2em]">Forensic Visual Proof (Desktop)</h4>
                        </div>
                      </div>
                      <div className="rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/50 p-2">
                        <AnnotatedScreenshot 
                          imageUrl={selectedLead.screenshotUrl} 
                          annotations={selectedLead.findings || []} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-20 rounded-[3rem] bg-zinc-950/50 border border-dashed border-white/10 flex flex-col items-center justify-center text-center group">
                      <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
                        <Eye className="w-8 h-8 text-zinc-700" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Visual Intelligence Locked</h3>
                      <button 
                        onClick={() => startDeepAudit(selectedLead.id)}
                        className="bg-amber-500 hover:bg-amber-400 text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all"
                      >
                        Launch Forensic Scan
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Eye className="w-5 h-5" />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Executive Summary</h4>
                    </div>
                  </div>
                  <p className="text-lg leading-relaxed text-zinc-200">
                    {selectedLead.executiveSummary}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}
