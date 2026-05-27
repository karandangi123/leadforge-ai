"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { ApprovalStatus, DraftChannel, getPrisma, hasDatabaseUrl, JobKind, LeadStatus } from "@leadforge/db";
import { runLeadAsyncJob } from "@/lib/ai-jobs/server";

const approvalEditSchema = z.object({
  leadId: z.string().trim().min(2),
  approvalId: z.string().trim().min(2),
  subject: z.string().trim().max(240).optional(),
  body: z.string().trim().min(20).max(8000),
  reviewerNote: z.string().trim().min(3).max(1200),
  requestedAction: z.string().trim().max(240).optional(),
  decision: z.enum(["approve", "revise"]),
  returnTo: z.string().trim().optional(),
});



export async function runResearch(formData: FormData) {
  return runLeadAsyncJob(formData, JobKind.RESEARCH);
}

export async function runWebsiteAudit(formData: FormData) {
  return runLeadAsyncJob(formData, JobKind.WEBSITE_AUDIT);
}

export async function generateOutreachDraft(formData: FormData) {
  return runLeadAsyncJob(formData, JobKind.OUTREACH_DRAFT);
}

export async function prepareClientOperations(formData: FormData) {
  return runLeadAsyncJob(formData, JobKind.CLIENT_OPS);
}

export async function approveLeadWork(formData: FormData) {
  return reviewLeadWork(formData, "approve");
}

export async function rejectLeadWork(formData: FormData) {
  return reviewLeadWork(formData, "reject");
}

export async function editApprovalAsset(formData: FormData) {
  const parsed = approvalEditSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    redirect("/?lead=invalid#outreach");
  }

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${parsed.data.leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    const approval = await prisma.approval.findFirst({
      where: {
        id: parsed.data.approvalId,
        leadId: parsed.data.leadId,
      },
      include: {
        outreachDraft: true,
      },
    });

    if (!approval) {
      redirect(`/leads/${parsed.data.leadId}?run=missing`);
    }

    const approveNow = parsed.data.decision === "approve";

    await prisma.$transaction(async (tx) => {
      if (approval.outreachDraft) {
        await tx.outreachDraft.update({
          where: { id: approval.outreachDraft.id },
          data: {
            subject: parsed.data.subject || approval.outreachDraft.subject,
            body: parsed.data.body,
          },
        });
      }

      await tx.approval.update({
        where: { id: approval.id },
        data: {
          status: approveNow ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
          requestedAction: parsed.data.requestedAction || approval.requestedAction,
          decidedAt: new Date(),
          notes: appendReviewNote(
            approval.notes,
            approveNow
              ? `Edited by reviewer before approval: ${parsed.data.reviewerNote}`
              : `Sent back for revision: ${parsed.data.reviewerNote}`,
          ),
        },
      });

      await tx.integrationSync.updateMany({
        where: {
          leadId: parsed.data.leadId,
          status: "READY",
        },
        data: {
          status: approveNow ? "APPROVED" : "BLOCKED",
        },
      });

      if (approval.outreachDraft && approval.outreachDraft.channel === DraftChannel.EMAIL) {
        const existingSyncs = await tx.integrationSync.findMany({
          where: {
            leadId: parsed.data.leadId,
            provider: "GMAIL",
          },
        });
        const hasDraftSync = existingSyncs.some((sync) => {
          const payload = readJsonRecord(sync.payload);
          return payload.outreachId === approval.outreachDraftId;
        });

        if (approveNow && !hasDraftSync) {
          await tx.integrationSync.create({
            data: {
              leadId: parsed.data.leadId,
              provider: "GMAIL",
              status: "APPROVED",
              payload: {
                outreachId: approval.outreachDraftId,
                mode: "gmail_draft",
              },
            },
          });
        }
      }

      await tx.lead.update({
        where: { id: parsed.data.leadId },
        data: {
          status: approveNow ? LeadStatus.READY : LeadStatus.REJECTED,
          nextAction: approveNow ? "Create Gmail draft and sync CRM" : "Revise outreach assets with reviewer edits",
        },
      });
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${parsed.data.leadId}?run=db-unavailable`);
  }

  revalidatePath("/");
  revalidatePath(`/leads/${parsed.data.leadId}`);
  redirect(parsed.data.returnTo || `/leads/${parsed.data.leadId}?run=${parsed.data.decision}`);
}

// Helpers

function readLeadId(formData: FormData) {
  const leadId = formData.get("leadId");
  return z.string().min(1).parse(leadId);
}

function readApprovalId(formData: FormData) {
  const approvalId = formData.get("approvalId");
  return z.string().min(1).parse(approvalId);
}

function appendReviewNote(current: string | null, next: string) {
  const stamped = `[${new Date().toISOString()}] ${next}`;
  return current ? `${current}\n\n${stamped}` : stamped;
}

async function reviewLeadWork(formData: FormData, decision: "approve" | "reject") {
  const leadId = readLeadId(formData);
  const approvalId = readApprovalId(formData);
  const returnTo = formData.get("returnTo");

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    const approval = await prisma.approval.findFirst({
      where: { id: approvalId, leadId },
      include: { outreachDraft: true },
    });

    if (!approval) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    const approved = decision === "approve";
    await prisma.$transaction(async (tx) => {
      await tx.approval.update({
        where: { id: approval.id },
        data: {
          status: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
          decidedAt: new Date(),
          notes: approved
            ? appendReviewNote(approval.notes, "Approved by reviewer.")
            : appendReviewNote(approval.notes, "Rejected by reviewer."),
        },
      });

      await tx.integrationSync.updateMany({
        where: {
          leadId,
          status: "READY",
        },
        data: {
          status: approved ? "APPROVED" : "BLOCKED",
        },
      });

      if (approval.outreachDraft && approval.outreachDraft.channel === DraftChannel.EMAIL) {
        const existingSyncs = await tx.integrationSync.findMany({
          where: {
            leadId,
            provider: "GMAIL",
          },
        });
        const hasDraftSync = existingSyncs.some((sync) => {
          const payload = readJsonRecord(sync.payload);
          return payload.outreachId === approval.outreachDraftId;
        });

        if (approved && !hasDraftSync) {
          await tx.integrationSync.create({
            data: {
              leadId,
              provider: "GMAIL",
              status: "APPROVED",
              payload: {
                outreachId: approval.outreachDraftId,
                mode: "gmail_draft",
              },
            },
          });
        }
      }

      await tx.lead.update({
        where: { id: leadId },
        data: {
          status: approved ? LeadStatus.READY : LeadStatus.REJECTED,
          nextAction: approved ? "Create Gmail draft from the approved outreach asset." : "Revise outreach assets with reviewer feedback.",
        },
      });
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=db-unavailable`);
  }

  revalidatePath("/");
  revalidatePath(`/leads/${leadId}`);
  redirect(typeof returnTo === "string" && returnTo.length > 0 ? returnTo : `/leads/${leadId}?run=${decision}`);
}

function readJsonRecord(value: unknown) {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}
