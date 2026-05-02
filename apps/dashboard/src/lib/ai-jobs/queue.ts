import { Queue } from "bullmq";
import IORedis from "ioredis";
import { AI_JOB_QUEUE_NAME } from "./types";

const globalForQueues = globalThis as unknown as {
  aiJobQueue?: Queue<{ jobId: string }>;
  aiJobRedis?: IORedis;
};

export function getQueueConnection() {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("Redis connection string is not configured.");
  }

  if (!globalForQueues.aiJobRedis) {
    globalForQueues.aiJobRedis = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });
  }

  return globalForQueues.aiJobRedis;
}

export function getAiJobQueue() {
  if (!globalForQueues.aiJobQueue) {
    globalForQueues.aiJobQueue = new Queue<{ jobId: string }>(AI_JOB_QUEUE_NAME, {
      connection: getQueueConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });
  }

  return globalForQueues.aiJobQueue;
}

export async function enqueueAsyncJob(jobId: string) {
  const queue = getAiJobQueue();
  await queue.add("execute", { jobId }, { jobId });
}
