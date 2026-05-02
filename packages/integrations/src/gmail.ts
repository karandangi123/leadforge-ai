import { randomBytes } from "node:crypto";
import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.labels",
  "openid",
  "email",
  "profile",
];

const GMAIL_COMPOSE_SCOPE = "https://www.googleapis.com/auth/gmail.compose";
const GMAIL_LABELS_SCOPE = "https://www.googleapis.com/auth/gmail.labels";

export type GoogleOAuthTokenSet = {
  accessToken: string | null;
  refreshToken: string | null;
  expiryDate: number | null;
  tokenType: string | null;
  scope: string | null;
};

export type StoredGoogleConnection = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  tokenType?: string | null;
  scope?: string | null;
};

export type GmailLabelSnapshot = {
  id: string;
  name: string;
  type: string;
  messagesTotal?: number;
  messagesUnread?: number;
  threadsTotal?: number;
  threadsUnread?: number;
};

export type GmailDraftSnapshot = {
  id: string;
  threadId: string | null;
  internalDate: string | null;
  subject: string | null;
  snippet: string | null;
};

export type GmailWorkspaceSnapshotData = {
  labels: GmailLabelSnapshot[];
  recentDrafts: GmailDraftSnapshot[];
};

export function getGmailComposeScopes() {
  return [...SCOPES];
}

export function getRequiredGmailScopes() {
  return [GMAIL_COMPOSE_SCOPE, GMAIL_LABELS_SCOPE];
}

export function getGmailComposeScope() {
  return GMAIL_COMPOSE_SCOPE;
}

export function getGmailLabelsScope() {
  return GMAIL_LABELS_SCOPE;
}

export function hasGoogleOAuthCredentials() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function createGoogleOAuthState() {
  return randomBytes(24).toString("hex");
}

export function createGoogleOAuthUrl(input: {
  redirectUri: string;
  state: string;
}) {
  const client = getGoogleOAuthClient(input.redirectUri);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: getGmailComposeScopes(),
    state: input.state,
  });
}

export async function exchangeGoogleOAuthCode(input: {
  code: string;
  redirectUri: string;
}): Promise<GoogleOAuthTokenSet> {
  const client = getGoogleOAuthClient(input.redirectUri);
  const { tokens } = await client.getToken(input.code);

  return {
    accessToken: tokens.access_token ?? null,
    refreshToken: tokens.refresh_token ?? null,
    expiryDate: tokens.expiry_date ?? null,
    tokenType: tokens.token_type ?? null,
    scope: tokens.scope ?? null,
  };
}

export async function getGoogleAccountProfile(input: {
  redirectUri: string;
  tokens: GoogleOAuthTokenSet;
}) {
  const oauth2 = getGoogleOAuthClient(input.redirectUri);
  oauth2.setCredentials({
    access_token: input.tokens.accessToken ?? undefined,
    refresh_token: input.tokens.refreshToken ?? undefined,
    expiry_date: input.tokens.expiryDate ?? undefined,
    token_type: input.tokens.tokenType ?? undefined,
    scope: input.tokens.scope ?? undefined,
  });

  const oauth2Api = google.oauth2({ auth: oauth2, version: "v2" });
  const response = await oauth2Api.userinfo.get();

  return {
    id: response.data.id ?? null,
    email: response.data.email ?? null,
    verifiedEmail: response.data.verified_email ?? false,
    name: response.data.name ?? null,
  };
}

