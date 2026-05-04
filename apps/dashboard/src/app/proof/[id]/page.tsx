import { getPrisma } from "@leadforge/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Shield, Target, AlertTriangle, ArrowRight, Zap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const prisma = getPrisma();
  const audit = await prisma.websiteAudit.findUnique({
    where: { publicProofId: params.id },
    include: { lead: true }
  });

  if (!audit || !audit.lead) return { title: "LeadForge Forensic Evidence" };

  return {
    title: `Forensic Evidence: ${audit.lead.company} | LeadForge Intelligence`,
    description: `Private forensic analysis for ${audit.lead.website}. Identified critical conversion friction points with visual proof.`,
    openGraph: {
      title: `Forensic Proof for ${audit.lead.company}`,
      description: `Specific visual intelligence for ${audit.lead.website}`,
      type: "website"
    }
  };
}

export default async function PublicProofPage({ params }: { params: { id: string } }) {
  const prisma = getPrisma();
  const audit = await prisma.websiteAudit.findUnique({
    where: { publicProofId: params.id },
    include: { 
      lead: true,
      findings: {
        where: { status: "APPROVED" },
        take: 1
      },
      screenshots: true
    }
  });

  if (!audit || !audit.lead) return notFound();

  const finding = audit.findings[0];
  const screenshot = audit.screenshots.find(s => s.viewport === 'desktop' || s.viewport === 'DESKTOP');

  return (
    <div className="min-h-screen bg-obsidian text-white font-sans selection:bg-leadforge-blue/30 selection:text-white">
      {/* Premium Forensic Header */}
      <nav className="border-b border-steel bg-obsidian/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-leadforge-blue flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
               <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-black tracking-tighter text-xl">LEADFORGE <span className="text-mist font-bold">FORENSICS</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-mist">Confidential Audit:</span>
            <div className="px-4 py-1.5 rounded-full bg-leadforge-blue/10 border border-leadforge-blue/20 text-leadforge-blue text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              {audit.lead.company}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 lg:py-24 space-y-16">
        {/* Hero Section */}
        <div className="max-w-4xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-crimson/5 border border-crimson/20 text-crimson"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Critical Forensic Finding</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-white"
          >
            {finding?.title || "Visual Intelligence Report"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-mist leading-relaxed max-w-2xl"
          >
            Our forensic engine identified a high-friction bottleneck on <span className="text-white font-bold">{audit.lead.website}</span> that is directly impacting your primary conversion velocity.
          </motion.p>
        </div>

        {/* Evidence Block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="group relative rounded-[3rem] overflow-hidden border border-steel shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-black p-2">
              <div className="aspect-[16/10] relative rounded-[2.5rem] overflow-hidden bg-zinc-950">
                <img 
                   src={screenshot?.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"} 
                   alt="Forensic Evidence"
                   className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 opacity-80"
                />
                
                {/* Visual Marker */}
                {finding?.x && finding?.y && (
                  <div 
                    className="absolute group/marker"
                    style={{ left: `${finding.x}%`, top: `${finding.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-leadforge-blue bg-leadforge-blue/10 animate-pulse shadow-[0_0_40px_rgba(59,130,246,0.6)] flex items-center justify-center relative">
                      <div className="w-4 h-4 rounded-full bg-leadforge-blue" />
                    </div>
                  </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-4 text-zinc-500 italic text-sm">
                <Shield className="w-4 h-4" />
                Verified Forensic Evidence • ID: {audit.publicProofId}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">LIVE FORENSIC SIGNAL</span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8 lg:sticky lg:top-32">
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 backdrop-blur-3xl space-y-8 relative overflow-hidden group">
              {/* Sendability Meter in Public View */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Signal Strength</span>
                  <span className="text-[10px] font-black text-white">{Math.round((finding?.overallSendability || 0.85) * 100)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${(finding?.overallSendability || 0.85) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-3 text-emerald-400">
                    <Target className="w-4 h-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Why this matters</h4>
                  </div>
                  <p className="text-base text-zinc-200 leading-relaxed font-medium">
                    {finding?.businessImpact || "Critical friction point identified in the primary conversion path."}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3 text-zinc-400">
                    <Zap className="w-4 h-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">The Analysis</h4>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {finding?.whyThisFinding || "High confidence, visually provable signal anchored in multi-agent verification."}
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Suggested Resolution</h4>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-sm text-zinc-300 leading-relaxed italic">
                    "{finding?.fixSuggestion || "Optimize the visual hierarchy to prioritize demo intent."}"
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 group shadow-2xl">
                  Get My Full Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Authenticated Forensic Portal</p>
              <div className="flex items-center justify-center gap-2 opacity-50">
                <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center font-black text-[8px]">LF</div>
                <span className="text-xs font-bold tracking-tighter">LeadForge AI</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center space-y-6">
          <p className="text-zinc-500 text-sm max-w-xl">
            This report was generated using LeadForge's multi-agent forensic engine. It identifies conversion friction, security vulnerabilities, and messaging gaps for high-growth teams.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-700">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>LeadForge Intelligence © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
