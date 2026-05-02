import { Worker } from "bullmq";
import { executeAsyncJobById } from "../../dashboard/src/lib/ai-jobs/executor";
import { getQueueConnection } from "../../dashboard/src/lib/ai-jobs/queue";
import { AI_JOB_QUEUE_NAME } from "../../dashboard/src/lib/ai-jobs/types";

const worker = new Worker(
  AI_JOB_QUEUE_NAME,
  async (job) => {
    await executeAsyncJobById(job.data.jobId);
  },
  {
    connection: getQueueConnection(),
    concurrency: 4,
  },
);

worker.on("ready", () => {
  console.log(`[worker] listening on ${AI_JOB_QUEUE_NAME}`);
});

worker.on("completed", (job) => {
  console.log(`[worker] completed ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(`[worker] failed ${job?.id ?? "unknown-job"}: ${error.message}`);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
