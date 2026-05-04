"use client";

import React from "react";
import { 
  Shield, 
  Radar, 
  Target, 
  Settings, 
  Activity, 
  LayoutDashboard,
  Search,
  Bell,
  Plus
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function WarRoomShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-obsidian text-white selection:bg-leadforge-blue/30 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-obsidian scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Radar, label: "War Room", href: "/war-room" },
    { icon: Target, label: "Approvals", href: "/approvals" },
    { icon: Activity, label: "Activity", href: "/activity" },
    { icon: Shield, label: "Security", href: "/security" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-[80px] lg:w-[240px] border-r border-steel bg-zircon flex flex-col transition-all duration-300 z-50">
      <div className="h-20 flex items-center px-6 gap-3">
        <div className="w-8 h-8 rounded-lg bg-leadforge-blue flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <span className="font-black tracking-tighter text-xl lg:block hidden">LEADFORGE</span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? "bg-leadforge-blue/10 text-leadforge-blue border border-leadforge-blue/20" 
                : "text-mist hover:text-white hover:bg-steel"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-leadforge-blue" : "group-hover:scale-110 transition-transform"}`} />
              <span className="font-bold text-sm lg:block hidden">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-leadforge-blue shadow-[0_0_10px_rgba(59,130,246,1)] lg:block hidden" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-steel lg:block hidden">
        <div className="p-4 rounded-2xl bg-steel/50 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-mist">
            <span>System Health</span>
            <span className="text-emerald flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              Online
            </span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-leadforge-blue w-[92%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="h-20 border-b border-steel bg-obsidian/50 backdrop-blur-xl px-8 flex items-center justify-between z-40 sticky top-0">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative max-w-md w-full lg:block hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
          <input 
            type="text" 
            placeholder="Engage forensic lens (enter URL)..." 
            className="w-full bg-zircon border border-steel rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-leadforge-blue focus:ring-4 focus:ring-leadforge-blue/5 transition-all text-white placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-xl border border-steel hover:bg-steel transition-colors relative">
          <Bell className="w-5 h-5 text-mist" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-crimson border-2 border-obsidian" />
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-leadforge-blue hover:text-white transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          New Audit
        </button>
        <div className="w-10 h-10 rounded-xl bg-steel border border-white/10 flex items-center justify-center font-bold text-xs">
          KD
        </div>
      </div>
    </header>
  );
}
