import { getPrisma } from "@leadforge/db";
import { AgentResult } from "../ai-agents";

export type OutreachDraft = {
  subject: string;
  body: string;
  silverBullet: string; // The core insight used
  visualProofUrl?: string; // Link to the screenshot of the pain point
};

export class OutreachAgent {
  /**
   * Generates hyper-personalized outreach based on a Live Audit
   */
  static async generateContextAwareDraft(leadId: string, stepNumber: number): Promise<AgentResult<OutreachDraft>> {
    const prisma = getPrisma();
    const startedAt = Date.now();

    // 1. Get the latest audit intelligence
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        enrichmentProfile: true,
        workspace: { include: { playbook: true } }
      }
    });

    if (!lead || !lead.enrichmentProfile) throw new Error("Lead intelligence not found. Run audit first.");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    // 2. Specialized Copywriting Prompt
    const systemPrompt = `You are an Elite Sales Copywriter. 
Your goal is to beat Lemlist by generating outreach that is impossible to ignore.
Instead of generic flattery, you will use "Forensic Evidence" from our Live Audit.

Audit Data: ${lead.enrichmentProfile.description}
Playbook: ${JSON.stringify(lead.workspace.playbook)}
Step Number: ${stepNumber}

Guidelines:
- Step 1: Focus on the "Primary Pain" (Silver Bullet). Mention a specific technical or visual flaw.
- Step 2-N: Add value based on a secondary signal (Competitor Gap or Growth Marker).
- Tone: Professional, slightly provocative, and high-value. Avoid "marketing speak".
- Format: Keep it short (under 100 words).

Output a JSON object with 'subject', 'body', and 'silverBullet'.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o", // Use high-fidelity for copy quality
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate Step ${stepNumber} for ${lead.company}.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      }),
    });

    const result = await response.json() as any;
    const draft = JSON.parse(result.choices[0].message.content) as OutreachDraft;

    return {
      data: draft,
      mode: "openai",
      model: "gpt-4o-outreach",
      latencyMs: Date.now() - startedAt,
      tokenCount: result.usage?.total_tokens ?? 0
    };
  }
}
