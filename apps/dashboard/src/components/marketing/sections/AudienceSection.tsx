"use client";

import { motion } from "framer-motion";
import { Building2, Rocket, UserCheck, Users, Search, Home, ArrowRight } from "lucide-react";

export function AudienceSection() {
  const audiences = [
    {
      icon: Building2,
      title: "B2B Agencies",
      desc: "Build client-ready lead pipelines in hours, not weeks.",
      metric: "10x speed"
    },
    {
      icon: Rocket,
      title: "SaaS Startups",
      desc: "Find ICP accounts and launch outbound campaigns faster.",
      metric: "40% conversion"
    },
    {
      icon: UserCheck,
      title: "Freelancers",
      desc: "Get consistent prospects without manual LinkedIn scraping.",
      metric: "5hr/wk saved"
    },
    {
      icon: Users,
      title: "Sales Teams",
      desc: "Prioritize high-intent accounts and automate outreach.",
      metric: "3x meetings"
    },
    {
      icon: Search,
      title: "Recruiters",
      desc: "Source candidates and companies with enriched data.",
      metric: "Verified data"
    },
    {
      icon: Home,
      title: "Real Estate",
      desc: "Find local business owners and expansion opportunities.",
      metric: "Local growth"
    }
  ];

  return (
    <section id="audience" className="py-32 relative overflow-hidden bg-white/5">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
              Built for every growth engine.
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto font-medium">
              Whether you're an agency scaling for clients or a startup finding your first 100 users, LeadForge AI provides the data and intelligence you need.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {audiences.map((audience, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-8 rounded-[2.5rem] bg-[#0D1117] border border-white/5 hover:border-[#22D3EE]/30 transition-all group relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#22D3EE]/5 blur-3xl group-hover:bg-[#22D3EE]/10 transition-all pointer-events-none" />
              
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-8 group-hover:bg-[#22D3EE] group-hover:text-[#05070D] transition-all">
                <audience.icon size={24} />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{audience.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-8 font-medium">
                {audience.desc}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22D3EE]">
                  {audience.metric}
                </span>
                <div className="text-white/20 group-hover:text-white transition-colors">
                  <ArrowRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
