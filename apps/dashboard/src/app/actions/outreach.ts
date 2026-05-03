"use server";

import { getPrisma } from "@leadforge/db";
import { SequenceHealerAgent, OutreachAgent } from "@leadforge/agents";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Process a lead's reply and generate a "Self-Healed" pivot strategy
 */
export async function processLeadReply(leadId: string, replyText: string) {
  const prisma = getPrisma();
  
  try {
    const healingResult = await SequenceHealerAgent.healSequence(leadId, replyText);
    revalidatePath(`/leads/${leadId}`);
    return { 
      success: true, 
      pivot: healingResult.data 
    };
  } catch (error) {
    console.error("[SequenceHealer] Failed to process reply", error);
    return { success: false, error: "Failed to heal sequence" };
  }
}

/**
 * Server Action: Generate a 3-step Context-Aware Sequence based on Live Audit
 */
export async function generateContextAwareSequence(leadId: string) {
  try {
    const steps = await Promise.all([
      OutreachAgent.generateContextAwareDraft(leadId, 1),
      OutreachAgent.generateContextAwareDraft(leadId, 2),
      OutreachAgent.generateContextAwareDraft(leadId, 3),
    ]);

    revalidatePath(`/leads/${leadId}`);
    return { 
      success: true, 
      sequence: steps.map(s => s.data) 
    };
  } catch (error) {
    console.error("[OutreachAgent] Failed to generate sequence", error);
    return { success: false, error: "Failed to generate sequence" };
  }
}
