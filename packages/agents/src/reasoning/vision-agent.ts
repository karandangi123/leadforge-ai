import { getPrisma } from "@leadforge/db";
import { WebCrawler } from "../../../crawler/src/index";
import { AgentResult } from "../ai-agents";
import { StorageProvider, HeyGenAdapter } from "@leadforge/integrations";

export type VisualSignal = {
  kind: "UX_DEBT" | "SOCIAL_PROOF" | "VISUAL_TECH" | "LAYOUT_ISSUE" | "PRICING_FRICTION" | "MOBILE_RESPONSIVE_DEBT";
  severity: "high" | "medium" | "low";
  finding: string;
  recommendation: string;
  location: string;
  confidence: number;
  x: number;
  y: number;
  viewport: "desktop" | "mobile";
  needsHumanReview: boolean;
};

export type VisionAnalysisResult = {
  summary: string;
  signals: VisualSignal[];
  uxScore: number;
  mobileScore: number;
  desktopScore: number;
  videoScript: string;
  videoId?: string;
  conversionFriction: "high" | "medium" | "low";
  screenshots: Array<{ url: string; viewport: "desktop" | "mobile" }>;
};

export class VisionAgent {
  /**
   * Final Evolution: Forensic Audit + AI Video Synthesis (Phase 9.2)
   */
  static async analyzeWebsite(leadId: string): Promise<AgentResult<VisionAnalysisResult>> {
    const prisma = getPrisma();
    const startedAt = Date.now();

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || !lead.website) throw new Error("Lead data unreachable.");
    
    const url = lead.website.startsWith("http") ? lead.website : `https://${lead.website}`;
    const { desktop, mobile } = await WebCrawler.captureForensicPair(url);
    if (!desktop.screenshotUrl || !mobile.screenshotUrl) throw new Error("Visual capture failed.");

    const [desktopUrl, mobileUrl] = await Promise.all([
      StorageProvider.uploadScreenshot(leadId, desktop.screenshotUrl, "home_desktop"),
      StorageProvider.uploadScreenshot(leadId, mobile.screenshotUrl, "home_mobile")
    ]);

    const audit = await prisma.websiteAudit.create({
      data: { leadId, status: "RUNNING" }
    });

    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
      if (!apiKey) throw new Error("Vision Engine API Key Missing.");

      const [desktopRefined, mobileRefined] = await Promise.all([
        this.runRefinedAnalysis(apiKey, desktop.screenshotUrl, "desktop"),
        this.runRefinedAnalysis(apiKey, mobile.screenshotUrl, "mobile")
      ]);

      const combinedSignals = [
        ...desktopRefined.signals.map((s: any) => ({ ...s, viewport: "desktop" })),
        ...mobileRefined.signals.map((s: any) => ({ ...s, viewport: "mobile" }))
      ];

      const overallUxScore = Math.round((desktopRefined.uxScore + mobileRefined.uxScore) / 2);
      const videoScript = await this.generateVideoScript(apiKey, lead.company, combinedSignals);

      // --- NEW: Trigger AI Video Synthesis (Phase 9.2) ---
      const videoJobId = await HeyGenAdapter.generateAuditVideo(videoScript);

      await prisma.$transaction([
        prisma.websiteScreenshot.create({
          data: {
            auditId: audit.id,
            pageType: "home",
            viewport: "desktop",
            imageUrl: desktopUrl,
            score: desktopRefined.uxScore,
            aiAnalysis: desktopRefined as any,
            annotations: {
              create: desktopRefined.signals.map((s: any) => ({
                x: s.x, y: s.y, label: s.finding, recommendation: s.recommendation, severity: s.severity, issueType: s.kind
              }))
            }
          }
        }),
        prisma.websiteScreenshot.create({
          data: {
            auditId: audit.id,
            pageType: "home",
            viewport: "mobile",
            imageUrl: mobileUrl,
            score: mobileRefined.uxScore,
            aiAnalysis: mobileRefined as any,
            annotations: {
              create: mobileRefined.signals.map((s: any) => ({
                x: s.x, y: s.y, label: s.finding, recommendation: s.recommendation, severity: s.severity, issueType: s.kind
              }))
            }
          }
        }),
        prisma.lead.update({
          where: { id: leadId },
          data: { status: "READY", auditScore: overallUxScore }
        }),
        prisma.websiteAudit.update({
          where: { id: audit.id },
          data: { 
            status: "SUCCEEDED", 
            overallScore: overallUxScore,
            desktopScore: desktopRefined.uxScore,
            mobileScore: mobileRefined.uxScore,
            videoScript,
            videoUrl: videoJobId, // Storing job ID as initial URL placeholder
            videoStatus: videoJobId ? "GENERATING" : "PENDING",
            findings: combinedSignals as any,
            completedAt: new Date()
          }
        })
      ]);

      return {
        data: { 
          summary: desktopRefined.summary, 
          signals: combinedSignals, 
          uxScore: overallUxScore,
          mobileScore: mobileRefined.uxScore,
          desktopScore: desktopRefined.uxScore,
          videoScript,
          videoId: videoJobId || undefined,
          conversionFriction: desktopRefined.conversionFriction,
          screenshots: [{ url: desktopUrl, viewport: "desktop" }, { url: mobileUrl, viewport: "mobile" }]
        },
        mode: "video-synthesis-engaged",
        model: "gemini-1.5-flash + heygen",
        latencyMs: Date.now() - startedAt,
        tokenCount: 0
      };

    } catch (error: any) {
      console.error("[VisionAgent] Audit Failed:", error);
      await prisma.websiteAudit.update({ where: { id: audit.id }, data: { status: "FAILED" } });
      throw error;
    }
  }

  private static async generateVideoScript(apiKey: string, company: string, signals: any[]): Promise<string> {
    const topFindings = signals.filter(s => s.severity === 'high').slice(0, 2);
    const findingsList = topFindings.map(s => `- ${s.finding}: ${s.recommendation}`).join("\n");
    const prompt = `Write a 60-second video walkthrough script for ${company} based on these findings:\n${findingsList}\nKeep it professional and helpful.`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
  }

  private static async runRefinedAnalysis(apiKey: string, base64: string, viewport: string): Promise<any> {
    const prompt = `Analyze this ${viewport} B2B screenshot. Identify 3 critical UX friction points with (x,y) coordinates. Return JSON with 'signals', 'summary', and 'uxScore' (0-100).`;
    const response = await this.callGemini(apiKey, base64, prompt);
    return response;
  }

  private static async callGemini(apiKey: string, base64: string, prompt: string): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64.replace(/^data:image\/\w+;base64,/, "") } }] }], generationConfig: { response_mime_type: "application/json", temperature: 0 } }) });
    const result = await response.json();
    return JSON.parse(result.candidates[0].content.parts[0].text);
  }
}
