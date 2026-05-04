"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Filter, 
  RefreshCw,
  Radar
} from "lucide-react";
import { getWarRoomLeads, getLeadForensicData, getLeadSynthesis, cleanupHungAudits } from "@/app/actions/war-room";
import { runVisionAudit, getVisionJobStatus } from "@/app/actions/vision-audit";
import { createGmailDraft } from "@/app/actions/outreach";
import { WarRoomShell } from "@/components/war-room/shell";
import { TacticalBriefCard } from "@/components/war-room/tactical-brief-card";
import { StrategicSummary } from "@/components/war-room/strategic-summary";
import { ForensicCanvas } from "@/components/war-room/forensic-canvas";
import { ExecutionPanel } from "@/components/war-room/execution-panel";

const MOCK_BRIEFS = [
  {
    id: "seed-1",
    company: "Acme Corp",
    website: "acme.com",
    score: 98,
    executiveSummary: "Acme is aggressively scaling their cloud infra but missing core security headers (CSP).",
    silverBulletHook: "I noticed your HSTS headers are missing on acme.com/pricing.",
    status: "HOT"
  }
];

export default function WarRoom() {
  const [briefs, setBriefs] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditStep, setAuditStep] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [activeFindingIdx, setActiveFindingIdx] = useState<number>(0);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getWarRoomLeads();
      setBriefs(data.length > 0 ? data : MOCK_BRIEFS);
      if (data[0] && !selectedLead) handleSelectLead(data[0]);
    } catch (e) {
      setBriefs(MOCK_BRIEFS);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLead = async (lead: any) => {
    setSelectedLead(lead);
    setActiveFindingIdx(0);
    try {
      const forensic = await getLeadForensicData(lead.id);
      if (forensic) {
        setSelectedLead((prev: any) => ({ ...prev, ...forensic }));
      }
    } catch (e) {
      console.error("Forensic load failed:", e);
    }
  };

  const startDeepAudit = async (leadId: string) => {
    setIsAuditing(true);
    setAuditProgress(5);
    setAuditStep("Initializing Forensic Scan...");
    try {
      const res = await runVisionAudit(leadId);
      if (res.success && res.trackingId) {
        setTrackingId(res.trackingId);
      } else {
        setIsAuditing(false);
      }
    } catch (e) {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (isAuditing && trackingId) {
      pollInterval = setInterval(async () => {
        const statusRes = await getVisionJobStatus(trackingId);
        if (statusRes.status === "COMPLETED" || statusRes.status === "SUCCEEDED") {
          setIsAuditing(false);
          setTrackingId(null);
          loadLeads();
        } else if (statusRes.status === "FAILED") {
          setIsAuditing(false);
          setTrackingId(null);
        } else {
          if (statusRes.progress) setAuditProgress(statusRes.progress);
          if (statusRes.step) setAuditStep(statusRes.step);
        }
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [isAuditing, trackingId]);

  const handleApprove = async () => {
    if (!selectedLead || !selectedLead.findings?.[activeFindingIdx]) return;
    const finding = selectedLead.findings[activeFindingIdx];
    try {
      const subject = `Visual Evidence: ${finding.finding || finding.title || "Observation"} for ${selectedLead.company}`;
      const body = finding.outreachHook || "Hi, I noticed something interesting on your site...";
      const to = selectedLead.contactEmail || "prospect@example.com"; // Fallback if missing
      
      const res = await createGmailDraft(selectedLead.id, subject, body, to);
      if (res.success) alert("Draft created in Gmail.");
    } catch (e) {
      alert("Failed to create draft.");
    }
  };

  const handleCRMExport = async () => {
    if (!selectedLead) return;
    try {
      const { exportLeadToHubSpot } = await import("@/app/actions/war-room");
      const res = await exportLeadToHubSpot(selectedLead.id);
      if (res.success) alert("Lead synced to HubSpot successfully.");
    } catch (e) {
      alert("CRM sync failed.");
    }
  };

  return (
    <WarRoomShell>
      <div className="flex h-full overflow-hidden">
        {/* Pipeline Sidebar */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-[450px] border-r border-steel flex flex-col bg-obsidian/50 z-20"
        >
          <div className="p-6 border-b border-steel flex items-center justify-between forensic-glass">
            <div>
              <h2 className="text-xl font-black tracking-tight">Intelligence Pipeline</h2>
              <p className="text-xs text-mist font-medium mt-1">Found {briefs.length} targets</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-steel text-mist hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg bg-steel text-mist hover:text-white transition-colors" onClick={() => loadLeads()}><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-48 rounded-[2rem] bg-zircon animate-pulse border border-steel" />) :
              briefs.map((lead, idx) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <TacticalBriefCard 
                    lead={lead}
                    isActive={selectedLead?.id === lead.id}
                    onSelect={() => handleSelectLead(lead)}
                  />
                </motion.div>
              ))
            }
          </div>
        </motion.div>

        {/* The Cockpit */}
        <div className="flex-1 bg-obsidian flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedLead ? (
              <motion.div 
                key={selectedLead.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <StrategicSummary lead={selectedLead} finding={selectedLead.findings?.[activeFindingIdx]} />
                
                <div className="flex-1 flex min-h-0 overflow-hidden">
                  {selectedLead.screenshotUrl ? (
                    <ForensicCanvas 
                      imageUrl={selectedLead.screenshotUrl}
                      findings={selectedLead.findings || []}
                      activeFindingIdx={activeFindingIdx}
                      onFindingSelect={(idx) => setActiveFindingIdx(idx)}
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                      <div className="w-24 h-24 rounded-full bg-leadforge-blue/10 flex items-center justify-center mb-8 signal-pulse">
                        <Target className="w-12 h-12 text-leadforge-blue" />
                      </div>
                      <h2 className="text-4xl font-black tracking-tighter mb-4 italic uppercase">Ready for Cockpit</h2>
                      <p className="text-mist max-w-lg text-xl leading-relaxed mb-12">Forensic UI modules ready for <span className="text-white font-bold">{selectedLead.company}</span>. Deployment sequence initiated.</p>
                      {!isAuditing ? (
                        <button 
                          onClick={() => startDeepAudit(selectedLead.id)} 
                          className="px-10 py-5 rounded-2xl bg-leadforge-blue text-white font-black uppercase tracking-widest text-sm hover:bg-leadforge-blue/80 transition-all shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-95"
                        >
                          Engage Forensic Deep-Scan
                        </button>
                      ) : (
                        <div className="w-full max-w-md space-y-6">
                          <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] text-leadforge-blue">
                            <span className="flex items-center gap-2">
                               <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                               {auditStep}
                            </span>
                            <span>{auditProgress}%</span>
                          </div>
                          <div className="h-3 bg-steel rounded-full overflow-hidden p-1 border border-white/5">
                            <motion.div 
                              className="h-full bg-leadforge-blue rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]" 
                              initial={{ width: 0 }} 
                              animate={{ width: `${auditProgress}%` }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ExecutionPanel 
                      finding={selectedLead.findings?.[activeFindingIdx]}
                      onApprove={handleApprove}
                      onReject={() => console.log("Rejected")}
                      onEdit={() => console.log("Editing")}
                      onCRMExport={handleCRMExport}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20 grayscale opacity-20">
                <Radar className="w-20 h-20 mb-8 animate-pulse text-leadforge-blue" />
                <h2 className="text-2xl font-black tracking-tighter italic uppercase">Engage Radar</h2>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </WarRoomShell>
  );
}
