"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Briefcase, 
  Clock, 
  RefreshCw, 
  Plus, 
  Settings, 
  ExternalLink,
  ChevronDown,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  FileText,
  User,
  ArrowRight
} from "lucide-react";

export function CrmHub() {
  const [activeTab, setActiveTab] = useState<"DEALS" | "ACTIVITIES" | "CLIENTS" | "SYNC">("DEALS");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1e2521] flex items-center gap-2">
            <Building2 className="text-[#176b5d]" />
            Agency CRM & Pipeline
          </h2>
          <p className="mt-1 text-sm text-[#687169]">
            Manage client workspaces, track deal stages, monitor activity history, and sync with external CRMs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSync}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[#d9d2c1] bg-white text-[#1e2521] text-sm font-bold shadow-sm hover:border-[#176b5d] transition-colors"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin text-[#176b5d]" : "text-[#687169]"} />
            {isSyncing ? "Syncing HubSpot..." : "Sync CRM"}
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#176b5d] px-4 py-2.5 text-sm font-black text-white hover:bg-[#115247] shadow-sm transition-all">
            <Plus size={18} /> New Deal
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#d9d2c1] pb-px">
        {[
          { id: "DEALS", label: "Deal Pipeline", icon: Briefcase },
          { id: "ACTIVITIES", label: "Activity History", icon: Clock },
          { id: "CLIENTS", label: "Client Workspaces", icon: Building2 },
          { id: "SYNC", label: "CRM Sync Settings", icon: RefreshCw }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab.id 
                ? "border-[#176b5d] text-[#176b5d]" 
                : "border-transparent text-[#687169] hover:text-[#1e2521] hover:border-[#d9d2c1]"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === "DEALS" && <DealPipelineView />}
        {activeTab === "ACTIVITIES" && <ActivityHistoryView />}
        {activeTab === "CLIENTS" && <ClientWorkspacesView />}
        {activeTab === "SYNC" && <CrmSyncSettingsView />}
      </div>
    </div>
  );
}

