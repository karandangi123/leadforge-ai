import { type PrismaClient } from "@leadforge/db";
import { fetchGmailWorkspaceSnapshot } from "@leadforge/integrations";
import { GOOGLE_PROVIDER } from "./workspace";
import { getGoogleAuthClient } from "./google-workspace";

type GmailSyncTrigger =
  | "frictionless_auth_flow"
  | "google_reauth_flow"
  | "manual_refresh";

type SyncWorkspaceGmailDataInput = {
  workspaceId: string;
  userId?: string | null;
  trigger: GmailSyncTrigger;
};

export async function syncWorkspaceGmailData(
  prisma: PrismaClient,
  input: SyncWorkspaceGmailDataInput,
) {
  const connection = await prisma.workspaceIntegrationConnection.findUnique({
    where: {
      workspaceId_provider: {
        workspaceId: input.workspaceId,
        provider: GOOGLE_PROVIDER,
      },
    },
  });

  if (!connection) {
    throw new Error("Google Gmail connection is not available for this workspace.");
  }

  const attemptAt = new Date();

  await prisma.workspaceGmailSnapshot.upsert({
    where: { workspaceId: input.workspaceId },
    update: {
      provider: GOOGLE_PROVIDER,
      syncStatus: "SYNCING",
      syncError: null,
      lastAttemptedSyncAt: attemptAt,
    },
    create: {
      workspaceId: input.workspaceId,
      provider: GOOGLE_PROVIDER,
      syncStatus: "SYNCING",
      lastAttemptedSyncAt: attemptAt,
    },
  });

  try {
    const auth = await getGoogleAuthClient(input.workspaceId);
    const credentials = auth.credentials;

    const { snapshot, tokens } = await fetchGmailWorkspaceSnapshot(
      {
        accessToken: (credentials.access_token as string) ?? connection.accessToken,
        refreshToken: (credentials.refresh_token as string) ?? connection.refreshToken,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : connection.expiresAt,
        tokenType: connection.tokenType,
        scope: connection.scope,
      },
      { maxDrafts: 10 },
    );

    const syncedAt = new Date();

    await prisma.workspaceIntegrationConnection.update({
      where: { id: connection.id },
      data: {
        status: "CONNECTED",
        accessToken: tokens?.accessToken ?? connection.accessToken,
        refreshToken: tokens?.refreshToken ?? connection.refreshToken,
        tokenType: tokens?.tokenType ?? connection.tokenType,
        scope: tokens?.scope ?? connection.scope,
        expiresAt: tokens?.expiryDate ? new Date(tokens.expiryDate) : connection.expiresAt,
        lastSyncedAt: syncedAt,
        lastError: null,
      },
    });

    const gmailSnapshot = await prisma.workspaceGmailSnapshot.upsert({
      where: { workspaceId: input.workspaceId },
      update: {
        provider: GOOGLE_PROVIDER,
        labels: snapshot.labels,
        recentDrafts: snapshot.recentDrafts,
        labelCount: snapshot.labels.length,
        recentDraftCount: snapshot.recentDrafts.length,
        syncStatus: "SYNCED",
        syncError: null,
        lastAttemptedSyncAt: syncedAt,
        lastSuccessfulSyncAt: syncedAt,
      },
      create: {
        workspaceId: input.workspaceId,
        provider: GOOGLE_PROVIDER,
        labels: snapshot.labels,
        recentDrafts: snapshot.recentDrafts,
        labelCount: snapshot.labels.length,
        recentDraftCount: snapshot.recentDrafts.length,
        syncStatus: "SYNCED",
        syncError: null,
        lastAttemptedSyncAt: syncedAt,
        lastSuccessfulSyncAt: syncedAt,
      },
    });

    if (input.userId) {
      await prisma.auditLog.create({
        data: {
          workspaceId: input.workspaceId,
          userId: input.userId,
          action: "GMAIL_WORKSPACE_SYNC_SUCCEEDED",
          entityType: "WORKSPACE_GMAIL_SNAPSHOT",
          entityId: gmailSnapshot.id,
          metadata: {
            trigger: input.trigger,
            labelCount: gmailSnapshot.labelCount,
            recentDraftCount: gmailSnapshot.recentDraftCount,
          },
        },
      });
    }

    return gmailSnapshot;
  } catch (error) {
    const message = toErrorMessage(error);

    const failedSnapshot = await prisma.workspaceGmailSnapshot.upsert({
      where: { workspaceId: input.workspaceId },
      update: {
        provider: GOOGLE_PROVIDER,
        syncStatus: "FAILED",
        syncError: message,
        lastAttemptedSyncAt: new Date(),
      },
      create: {
        workspaceId: input.workspaceId,
        provider: GOOGLE_PROVIDER,
        syncStatus: "FAILED",
        syncError: message,
        lastAttemptedSyncAt: new Date(),
      },
    });

    if (input.userId) {
      await prisma.auditLog.create({
        data: {
          workspaceId: input.workspaceId,
          userId: input.userId,
          action: "GMAIL_WORKSPACE_SYNC_FAILED",
          entityType: "WORKSPACE_GMAIL_SNAPSHOT",
          entityId: failedSnapshot.id,
          metadata: {
            trigger: input.trigger,
            error: message,
          },
        },
      });
    }

    throw error;
  }
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Gmail sync error";
}
