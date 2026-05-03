import { PromptKind, getPrisma } from "@leadforge/db";

/**
 * DEFAULT_PROMPTS: These are the open-source fallback prompts.
 * They are designed to be functional but are intentionally simpler
 * than the LeadForge Pro proprietary prompt library.
 */
export const DEFAULT_PROMPTS: Record<PromptKind, string> = {
  [PromptKind.RESEARCH]: "You are an expert revenue researcher. Analyze the following lead data...",
  [PromptKind.WEBSITE_AUDIT]: "You are a conversion optimization expert. Audit this website...",
  [PromptKind.OUTREACH]: "You are a creative outreach strategist. Write a compelling message...",
  [PromptKind.REVIEWER]: "You are a quality control agent. Review the following output...",
  [PromptKind.FOLLOW_UP]: "Draft a polite follow-up message...",
  [PromptKind.EVAL]: "Evaluate the response based on the following criteria...",
  [PromptKind.SIGNAL_DISCOVERY]: "You are an Elite Sales Intelligence Agent. Your goal is to analyze a Product Playbook and a Lead's basic info to identify 'Iceberg Signals' that prove the lead has a high-severity pain point. Suggest specific technical checks (like robots.txt, tech stack markers, or social signals) to verify these pains.",
};

export class PromptRegistry {
  /**
   * Fetches the appropriate prompt version for a task.
   * Logic: Secure API (Pro) -> Workspace Version (Custom) -> Global Defaults (Open Source)
   */
  static async getPrompt(kind: PromptKind, workspaceId: string): Promise<string> {
    // 1. Check for High-Performance Premium Prompts (PRO MODE)
    // This allows the SaaS to fetch encrypted/proprietary prompts from a private backend.
    const privatePromptUrl = process.env.LEADFORGE_PRIVATE_PROMPT_URL;
    if (privatePromptUrl) {
      try {
        const response = await fetch(`${privatePromptUrl}/prompts/${kind}`, {
          headers: { "Authorization": `Bearer ${process.env.LEADFORGE_INTERNAL_KEY}` }
        });
        if (response.ok) {
          const data = await response.json() as { content: string };
          return data.content;
        }
      } catch (error) {
        console.error("[PromptRegistry] Failed to fetch premium prompt, falling back to local.");
      }
    }

    const prisma = getPrisma();
    
    // 2. Attempt to fetch an active version from the workspace (User-defined overrides)
    const version = await prisma.promptVersion.findFirst({
      where: {
        workspaceId,
        kind,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (version) {
      return version.content;
    }

    // 3. Fallback to Open Source Global Defaults
    return DEFAULT_PROMPTS[kind];
  }

  static async registerVersion(workspaceId: string, kind: PromptKind, name: string, content: string) {
    const prisma = getPrisma();
    
    await prisma.promptVersion.updateMany({
      where: { workspaceId, kind, isActive: true },
      data: { isActive: false },
    });

    return prisma.promptVersion.create({
      data: {
        workspaceId,
        kind,
        name,
        version: new Date().toISOString(),
        content,
        isActive: true,
      },
    });
  }
}
