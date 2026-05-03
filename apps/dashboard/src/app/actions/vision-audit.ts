"use server";

import { revalidatePath } from "next/cache";
import { visionQueue } from "@/lib/ai-jobs/vision-worker";
import { getPrisma } from "@leadforge/db";
import { getActiveWorkspace } from "@/lib/workspace";

/**
 * Triggers an asynchronous visual audit via BullMQ
 */
export async function runVisionAudit(leadId: string) {
  const prisma = getPrisma();
  
  try {
    // 1. Check for existing hung audits (Recovery Logic)
    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { status: true }
    });

    if (!existingLead) throw new Error("Lead target not found in perimeter.");

    // 2. Clear previous audit state if retrying
    await prisma.websiteAudit.deleteMany({
      where: { leadId, status: "FAILED" }
    });

    // 3. Mark as AUDIT with an "Audit Timeout" timestamp
    await prisma.lead.update({
      where: { id: leadId },
      data: { 
        status: "AUDIT",
        notes: `Audit initiated at ${new Date().toISOString()}`
      }
    });

    // 4. Initialize Job Tracking in DB
    const jobRecord = await prisma.asyncJob.create({
      data: {
        leadId,
        type: "VISION_AUDIT",
        status: "QUEUED",
        progress: 10,
        payload: { strategy: "forensic_dual_viewport" }
      }
    });

    // 5. Add to BullMQ with high priority
    const job = await visionQueue.add(`audit-${leadId}`, { 
      leadId,
      jobRecordId: jobRecord.id 
    }, {
      removeOnComplete: true,
      attempts: 2,
      backoff: { type: "exponential", delay: 10000 }
    });

    revalidatePath("/war-room");
    
    return {
      success: true,
      jobId: job.id,
      trackingId: jobRecord.id
    };
  } catch (error) {
    console.error("🛑 [CTO-ALERT] Vision Audit Engine Failure:", error);
    
    // Recovery: Revert status if we failed to queue
    try {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "NEW" }
      });
    } catch {}

    return {
      success: false,
      error: error instanceof Error ? error.message : "Infrastructure timeout."
    };
  }
}

/**
 * Polling endpoint for the War Room UI to track real-time progress
 */
export async function getVisionJobStatus(trackingId: string) {
  const prisma = getPrisma();
  
  try {
    const job = await prisma.asyncJob.findUnique({
      where: { id: trackingId },
      include: { events: { orderBy: { createdAt: "desc" }, take: 1 } }
    });

    if (!job) return { status: "NOT_FOUND" };

    return {
      status: job.status,
      progress: job.progress,
      step: job.events[0]?.message || "Processing..."
    };
  } catch (error) {
    return { status: "ERROR" };
  }
}

/**
 * Fast Ingest: Create lead and start audit in one click
 */
export async function fastAudit(url: string) {
  const prisma = getPrisma();
  
  try {
    // 1. Get Active Workspace
    const workspace = await getActiveWorkspace();

    // 2. Sanitize URL
    const domain = url.replace('https://', '').replace('http://', '').split('/')[0];
    const companyName = domain.split('.')[0].toUpperCase();

    // 3. Create Lead
    const lead = await prisma.lead.create({
      data: {
        company: companyName,
        website: url,
        status: "NEW",
        workspaceId: workspace.id,
        source: "fast_ingest"
      }
    });

    // 3. Trigger Audit
    const result = await runVisionAudit(lead.id);
    
    revalidatePath("/war-room");
    
    return result;
  } catch (error) {
    return { success: false, error: "Ingest failed." };
  }
}
