import { PromptKind, getPrisma } from "@leadforge/db";
import { type AgentResult } from "../ai-agents";
import { ModelRouter } from "../model-router";
import { PromptRegistry } from "../prompt-registry";

export type DiscoveryTask = {
  type: "scrape" | "file_check" | "news_search" | "technographic_check";
  target: string; // URL or File path (e.g. /robots.txt)
  objective: string; // e.g. "Check if they use a security header"
  expectedSignal: string; // e.g. "Missing security.txt implies low security maturity"
};

export type ResearchPlan = {
  rationale: string; // Why we are looking for these signals
  hypotheticalPains: string[];
  tasks: DiscoveryTask[];
  inferredICPFit: "high" | "medium" | "low";
};

export class SignalDiscoveryAgent {
  static async generatePlan(
    workspaceId: string,
    leadId: string
  ): Promise<AgentResult<ResearchPlan>> {
    const prisma = getPrisma();
    
    // 1. Fetch Lead and Playbook
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        workspace: {
          include: { playbook: true }
        },
        enrichmentProfile: true
      }
    });

    if (!lead || !lead.workspace.playbook) {
      throw new Error("Lead or Playbook not found");
    }

    const playbook = lead.workspace.playbook;
    const promptInstructions = await PromptRegistry.getPrompt(PromptKind.SIGNAL_DISCOVERY, workspaceId);

    const input = {
      playbook: {
        product: playbook.product,
        idealCustomer: playbook.idealCustomer,
        pains: playbook.pains,
        proofPoints: playbook.proofPoints,
      },
      lead: {
        company: lead.company,
        website: lead.website,
        industry: lead.enrichmentProfile?.industry,
        description: lead.enrichmentProfile?.description,
      }
    };

    const modelConfig = ModelRouter.getModelForKind(PromptKind.SIGNAL_DISCOVERY);
    const startedAt = Date.now();

    // The JSON Schema for the ResearchPlan (remains the same)
    const researchPlanSchema = {
      type: "object",
      required: ["rationale", "hypotheticalPains", "tasks", "inferredICPFit"],
      additionalProperties: false,
      properties: {
        rationale: { type: "string" },
        hypotheticalPains: { type: "array", items: { type: "string" } },
        inferredICPFit: { type: "string", enum: ["high", "medium", "low"] },
        tasks: {
          type: "array",
          items: {
            type: "object",
            required: ["type", "target", "objective", "expectedSignal"],
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["scrape", "file_check", "news_search", "technographic_check", "social_pulse"] },
              target: { type: "string" },
              objective: { type: "string" },
              expectedSignal: { type: "string" }
            }
          }
        }
      }
    };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // ── PHASE 1: GENERATION ───────────────────────────────────────────────────
    const generateRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: promptInstructions },
          { role: "user", content: `Generate a detailed ResearchPlan. You MUST include exactly 3 'Custom Research' questions in the tasks array that will prove if this lead is a high-fit prospect. Input: ${JSON.stringify(input)}` },
        ],
        response_format: { type: "json_schema", json_schema: { name: "research_plan", strict: true, schema: researchPlanSchema } },
        temperature: 0.2,
      }),
    });

    if (!generateRes.ok) throw new Error(`Generation failed: ${generateRes.status}`);
    const generateJson = await generateRes.json() as any;
    const initialPlan = JSON.parse(generateJson.choices[0].message.content) as ResearchPlan;

    // ── PHASE 2: VERIFICATION (The "Elite" Accuracy Layer) ──────────────────────
    // We use a second pass to "Audit" the plan for hallucinations or irrelevant tasks.
    const auditRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use high-reasoning model for the audit
        messages: [
          { 
            role: "system", 
            content: "You are a Quality Control Agent. Audit the following ResearchPlan. Remove any tasks that are impossible to verify, hallucinated, or low-relevance. Ensure every task has a direct 'Signal-to-Pain' correlation." 
          },
          { 
            role: "user", 
            content: `Product Playbook: ${JSON.stringify(input.playbook)}\nInitial Plan: ${JSON.stringify(initialPlan)}` 
          },
        ],
        response_format: { type: "json_schema", json_schema: { name: "research_plan", strict: true, schema: researchPlanSchema } },
        temperature: 0, // Deterministic
      }),
    });

    if (!auditRes.ok) throw new Error(`Audit failed: ${auditRes.status}`);
    const auditJson = await auditRes.json() as any;
    const verifiedPlan = JSON.parse(auditJson.choices[0].message.content) as ResearchPlan;

    // ── PHASE 3: DETERMINISTIC INJECTION ────────────────────────────────────────
    // We add "Ground Truth" tasks that are known to be 100% accurate technical markers
    verifiedPlan.tasks.push({
      type: "technographic_check",
      target: lead.website ?? "unknown",
      objective: "Check for security headers (HSTS, CSP)",
      expectedSignal: "Absence of HSTS/CSP headers confirms low technical debt maturity."
    });

    return {
      data: verifiedPlan,
      mode: "openai",
      model: "gpt-4o-verified",
      latencyMs: Date.now() - startedAt,
      tokenCount: (generateJson.usage?.total_tokens ?? 0) + (auditJson.usage?.total_tokens ?? 0)
    };
  }
}


