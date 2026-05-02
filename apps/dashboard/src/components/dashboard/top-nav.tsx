"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  Sparkles, 
  Layout, 
  Search, 
  Zap, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  Flame,
  Radar,
  Lightbulb,
  PenSquare,
  FileText,
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  BarChart3,
  Box,
  Target,
  Mail,
  Layers,
  CalendarDays,
  Phone,
  Activity,
  Cpu,
  Terminal,
  Settings,
  BookOpen,
  GitBranch,
  Bell,
  Command,
  CreditCard,
  Code2
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Github } from "@/components/ui/BrandIcons";

const menuItems = [
  {
    label: "Platform",
    id: "platform",
    href: "/dashboard?view=cat-platform",
    items: [
      { icon: LayoutDashboard, label: "Pipeline", detail: "Manage your revenue funnel and lead stages.", href: "/dashboard?view=dashboard" },
      { icon: Zap, label: "Sequences", detail: "Multi-channel automated outreach flows.", href: "/dashboard?view=sequences" },
      { icon: Building2, label: "CRM Hub", detail: "Centralized deal and contact management.", href: "/dashboard?view=crm" },
      { icon: ClipboardCheck, label: "Approvals", detail: "Human-in-the-loop review queue.", href: "/dashboard?view=outreach" },
    ]
  },
  {
    label: "Growth Lab",
    id: "growth",
    href: "/dashboard?view=cat-growth",
    items: [
      { icon: Flame, label: "Roast Lab", detail: "Deep website teardowns and conversion audits.", href: "/dashboard?view=roast" },
      { icon: Radar, label: "Competitor Spy", detail: "Market intelligence and positioning voids.", href: "/dashboard?view=competitor" },
      { icon: Lightbulb, label: "Growth Mode", detail: "AI-driven 90-day execution strategies.", href: "/dashboard?view=growth" },
      { icon: PenSquare, label: "Content Engine", detail: "Founder-grade authority content system.", href: "/dashboard?view=content" },
      { icon: FileText, label: "Proposal Gen", detail: "Close deals with premium proposal packages.", href: "/dashboard?view=proposal" },
    ]
  },
  {
    label: "Intelligence",
    id: "intel",
    href: "/dashboard?view=cat-intel",
    items: [
      { icon: Search, label: "Discovery", detail: "Find high-fit prospects across the web.", href: "/dashboard?view=intelligence" },
      { icon: Box, label: "Enrichment", detail: "Deep-profile leads with real-time data.", href: "/dashboard?view=enrichment" },
      { icon: Target, label: "Playbook", detail: "Define your ICP, tone, and positioning.", href: "/dashboard?view=targeting" },
      { icon: BarChart3, label: "Analytics", detail: "Performance metrics and revenue signals.", href: "/dashboard?view=analytics" },
    ]
  }
];

export function TopNav() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav 
      className="flex items-center gap-4 lg:gap-8 px-4 lg:px-10 h-16 border-b border-white/5 bg-[#02040a]/90 backdrop-blur-xl sticky top-0 z-[60]"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <Link href="/dashboard?view=home" className="flex items-center gap-2 mr-2 lg:mr-4 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md">
           <Sparkles size={16} className="text-[#02040a]" />
        </div>
        <span className="font-black tracking-tighter text-white text-lg hidden sm:block">LeadForge</span>
      </Link>

      <div className="flex items-center gap-0.5 lg:gap-1">
        {/* Direct Dashboard Link */}
        <Link 
          href="/dashboard?view=dashboard"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === "dashboard" ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"}`}
        >
          <LayoutDashboard size={14} className="opacity-40" />
          Dashboard
        </Link>

        {menuItems.map((menu) => {
          const isActiveCategory = currentView === menu.href.split("=")[1];
          return (
            <div 
              key={menu.id} 
              className="relative"
              onMouseEnter={() => setActiveMenu(menu.id)}
            >
              <Link 
                href={menu.href}
                className={`flex items-center gap-1 lg:gap-1.5 px-3 lg:px-4 py-2 rounded-xl text-[13px] lg:text-sm font-bold transition-all ${activeMenu === menu.id || isActiveCategory ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"}`}
              >
                {menu.label}
                <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === menu.id ? "rotate-180" : ""} opacity-40`} />
              </Link>

              <AnimatePresence>
                {activeMenu === menu.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-[320px] lg:w-[520px] bg-[#0D1117] rounded-[2.5rem] border border-white/10 shadow-2xl p-6 lg:p-8 overflow-hidden"
                  >
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--soft-cyan)]/30 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      {menu.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setActiveMenu(null)}
                          className="group flex items-start gap-4 p-3 lg:p-4 rounded-2xl transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#22D3EE] group-hover:text-[#05070D] transition-all shadow-sm">
                            <item.icon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white tracking-tight mb-1">{item.label}</p>
                            <p className="text-[10px] lg:text-[11px] leading-relaxed text-[#94A3B8] line-clamp-1 lg:line-clamp-2 font-medium">{item.detail}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="relative z-10 mt-6 pt-6 border-t border-white/5">
                      <Link 
                        href={menu.href} 
                        onClick={() => setActiveMenu(null)}
                        className="flex items-center justify-between px-5 py-3 rounded-xl bg-white text-[#05070D] text-[10px] font-black uppercase tracking-widest group overflow-hidden relative"
                      >
                         <span className="relative z-10">Open {menu.label} Headquarters</span>
                         <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22D3EE]/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Top-level Pricing Option */}
        <Link 
          href="/dashboard?view=billing"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === "billing" ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"}`}
        >
          <CreditCard size={14} className="opacity-40" />
          Pricing
        </Link>

        {/* Top-level Open Source Option */}
        <Link 
          href="/dashboard?view=opensource"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === "opensource" ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"}`}
        >
          <Code2 size={14} className="opacity-40" />
          Open Source
        </Link>
        
        {/* Resources Dropdown */}
        <div 
          className="relative"
          onMouseEnter={() => setActiveMenu("resources")}
        >
          <Link 
            href="/dashboard?view=cat-resources"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeMenu === "resources" || currentView === "cat-resources" ? "bg-white/10 text-white" : "text-[#94A3B8] hover:text-white"}`}
          >
            Resources
            <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === "resources" ? "rotate-180" : ""} opacity-40`} />
          </Link>

          <AnimatePresence>
            {activeMenu === "resources" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 mt-2 w-[320px] bg-[#0D1117] rounded-[2.5rem] border border-white/10 shadow-2xl p-6 overflow-hidden"
              >
                <div className="relative z-10 flex flex-col gap-2">
                  {[
                    { icon: GitBranch, label: "Roadmap", detail: "Upcoming features.", href: "/dashboard?view=roadmap" },
                    { icon: BookOpen, label: "Guides", detail: "Technical playbooks.", href: "/dashboard?view=guide" },
                    { icon: ShieldCheck, label: "Security", detail: "Compliance & DNC.", href: "/dashboard?view=security" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-center gap-4 p-3 rounded-2xl transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#22D3EE] group-hover:text-[#05070D] transition-all">
                        <item.icon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">{item.label}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 lg:gap-4">
         <button className="p-2 rounded-xl text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#22D3EE] border-2 border-[#02040a] shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
         </button>
         <div className="w-8 h-8 rounded-full bg-[var(--dark-bg)] border border-[var(--accent-cyan)]/20 flex items-center justify-center text-white text-xs font-black shadow-md transition-all cursor-pointer">
           KD
         </div>
      </div>
    </nav>
  );
}
