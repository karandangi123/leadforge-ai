"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma, hasDatabaseUrl, LeadStatus } from "@leadforge/db";

import { createGmailDraftFromConnection } from "@leadforge/integrations";
import { getDefaultWorkspaceGoogleConnection } from "@/lib/integration-connections";

export async function createRealGmailDraft(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const outreachId = String(formData.get("outreachId") ?? "");
  let connectionId: string | null = null;

  const session = await auth();
  if (session?.user?.id === "demo-user") {
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/");
    redirect(`/leads/${leadId}?run=draft-synced`);
  }

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }


  try {
    const prisma = getPrisma();
    const connection = await getDefaultWorkspaceGoogleConnection();

    if (!connection) {
      redirect(`/leads/${leadId}?run=gmail-unauthorised`);
    }

    connectionId = connection.id;
    
    const outreach = await prisma.outreachDraft.findUnique({
      where: { id: outreachId },
      include: { lead: true, approvals: { orderBy: { createdAt: "desc" } } }
    });

    if (!outreach || outreach.leadId !== leadId) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    if (!outreach.lead.contactEmail) {
      redirect(`/leads/${leadId}?run=gmail-missing-email`);
    }

    const approved = outreach.approvals.some((approval) => approval.status === "APPROVED");
    if (!approved) {
      redirect(`/leads/${leadId}?run=gmail-awaiting-approval`);
    }

    const existingGmailSyncs = await prisma.integrationSync.findMany({
      where: { leadId, provider: "GMAIL" },
      orderBy: { createdAt: "desc" },
    });
    const matchingSync = existingGmailSyncs.find((sync) => {
      const payload = readJsonRecord(sync.payload);
      return payload.outreachId === outreachId;
    });

    if (matchingSync?.status === "SUCCESS") {
      redirect(`/leads/${leadId}?run=draft-already-synced`);
    }

    const syncRecord = matchingSync
      ? await prisma.integrationSync.update({
          where: { id: matchingSync.id },
          data: {
            status: "SYNCING",
            lastError: null,
            payload: {
              ...readJsonRecord(matchingSync.payload),
              outreachId,
              mode: "gmail_draft",
            },
          },
        })
      : await prisma.integrationSync.create({
          data: {
            leadId,
            provider: "GMAIL",
            status: "SYNCING",
            payload: {
              outreachId,
              mode: "gmail_draft",
            },
          },
        });

    const draftResult = await createGmailDraftFromConnection(
      {
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken,
        expiresAt: connection.expiresAt,
        tokenType: connection.tokenType,
        scope: connection.scope,
      },
      {
        to: outreach.lead.contactEmail,
        subject: outreach.subject || `Outreach for ${outreach.lead.company}`,
        body: outreach.body,
      },
    );

    await prisma.workspaceIntegrationConnection.update({
      where: { id: connection.id },
      data: {
        status: "CONNECTED",
        accessToken: draftResult.tokens?.accessToken ?? connection.accessToken,
        refreshToken: draftResult.tokens?.refreshToken ?? connection.refreshToken,
        tokenType: draftResult.tokens?.tokenType ?? connection.tokenType,
        scope: draftResult.tokens?.scope ?? connection.scope,
        expiresAt: draftResult.tokens?.expiryDate
          ? new Date(draftResult.tokens.expiryDate)
          : connection.expiresAt,
        lastSyncedAt: new Date(),
        lastError: null,
      },
    });

    await prisma.integrationSync.update({
      where: { id: syncRecord.id },
      data: {
        status: "SUCCESS",
        externalId: draftResult.draft.id ?? null,
        lastError: null,
        payload: {
          outreachId,
          mode: "gmail_draft",
          gmailDraftId: draftResult.draft.id,
          gmailThreadId: draftResult.draft.message?.threadId ?? null,
        },
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.SYNCED,
        nextAction: "Gmail draft created. Review inbox and log outcome.",
      },
    });

    // 3. Log trace
    await prisma.agentTrace.create({
      data: {
        leadId,
        agentName: "Gmail Bridge",
        status: "SUCCEEDED",
        input: { outreachId, provider: "GMAIL", gmailDraftId: draftResult.draft.id },
        output: { message: "Successfully created a Gmail draft without sending." },
      }
    });

  } catch (error) {
    const prisma = getPrisma();
    await prisma.integrationSync.updateMany({
      where: { leadId, provider: "GMAIL", status: "SYNCING" },
      data: {
        status: "FAILED",
        lastError: toErrorMessage(error),
      },
    });
    if (connectionId) {
      await prisma.workspaceIntegrationConnection.update({
        where: { id: connectionId },
        data: {
          status: "ERROR",
          lastError: toErrorMessage(error),
        },
      });
    }
    await prisma.agentTrace.create({
      data: {
        leadId,
        agentName: "Gmail Bridge",
        status: "FAILED",
        input: { outreachId, provider: "GMAIL" },
        output: { message: "Gmail draft creation failed." },
        errorMessage: toErrorMessage(error),
      },
    });
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=gmail-error`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=draft-synced`);
}

function readJsonRecord(value: unknown) {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Gmail error";
}
