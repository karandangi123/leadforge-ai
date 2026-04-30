import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { DEFAULT_WORKSPACE_SLUG, getOrCreateDefaultWorkspace, GOOGLE_PROVIDER } from "./workspace";

export type GmailConnectionStatus =
  | "not_configured"
  | "missing_oauth_config"
  | "connected"
  | "expired"
  | "error";

export type GmailConnectionState = {
  provider: typeof GOOGLE_PROVIDER;
  status: GmailConnectionStatus;
  workspaceSlug: string;
  connectedEmail: string | null;
  connectedAt: string | null;
  expiresAt: string | null;
  hasRefreshToken: boolean;
  lastError: string | null;
  scopes: string[];
};

export async function getDefaultWorkspaceGmailConnectionState(): Promise<GmailConnectionState> {
  const oauthConfigured = hasGoogleOAuthConfig();
  if (!oauthConfigured) {
    return {
      provider: GOOGLE_PROVIDER,
      status: "missing_oauth_config",
      workspaceSlug: DEFAULT_WORKSPACE_SLUG,
      connectedEmail: null,
      connectedAt: null,
      expiresAt: null,
      hasRefreshToken: false,
      lastError: null,
      scopes: [],
    };
  }

  if (!hasDatabaseUrl()) {
    return {
      provider: GOOGLE_PROVIDER,
      status: "not_configured",
      workspaceSlug: DEFAULT_WORKSPACE_SLUG,
      connectedEmail: null,
      connectedAt: null,
      expiresAt: null,
      hasRefreshToken: false,
      lastError: null,
      scopes: [],
    };
  }

  const prisma = getPrisma();
  const workspace = await getOrCreateDefaultWorkspace();
  const connection = await prisma.workspaceIntegrationConnection.findUnique({
    where: {
      workspaceId_provider: {
        workspaceId: workspace.id,
        provider: GOOGLE_PROVIDER,
      },
    },
  });

  if (!connection) {
    return {
      provider: GOOGLE_PROVIDER,
      status: "not_configured",
      workspaceSlug: workspace.slug,
      connectedEmail: null,
      connectedAt: null,
      expiresAt: null,
      hasRefreshToken: false,
      lastError: null,
      scopes: [],
    };
  }

  return {
    provider: GOOGLE_PROVIDER,
    status:
      connection.status === "ERROR"
        ? "error"
        : connection.expiresAt && connection.expiresAt.getTime() < Date.now() && !connection.refreshToken
          ? "expired"
          : "connected",
    workspaceSlug: workspace.slug,
    connectedEmail: connection.externalAccountEmail,
    connectedAt: connection.updatedAt.toISOString(),
    expiresAt: connection.expiresAt?.toISOString() ?? null,
    hasRefreshToken: Boolean(connection.refreshToken),
    lastError: connection.lastError,
    scopes: connection.scope ? connection.scope.split(" ").filter(Boolean) : [],
  };
}

export async function getDefaultWorkspaceGoogleConnection() {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const prisma = getPrisma();
  const workspace = await getOrCreateDefaultWorkspace();
  return prisma.workspaceIntegrationConnection.findUnique({
    where: {
      workspaceId_provider: {
        workspaceId: workspace.id,
        provider: GOOGLE_PROVIDER,
      },
    },
  });
}

export function hasGoogleOAuthConfig() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
