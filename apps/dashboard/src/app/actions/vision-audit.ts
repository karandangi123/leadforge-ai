"use server";

import { revalidatePath } from "next/cache";
import { visionQueue } from "@/lib/ai-jobs/vision-worker";
import { getPrisma } from "@leadforge/db";
import { getActiveWorkspace } from "@/lib/workspace";
import { ForensicEngine } from "@/lib/forensic-engine";
import { validatePublicUrl } from "@/lib/security/url-validator";
import { forensicAuditLimiter } from "@/lib/security/ratelimit";
import { z } from "zod";

const IdSchema = z.string().min(1);
const UrlSchema = z.string().min(3);

/**
 * Triggers an asynchronous visual audit via BullMQ
 */
export async function runVisionAudit(rawLeadId: string) {
  const leadId = IdSchema.parse(rawLeadId);
  const prisma = getPrisma();
  
  try {
    // 0. Rate Limit Protection
    const { success } = await forensicAuditLimiter.limit(`audit:${leadId}`);
    if (!success) throw new Error("Rate limit exceeded. Please wait before auditing again.");

    // 1. Check for existing hung audits (Recovery Logic)
    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { status: true, workspaceId: true, website: true }
    });

    if (!existingLead) throw new Error("Lead target not found in perimeter.");
    if (!existingLead.website) throw new Error("Lead has no valid website to audit.");

    // 1.5 Validate URL (SSRF Protection)
    await validatePublicUrl(existingLead.website);

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

    // 4. Initialize Job Tracking in DB with initial event
    const jobRecord = await prisma.asyncJob.create({
      data: {
        leadId, workspaceId: existingLead.workspaceId,
        kind: "WEBSITE_AUDIT",
        status: "QUEUED",
        progress: 5,
        payload: { strategy: "forensic_dual_viewport" },
        events: {
          create: {
            status: "QUEUED",
            message: "Request queued for Vision Infrastructure."
          }
        }
      }
    });

    // 5. Add to BullMQ with high priority
    try {
      const job = await visionQueue.add(`audit-${leadId}`, { 
        leadId, workspaceId: existingLead.workspaceId,
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
    } catch (queueError) {
      console.warn("⚠️ [VisionAudit] BullMQ unavailable, attempting recovery...");
      // If Queue fails (e.g. no Redis), we return the tracking ID anyway
      // and let the frontend handle the 'Hung' state or future inline retry
      return {
        success: true,
        trackingId: jobRecord.id,
        warning: "Queueing delay detected."
      };
    }
  } catch (error: any) {
    console.error("🛑 [CTO-ALERT] Vision Audit Engine Failure:", error);
    return {
      success: false,
      error: error.message || "Infrastructure timeout."
    };
  }
}

/**
 * Polling endpoint for the War Room UI to track real-time progress
 */
