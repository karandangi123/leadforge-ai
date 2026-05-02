import "server-only";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { auth } from "@/auth";
import { cookies, headers } from "next/headers";
import { DEFAULT_WORKSPACE_SLUG, getActiveWorkspace, GOOGLE_PROVIDER } from "./workspace";
import { getGmailConnectionHealth, getRequiredWorkspaceGmailScopes } from "./gmail-connection-health";

export type GmailConnectionStatus =
  | "not_configured"
  | "missing_oauth_config"
  | "connected"
  | "expired"
  | "error";

export type GmailConfigReadiness = {
  databaseReady: boolean;
  clientIdReady: boolean;
  clientSecretReady: boolean;
  redirectUriReady: boolean;
  expectedRedirectUri: string;
  configuredRedirectUri: string | null;
  redirectUriMatchesHost: boolean;
  blockers: string[];
  userFacingBlockers: string[];
};

export type GmailConnectionState = {
  provider: typeof GOOGLE_PROVIDER;
  status: GmailConnectionStatus;
  workspaceSlug: string;
  connectedEmail: string | null;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  expiresAt: string | null;
  hasRefreshToken: boolean;
  lastError: string | null;
  scopes: string[];
  isActive: boolean;
  statusLabel: string;
  statusDetail: string;
  requiresReconnect: boolean;
  snapshotStatus: string | null;
  snapshotError: string | null;
  lastAttemptedSyncAt: string | null;
  lastSuccessfulSyncAt: string | null;
  labelCount: number;
  recentDraftCount: number;
  readiness: GmailConfigReadiness;
};

const REQUIRED_GMAIL_SCOPES = getRequiredWorkspaceGmailScopes();

