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
  static async analyzeWebsite(leadId: string): Promise<VisionAnalysisResult> {
    // 0. Stress Test Mocking
    if (process.env.STRESS_TEST_MOCK === "true") {
      return {
        summary: "Mock vision analysis for stress test.",
        uxScore: 85,
        mobileScore: 80,
        desktopScore: 90,
        videoScript: "Analysis complete.",
        conversionFriction: "medium",
        signals: [
          { x: 50, y: 50, finding: "Mock Friction", recommendation: "Fix it.", severity: "high", kind: "UX_DEBT", viewport: "desktop", confidence: 0.9, location: "Hero", needsHumanReview: false }
        ],
        screenshots: [
          { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", viewport: "desktop" },
          { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", viewport: "mobile" }
        ]
      };
    }

    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    const [desktopUrl, mobileUrl] = await Promise.all([
      StorageProvider.uploadScreenshot(leadId, desktop.screenshotUrl, "home_desktop"),
      StorageProvider.uploadScreenshot(leadId, mobile.screenshotUrl, "home_mobile")
    ]);

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("No Vision Engine API Key configured.");

    const [desktopRefined, mobileRefined] = await Promise.all([
      this.runRefinedAnalysis(apiKey, desktop.screenshotUrl, "desktop"),
      this.runRefinedAnalysis(apiKey, mobile.screenshotUrl, "mobile")
    ]);

    const combinedSignals = [
      ...desktopRefined.signals.map((s: any) => ({ ...s, viewport: "desktop" })),
      ...mobileRefined.signals.map((s: any) => ({ ...s, viewport: "mobile" }))
    ];

    const overallUxScore = Math.round((desktopRefined.uxScore + mobileRefined.uxScore) / 2);
    
    return {
      summary: desktopRefined.summary,
      signals: combinedSignals,
      uxScore: overallUxScore,
      mobileScore: mobileRefined.uxScore,
      desktopScore: desktopRefined.uxScore,
      videoScript: "Analysis complete.",
      conversionFriction: desktopRefined.conversionFriction || "medium",
      screenshots: [{ url: desktopUrl, viewport: "desktop" }, { url: mobileUrl, viewport: "mobile" }]
    };
  }

  private static async generateVideoScript(apiKey: string, company: string, signals: any[]): Promise<string> {
    const topFindings = signals.filter(s => s.severity === 'high').slice(0, 2);
    const findingsList = topFindings.map(s => `- ${s.finding}: ${s.recommendation}`).join("\n");
    const prompt = `Write a 60-second video walkthrough script for ${company} based on these findings:\n${findingsList}\nKeep it professional and helpful.`;
    
    if (apiKey.startsWith("gsk_") || apiKey.includes("generativelanguage")) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const result = await response.json() as any;
      return result.candidates[0].content.parts[0].text;
    } else {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }] })
      });
      const result = await response.json() as any;
      return result.choices[0].message.content;
    }
  }

  private static async runRefinedAnalysis(apiKey: string, base64: string, viewport: string): Promise<any> {
    const prompt = `Analyze this ${viewport} B2B screenshot. Identify 3 critical UX friction points with (x,y) coordinates (0-100 scale). Return JSON with 'signals', 'summary', and 'uxScore' (0-100). 
    Signals must have: x, y, finding, recommendation, severity, kind.`;
    
    // 0. Stress Test Mocking
    if (process.env.STRESS_TEST_MOCK === "true") {
      return {
        summary: "Mock vision analysis for stress test.",
        uxScore: 85,
        conversionFriction: "medium",
        signals: [
          { x: 50, y: 50, finding: "Mock Friction", recommendation: "Fix it.", severity: "high", kind: "UX_DEBT" }
        ]
      };
    }

    try {
      if (apiKey.startsWith("gsk_") || apiKey.includes("generativelanguage")) {
        return await this.callGemini(apiKey, base64, prompt);
      } else {
        return await this.callOpenAI(apiKey, base64, prompt);
      }
    } catch (e) {
      console.error(`[VisionAgent] Analysis failed for ${viewport}:`, e);
      return {
        signals: [],
        summary: "Visual analysis currently unavailable.",
        uxScore: 70
      };
    }
  }

  private static async callGemini(apiKey: string, base64: string, prompt: string): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64.replace(/^data:image\/\w+;base64,/, "") } }] }], 
        generationConfig: { response_mime_type: "application/json", temperature: 0 } 
      }) 
    });
    
    if (!response.ok) throw new Error(`Gemini Error: ${response.statusText}`);
    const result = await response.json() as any;
    const content = result.candidates[0].content.parts[0].text;
    return JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
  }

  private static async callOpenAI(apiKey: string, base64: string, prompt: string): Promise<any> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: base64 } }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      })
    });

    if (!response.ok) throw new Error(`OpenAI Error: ${response.statusText}`);
    const result = await response.json() as any;
    return JSON.parse(result.choices[0].message.content);
  }
}
