"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { getPrisma, hasDatabaseUrl, JobKind, JobStatus } from "@leadforge/db";
import { executeAsyncJobById } from "./executor";
import { enqueueAsyncJob } from "./queue";
import { getCompletedRunKey, getQueuedRunKey } from "./types";
import { getAiRuntimeMode, hasRedisUrl } from "../runtime-mode";
import { z } from "zod";

export async function runLeadAsyncJob(formData: FormData, kind: JobKind) {
  const leadId = readLeadId(formData);
  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    const executionMode = getAiRuntimeMode();
    const job = await prisma.asyncJob.create({
      data: {
        workspaceId: lead.workspaceId,
        leadId: lead.id,
        kind,
        status: JobStatus.QUEUED,
        payload: {
          executionMode,
          triggeredBy: "lead_detail",
        },
        events: {
          create: {
            status: JobStatus.QUEUED,
            message:
              executionMode === "live"
                ? "Job queued for background execution."
                : "Queue unavailable. Running inline in degraded mode.",
            meta: {
              executionMode,
            },
          },
        },
      },
    });

    if (hasRedisUrl()) {
      await enqueueAsyncJob(job.id);
      revalidatePath(`/leads/${leadId}`);
      redirect(`/leads/${leadId}?run=${getQueuedRunKey(kind)}&jobId=${job.id}`);
    }

    await executeAsyncJobById(job.id);
    revalidatePath("/");
    revalidatePath(`/leads/${leadId}`);
    redirect(`/leads/${leadId}?run=${getCompletedRunKey(kind)}&jobId=${job.id}`);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=db-unavailable`);
  }
}

function readLeadId(formData: FormData) {
  const leadId = formData.get("leadId");
  return z.string().min(1).parse(leadId);
}