export async function getDefaultWorkspaceGmailConnectionState(): Promise<GmailConnectionState> {
  const readiness = await getGmailConfigReadiness();
  const session = await auth();
  const isDemo = session?.user?.id === "demo-user";
  const cookieStore = await cookies();
  const demoConnected = cookieStore.get("leadforge-demo-connected")?.value === "true";

  if (isDemo && demoConnected) {
    return {
      provider: GOOGLE_PROVIDER,
      status: "connected",
      workspaceSlug: "demo",
      connectedEmail: "demo-operator@leadforge.ai",
      connectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      expiresAt: null,
      hasRefreshToken: true,
      lastError: null,
      scopes: REQUIRED_GMAIL_SCOPES,
      isActive: true,
      statusLabel: "Gmail Active",
      statusDetail: "Demo mode is simulating a healthy Gmail connection with synced labels and draft metadata.",
      requiresReconnect: false,
      snapshotStatus: "SYNCED",
      snapshotError: null,
      lastAttemptedSyncAt: new Date().toISOString(),
      lastSuccessfulSyncAt: new Date().toISOString(),
      labelCount: 5,
      recentDraftCount: 3,
      readiness,
    };
  }

  if (isDemo) {
    return {
      provider: GOOGLE_PROVIDER,
      status: "not_configured",
      workspaceSlug: "demo",
      connectedEmail: null,
      connectedAt: null,
      lastSyncedAt: null,
      expiresAt: null,
      hasRefreshToken: false,
      lastError: null,
      scopes: [],
      isActive: false,
      statusLabel: "Demo Workspace",
      statusDetail:
        "Demo mode stays isolated from real Gmail accounts. Use Google sign-in with a configured database and OAuth app for production-ready Gmail sync.",
      requiresReconnect: false,
      snapshotStatus: null,
      snapshotError: null,
      lastAttemptedSyncAt: null,
      lastSuccessfulSyncAt: null,
      labelCount: 0,
      recentDraftCount: 0,
      readiness,
    };
  }

  if (!readiness.clientIdReady || !readiness.clientSecretReady) {
    return {
      provider: GOOGLE_PROVIDER,
      status: "missing_oauth_config",
      workspaceSlug: DEFAULT_WORKSPACE_SLUG,
      connectedEmail: null,
      connectedAt: null,
      lastSyncedAt: null,
      expiresAt: null,
      hasRefreshToken: false,
      lastError: null,
      scopes: [],
      isActive: false,
      statusLabel: "OAuth App Missing",
      statusDetail:
        "LeadForge cannot open Google sign-in for Gmail yet because the server-side Google app is not configured.",
      requiresReconnect: true,
      snapshotStatus: null,
      snapshotError: null,
      lastAttemptedSyncAt: null,
      lastSuccessfulSyncAt: null,
      labelCount: 0,
      recentDraftCount: 0,
      readiness,
    };
  }

  if (!readiness.databaseReady) {
    return {
      provider: GOOGLE_PROVIDER,
      status: "not_configured",
      workspaceSlug: DEFAULT_WORKSPACE_SLUG,
      connectedEmail: null,
      connectedAt: null,
      lastSyncedAt: null,
      expiresAt: null,
      hasRefreshToken: false,
      lastError: null,
      scopes: [],
      isActive: false,
      statusLabel: "Workspace Storage Missing",
      statusDetail: "Connect a database first so Gmail credentials and synced workspace data can be stored safely.",
      requiresReconnect: false,
      snapshotStatus: null,
      snapshotError: null,
      lastAttemptedSyncAt: null,
      lastSuccessfulSyncAt: null,
      labelCount: 0,
      recentDraftCount: 0,
      readiness,
    };
  }

  try {
    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();
    const [connection, snapshot] = await Promise.all([
      prisma.workspaceIntegrationConnection.findUnique({
        where: {
          workspaceId_provider: {
            workspaceId: workspace.id,
            provider: GOOGLE_PROVIDER,
          },
        },
      }),
      prisma.workspaceGmailSnapshot.findUnique({
        where: { workspaceId: workspace.id },
      }),
    ]);

    if (!connection) {
      return {
        provider: GOOGLE_PROVIDER,
        status: "not_configured",
        workspaceSlug: workspace.slug,
        connectedEmail: null,
        connectedAt: null,
        lastSyncedAt: null,
        expiresAt: null,
        hasRefreshToken: false,
        lastError: null,
        scopes: [],
        isActive: false,
        statusLabel: "Gmail Not Connected",
        statusDetail:
          "Google sign-in should activate Gmail automatically. Use re-authentication only if you need to repair or switch the connection.",
        requiresReconnect: true,
        snapshotStatus: snapshot?.syncStatus ?? null,
        snapshotError: snapshot?.syncError ?? null,
        lastAttemptedSyncAt: snapshot?.lastAttemptedSyncAt?.toISOString() ?? null,
        lastSuccessfulSyncAt: snapshot?.lastSuccessfulSyncAt?.toISOString() ?? null,
        labelCount: snapshot?.labelCount ?? 0,
        recentDraftCount: snapshot?.recentDraftCount ?? 0,
        readiness,
      };
    }

    const health = getGmailConnectionHealth({
      status: connection.status,
      scope: connection.scope,
      expiresAt: connection.expiresAt,
      refreshToken: connection.refreshToken,
      lastError: connection.lastError,
      connectedEmail: connection.externalAccountEmail,
      syncStatus: snapshot?.syncStatus,
      syncError: snapshot?.syncError,
    });

    return {
      provider: GOOGLE_PROVIDER,
      status: health.status,
      workspaceSlug: workspace.slug,
      connectedEmail: connection.externalAccountEmail,
      connectedAt: connection.createdAt.toISOString(),
      lastSyncedAt: connection.lastSyncedAt?.toISOString() ?? null,
      expiresAt: connection.expiresAt?.toISOString() ?? null,
      hasRefreshToken: Boolean(connection.refreshToken),
      lastError: health.lastError,
      scopes: health.scopes,
      isActive: health.isActive,
      statusLabel: health.statusLabel,
      statusDetail: health.statusDetail,
      requiresReconnect: health.requiresReconnect,
      snapshotStatus: snapshot?.syncStatus ?? null,
      snapshotError: snapshot?.syncError ?? null,
      lastAttemptedSyncAt: snapshot?.lastAttemptedSyncAt?.toISOString() ?? null,
      lastSuccessfulSyncAt: snapshot?.lastSuccessfulSyncAt?.toISOString() ?? null,
      labelCount: snapshot?.labelCount ?? 0,
      recentDraftCount: snapshot?.recentDraftCount ?? 0,
      readiness,
    };
  } catch (error) {
    console.error("Gmail connection check failed, returning degraded state:", error);
    return {
      provider: GOOGLE_PROVIDER,
      status: "error",
      workspaceSlug: DEFAULT_WORKSPACE_SLUG,
      connectedEmail: null,
      connectedAt: null,
      lastSyncedAt: null,
      expiresAt: null,
      hasRefreshToken: false,
      lastError: "Database connection failed",
      scopes: [],
      isActive: false,
      statusLabel: "System Offline",
      statusDetail: "The system could not verify your Gmail status because the database is unreachable.",
      requiresReconnect: false,
      snapshotStatus: null,
      snapshotError: null,
      lastAttemptedSyncAt: null,
      lastSuccessfulSyncAt: null,
      labelCount: 0,
      recentDraftCount: 0,
      readiness,
    };
  }
}

