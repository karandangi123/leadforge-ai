"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 bg-[#02040a]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                 <Sparkles size={16} className="text-[#05070D]" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">LeadForge AI</span>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed font-medium">
              LeadForge AI is an autonomous revenue intelligence platform designed to turn broken manual lead generation into automated pipeline velocity.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white mb-6">Product</p>
              <ul className="space-y-4">
                <li><Link href="/dashboard?view=intelligence" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Discovery</Link></li>
                <li><Link href="/dashboard?view=enrichment" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Enrichment</Link></li>
                <li><Link href="/dashboard?view=sequences" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Sequences</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white mb-6">Resources</p>
              <ul className="space-y-4">
                <li><Link href="/dashboard?view=roadmap" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Roadmap</Link></li>
                <li><Link href="/dashboard?view=opensource" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Open Source</Link></li>
                <li><Link href="/dashboard?view=guide" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Guides</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-black uppercase tracking-widest text-white mb-6">Legal</p>
              <ul className="space-y-4">
                <li><Link href="/dashboard?view=security" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/dashboard?view=billing" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
            © 2026 LeadForge AI • Built by Karan Dangi
          </p>
          <div className="flex items-center gap-8">
             <a href="https://github.com/karandangi123" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">GitHub</a>
             <a href="https://linkedin.com/in/karan-dangi-4a672925b" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
