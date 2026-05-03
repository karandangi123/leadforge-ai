import { getPrisma } from "@leadforge/db";
import { AgentResult } from "../ai-agents";

export type RejectionCategory = 
  | "HAPPY_WITH_COMPETITOR" 
  | "WRONG_PERSON" 
  | "PRICE" 
  | "BAD_TIMING" 
  | "NOT_INTERESTED_IN_TOPIC";

export type HealingPivot = {
  category: RejectionCategory;
  analysis: string;
  newAngle: string;
  nextStepDraft: string;
  confidence: number;
};

export class SequenceHealerAgent {
  /**
   * Analyzes a rejection and suggests a strategic pivot based on discovered intelligence
   */
  static async healSequence(leadId: string, replyText: string): Promise<AgentResult<HealingPivot>> {
    const prisma = getPrisma();
    const startedAt = Date.now();

    // 1. Get Lead Dossier (Intelligence already discovered)
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        enrichmentProfile: true,
        agentTraces: true,
        workspace: { include: { playbook: true } }
      }
    });

    if (!lead) throw new Error("Lead not found");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    // 2. Multi-Phase Reasoning with GPT-4o
    const systemPrompt = `You are an Elite Objection Handling Agent. 
Analyze the lead's rejection reply. Your goal is to "Heal" the sequence by pivoting to a SECONDARY signal we discovered about them.

Discovered Dossier: ${lead.enrichmentProfile?.description}
Outreach Playbook: ${JSON.stringify(lead.workspace.playbook)}

Rules:
1. If they say "Happy with [Competitor]", acknowledge it but pivot to a DIFFERENT pain point (e.g. UX debt or performance).
2. If they are the "Wrong Person", ask for the correct referral but suggest a value-add for that person.
3. Be human, respectful, and persistent (the "Elite Rep" mindset).

Return a JSON object matching the HealingPivot type.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Lead Reply: "${replyText}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    const result = await response.json() as any;
    const pivot = JSON.parse(result.choices[0].message.content) as HealingPivot;

    // 3. Log the "Healing Trace"
    await prisma.agentTrace.create({
      data: {
        leadId,
        agentName: "Sequence Healer",
        status: "SUCCEEDED",
        input: { replyText, category: pivot.category },
        output: { analysis: pivot.analysis, newAngle: pivot.newAngle }
      }
    });

    return {
      data: pivot,
      mode: "openai",
      model: "gpt-4o-healer",
      latencyMs: Date.now() - startedAt,
      tokenCount: result.usage?.total_tokens ?? 0
    };
  }
}
