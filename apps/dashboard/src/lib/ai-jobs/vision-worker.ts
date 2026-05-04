import { Worker, Queue, Job } from "bullmq";
import { AuditOrchestrator } from "@leadforge/agents";
import { getPrisma } from "@leadforge/db";
import IORedis from "ioredis";

const REDIS_URL = process.env.UPSTASH_REDIS_URL || "redis://localhost:6379";
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const visionQueue = new Queue("vision-audit", { connection });

/**
 * Worker to process vision audits asynchronously
 */
export const visionWorker = new Worker(
  "vision-audit",
  async (job: Job) => {
    const { leadId, jobRecordId } = job.data;
    const prisma = getPrisma();
    
    console.log(`[VisionWorker] Starting audit for lead ${leadId} (Job: ${jobRecordId})`);
    
    try {
      // 1. Update Job Status to RUNNING
      await prisma.asyncJob.update({
        where: { id: jobRecordId },
        data: { 
          status: "RUNNING", 
          progress: 10,
          startedAt: new Date(),
          events: {
            create: { status: "RUNNING", message: "Forensic Orchestrator engaged. Normalizing perimeter..." }
          }
        }
      });

      // Staged Progress streaming (Phase 4 Simulation in Worker)
      await prisma.asyncJobEvent.create({ data: { asyncJobId: jobRecordId, status: "RUNNING", message: "IdentityAgent: Detecting company profile..." } });
      
      const result = await AuditOrchestrator.runFullAudit(leadId);

      await prisma.asyncJobEvent.create({ data: { asyncJobId: jobRecordId, status: "RUNNING", message: "VisionAgent: Analyzing visual hierarchy..." } });
      await prisma.asyncJobEvent.create({ data: { asyncJobId: jobRecordId, status: "RUNNING", message: "TechnicalAgent: Verifying deterministic security..." } });

      // 2. Check if user cancelled while we were working
      const currentJob = await prisma.asyncJob.findUnique({ where: { id: jobRecordId } });
      if (currentJob?.status === "CANCELLED") {
        console.log(`[VisionWorker] Job ${jobRecordId} was cancelled by user. Discarding results.`);
        return null;
      }

      // 3. Update Job Status to SUCCEEDED
      await prisma.asyncJob.update({
        where: { id: jobRecordId },
        data: { 
          status: "SUCCEEDED", 
          progress: 100,
          completedAt: new Date(),
          result: result as any,
          events: {
            create: { status: "SUCCEEDED", message: "Forensic Package ready for outreach." }
          }
        }
      });

      console.log(`[VisionWorker] Successfully completed orchestrated audit for ${leadId}`);
      return result;
    } catch (error: any) {
      console.error(`[VisionWorker] Audit failed for ${leadId}:`, error);
      
      // 3. Update Job Status to FAILED
      await prisma.asyncJob.update({
        where: { id: jobRecordId },
        data: { 
          status: "FAILED", 
          errorMessage: error.message,
          events: {
            create: { status: "FAILED", message: `Audit failed: ${error.message}` }
          }
        }
      });

      throw error;
    }
  },
  { connection, concurrency: 2 }
);
