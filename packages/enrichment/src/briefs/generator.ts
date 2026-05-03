import { getPrisma } from "@leadforge/db";
import { AgentResult } from "@leadforge/agents";

export type IntelligenceBrief = {
  executiveSummary: string; // "Why this lead is ready to buy now"
  silverBulletHook: string; // "Mention their broken pricing page and recent hiring..."
  competitorGap: string; // "Currently use [X], but traffic dropped 20%..."
  painPoints: Array<{ title: string; evidence: string; severity: "critical" | "high" | "medium" }>;
  technicalAudit: {
    stack: string[];
    vulnerabilities: string[];
    growthSignals: string[];
  };
  socialSentiment: {
    intentSignals: string[];
    recentInteractions: string[];
  };
};

export class BriefGenerator {
  static async generate(leadId: string): Promise<AgentResult<IntelligenceBrief>> {
    const prisma = getPrisma();
    const startedAt = Date.now();

    // 1. Aggregrate ALL signals from the DB
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        enrichmentProfile: true,
        agentTraces: {
          orderBy: { createdAt: "desc" },
          take: 20
        },
        websiteAudits: true,
        workspace: { include: { playbook: true } }
      }
    });

    if (!lead) throw new Error("Lead not found");

    // 2. Synthesize with GPT-4o
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    const systemPrompt = `You are a Senior Revenue Strategist.
Your task is to synthesize all available intelligence on a lead into an "Elite Intelligence Brief".
This brief will be used by a high-ticket sales rep to close the deal.

Available Data:
- Lead Info: ${JSON.stringify(lead)}
- Product Playbook: ${JSON.stringify(lead.workspace.playbook)}

Output a JSON object matching the IntelligenceBrief type. Make it extremely aggressive, specific, and accurate.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Synthesize the dossier into an Intelligence Brief." }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    const result = await response.json() as any;
    const brief = JSON.parse(result.choices[0].message.content) as IntelligenceBrief;

    return {
      data: brief,
      mode: "openai",
      model: "gpt-4o-brief-master",
      latencyMs: Date.now() - startedAt,
      tokenCount: result.usage?.total_tokens ?? 0
    };
  }
}
