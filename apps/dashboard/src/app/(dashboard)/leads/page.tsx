"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Plus, 
  Zap, 
  User, 
  Globe, 
  Mail, 
  Phone, 
  Target,
  ArrowUpDown,
  RefreshCw,
  MoreHorizontal
} from "lucide-react";
import { getLeads, updateLeadStatus } from "@/app/actions/leads";
import { toast } from "sonner";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredLeads = leads.filter(lead => 
    lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Leads Management</h1>
          <p className="text-zinc-500 mt-1">Manage, enrich, and orchestrate your outbound pipeline.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leads.length, icon: User, color: "text-blue-500" },
          { label: "High Fit", value: leads.filter(l => (l.fitScore || 0) > 80).length, icon: Target, color: "text-emerald-500" },
          { label: "Need Audit", value: leads.filter(l => l.status === 'NEW').length, icon: Zap, color: "text-amber-500" },
          { label: "Synced", value: leads.filter(l => l.status === 'SYNCED').length, icon: Globe, color: "text-purple-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex justify-between items-center bg-zinc-900/20 p-2 rounded-2xl border border-zinc-800/50">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search leads, companies, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-zinc-800 mx-2" />
          <button 
            onClick={loadLeads}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-bottom border-zinc-800/50 bg-zinc-900/40">
              <th className="p-4 w-12">
                <input 
                  type="checkbox" 
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900" 
                />
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Company / Contact</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fit Score</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Last Action</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="p-8 text-center text-zinc-700">Loading lead intelligence...</td>
                </tr>
              ))
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <User className="w-8 h-8 text-zinc-800" />
                    <p className="text-zinc-500 font-medium">No leads found matching your search.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-800/20 transition-colors group">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleSelectLead(lead.id)}
                      className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900" 
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-400 font-bold group-hover:border-emerald-500/30 transition-colors">
                        {lead.company[0]}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-100">{lead.company}</div>
                        <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                          {lead.contactName || "No contact"} 
                          {lead.website && <span className="text-[8px] opacity-30">•</span>}
                          {lead.website && <span className="opacity-60">{lead.website}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight ${
                      lead.status === 'NEW' ? 'bg-zinc-800 text-zinc-400' :
                      lead.status === 'AUDIT' ? 'bg-amber-500/10 text-amber-500' :
                      lead.status === 'READY' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            (lead.fitScore || 0) > 80 ? 'bg-emerald-500' :
                            (lead.fitScore || 0) > 50 ? 'bg-amber-500' : 'bg-zinc-600'
                          }`} 
                          style={{ width: `${lead.fitScore || 0}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-400">{lead.fitScore || 0}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-zinc-300">{lead.nextAction || "Start research"}</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">Updated 2h ago</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-500 transition-all">
                        <Zap className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
