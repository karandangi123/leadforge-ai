"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Activity, 
  Mail, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  Plus,
  Settings,
  ExternalLink,
  ChevronDown,
  Flame,
  Globe,
  Inbox
} from "lucide-react";
import { syncDeliverabilityData } from "@/app/actions/deliverability";

export type WarmupStatus = "ACTIVE" | "INACTIVE" | "PAUSED" | "COMPLETED";

export interface SenderDomain {
  id: string;
  domain: string;
  isPrimary: boolean;
  spfStatus: "PASS" | "FAIL" | "PENDING" | string;
  dkimStatus: "PASS" | "FAIL" | "PENDING" | string;
  dmarcStatus: "PASS" | "FAIL" | "PENDING" | string;
  warmupStatus: WarmupStatus | string;
  warmupSentToday: number;
  warmupReceivedToday: number;
  spamScore: number | null;
  inboxPlacementRate: number | null;
  lastCheckedAt: string | null;
}

export function DeliverabilityPanel({ domains }: { domains: SenderDomain[] }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>(domains[0]?.domain || "");
  const [showAddModal, setShowAddModal] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncDeliverabilityData();
    setIsRefreshing(false);
  };

  const currentDomain = domains.find(d => d.domain === selectedDomain) || domains[0];

  const StatusIcon = ({ status }: { status: string }) => {
    switch(status) {
      case "PASS": return <CheckCircle2 className="text-emerald-500" size={18} />;
      case "FAIL": return <AlertTriangle className="text-red-500" size={18} />;
      default: return <RefreshCw className="text-amber-500" size={18} />;
    }
  };

  const StatusBadge = ({ status, label }: { status: string, label: string }) => {
    const isPass = status === "PASS";
    const isFail = status === "FAIL";
    return (
      <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold ${
        isPass ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
        isFail ? "bg-red-50 border-red-100 text-red-700" :
        "bg-amber-50 border-amber-100 text-amber-700"
      }`}>
        <StatusIcon status={status} />
        {label}: {status}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1e2521] flex items-center gap-2">
            <ShieldCheck className="text-[#176b5d]" />
            Sender Reputation & Deliverability
          </h2>
          <p className="mt-1 text-sm text-[#687169]">
            Monitor DNS health, inbox placement, and automate IP/Domain warmup via specialized providers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9d2c1] bg-white text-[#687169] shadow-sm hover:border-[#176b5d] hover:text-[#176b5d] transition-colors"
            title="Refresh DNS & Warmup Stats"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#176b5d] px-4 py-2.5 text-sm font-black text-white hover:bg-[#115247] shadow-sm transition-all"
          >
            <Plus size={18} /> Connect Domain
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Domain Selector Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-[#d9d2c1] bg-white p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#687169] mb-4">Connected Domains</h3>
            <div className="space-y-2">
              {domains.length === 0 && (
                <div className="text-xs text-[#687169] py-2">No domains connected yet.</div>
              )}
              {domains.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.domain)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedDomain === d.domain 
                      ? "border-[#176b5d] bg-[#f3faf7] ring-1 ring-[#176b5d]/20" 
                      : "border-transparent hover:bg-[#f7f5ef]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe size={16} className={selectedDomain === d.domain ? "text-[#176b5d]" : "text-[#a39b8b]"} />
                    <span className={`text-sm font-bold ${selectedDomain === d.domain ? "text-[#176b5d]" : "text-[#1e2521]"}`}>
                      {d.domain}
                    </span>
                  </div>
                  {d.warmupStatus === "ACTIVE" && <Activity size={14} className="text-emerald-500 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="rounded-2xl border border-[#cfe7de] bg-[#f3faf7] p-5 shadow-sm">
            <h3 className="text-sm font-black text-[#176b5d] flex items-center gap-2 mb-2">
              <Flame size={16} /> Advanced Deliverability
            </h3>
            <p className="text-xs leading-relaxed text-[#4f5a53] mb-4">
              Native deliverability automation is available as a Pro feature. Currently integrated with specialized external tools for warmup.
            </p>
            <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-white border border-[#176b5d]/20 px-3 py-2 text-xs font-bold text-[#176b5d] hover:bg-[#176b5d] hover:text-white transition-colors">
              Upgrade to Pro <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* Main Dashboard Area */}
        <div className="lg:col-span-3 space-y-6">
          {currentDomain ? (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[#d9d2c1] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-[#687169]">
                      <Inbox size={16} /> Inbox Placement
                    </div>
                    <TrendingUp size={16} className={(currentDomain.inboxPlacementRate ?? 0) >= 95 ? "text-emerald-500" : "text-amber-500"} />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-[#1e2521]">{currentDomain.inboxPlacementRate?.toFixed(1) ?? "--"}%</span>
                    <span className="text-sm font-bold text-[#687169] mb-1">last 7 days</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d9d2c1] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-[#687169]">
                      <AlertTriangle size={16} /> Spam Score
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-black ${(currentDomain.spamScore ?? 10) < 2 ? "text-emerald-600" : "text-red-600"}`}>
                      {currentDomain.spamScore?.toFixed(1) ?? "--"}
                    </span>
                    <span className="text-sm font-bold text-[#687169] mb-1">/ 10.0</span>
                  </div>
                </div>

            <div className="rounded-2xl border border-[#d9d2c1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-[#687169]">
                  <Activity size={16} /> Warmup Status
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${currentDomain.warmupStatus === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                <span className="text-xl font-black text-[#1e2521]">{currentDomain.warmupStatus}</span>
              </div>
              <div className="mt-3 text-xs font-bold text-[#687169]">
                {currentDomain.warmupSentToday} sent / {currentDomain.warmupReceivedToday} received today
              </div>
            </div>
          </div>

          {/* DNS Health */}
          <div className="rounded-2xl border border-[#d9d2c1] bg-white overflow-hidden shadow-sm">
            <div className="border-b border-[#f0ece3] bg-[#fcfbf9] px-6 py-4 flex flex-row justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-[#1e2521]">DNS Authentication Health</h3>
                <p className="text-xs text-[#687169] mt-1">Essential records to bypass spam filters</p>
              </div>
              <button className="text-xs font-bold text-[#176b5d] flex items-center gap-1 hover:underline">
                <Settings size={14} /> DNS Settings
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusBadge status={currentDomain.spfStatus} label="SPF Record" />
                <StatusBadge status={currentDomain.dkimStatus} label="DKIM Record" />
                <StatusBadge status={currentDomain.dmarcStatus} label="DMARC Policy" />
              </div>

              {currentDomain.dkimStatus === "FAIL" && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Missing DKIM Signature</h4>
                    <p className="text-xs text-red-600 mt-1 leading-relaxed">
                      Emails sent from {currentDomain.domain} are lacking a valid DKIM signature. This heavily impacts inbox placement for Gmail and Outlook. Ensure your DNS CNAME/TXT records match your provider.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warmup Integration */}
          <div className="rounded-2xl border border-[#d9d2c1] bg-white shadow-sm overflow-hidden">
             <div className="border-b border-[#f0ece3] bg-[#fcfbf9] px-6 py-4">
                <h3 className="text-lg font-black text-[#1e2521]">Warmup Integration</h3>
                <p className="text-xs text-[#687169] mt-1">Manage external tool warmup API integration</p>
             </div>
             <div className="p-6">
               <div className="flex items-center justify-between p-4 border border-[#e3dccd] rounded-xl bg-gray-50/50">
                 <div className="flex items-center gap-4">
                   <div className="h-10 w-10 bg-white border border-[#e3dccd] rounded-lg shadow-sm flex items-center justify-center font-black text-[#1e2521] text-lg">
                     W
                   </div>
                   <div>
                     <h4 className="font-bold text-[#1e2521]">Warmup Inbox / Lemwarm</h4>
                     <p className="text-xs text-[#687169]">Connected via API</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   {currentDomain.warmupStatus === "ACTIVE" ? (
                     <button className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-xs font-bold rounded-lg shadow-sm hover:bg-amber-50">
                       Pause Warmup
                     </button>
                   ) : (
                     <button className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-100">
                       Start Warmup
                     </button>
                   )}
                   <button className="p-2 text-[#687169] hover:text-[#1e2521]">
                     <Settings size={18} />
                   </button>
                 </div>
               </div>
             </div>
          </div>
          </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d9d2c1] bg-transparent p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0ece3]">
                <Globe size={20} className="text-[#a39b8b]" />
              </div>
              <h3 className="text-lg font-black text-[#1e2521]">No Domains Connected</h3>
              <p className="mt-2 text-sm text-[#687169] max-w-sm mx-auto">
                Connect your sending domains to monitor DNS health, start email warmup, and track inbox placement.
              </p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#176b5d] px-4 py-2 text-sm font-black text-white hover:bg-[#115247]"
              >
                <Plus size={16} /> Add First Domain
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
