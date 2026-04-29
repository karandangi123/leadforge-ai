"use client";

import * as React from "react";
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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Mobile Top Header (Sticky) */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between h-16 px-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <button onClick={toggleMenu} className="flex items-center gap-2 group">
          <div className={`size-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}>
            <Sparkles className="text-emerald-400" size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">LeadForge AI</p>
            <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Menu {isMenuOpen ? 'Open' : 'Closed'}</p>
          </div>
        </button>
      </header>

      {/* Sidebar Content */}
      <div className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8">
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] mb-4 px-4">Menu</p>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${pathname === item.href ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <item.icon size={20} className={pathname === item.href ? 'text-emerald-400' : ''} />
                  <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em] mb-4 px-4">System</p>
            <div className="space-y-1">
              {systemItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${pathname === item.href ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <item.icon size={20} className={pathname === item.href ? 'text-emerald-400' : ''} />
                  <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
