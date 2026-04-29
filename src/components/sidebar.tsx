"use client";

import * as React from "react";
import {
  Flame,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Pipeline", href: "/?view=dashboard" },
  { icon: Flame, label: "Roast Lab", href: "/?view=roast" },
  { icon: Radar, label: "Competitor Spy", href: "/?view=competitor" },
  { icon: Lightbulb, label: "Growth Mode", href: "/?view=growth" },
  { icon: Search, label: "Discovery", href: "/?view=intelligence" },
  { icon: Target, label: "Playbook", href: "/?view=targeting" },
  { icon: ClipboardCheck, label: "Approvals", href: "/?view=outreach" },
];

const systemItems = [
  { icon: ShieldCheck, label: "Security & Evals", href: "/?view=security" },
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
            className={`flex size-10 items-center justify-center rounded-xl bg-gray-900 shadow-lg transition-transform duration-300 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          >
            <Sparkles className="text-emerald-400" size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">LeadForge AI</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-600">
              {navItems.find((item) => item.href.endsWith(`view=${currentView}`))?.label ?? "Menu"}
            </p>
          </div>
        </button>
      </header>

      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 transform flex-col border-r border-gray-100 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-gray-100 px-6 py-7">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">LeadForge AI</p>
          <h1 className="mt-2 text-lg font-black leading-tight text-gray-900">Pipeline Command Layer</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Run the operator workflow, then open the viral demo lab when you want a feature people instantly try and share.</p>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-8">
          <SidebarSection title="Workspace">
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

          <SidebarSection title="System">
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
      </div>

      {isMenuOpen ? <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setIsMenuOpen(false)} /> : null}
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
      <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{title}</p>
      <div className="space-y-1">{children}</div>
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
      className={`flex items-start gap-4 rounded-2xl px-4 py-3 transition-all duration-200 ${
        active ? "bg-gray-900 text-white shadow-lg shadow-gray-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon size={20} className={`mt-0.5 shrink-0 ${active ? "text-emerald-400" : ""}`} />
      <span className="min-w-0 break-words text-sm font-semibold tracking-wide">{label}</span>
    </Link>
  );
}
