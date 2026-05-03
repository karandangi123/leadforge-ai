import { getPrisma } from "@leadforge/db";
import { AgentResult } from "../ai-agents";

export type ProspectingSignature = {
  targetCompetitors: string[];
  targetTechnicalGaps: string[];
  targetIndustries: string[];
  reasoning: string;
};

export type NewLeadsFound = {
  signature: ProspectingSignature;
  leadsFound: Array<{ company: string; website: string; reason: string }>;
};

export class ProspectingLoopAgent {
  /**
   * Analyzes past successful pivots and generates a new prospecting signature
   */
  static async analyzeSuccessAndProspect(): Promise<AgentResult<NewLeadsFound>> {
    const prisma = getPrisma();
    const startedAt = Date.now();

    // 1. Fetch successful agent traces (where healing led to a positive outcome)
    // In a real app, you'd filter by a 'converted' or 'replied' flag
    const successfulTraces = await prisma.agentTrace.findMany({
      where: { 
        agentName: "Sequence Healer",
        status: "SUCCEEDED"
      },
      take: 50,
      orderBy: { createdAt: "desc" }
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    // 2. Extract the "Winning Pattern" using GPT-4o
    const analysisPrompt = `You are a Growth Intelligence Lead. 
Analyze these successful sales pivots and identify the "Winning Signature".
What do these leads have in common? (Competitors, technical flaws, etc.)

Successful Data: ${JSON.stringify(successfulTraces)}

Based on this, generate a ProspectingSignature that we can use to find NEW leads.
Then, simulate 5 NEW companies that fit this signature perfectly.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: analysisPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    const result = await response.json() as any;
    const prospectingData = JSON.parse(result.choices[0].message.content) as NewLeadsFound;

    // 3. (Optional) Auto-ingest into DB
    // Here we would call the Apollo/LinkedIn API to get real data

    return {
      data: prospectingData,
      mode: "openai",
      model: "gpt-4o-prospector",
      latencyMs: Date.now() - startedAt,
      tokenCount: result.usage?.total_tokens ?? 0
    };
  }
}
