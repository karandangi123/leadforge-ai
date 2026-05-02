"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Menu, X, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Platform", href: "#features" },
    { name: "Workflow", href: "#workflow" },
    { name: "Audience", href: "#audience" },
    { name: "Pricing", href: "/dashboard?view=billing" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? "py-3 bg-[#02040a]/90 backdrop-blur-2xl border-b border-white/5" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all duration-500">
             <Sparkles size={18} className="text-[#05070D]" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">LeadForge AI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-5 py-2 text-[13px] font-bold text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link 
            href="/dashboard?view=dashboard"
            className="text-sm font-black text-[#94A3B8] hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/dashboard?view=dashboard"
            className="group flex items-center gap-2 bg-white text-[#05070D] px-6 py-3 rounded-xl text-sm font-black transition-all hover:bg-[#22D3EE] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95"
          >
            Launch Dashboard
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-white/70"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#02040a] border-b border-white/5 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-[#94A3B8] hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/5" />
              <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-2 bg-white text-[#05070D] p-4 rounded-xl font-black text-sm"
              >
                Launch Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