function DealPipelineView() {
  const stages = [
    { id: "DISCOVERY", label: "Discovery", color: "bg-blue-50 text-blue-700 border-blue-200", count: 3, value: "$45,000" },
    { id: "PROPOSAL", label: "Proposal", color: "bg-amber-50 text-amber-700 border-amber-200", count: 2, value: "$28,000" },
    { id: "NEGOTIATION", label: "Negotiation", color: "bg-purple-50 text-purple-700 border-purple-200", count: 1, value: "$12,000" },
    { id: "WON", label: "Closed Won", color: "bg-emerald-50 text-emerald-700 border-emerald-200", count: 4, value: "$85,000" },
  ];

  const mockDeals = [
    { id: "1", name: "Enterprise RevOps Setup", client: "Acme Corp", amount: "$15,000", stage: "DISCOVERY", closeDate: "Oct 15" },
    { id: "2", name: "Q4 Lead Generation", client: "TechFlow", amount: "$8,500", stage: "PROPOSAL", closeDate: "Oct 22" },
    { id: "3", name: "Outbound Sequences Audit", client: "GlobalNet", amount: "$12,000", stage: "NEGOTIATION", closeDate: "Nov 01" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      {stages.map((stage) => (
        <div key={stage.id} className="flex flex-col rounded-xl border border-[#d9d2c1] bg-[#fcfbf9] overflow-hidden">
          <div className="p-3 border-b border-[#d9d2c1] bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${stage.color}`}>
                {stage.label}
              </span>
              <span className="text-xs font-bold text-[#687169]">{stage.count}</span>
            </div>
            <div className="text-sm font-black text-[#1e2521]">{stage.value}</div>
          </div>
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {mockDeals.filter(d => d.stage === stage.id).map(deal => (
              <div key={deal.id} className="bg-white rounded-lg border border-[#e3dccd] p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab">
                <div className="text-sm font-black text-[#1e2521] mb-1">{deal.name}</div>
                <div className="text-xs text-[#687169] flex items-center gap-1 mb-3">
                  <Building2 size={12} /> {deal.client}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#f0ece3]">
                  <div className="text-xs font-bold text-[#176b5d]">{deal.amount}</div>
                  <div className="text-[10px] text-[#a39b8b] flex items-center gap-1">
                    <Calendar size={10} /> {deal.closeDate}
                  </div>
                </div>
              </div>
            ))}
            {mockDeals.filter(d => d.stage === stage.id).length === 0 && (
              <div className="h-24 border-2 border-dashed border-[#e3dccd] rounded-lg flex items-center justify-center text-xs text-[#a39b8b] font-bold">
                Drop deals here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityHistoryView() {
  const activities = [
    { id: 1, type: "CALL", title: "Discovery Call with Acme Corp", desc: "Discussed Q4 expansion plans. Lead is highly interested in the automated sequence builder.", time: "2 hours ago", icon: Phone, color: "text-blue-600 bg-blue-50" },
    { id: 2, type: "EMAIL", title: "Sent Proposal to TechFlow", desc: "Sent the revised pricing for 5 seats. Awaiting response.", time: "5 hours ago", icon: Mail, color: "text-amber-600 bg-amber-50" },
    { id: 3, type: "CRM_SYNC", title: "HubSpot Sync Completed", desc: "Synced 12 new leads and updated 3 deal stages automatically.", time: "1 day ago", icon: RefreshCw, color: "text-emerald-600 bg-emerald-50" },
    { id: 4, type: "NOTE", title: "Internal Note on GlobalNet", desc: "Legal team approved the MSA. Proceed to final negotiation phase.", time: "2 days ago", icon: FileText, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl border border-[#d9d2c1] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f0ece3] bg-[#fcfbf9] flex items-center justify-between">
          <h3 className="font-black text-[#1e2521]">Timeline</h3>
          <div className="flex gap-2">
            <select className="text-xs border-[#d9d2c1] rounded-md px-2 py-1 outline-none text-[#687169] bg-white">
              <option>All Activities</option>
              <option>Calls & Meetings</option>
              <option>Emails</option>
              <option>CRM Syncs</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          <div className="relative border-l-2 border-[#f0ece3] ml-4 space-y-8 pb-4">
            {activities.map((item) => (
              <div key={item.id} className="relative pl-6">
                <div className={`absolute -left-[17px] top-0.5 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center ${item.color}`}>
                  <item.icon size={14} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-[#1e2521]">{item.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#a39b8b]">{item.time}</span>
                  </div>
                  <p className="text-xs text-[#687169] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientWorkspacesView() {
  const clients = [
    { id: 1, name: "Acme Corp", industry: "SaaS", activeDeals: 2, arr: "$120k", status: "Active" },
    { id: 2, name: "TechFlow", industry: "Fintech", activeDeals: 1, arr: "$45k", status: "Active" },
    { id: 3, name: "GlobalNet", industry: "Telecom", activeDeals: 1, arr: "$80k", status: "Onboarding" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-xl border border-[#d9d2c1] p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-[#f3faf7] border border-[#cfe7de] flex items-center justify-center text-[#176b5d] font-black text-xl">
                {client.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-[#1e2521] text-lg">{client.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#687169]">
                  <span className="flex items-center gap-1"><Briefcase size={12}/> {client.industry}</span>
                  <span className="w-1 h-1 rounded-full bg-[#d9d2c1]" />
                  <span>{client.activeDeals} Active Deals</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:justify-end">
              <div className="text-right">
                <div className="text-xs text-[#687169] uppercase font-bold tracking-wider">Pipeline</div>
                <div className="font-black text-[#176b5d]">{client.arr}</div>
              </div>
              <button className="h-8 w-8 rounded-full bg-[#f7f5ef] text-[#1e2521] flex items-center justify-center hover:bg-[#1e2521] hover:text-white transition-colors">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#fcfbf9] rounded-xl border border-[#d9d2c1] p-5 h-fit">
        <h3 className="font-black text-[#1e2521] mb-2 flex items-center gap-2"><User size={16} /> Agency View</h3>
        <p className="text-xs text-[#687169] mb-4">You are viewing the unified agency pipeline. Selecting a client workspace will filter leads, sequences, and analytics.</p>
        <button className="w-full h-10 border border-dashed border-[#176b5d] text-[#176b5d] font-bold text-sm rounded-lg hover:bg-[#f3faf7] transition-colors">
          + Add New Client
        </button>
      </div>
    </div>
  );
}

function CrmSyncSettingsView() {
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-[#d9d2c1] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f0ece3]">
          <h3 className="text-lg font-black text-[#1e2521]">CRM Integrations</h3>
          <p className="text-xs text-[#687169] mt-1">Connect LeadForge to your source of truth for two-way synchronization.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 border border-[#cfe7de] bg-[#f3faf7] rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center shadow-sm text-orange-500 font-black text-xl border border-[#d9d2c1]">
                H
              </div>
              <div>
                <h4 className="font-bold text-[#1e2521]">HubSpot CRM</h4>
                <p className="text-xs text-[#176b5d] font-bold flex items-center gap-1 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#176b5d] animate-pulse" /> Connected to Agency Portal
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-white border border-[#d9d2c1] text-xs font-bold text-[#1e2521] rounded-lg shadow-sm hover:bg-gray-50">
              Configure Mapping
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-[#e3dccd] bg-[#fcfbf9] rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center shadow-sm text-blue-500 font-black text-xl border border-[#d9d2c1]">
                S
              </div>
              <div>
                <h4 className="font-bold text-[#1e2521]">Salesforce</h4>
                <p className="text-xs text-[#687169] mt-0.5">Enterprise synchronization</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-[#1e2521] text-xs font-bold text-white rounded-lg shadow-sm hover:bg-black">
              Connect
            </button>
          </div>
        </div>
        <div className="p-6 bg-[#fcfbf9] border-t border-[#f0ece3]">
          <h4 className="text-sm font-bold text-[#1e2521] mb-3">Sync Preferences</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="accent-[#176b5d] w-4 h-4" />
              <span className="text-sm text-[#4f5a53]">Automatically push new <b>Closed Won</b> deals to CRM</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="accent-[#176b5d] w-4 h-4" />
              <span className="text-sm text-[#4f5a53]">Sync email activity and calendar meetings to CRM Timeline</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="accent-[#176b5d] w-4 h-4" />
              <span className="text-sm text-[#4f5a53]">Pull Stage changes from CRM into LeadForge</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
