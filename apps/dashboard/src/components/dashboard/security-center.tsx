"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Fingerprint,
  FileText,
  Trash2,
  Plus
} from "lucide-react";
import { addDncEntry, toggleSso } from "@/app/actions/security";

interface SecurityCenterProps {
  initialAuditLogs: any[];
  initialDncEntries: any[];
}

export function SecurityCenter({ initialAuditLogs, initialDncEntries }: SecurityCenterProps) {
  const [activeTab, setActiveTab] = useState<"COMPLIANCE" | "RBAC" | "DNC" | "AUDIT">("COMPLIANCE");

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1e2521] flex items-center gap-2">
            <ShieldCheck className="text-[#176b5d]" />
            Security & Compliance Center
          </h2>
          <p className="mt-1 text-sm text-[#687169]">
            Manage enterprise-grade security, RBAC policies, and regional data compliance (GDPR/CCPA).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3faf7] border border-[#cfe7de] text-[#176b5d] text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 size={12} /> SOC2 Type II Compliant
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#d9d2c1] pb-px">
        {[
          { id: "COMPLIANCE", label: "Regional Compliance", icon: Lock },
          { id: "RBAC", label: "Access Control", icon: Users },
          { id: "DNC", label: "Do Not Contact (DNC)", icon: ShieldAlert },
          { id: "AUDIT", label: "Audit Logs", icon: History }
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
        {activeTab === "COMPLIANCE" && <ComplianceView />}
        {activeTab === "RBAC" && <RbacView />}
        {activeTab === "DNC" && <DncView initialEntries={initialDncEntries} />}
        {activeTab === "AUDIT" && <AuditLogView logs={initialAuditLogs} />}
      </div>
    </div>
  );
}

function ComplianceView() {
  const requirements = [
    { name: "GDPR (EU Data Protection)", status: "ACTIVE", detail: "EU-US Data Privacy Framework active." },
    { name: "CCPA (California Privacy)", status: "ACTIVE", detail: "Right-to-opt-out enabled for all leads." },
    { name: "CAN-SPAM Act", status: "ACTIVE", detail: "Unsubscribe headers automatically included in all drafts." },
    { name: "SOC2 Compliance", status: "PENDING", detail: "Annual audit scheduled for Q4 2026." },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requirements.map((req) => (
          <div key={req.name} className="p-5 rounded-2xl border border-[#d9d2c1] bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-black text-[#1e2521]">{req.name}</h4>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                req.status === "ACTIVE" ? "bg-[#f3faf7] text-[#176b5d] border border-[#cfe7de]" : "bg-[#fefce8] text-[#854d0e] border border-[#fef08a]"
              }`}>
                {req.status}
              </span>
            </div>
            <p className="text-xs text-[#687169] leading-relaxed">{req.detail}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1e2521] rounded-2xl p-6 text-white overflow-hidden relative group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Fingerprint className="text-[#b9ddcf]" size={24} />
            <h3 className="text-lg font-black">SSO & MFA Enforcement</h3>
          </div>
          <p className="text-sm text-[#a39b8b] mb-6 max-w-lg">
            Require SAML SSO (Okta, Azure, Google) and Multi-Factor Authentication for all workspace members.
          </p>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-[#176b5d] text-white text-xs font-black rounded-xl hover:bg-[#115247] transition-all">
              Configure SSO
            </button>
            <button className="px-5 py-2.5 bg-white/10 text-white text-xs font-black rounded-xl hover:bg-white/20 transition-all">
              Enable MFA
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-4 translate-x-1/4 -translate-y-1/4 opacity-20 group-hover:scale-110 transition-transform">
          <ShieldCheck size={160} strokeWidth={1} />
        </div>
      </div>
    </div>
  );
}

function RbacView() {
  const members = [
    { id: 1, name: "Karan Dangi", email: "karan@leadforge.ai", role: "OWNER", status: "ACTIVE" },
    { id: 2, name: "Sarah Chen", email: "sarah@leadforge.ai", role: "ADMIN", status: "ACTIVE" },
    { id: 3, name: "Michael Ross", email: "m.ross@agency.com", role: "OPERATOR", status: "INVITED" },
  ];

  return (
    <div className="bg-white border border-[#d9d2c1] rounded-2xl shadow-sm overflow-hidden">
      <div className="border-b border-[#f0ece3] bg-[#fcfbf9] px-6 py-4 flex items-center justify-between">
        <h3 className="font-black text-[#1e2521]">Workspace Members</h3>
        <button className="flex items-center gap-2 text-xs font-black text-[#176b5d] hover:underline">
          <UserPlus size={14} /> Invite Member
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#f0ece3] text-xs uppercase tracking-wider text-[#687169] bg-[#fffdf8]">
              <th className="px-6 py-3 font-bold">User</th>
              <th className="px-6 py-3 font-bold">Role</th>
              <th className="px-6 py-3 font-bold">Status</th>
              <th className="px-6 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece3]">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-[#fcfbf9] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1e2521]">{m.name}</span>
                    <span className="text-[10px] text-[#687169]">{m.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    m.role === "OWNER" ? "bg-purple-50 text-purple-700" : m.role === "ADMIN" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"
                  }`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs text-[#4f5a53]">
                    <div className={`h-1.5 w-1.5 rounded-full ${m.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-bold text-[#1e2521] hover:underline">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DncView({ initialEntries }: { initialEntries: any[] }) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
      {isAdding && (
        <div className="p-6 rounded-2xl border border-[#d9d2c1] bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="font-black text-[#1e2521] mb-4">Add Suppression Entry</h4>
          <form action={async (formData) => {
            await addDncEntry(formData);
            setIsAdding(false);
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-[#687169] mb-1">Suppression Type</label>
                <select name="type" className="w-full h-10 px-3 rounded-lg border border-[#d9d2c1] bg-[#fffdf8] text-sm">
                  <option value="EMAIL">Email Address</option>
                  <option value="DOMAIN">Entire Domain</option>
                  <option value="PHONE">Phone Number</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-[#687169] mb-1">Value</label>
                <input name="value" placeholder="competitor.com" className="w-full h-10 px-3 rounded-lg border border-[#d9d2c1] bg-[#fffdf8] text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-[#687169] mb-1">Reason (Optional)</label>
              <input name="reason" placeholder="Direct competitor exclusion" className="w-full h-10 px-3 rounded-lg border border-[#d9d2c1] bg-[#fffdf8] text-sm" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setIsAdding(false)} className="h-10 px-4 rounded-xl text-sm font-bold text-[#687169]">Cancel</button>
              <button type="submit" className="h-10 px-6 rounded-xl bg-[#176b5d] text-white text-sm font-black shadow-sm hover:bg-[#115247]">Add Entry</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-[#d9d2c1] rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-[#f0ece3] bg-[#fcfbf9] px-6 py-4 flex items-center justify-between">
            <h3 className="font-black text-[#1e2521]">Suppression List (DNC)</h3>
            <div className="flex gap-2">
               <button 
                 onClick={() => setIsAdding(true)}
                 className="flex items-center gap-2 h-8 px-3 rounded-lg border border-[#d9d2c1] text-xs font-bold text-[#1e2521] bg-white hover:border-[#176b5d]"
               >
                 <Plus size={14} /> Add Entry
               </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#f0ece3] text-xs uppercase tracking-wider text-[#687169] bg-[#fffdf8]">
                  <th className="px-6 py-3 font-bold">Type</th>
                  <th className="px-6 py-3 font-bold">Value</th>
                  <th className="px-6 py-3 font-bold">Reason</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece3]">
                {initialEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#a39b8b] italic">No entries found.</td>
                  </tr>
                ) : initialEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-[#fff4f2]/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-[#687169] border border-[#d9d2c1] px-1.5 py-0.5 rounded uppercase">{e.type}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#1e2521]">{e.value}</td>
                    <td className="px-6 py-4 text-xs text-[#687169]">{e.reason}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-[#cfe7de] bg-[#f3faf7]">
          <h4 className="font-black text-[#176b5d] mb-2 flex items-center gap-2">
            <ShieldAlert size={16} /> Global Suppression
          </h4>
          <p className="text-xs text-[#4f5a53] leading-relaxed mb-4">
            LeadForge automatically prevents outreach to any contact or domain in your DNC list. 
          </p>
          <div className="space-y-3">
             <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="accent-[#176b5d] w-4 h-4" />
                <span className="text-xs text-[#1e2521]">Auto-suppress internal domains</span>
             </label>
             <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="accent-[#176b5d] w-4 h-4" />
                <span className="text-xs text-[#1e2521]">Enable global bounce blacklist</span>
             </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditLogView({ logs }: { logs: any[] }) {
  return (
    <div className="max-w-4xl space-y-4">
       <div className="flex items-center justify-between mb-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a39b8b]" size={14} />
            <input 
              placeholder="Search audit logs..." 
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-[#d9d2c1] bg-[#fffdf8] text-xs outline-none focus:border-[#176b5d]" 
            />
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#d9d2c1] bg-white text-xs font-bold text-[#1e2521]">
                <Filter size={14} /> Export CSV
             </button>
          </div>
       </div>

       <div className="bg-white border border-[#d9d2c1] rounded-2xl shadow-sm overflow-hidden">
         <div className="divide-y divide-[#f0ece3]">
            {logs.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#a39b8b] italic">No activity recorded yet.</div>
            ) : logs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[#fcfbf9] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#f7f5ef] flex items-center justify-center text-[#687169]">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#1e2521] truncate">
                      {log.action} <span className="text-[#a39b8b] font-normal italic">on</span> {log.entityType} ({log.entityId?.slice(-6) ?? "N/A"})
                    </div>
                    <div className="text-[10px] text-[#687169] flex gap-2">
                      <span>{log.userId ?? "SYSTEM"}</span>
                      {log.metadata && <span className="text-[#176b5d]">{JSON.stringify(log.metadata)}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#a39b8b] whitespace-nowrap ml-4">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
         </div>
       </div>
    </div>
  );
}