export async function createGmailDraftFromConnection(
  connection: StoredGoogleConnection,
  params: {
    to: string;
    subject: string;
    body: string;
    threadId?: string;
  },
) {
  const { gmail, tokens } = await getAuthorizedGmailClient(connection);

  const utf8Subject = `=?utf-8?B?${Buffer.from(params.subject).toString("base64")}?=`;
  const messageParts = [
    `To: ${params.to}`,
    `Subject: ${utf8Subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    params.body,
  ];
  const message = messageParts.join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: {
        raw: encodedMessage,
        threadId: params.threadId,
      },
    },
  });

  return {
    draft: res.data,
    tokens,
  };
}

export async function fetchGmailWorkspaceSnapshot(
  connection: StoredGoogleConnection,
  options?: { maxDrafts?: number },
) {
  const { gmail, tokens } = await getAuthorizedGmailClient(connection);
  const maxDrafts = options?.maxDrafts ?? 10;

  const [labelsResponse, draftsResponse] = await Promise.all([
    gmail.users.labels.list({ userId: "me" }),
    gmail.users.drafts.list({ userId: "me", maxResults: maxDrafts }),
  ]);

  const labels: GmailLabelSnapshot[] = (labelsResponse.data.labels ?? []).map((label) => ({
    id: label.id ?? "unknown",
    name: label.name ?? "Unnamed label",
    type: label.type ?? "system",
    messagesTotal: label.messagesTotal ?? undefined,
    messagesUnread: label.messagesUnread ?? undefined,
    threadsTotal: label.threadsTotal ?? undefined,
    threadsUnread: label.threadsUnread ?? undefined,
  }));

  const draftIds = (draftsResponse.data.drafts ?? [])
    .map((draft) => draft.id)
    .filter((draftId): draftId is string => Boolean(draftId));

  const recentDrafts: GmailDraftSnapshot[] = await Promise.all(
    draftIds.map(async (draftId) => {
      const response = await gmail.users.drafts.get({
        userId: "me",
        id: draftId,
        format: "full",
      });

      const message = response.data.message;
      const headers = message?.payload?.headers ?? [];
      const subjectHeader = headers.find((header: { name?: string | null }) => header.name?.toLowerCase() === "subject");

      return {
        id: response.data.id ?? draftId,
        threadId: message?.threadId ?? null,
        internalDate: message?.internalDate ?? null,
        subject: subjectHeader?.value ?? null,
        snippet: message?.snippet ?? null,
      };
    }),
  );

  return {
    snapshot: {
      labels,
      recentDrafts,
    } satisfies GmailWorkspaceSnapshotData,
    tokens,
  };
}

export async function refreshGoogleAccessToken(connection: StoredGoogleConnection) {
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "http://localhost:3000/api/integrations/google/callback";
  const client = getGoogleOAuthClient(redirectUri);
  client.setCredentials({
    access_token: connection.accessToken ?? undefined,
    refresh_token: connection.refreshToken ?? undefined,
    expiry_date: connection.expiresAt?.getTime(),
  });

  const { credentials } = await client.refreshAccessToken();
  return {
    accessToken: credentials.access_token ?? connection.accessToken ?? null,
    refreshToken: credentials.refresh_token ?? connection.refreshToken ?? null,
    expiryDate: credentials.expiry_date ?? null,
    tokenType: credentials.token_type ?? null,
    scope: credentials.scope ?? null,
  } satisfies GoogleOAuthTokenSet;
}

function getGoogleOAuthClient(redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function getAuthorizedGmailClient(connection: StoredGoogleConnection) {
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "http://localhost:3000/api/integrations/google/callback";
  const oauth2 = getGoogleOAuthClient(redirectUri);
  oauth2.setCredentials({
    access_token: connection.accessToken ?? undefined,
    refresh_token: connection.refreshToken ?? undefined,
    expiry_date: connection.expiresAt?.getTime(),
    token_type: connection.tokenType ?? undefined,
    scope: connection.scope ?? undefined,
  });

  let refreshed: GoogleOAuthTokenSet | null = null;
  const shouldRefresh =
    !connection.accessToken ||
    (connection.expiresAt ? connection.expiresAt.getTime() - Date.now() < 60_000 : false);

  if (shouldRefresh && connection.refreshToken) {
    refreshed = await refreshGoogleAccessToken(connection);
    oauth2.setCredentials({
      access_token: refreshed.accessToken ?? undefined,
      refresh_token: refreshed.refreshToken ?? undefined,
      expiry_date: refreshed.expiryDate ?? undefined,
      token_type: refreshed.tokenType ?? undefined,
      scope: refreshed.scope ?? undefined,
    });
  }

  return {
    gmail: google.gmail({ version: "v1", auth: oauth2 }),
    tokens: refreshed,
  };
}
