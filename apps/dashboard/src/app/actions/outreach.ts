"use server";

import { getPrisma } from "@leadforge/db";
import { SequenceHealerAgent, OutreachAgent } from "@leadforge/agents";
import { revalidatePath } from "next/cache";
import { createGmailDraftFromConnection, TokenCrypto } from "@leadforge/integrations";
import { z } from "zod";

const IdSchema = z.string().min(1);
const DraftSchema = z.object({
  leadId: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  to: z.string().email(),
});

/**
 * Server Action: Create a Gmail draft for a specific lead
 */
export async function createGmailDraft(rawLeadId: string, rawSubject: string, rawBody: string, rawTo: string) {
  const { leadId, subject, body, to } = DraftSchema.parse({
    leadId: rawLeadId,
    subject: rawSubject,
    body: rawBody,
    to: rawTo
  });
  const prisma = getPrisma();
  
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { workspace: true }
    });

    if (!lead) throw new Error("Lead not found");

    const connection = await prisma.workspaceIntegrationConnection.findUnique({
      where: {
        workspaceId_provider: {
          workspaceId: lead.workspaceId,
          provider: "GOOGLE_GMAIL"
        }
      }
    });

    if (!connection) throw new Error("Gmail integration not connected.");

    const { draft, tokens } = await createGmailDraftFromConnection(connection as any, {
      to,
      subject,
      body
    });

    // If tokens were refreshed, update the DB with encrypted versions
    if (tokens) {
      await prisma.workspaceIntegrationConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: tokens.accessToken ? TokenCrypto.encrypt(tokens.accessToken) : undefined,
          refreshToken: tokens.refreshToken ? TokenCrypto.encrypt(tokens.refreshToken) : undefined,
          expiresAt: tokens.expiryDate ? new Date(tokens.expiryDate) : undefined
        }
      });
    }

    revalidatePath(`/war-room`);
    return { success: true, draftId: draft.id };
  } catch (error: any) {
    console.error("[GmailDraft] Failed to create draft:", error);
    return { success: false, error: error.message || "Failed to create draft" };
  }
}
export async function processLeadReply(rawLeadId: string, rawReplyText: string) {
  const leadId = IdSchema.parse(rawLeadId);
  const replyText = z.string().min(1).parse(rawReplyText);
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
export async function generateContextAwareSequence(rawLeadId: string) {
  const leadId = IdSchema.parse(rawLeadId);
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
