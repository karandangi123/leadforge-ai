"use client";

import * as React from "react";
import {
  Flame,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  PenSquare,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  ClipboardCheck,
  FileText,
  Activity,
  Terminal,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Pipeline", href: "/?view=dashboard" },
  { icon: Flame, label: "Roast Lab", href: "/?view=roast" },
  { icon: Radar, label: "Competitor Spy", href: "/?view=competitor" },
  { icon: Lightbulb, label: "Growth Mode", href: "/?view=growth" },
  { icon: PenSquare, label: "Content Engine", href: "/?view=content" },
  { icon: FileText, label: "Proposal Generator", href: "/?view=proposal" },
  { icon: Search, label: "Discovery", href: "/?view=intelligence" },
  { icon: Target, label: "Playbook", href: "/?view=targeting" },
  { icon: ClipboardCheck, label: "Approvals", href: "/?view=outreach" },
];

const systemItems = [
  { icon: Activity, label: "Trace Viewer", href: "/?view=traces" },
  { icon: Mail, label: "Mailroom", href: "/?view=mailroom" },
  { icon: Terminal, label: "Prompt Lab", href: "/?view=prompts" },
  { icon: ShieldCheck, label: "Quality Center", href: "/?view=quality" },
  { icon: Settings, label: "Setup", href: "/?view=setup" },
  { icon: HelpCircle, label: "Guide", href: "/?view=guide" },
  { icon: GitBranch, label: "Roadmap", href: "/?view=roadmap" },
];

export function Sidebar() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-100 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
        <button onClick={() => setIsMenuOpen((value) => !value)} className="flex items-center gap-2 group">
          <div
            className={`flex size-10 items-center justify-center rounded-xl bg-[#1e2521] shadow-lg transition-transform duration-300 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          >
            <Sparkles className="text-[#176b5d]" size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1e2521]">LeadForge AI</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#176b5d]">
              {navItems.find((item) => item.href.endsWith(`view=${currentView}`))?.label ?? "Menu"}
            </p>
          </div>
        </button>
      </header>

      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 transform flex-col border-r border-[#e3dccd] bg-[#fdfdfc] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-[#e3dccd] px-8 py-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#176b5d]">Architect</p>
          <h1 className="mt-2 text-xl font-black leading-tight text-[#1e2521]">LeadForge AI</h1>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#687169]">System Active</p>
          </div>
        </div>

        <div className="flex-1 space-y-10 overflow-y-auto px-6 py-10">
          <SidebarSection title="Operations">
            {navItems.map((item) => {
              const active = currentView === new URL(item.href, "https://leadforge.local").searchParams.get("view");
              return (
                <NavLink
                  key={item.label}
                  active={active}
                  icon={item.icon}
                  href={item.href}
                  label={item.label}
                  onNavigate={() => setIsMenuOpen(false)}
                />
              );
            })}
          </SidebarSection>

          <SidebarSection title="Engine Room">
            {systemItems.map((item) => {
              const active = currentView === new URL(item.href, "https://leadforge.local").searchParams.get("view");
              return (
                <NavLink
                  key={item.label}
                  active={active}
                  icon={item.icon}
                  href={item.href}
                  label={item.label}
                  onNavigate={() => setIsMenuOpen(false)}
                />
              );
            })}
          </SidebarSection>
        </div>

        <div className="p-8 border-t border-[#e3dccd]">
          <div className="rounded-2xl bg-[#176b5d]/5 p-4 border border-[#176b5d]/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#176b5d]">v0.1.0 Alpha</p>
            <p className="mt-1 text-xs font-semibold text-[#4f5a53]">Operator-first ROS</p>
          </div>
        </div>
      </div>

      {isMenuOpen ? <div className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm lg:hidden" onClick={() => setIsMenuOpen(false)} /> : null}
    </>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#9a9488]">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function NavLink({
  active,
  icon: Icon,
  href,
  label,
  onNavigate,
}: {
  active: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300 ${
        active 
          ? "bg-[#1e2521] text-white shadow-xl shadow-[#1e2521]/10" 
          : "text-[#687169] hover:bg-white hover:text-[#1e2521] hover:shadow-md hover:shadow-black/5"
      }`}
    >
      <Icon size={18} className={`shrink-0 transition-colors ${active ? "text-[#176b5d]" : "group-hover:text-[#176b5d]"}`} />
      <span className="min-w-0 break-words text-sm font-bold tracking-tight">{label}</span>
      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#176b5d]" />}
    </Link>
  );
}
