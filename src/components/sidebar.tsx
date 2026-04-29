"use client";

import {
  LayoutDashboard,
  Target,
  Search,
  MessageSquareText,
  ShieldCheck,
  Settings,
  HelpCircle,
  GitBranch,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Command Center", href: "/?view=dashboard" },
  { icon: Search, label: "Intelligence", href: "/?view=intelligence" },
  { icon: Target, label: "Targeting", href: "/?view=targeting" },
  { icon: MessageSquareText, label: "Outreach Queue", href: "/?view=outreach" },
  { icon: ShieldCheck, label: "Security & Evals", href: "/?view=security" },
];

const systemItems = [
  { icon: Settings, label: "Setup", href: "/?view=setup" },
  { icon: HelpCircle, label: "Guide", href: "/?view=guide" },
  { icon: GitBranch, label: "Roadmap", href: "/?view=roadmap" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-100 bg-white flex flex-col flex-shrink-0 h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">LeadForge AI</p>
            <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">v1.0 Stable</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="px-2 mb-2 text-[10px] font-bold uppercase text-gray-400 tracking-widest">Main Operations</p>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
          >
            <item.icon size={18} className="text-gray-400" />
            {item.label}
          </a>
        ))}

        <div className="pt-8">
          <p className="px-2 mb-2 text-[10px] font-bold uppercase text-gray-400 tracking-widest">System</p>
          {systemItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            >
              <item.icon size={18} className="text-gray-400" />
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="p-4 rounded-xl bg-gray-900 text-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)]">
          <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-[0.2em] mb-1">Architected with ⚡️</p>
          <p className="text-xs font-bold">Karan Dangi</p>
          <p className="text-[9px] text-gray-400 mt-1 font-medium leading-relaxed">
            Applied AI Engineer<br/>
            Data Science @ NIT Bhopal
          </p>
        </div>
      </div>
    </aside>
  );
}
