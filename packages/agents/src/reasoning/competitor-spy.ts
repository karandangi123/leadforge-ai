import { getPrisma } from "@leadforge/db";
import { AgentResult } from "../ai-agents";

export type CompetitorSignal = {
  competitorName: string;
  pixelDetected: boolean;
  signatureFound: string; // The specific script or cookie found
  marketPositioning: string; // How to beat them
  ripAndReplaceAngle: string; // The specific icebreaker
};

export type CompetitorSpyResult = {
  competitorsFound: CompetitorSignal[];
  threatLevel: "high" | "medium" | "low";
  summary: string;
};

// Advanced Competitor Signatures Registry
const COMPETITOR_SIGNATURES: Record<string, string[]> = {
  "HubSpot": ["js.hs-scripts.com", "js.hs-analytics.net", "hs-banner"],
  "Salesforce": ["salesforce.com/embeddedservice", "pardot.com"],
  "Intercom": ["widget.intercom.io", "intercom-container"],
  "Drift": ["js.driftt.com", "drift-frame-controller"],
  "Apollo": ["apollo.io/api/v1/tracker"],
  "Clay": ["clay.run", "clay.com/pixel"],
  "Zendesk": ["static.zdassets.com"],
  "Marketo": ["munchkin.marketo.net"],
  "Pipedrive": ["pipedrive.com/lead-booster"],
};

export class CompetitorSpyAgent {
  static async scanForCompetitors(url: string, websiteContent: string): Promise<AgentResult<CompetitorSpyResult>> {
    const startedAt = Date.now();
    const found: CompetitorSignal[] = [];

    // 1. Technical Signature Matching (Deterministic)
    for (const [name, signatures] of Object.entries(COMPETITOR_SIGNATURES)) {
      for (const sig of signatures) {
        if (websiteContent.includes(sig)) {
          found.push({
            competitorName: name,
            pixelDetected: true,
            signatureFound: sig,
            marketPositioning: "", // To be filled by LLM
            ripAndReplaceAngle: "", // To be filled by LLM
          });
          break; // Found this competitor, move to next
        }
      }
    }

    if (found.length === 0) {
      return {
        data: { competitorsFound: [], threatLevel: "low", summary: "No major competitor pixels detected." },
        mode: "local",
        model: "deterministic-scanner",
        latencyMs: Date.now() - startedAt,
        tokenCount: 0
      };
    }

    // 2. LLM Strategic Analysis
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a Competitive Intelligence Strategist. For each detected competitor, provide a 'Rip and Replace' sales angle and market positioning for our product 'LeadForge AI'. LeadForge AI is an agentic growth platform that automates research and outreach with human-level accuracy." 
          },
          { 
            role: "user", 
            content: `Competitors Detected: ${JSON.stringify(found.map(f => f.competitorName))}. Generate strategic angles.` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    const result = await response.json() as any;
    const strategyData = JSON.parse(result.choices[0].message.content);

    // Map strategic data back to found competitors
    const finalFound = found.map(f => ({
      ...f,
      marketPositioning: strategyData[f.competitorName]?.positioning || "N/A",
      ripAndReplaceAngle: strategyData[f.competitorName]?.ripAndReplaceAngle || "N/A",
    }));

    return {
      data: {
        competitorsFound: finalFound,
        threatLevel: finalFound.length > 2 ? "high" : "medium",
        summary: `Detected ${finalFound.length} competitors. Primary target for rip-and-replace: ${finalFound[0].competitorName}.`,
      },
      mode: "openai",
      model: "gpt-4o-spy",
      latencyMs: Date.now() - startedAt,
      tokenCount: result.usage?.total_tokens ?? 0
    };
  }
}
