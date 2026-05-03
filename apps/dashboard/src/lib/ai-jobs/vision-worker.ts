import { Worker, Queue, Job } from "bullmq";
import { VisionAgent } from "@leadforge/agents";
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
    const { leadId } = job.data;
    console.log(`[VisionWorker] Starting audit for lead ${leadId}`);
    
    try {
      const result = await VisionAgent.analyzeWebsite(leadId);
      console.log(`[VisionWorker] Successfully completed audit for ${leadId} in ${result.latencyMs}ms`);
      return result.data;
    } catch (error) {
      console.error(`[VisionWorker] Audit failed for ${leadId}:`, error);
      throw error;
    }
  },
  { connection, concurrency: 2 }
);
