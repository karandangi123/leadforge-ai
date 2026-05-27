"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { z } from "zod";

const IdSchema = z.string().min(1);

export async function syncLeadToExternal(formData: FormData) {
  const leadId = IdSchema.parse(formData.get("leadId"));
  const syncId = IdSchema.parse(formData.get("syncId"));

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    
    // 1. Fetch sync record
    const sync = await prisma.integrationSync.findUnique({
      where: { id: syncId },
      include: { lead: true }
    });

    if (!sync || sync.leadId !== leadId) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    // 2. Mark as processing
    await prisma.integrationSync.update({
      where: { id: syncId },
      data: { status: "SYNCING" }
    });

    // 3. Simulate/Execute external call
    // In a production "advance level" we would use a library like 'airtable' or 'axios'
    const success = await executeExternalSync(sync.provider, sync.payload);

    if (success) {
      await prisma.integrationSync.update({
        where: { id: syncId },
        data: { 
          status: "SUCCESS",
          externalId: `sync-${syncId}`,
          lastError: null,
        }
      });

      // If all syncs for this lead are done, we could move stage
      // But for now, just log a trace
      await prisma.agentTrace.create({
        data: {
          leadId,
          agentName: "Integration Sync",
          status: "SUCCEEDED",
          input: { provider: sync.provider, syncId },
          output: { message: `Successfully synced lead to ${sync.provider}` },
        }
      });
    } else {
      await prisma.integrationSync.update({
        where: { id: syncId },
        data: { status: "FAILED", lastError: `Sync failed for ${sync.provider}` }
      });
    }

  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=sync-failed`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
}
/**
 * Push an approved outreach draft to Gmail as a real draft
 */
export async function createRealGmailDraft(formData: FormData) {
  const prisma = getPrisma();
  const leadId = IdSchema.parse(formData.get("leadId"));
  const outreachId = IdSchema.parse(formData.get("outreachId"));

  try {
    // Note: Actual Gmail API integration happens in the background worker
    // This action marks the draft as "QUEUED_FOR_SYNC"
    await prisma.outreachDraft.update({
      where: { id: outreachId },
      data: { gmailStatus: "QUEUED" }
    });
    
    revalidatePath(`/leads/${leadId}`);
     
  } catch (error) {
    console.error("[IntegrationsAction] Failed to queue Gmail draft", error);
     
  }
}

async function executeExternalSync(provider: string, payload: unknown) {
  console.log(`[Sync] Sending to ${provider}:`, payload);
  // Simulation delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Real logic would go here
  // Example: if (provider === 'AIRTABLE') { ... }
  
  return true; 
}
