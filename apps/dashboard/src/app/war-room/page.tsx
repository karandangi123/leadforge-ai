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
  Radar,
  Trash2,
  Activity,
  Copy,
  ExternalLink,
  Target as TargetIcon
} from "lucide-react";
import { getWarRoomLeads, getLeadForensicData, getLeadSynthesis, deleteWarRoomLead, cleanupHungAudits } from "@/app/actions/war-room";
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
  const [auditEvents, setAuditEvents] = useState<string[]>([]);
  const [fastUrl, setFastUrl] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [forensicLoading, setForensicLoading] = useState(false);
  const [synthesisLoading, setSynthesisLoading] = useState(false);

  const notify = (msg: string) => {
    console.log(`[WarRoom] ${msg}`);
  };

  const startDeepAudit = async (leadId: string) => {
    setAuditEvents([]);
    if (leadId.startsWith('seed-')) {
      alert("Note: This is a demo lead. Real infrastructure actions are disabled for seeds.");
      return;
    }

    // Singleton Research Policy + 5min Timeout Recovery
    const ongoingAudit = briefs.find(b => b.status === 'AUDIT');
    const isHung = ongoingAudit && (new Date().getTime() - new Date(ongoingAudit.updatedAt || ongoingAudit.createdAt).getTime() > 300000);

    if ((isAuditing || (ongoingAudit && !isHung)) && !leadId?.startsWith('force-')) {
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
      console.error("Deep Audit Failed:", e);
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

    if (isAuditing) {
      // Countdown timer - Absolute Priority
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-fallback if it takes too long without server response
            setAuditStep("Finalizing results...");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Polling Logic
      if (trackingId) {
        pollInterval = setInterval(async () => {
          try {
            const statusRes = await getVisionJobStatus(trackingId);
            if (statusRes.status === "COMPLETED" || statusRes.status === "SUCCEEDED") {
              finishAudit();
            } else if (statusRes.status === "FAILED") {
              alert(`Audit failed: ${statusRes.step}`);
              cancelAuditLocally();
            } else {
              if (statusRes.progress) setAuditProgress(statusRes.progress);
              if (statusRes.step) {
                setAuditStep(statusRes.step);
                setAuditEvents(prev => prev.includes(statusRes.step) ? prev : [...prev, statusRes.step]);
              }
            }
          } catch (e) {
            console.error("Poll fail:", e);
          }
        }, 3000);
      }
    }

    const finishAudit = async () => {
      setIsAuditing(false);
      setTrackingId(null);
      const data = await getWarRoomLeads();
      setBriefs(data.length > 0 ? data : MOCK_BRIEFS);
      if (selectedLead) {
        const updated = data.find(l => l.id === selectedLead.id);
        if (updated) handleSelectLead(updated);
      }
    };

    const cancelAuditLocally = () => {
      setIsAuditing(false);
      setTrackingId(null);
    };

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [isAuditing, trackingId, selectedLead?.id]);

  const stopAudit = async () => {
    // Instant UI feedback - NO CONFIRM for emergency stop
    const tid = trackingId;
    const lid = selectedLead?.id;

    setIsAuditing(false);
    setTrackingId(null);
    setAuditProgress(0);
    setAuditStep("");
    setTimeLeft(45);
    
    try {
      if (tid && lid) {
        await cancelVisionAudit(tid, lid);
        // Refresh leads list to clear 'AUDIT' status from DB
        const data = await getWarRoomLeads();
        setBriefs(data.length > 0 ? data : MOCK_BRIEFS);
      }
    } catch (e) {
      console.error("Termination failed:", e);
    }
  };

  const handleDeleteLead = async (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation(); // Don't select the lead
    if (leadId.startsWith('seed-')) return;
    
    const confirmDelete = confirm("Delete this search site and all its forensic data?");
    if (!confirmDelete) return;

    try {
      const res = await deleteWarRoomLead(leadId);
      if (res.success) {
        setBriefs(prev => prev.filter(b => b.id !== leadId));
        if (selectedLead?.id === leadId) {
          setSelectedLead(null);
        }
        notify("Lead removed from perimeter.");
      }
    } catch (e) {
      alert("Failed to delete lead.");
    }
  };

  const runCleanup = async () => {
    const res = await cleanupHungAudits();
    if (res.success) {
      const data = await getWarRoomLeads();
      setBriefs(data.length > 0 ? data : MOCK_BRIEFS);
      notify(`Cleanup complete. ${res.count} hung tasks reset.`);
    }
  };

  const loadLabExamples = async () => {
    const examples = [
      { url: "https://stripe.com", name: "STRIPE" },
      { url: "https://slack.com", name: "SLACK" },
      { url: "https://notion.so", name: "NOTION" },
      { url: "https://airbnb.com", name: "AIRBNB" },
      { url: "https://salesforce.com", name: "SALESFORCE" }
    ];
    
    notify("Populating Discovery Lab...");
    for (const site of examples) {
      try {
        await fastAudit(site.url);
      } catch (e) {}
    }
    const data = await getWarRoomLeads();
    setBriefs(data.length > 0 ? data : MOCK_BRIEFS);
    notify("Discovery Lab Online.");
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

    // 2. Fetch Synthesis if pending OR data is missing
    if (lead.isPending || !lead.silverBulletHook || lead.silverBulletHook === "Contextual hook pending...") {
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

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
                />
                <button 
                  onClick={runCleanup}
                  title="Cleanup Hung Audits"
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 border border-white/5 text-zinc-500 hover:text-emerald-500 transition-all"
                >
                  <Activity className="w-4 h-4" />
                </button>
                <button 
                  onClick={loadLabExamples}
                  title="Load Discovery Lab Examples"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 border border-white/5 text-zinc-500 hover:text-amber-500 transition-all"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
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
                <div className="flex items-center gap-3">
                  {!brief.id.startsWith('seed-') && (
                    <button 
                      onClick={(e) => handleDeleteLead(e, brief.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 transition-all hover:bg-red-500 hover:text-white shadow-lg"
                      title="Delete Search Site"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="font-bold text-zinc-100">{brief.company}</span>
                </div>
                {brief.isPending && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">Syncing...</span>
                )}
              </div>
              <div className="text-xs text-zinc-500 truncate mb-3">{brief.executiveSummary}</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${brief.status === 'AUDIT' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                    {brief.status === 'AUDIT' ? 'Auditing Perimeter...' : `Fit: ${brief.score || 70}%`}
                  </span>
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

                    <div className="max-w-md w-full mb-12 text-left space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Intelligence Stream</p>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse delay-75" />
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse delay-150" />
                        </div>
                      </div>
                      <div className="space-y-2 bg-black/40 rounded-3xl p-6 border border-white/5 backdrop-blur-md max-h-48 overflow-y-auto custom-scrollbar">
                        {auditEvents.length === 0 && (
                          <div className="flex items-center gap-3 text-zinc-600 animate-pulse">
                            <Activity className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Waiting for Intelligence Engines...</span>
                          </div>
                        )}
                        {auditEvents.map((event, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 group"
                          >
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <div className="flex-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-last:text-emerald-400 transition-colors">
                                {event.split(':')[0]}
                              </p>
                              <p className="text-[10px] font-bold text-zinc-500 group-last:text-zinc-300 transition-colors">
                                {event.split(':')[1] || "Processing..."}
                              </p>
                            </div>
                            <span className="text-[8px] font-bold text-zinc-700 uppercase">Step {i + 1}</span>
                          </motion.div>
                        ))}
                      </div>
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <TargetIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Business Impact Analysis</h4>
                  </div>
                  <p className="text-lg leading-relaxed text-zinc-300">
                    {selectedLead.businessImpact || selectedLead.competitorGap}
                  </p>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 col-span-2 shadow-2xl relative group overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Ready-to-Send Proof Message</h4>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedLead.readyToSendMessage || "");
                        notify("Proof message copied to clipboard.");
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Copy Message</span>
                    </button>
                  </div>
                  <div className="bg-black/40 rounded-3xl p-8 border border-white/5 backdrop-blur-md">
                    <p className="text-xl font-medium leading-relaxed text-zinc-200 whitespace-pre-wrap">
                      {selectedLead.readyToSendMessage || "Generating high-fidelity proof message..."}
                    </p>
                  </div>
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
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              {selectedLead.findings[0]?.finding || "Primary Signal Detected"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                              selectedLead.findings[0]?.source === 'technical' 
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              Source: {selectedLead.findings[0]?.source || 'Vision Engine'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Confidence: {Math.round((selectedLead.findings[0]?.confidence || 0.95) * 100)}%
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              const url = `${window.location.origin}/proof/${selectedLead.publicProofId || 'demo'}`;
                              navigator.clipboard.writeText(url);
                              notify("Public proof link copied to clipboard.");
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[8px]">Copy Proof Link</span>
                          </button>
                        </div>
                      </div>
                      <div className="rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/50 p-2 group relative">
                        <div className="absolute top-8 right-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-3 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all shadow-2xl">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
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
                    {selectedLead?.executiveSummary}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
          <div className="w-32 h-32 relative mb-8">
            <Radar className="w-full h-full text-emerald-500 animate-spin opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
          </div>
          <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs">Synchronizing War Room...</p>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}
