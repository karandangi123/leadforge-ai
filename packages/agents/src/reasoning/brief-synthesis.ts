import { getPrisma } from "@leadforge/db";
import { AgentResult } from "../ai-agents";

export type LeadBrief = {
  executiveSummary: string;
  silverBulletHook: string;
  competitorGap: string;
  visualSignal: string;
  score: number;
};

export class BriefSynthesisAgent {
  /**
   * Synthesizes raw enrichment signals into a high-fidelity sales brief
   */
  static async synthesize(leadId: string): Promise<AgentResult<LeadBrief>> {
    const prisma = getPrisma();
    const startedAt = Date.now();

    // 1. Fetch the lead, its profile, and all raw signals
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        enrichmentProfile: {
          include: {
            signals: true
          }
        },
        workspace: {
          include: { playbook: true }
        }
      }
    });

    if (!lead || !lead.enrichmentProfile) {
      throw new Error("Lead data incomplete for synthesis.");
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    const isGroq = apiKey?.startsWith("gsk_");
    
    // 2. Specialized synthesis prompt
    const systemPrompt = `You are an Elite Sales Strategist. 
Your task is to synthesize raw lead signals into a high-fidelity "Lead Dossier".

Playbook: ${JSON.stringify(lead.workspace.playbook)}
Signals: ${JSON.stringify(lead.enrichmentProfile.signals)}

Output a JSON object with:
- executiveSummary: A 2-sentence strategic overview.
- silverBulletHook: A provocative, value-driven opening hook for an email.
- competitorGap: Specific intelligence on what they are using and why it's failing.
- visualSignal: A specific UI/UX flaw or visual债务 found.
- score: A 1-100 fit score based on the playbook.`;

    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = isGroq ? "llama-3.3-70b-versatile" : "gpt-4o";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    const result = await response.json() as any;
    const brief = JSON.parse(result.choices[0].message.content) as LeadBrief;

    return {
      data: brief,
      mode: isGroq ? "groq" : "openai",
      model: model,
      latencyMs: Date.now() - startedAt,
      tokenCount: result.usage?.total_tokens ?? 0
    };
  }
}