export async function getDefaultWorkspaceGoogleConnection() {
  const session = await auth();
  if (session?.user?.id === "demo-user") {
    return {
      id: "demo-connection",
      workspaceId: "demo",
      provider: GOOGLE_PROVIDER,
      status: "CONNECTED",
      externalAccountId: "demo-google-id",
      externalAccountEmail: "demo-operator@leadforge.ai",
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      tokenType: "Bearer",
      scope: REQUIRED_GMAIL_SCOPES.join(" "),
      expiresAt: null,
      lastSyncedAt: new Date(),
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  if (!hasDatabaseUrl()) {
    return null;
  }

  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();
  return prisma.workspaceIntegrationConnection.findUnique({
    where: {
      workspaceId_provider: {
        workspaceId: workspace.id,
        provider: GOOGLE_PROVIDER,
      },
    },
  });
}

export async function getGmailConfigReadiness(): Promise<GmailConfigReadiness> {
  const expectedRedirectUri = await getExpectedRedirectUri();
  const configuredRedirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI ?? null;
  const clientIdReady = Boolean(process.env.GOOGLE_CLIENT_ID);
  const clientSecretReady = Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const redirectUriReady = true;
  const redirectUriMatchesHost = !configuredRedirectUri || configuredRedirectUri === expectedRedirectUri;
  const blockers: string[] = [];
  const userFacingBlockers: string[] = [];

  if (!hasDatabaseUrl()) {
    blockers.push("DATABASE_URL is missing, so Gmail credentials and sync snapshots cannot be stored.");
    userFacingBlockers.push("Workspace storage is not connected yet, so Gmail connection data cannot be saved.");
  }
  if (!clientIdReady) {
    blockers.push("GOOGLE_CLIENT_ID is missing.");
    userFacingBlockers.push("LeadForge's Google sign-in app is not configured on the server yet.");
  }
  if (!clientSecretReady) {
    blockers.push("GOOGLE_CLIENT_SECRET is missing.");
    if (userFacingBlockers.every((item) => item !== "LeadForge's Google sign-in app is not configured on the server yet.")) {
      userFacingBlockers.push("LeadForge's Google sign-in app is not configured on the server yet.");
    }
  }
  if (!redirectUriMatchesHost) {
    blockers.push(
      `GOOGLE_OAUTH_REDIRECT_URI does not match this app host. Expected ${expectedRedirectUri} but found ${configuredRedirectUri}.`,
    );
    userFacingBlockers.push("The server-side Google callback is pointed at a different app URL and needs to be corrected.");
  }

  return {
    databaseReady: hasDatabaseUrl(),
    clientIdReady,
    clientSecretReady,
    redirectUriReady,
    expectedRedirectUri,
    configuredRedirectUri,
    redirectUriMatchesHost,
    blockers,
    userFacingBlockers,
  };
}

export function hasGoogleOAuthConfig() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET,
  );
}

async function getExpectedRedirectUri() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "127.0.0.1:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}/api/integrations/google/callback`;
}
