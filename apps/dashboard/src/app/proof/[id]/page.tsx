import { getPrisma } from "@leadforge/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Shield, Target, AlertTriangle, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      {/* Premium Header */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black text-sm">LF</div>
            <span className="font-bold tracking-tight">LeadForge <span className="text-zinc-500 font-medium">Forensics</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Confidential Audit for</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              {audit.lead.company}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-20 space-y-20">
        {/* Header Section */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Critical Finding Detected</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-[0.9]">
            {finding?.title || "Visual Intelligence Report"}
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
            Our forensic engine identified a specific bottleneck on <span className="text-white font-medium">{audit.lead.website}</span> that is directly impacting your conversion velocity.
          </p>
        </div>

        {/* Evidence Block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="group relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] bg-zinc-900 p-2">
              <div className="aspect-[16/10] relative rounded-[2.5rem] overflow-hidden">
                <img 
                  src={screenshot?.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"} 
                  alt="Forensic Evidence"
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                />
                {/* Visual Marker Simulation */}
                {finding?.x && finding?.y && (
                  <div 
                    className="absolute w-12 h-12 rounded-full border-4 border-emerald-500 bg-emerald-500/20 animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center"
                    style={{ left: `${finding.x}%`, top: `${finding.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-zinc-500 italic text-sm">
              <Shield className="w-4 h-4" />
              Verified Forensic Evidence • Timestamp: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-32">
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 backdrop-blur-3xl space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Target className="w-4 h-4" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Business Impact</h4>
                </div>
                <p className="text-lg text-zinc-200 leading-relaxed font-medium">
                  {finding?.businessImpact || "This issue creates friction in the primary user flow, likely leading to premature exits."}
                </p>
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4 text-zinc-400">
                  <Shield className="w-4 h-4" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Suggested Resolution</h4>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  {finding?.fixSuggestion || "Consider optimizing the visual hierarchy of your primary call-to-action."}
                </p>
              </div>

              <div className="pt-8">
                <button className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 group shadow-2xl">
                  Get Full Website Audit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Powered by</p>
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
