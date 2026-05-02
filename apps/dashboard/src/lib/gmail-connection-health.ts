import { getRequiredGmailScopes } from "@leadforge/integrations";

const REQUIRED_GMAIL_SCOPES = getRequiredGmailScopes();

export function getRequiredGmailScope() {
  return REQUIRED_GMAIL_SCOPES[0] ?? "https://www.googleapis.com/auth/gmail.compose";
}

export function getRequiredWorkspaceGmailScopes() {
  return [...REQUIRED_GMAIL_SCOPES];
}

export function getGmailConnectionHealth(input: {
  status: string;
  scope: string | null;
  expiresAt: Date | null;
  refreshToken: string | null;
  lastError: string | null;
  connectedEmail: string | null;
  syncStatus?: string | null;
  syncError?: string | null;
}) {
  const scopes = input.scope ? input.scope.split(" ").filter(Boolean) : [];
  const missingRequiredScopes = REQUIRED_GMAIL_SCOPES.filter((scope) => !scopes.includes(scope));
  const expiredWithoutRefresh =
    Boolean(input.expiresAt && input.expiresAt.getTime() < Date.now() && !input.refreshToken);

  if (input.status === "ERROR") {
    return {
      status: "error" as const,
      scopes,
      isActive: false,
      statusLabel: "Connection Needs Attention",
      statusDetail: "LeadForge could not confirm a usable Gmail draft connection. Re-authenticate to repair it.",
      requiresReconnect: true,
      lastError: input.lastError,
    };
  }

  if (missingRequiredScopes.length > 0) {
    return {
      status: "error" as const,
      scopes,
      isActive: false,
      statusLabel: "Missing Gmail Scope",
      statusDetail:
        "The connected Google account is missing Gmail draft or label permissions. Re-authenticate to restore Gmail Active status.",
      requiresReconnect: true,
      lastError: input.lastError ?? `Missing Gmail scopes: ${missingRequiredScopes.join(", ")}`,
    };
  }

  if (expiredWithoutRefresh) {
    return {
      status: "expired" as const,
      scopes,
      isActive: false,
      statusLabel: "Connection Expired",
      statusDetail:
        "The Google access token expired and there is no refresh token on file. Re-authenticate to restore draft creation.",
      requiresReconnect: true,
      lastError: input.lastError,
    };
  }

  if (input.syncStatus === "FAILED") {
    return {
      status: "error" as const,
      scopes,
      isActive: false,
      statusLabel: "Gmail Sync Needs Attention",
      statusDetail:
        "Google is connected, but LeadForge could not refresh Gmail labels and draft metadata. Repair the connection or run a fresh sync.",
      requiresReconnect: false,
      lastError: input.syncError ?? input.lastError,
    };
  }

  if (input.syncStatus && input.syncStatus !== "SYNCED") {
    return {
      status: "not_configured" as const,
      scopes,
      isActive: false,
      statusLabel: "Gmail Sync Pending",
      statusDetail:
        "Google is connected, but the workspace Gmail snapshot has not finished syncing yet. Refresh Gmail data to complete activation.",
      requiresReconnect: false,
      lastError: input.syncError ?? input.lastError,
    };
  }

  return {
    status: "connected" as const,
    scopes,
    isActive: true,
    statusLabel: input.connectedEmail ? `Gmail Active: ${input.connectedEmail}` : "Gmail Active",
    statusDetail:
      "Google sign-in has already connected this workspace, and Gmail labels plus recent drafts are synced for operator visibility.",
    requiresReconnect: false,
    lastError: input.lastError,
  };
}