export async function getVisionJobStatus(rawTrackingId: string) {
  const trackingId = IdSchema.parse(rawTrackingId);
  const prisma = getPrisma();
  
  try {
    const job = await prisma.asyncJob.findUnique({
      where: { id: trackingId },
      include: { events: { orderBy: { createdAt: "desc" }, take: 1 } }
    });

    if (!job) return { status: "NOT_FOUND" };

    // Self-Healing: If job is QUEUED for too long, trigger a Simulation
    const isHung = job.status === "QUEUED" && (Date.now() - job.createdAt.getTime() > 15000);
    if (isHung && job.leadId) {
      console.warn("⚠️ [VisionAudit] Job hung in queue. Activating Real Forensic Audit.");
      await triggerRealForensicAudit(trackingId, job.leadId);
      return { status: "COMPLETED", step: "Real Forensic Audit Finalized." };
    }

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
 * Triggers a real forensic audit using Firecrawl + Groq
 */
async function triggerRealForensicAudit(jobId: string, leadId: string) {
  const prisma = getPrisma();
  const engine = new ForensicEngine();
  
  try {
    // 1. Get Lead Details
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead || !lead.website) {
      throw new Error("Lead website not found.");
    }

    // 2. Update Job to CRAWLING
    await prisma.asyncJob.update({
      where: { id: jobId },
      data: { 
        status: "RUNNING", 
        progress: 20,
        events: { create: { status: "RUNNING", message: "Engaging Firecrawl Forensic Engine..." } }
      }
    });

    // 3. Perform Real Audit
    const result = await engine.performAudit(lead.website);

    // 4. Create Audit Record
    const audit = await prisma.websiteAudit.create({
      data: { 
        leadId, 
        status: "SUCCEEDED",
        overallScore: result.uxScore,
        businessImpact: result.summary,
        readyToSendMessage: result.findings[0]?.outreach_hook || "Check out your site's forensic audit.",
        confidence: result.findings[0]?.confidence || 0.8,
        completedAt: new Date()
      }
    });

    // 5. Create Real Findings
    if (result.findings.length > 0) {
      await prisma.auditFinding.createMany({
        data: result.findings.map(f => ({
          auditId: audit.id,
          title: f.title,
          category: f.category.toLowerCase(),
          confidence: f.confidence,
          x: f.x,
          y: f.y,
          sourceEngine: "forensic_engine",
          businessImpact: f.business_impact,
          fixSuggestion: f.recommendation,
          outreachHook: f.outreach_hook,
          whyThisFinding: f.why_this_finding,
          detectionConfidence: f.detection_confidence,
          evidenceStrength: f.evidence_strength,
          businessImpactScore: f.business_impact_score,
          outreachQualityScore: f.outreach_quality_score,
          overallSendability: (f.detection_confidence + f.evidence_strength + f.business_impact_score + f.outreach_quality_score) / 4,
          status: "APPROVED"
        }))
      });
    }

    // 6. Create Screenshot Record
    if (result.screenshotUrl) {
      await prisma.websiteScreenshot.create({
        data: {
          auditId: audit.id,
          viewport: "desktop",
          pageType: "home",
          imageUrl: result.screenshotUrl,
          score: result.uxScore
        }
      });
    }

    // 7. Update Job to SUCCESS
    await prisma.asyncJob.update({
      where: { id: jobId },
      data: { 
        status: "SUCCEEDED", 
        progress: 100,
        events: { create: { status: "SUCCEEDED", message: "Forensic analysis finalized with real data." } }
      }
    });

    // 8. Update Lead
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "READY", auditScore: result.uxScore }
    });

  } catch (error: any) {
    console.error("❌ [ForensicAudit] Real audit failed:", error);
    
    // Fail the job gracefully
    await prisma.asyncJob.update({
      where: { id: jobId },
      data: { 
        status: "FAILED", 
        progress: 100,
        events: { create: { status: "FAILED", message: `Audit failed: ${error.message}` } }
      }
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "NEW" }
    });
  }
}

/**
 * Fast Ingest: Create lead and start audit in one click
 */
export async function fastAudit(rawUrl: string) {
  const url = UrlSchema.parse(rawUrl);
  const prisma = getPrisma();
  
  try {
    // 1. Get Active Workspace
    const workspace = await getActiveWorkspace();

    // 1.5 Rate Limit Protection (per workspace)
    const { success } = await forensicAuditLimiter.limit(`workspace:${workspace.id}`);
    if (!success) throw new Error("Too many audits initiated. Please slow down.");

    // 2. Sanitize & Validate URL
    const validatedUrl = await validatePublicUrl(url);
    const domain = validatedUrl.replace('https://', '').replace('http://', '').split('/')[0];
    const companyName = domain.split('.')[0].toUpperCase();

    // 3. Create Lead
    const lead = await prisma.lead.create({
      data: {
        company: companyName,
        website: validatedUrl,
        status: "NEW",
        workspaceId: workspace.id,
        source: "fast_ingest"
      }
    });

    // 3. Trigger Audit
    const result = await runVisionAudit(lead.id);
    
    if (!result.success) {
      throw new Error(result.error || "Failed to engage vision engine.");
    }

    revalidatePath("/war-room");
    
    return {
      success: true,
      trackingId: result.trackingId,
      leadId: lead.id
    };
  } catch (error: any) {
    console.error("🛑 [FastAudit] Failed:", error);
    return {
      success: false,
      error: error.message || "Ingest failed."
    };
  }
}

/**
 * Stop/Cancel an ongoing audit
 */
export async function cancelVisionAudit(rawTrackingId: string, rawLeadId: string) {
  const trackingId = IdSchema.parse(rawTrackingId);
  const leadId = IdSchema.parse(rawLeadId);
  const prisma = getPrisma();
  
  try {
    await prisma.$transaction([
      prisma.asyncJob.update({
        where: { id: trackingId },
        data: { 
          status: "CANCELLED",
          events: {
            create: { status: "CANCELLED", message: "Audit stopped by user." }
          }
        }
      }),
      prisma.lead.update({
        where: { id: leadId },
        data: { status: "NEW" }
      })
    ]);

    revalidatePath("/war-room");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
