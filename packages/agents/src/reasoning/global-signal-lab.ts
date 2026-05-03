import { getPrisma } from "@leadforge/db";
import { AgentResult } from "../ai-agents";

export type MarketGap = {
  signalName: string;
  prevalence: number; // 0-100%
  description: string;
  industry: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
};

export type GlobalSignalReport = {
  gaps: MarketGap[];
  dominantStrategy: string; // The winning outreach angle for the whole segment
  totalAudited: number;
};

export class GlobalSignalAgent {
  /**
   * Aggregates visual and technical intelligence across an entire industry segment
   */
  static async analyzeMarketSegment(industry: string): Promise<AgentResult<GlobalSignalReport>> {
    const prisma = getPrisma();
    const startedAt = Date.now();

    // 1. Fetch all signals for leads in this industry
    const signals = await prisma.enrichmentSignal.findMany({
      where: {
        kind: "TECHNOGRAPHIC", // We aggregate tech + visual signals
        profile: {
          industry: { equals: industry, mode: 'insensitive' }
        }
      },
      include: {
        profile: true
      }
    });

    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("No API Key configured (OpenAI or Groq)");

    const isGroq = apiKey.startsWith("gsk_");
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = isGroq ? "llama-3.3-70b-versatile" : "gpt-4o";

    // 2. Cluster signals and identify Market Gaps
    const analysisPrompt = `You are a Market Intelligence Strategist. 
Analyze these raw technical and visual signals for the ${industry} industry.
Find the "Dominant Pain Points" that are common across at least 40% of these companies.

Signals: ${JSON.stringify(signals.slice(0, 100))}

Generate a GlobalSignalReport including:
1. Market Gaps: Specific flaws (e.g. "Legacy Mobile Nav", "Missing Trust Badges").
2. Dominant Strategy: A hyper-targeted outreach angle that would work for the WHOLE segment.

Return a JSON object matching the GlobalSignalReport type.`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: analysisPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    const result = await response.json() as any;
    if (!result.choices) throw new Error(`API Error: ${JSON.stringify(result)}`);
    const report = JSON.parse(result.choices[0].message.content) as GlobalSignalReport;

    return {
      data: {
        ...report,
        totalAudited: signals.length
      },
      mode: isGroq ? "groq" : "openai",
      model: model,
      latencyMs: Date.now() - startedAt,
      tokenCount: result.usage?.total_tokens ?? 0
    };
  }
}
