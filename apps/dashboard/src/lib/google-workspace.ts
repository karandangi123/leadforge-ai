import { getPrisma } from "@leadforge/db";
import { GOOGLE_PROVIDER } from "./workspace";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL + "/api/auth/callback/google"
);

type GoogleConnectionTokens = {
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
  expiresAt?: Date | null;
};

type GoogleWorkspaceSyncInput = {
  workspaceId: string;
  userId?: string | null;
  externalAccountId?: string | null;
  externalAccountEmail?: string | null;
  tokens: GoogleConnectionTokens;
  source: "frictionless_auth_flow" | "google_reauth_flow";
};

export async function syncGoogleAccountToWorkspace(
  prisma: ReturnType<typeof getPrisma>,
  input: GoogleWorkspaceSyncInput,
) {
  const existingConnection = await prisma.workspaceIntegrationConnection.findUnique({
    where: {
      workspaceId_provider: {
        workspaceId: input.workspaceId,
        provider: GOOGLE_PROVIDER,
      },
    },
  });

  const connection = await prisma.workspaceIntegrationConnection.upsert({
    where: {
      workspaceId_provider: {
        workspaceId: input.workspaceId,
        provider: GOOGLE_PROVIDER,
      },
    },
    update: {
      status: "CONNECTED",
      externalAccountId: input.externalAccountId ?? existingConnection?.externalAccountId ?? null,
      externalAccountEmail: input.externalAccountEmail ?? existingConnection?.externalAccountEmail ?? null,
      accessToken: input.tokens.accessToken ?? existingConnection?.accessToken ?? null,
      refreshToken: input.tokens.refreshToken ?? existingConnection?.refreshToken ?? null,
      tokenType: input.tokens.tokenType ?? existingConnection?.tokenType ?? "Bearer",
      scope: input.tokens.scope ?? existingConnection?.scope ?? null,
      expiresAt: input.tokens.expiresAt ?? existingConnection?.expiresAt ?? null,
      lastSyncedAt: new Date(),
      lastError: null,
    },
    create: {
      workspaceId: input.workspaceId,
      provider: GOOGLE_PROVIDER,
      status: "CONNECTED",
      externalAccountId: input.externalAccountId ?? null,
      externalAccountEmail: input.externalAccountEmail ?? null,
      accessToken: input.tokens.accessToken ?? null,
      refreshToken: input.tokens.refreshToken ?? null,
      tokenType: input.tokens.tokenType ?? "Bearer",
      scope: input.tokens.scope ?? null,
      expiresAt: input.tokens.expiresAt ?? null,
      lastSyncedAt: new Date(),
      lastError: null,
    },
  });

  if (input.userId) {
    await prisma.auditLog.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        action: input.source === "frictionless_auth_flow" ? "INTEGRATION_SYNC_AUTO" : "INTEGRATION_SYNC_REAUTH",
        entityType: "WORKSPACE_INTEGRATION_CONNECTION",
        entityId: GOOGLE_PROVIDER,
        metadata: {
          provider: "google",
          email: input.externalAccountEmail,
          scope: input.tokens.scope,
          source: input.source,
        },
      },
    });
  }

  return connection;
}

export async function getGoogleAuthClient(workspaceId: string) {
  const prisma = getPrisma();
  const connection = await prisma.workspaceIntegrationConnection.findUnique({
    where: {
      workspaceId_provider: {
        workspaceId,
        provider: GOOGLE_PROVIDER,
      },
    },
  });

  if (!connection || !connection.accessToken || !connection.refreshToken) {
    throw new Error("Google connection not found or incomplete.");
  }

  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.expiresAt?.getTime(),
  });

  // Check if token is expired or expires in the next 5 minutes
  const isExpired = !connection.expiresAt || connection.expiresAt.getTime() < Date.now() + 300000;

  if (isExpired) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update the database with the new tokens
    await prisma.workspaceIntegrationConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token ?? connection.refreshToken, // Google doesn't always send a new refresh token
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      },
    });

    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}
