/**
 * LinkedIn Integration Adapter for LeadForge AI
 *
 * This adapter provides approval-safe LinkedIn outreach capabilities:
 * - Connection request preparation with personalized notes
 * - InMail composition and queuing (requires LinkedIn Sales Navigator API)
 * - Message drafting for existing connections
 * - Profile view tracking
 *
 * Integration mode: approval-gated (no auto-send without human confirmation)
 * API: LinkedIn Partner API / Sales Navigator API (requires application approval)
 */

export type LinkedInCredentials = {
  accessToken: string | null;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  tokenType?: string | null;
};

export type LinkedInProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  profilePictureUrl?: string;
  publicProfileUrl?: string;
};

export type LinkedInConnectionRequest = {
  recipientProfileUrl: string;
  recipientName: string;
  note?: string; // Max 300 chars for connection note
};

export type LinkedInMessage = {
  recipientUrn?: string;
  recipientProfileUrl: string;
  subject?: string;
  body: string;
  isInMail?: boolean;
};

export type LinkedInActivityResult = {
  activityId: string;
  externalMessageId?: string;
  status: "QUEUED" | "SENT" | "REQUIRES_APPROVAL" | "ERROR";
  message: string;
  queuedForApproval?: boolean;
};

export type LinkedInConnectionStatus = {
  connected: boolean;
  profileId?: string;
  profileName?: string;
  connectionCount?: number;
  hasApiAccess: boolean;
  hasSalesNavigator: boolean;
};

/**
 * Check if LinkedIn API credentials are configured.
 * LinkedIn requires explicit partner API access from LinkedIn.
 */
export function hasLinkedInCredentials() {
  return Boolean(
    process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET,
  );
}

/**
 * Check if LinkedIn Sales Navigator API is configured for InMail.
 */
export function hasLinkedInSalesNavigator() {
  return Boolean(process.env.LINKEDIN_SALES_NAVIGATOR_TOKEN);
}

/**
 * Build a LinkedIn OAuth authorization URL.
 * Scopes needed: r_liteprofile, r_emailaddress, w_member_social
 * For messaging (InMail): requires Sales Navigator API approval.
 */
export function createLinkedInOAuthUrl(input: {
  redirectUri: string;
  state: string;
  scopes?: string[];
}) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) throw new Error("LINKEDIN_CLIENT_ID is not configured.");

  const defaultScopes = ["r_liteprofile", "r_emailaddress", "w_member_social"];
  const scopeString = (input.scopes || defaultScopes).join(" ");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: input.redirectUri,
    state: input.state,
    scope: scopeString,
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange a LinkedIn OAuth code for tokens.
 */
export async function exchangeLinkedInOAuthCode(input: {
  code: string;
  redirectUri: string;
}): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn OAuth credentials are not configured.");
  }

  const response = await fetch(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: input.code,
        redirect_uri: input.redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${err}`);
  }

  const data = await response.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Get the authenticated LinkedIn member's profile.
 */
export async function getLinkedInProfile(
  credentials: LinkedInCredentials,
): Promise<LinkedInProfile> {
  if (!credentials.accessToken) {
    throw new Error("LinkedIn access token is required.");
  }

  const response = await fetch("https://api.linkedin.com/v2/me", {
    headers: {
      Authorization: `Bearer ${credentials.accessToken}`,
      "LinkedIn-Version": "202401",
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch LinkedIn profile: ${err}`);
  }

  const data = await response.json() as {
    id: string;
    localizedFirstName?: string;
    localizedLastName?: string;
    headline?: string;
    profilePicture?: unknown;
    vanityName?: string;
  };
  return {
    id: data.id,
    firstName: data.localizedFirstName,
    lastName: data.localizedLastName,
    headline: data.headline,
    publicProfileUrl: data.vanityName
      ? `https://www.linkedin.com/in/${data.vanityName}`
      : undefined,
  };
}

/**
 * Queue a LinkedIn connection request for approval.
 * This does NOT auto-send — the request is stored for human review.
 * Actual sending requires LinkedIn Partner API access.
 */
export function buildLinkedInConnectionRequest(
  request: LinkedInConnectionRequest,
): {
  platform: "LINKEDIN";
  type: "CONNECTION_REQUEST";
  payload: LinkedInConnectionRequest;
  noteCharCount: number;
  requiresApproval: true;
  apiNote: string;
} {
  const note = request.note ?? "";
  if (note.length > 300) {
    throw new Error(
      "LinkedIn connection note cannot exceed 300 characters.",
    );
  }

  return {
    platform: "LINKEDIN",
    type: "CONNECTION_REQUEST",
    payload: request,
    noteCharCount: note.length,
    requiresApproval: true,
    apiNote:
      "Sending requires LinkedIn Partner API access. This request is queued for manual execution until API access is granted.",
  };
}

/**
 * Build an InMail or message payload for approval-gated delivery.
 * InMail requires LinkedIn Sales Navigator API.
 * Regular messages require an existing connection.
 */
export function buildLinkedInMessage(
  message: LinkedInMessage,
): {
  platform: "LINKEDIN";
  type: "INMAIL" | "MESSAGE";
  payload: LinkedInMessage;
  requiresApproval: true;
  requiresSalesNavigator: boolean;
  apiNote: string;
} {
  return {
    platform: "LINKEDIN",
    type: message.isInMail ? "INMAIL" : "MESSAGE",
    payload: message,
    requiresApproval: true,
    requiresSalesNavigator: Boolean(message.isInMail),
    apiNote: message.isInMail
      ? "InMail requires LinkedIn Sales Navigator API access (LINKEDIN_SALES_NAVIGATOR_TOKEN)."
      : "Direct messages require an accepted connection with the recipient.",
  };
}

/**
 * Send a LinkedIn InMail via Sales Navigator API.
 * Requires LINKEDIN_SALES_NAVIGATOR_TOKEN env var.
 */
export async function sendLinkedInInMail(
  credentials: LinkedInCredentials,
  message: LinkedInMessage,
): Promise<LinkedInActivityResult> {
  const token =
    process.env.LINKEDIN_SALES_NAVIGATOR_TOKEN ?? credentials.accessToken;

  if (!token) {
    throw new Error(
      "LinkedIn Sales Navigator token is required for InMail. Set LINKEDIN_SALES_NAVIGATOR_TOKEN.",
    );
  }

  // Sales Navigator InMail API endpoint
  const response = await fetch(
    "https://api.linkedin.com/v2/messages?mailboxes=List(urn%3Ali%3AfsdMailbox%3A(Member,urn%3Ali%3Amember%3Ame))",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202401",
      },
      body: JSON.stringify({
        recipients: [{ person: { handle: `~` } }],
        subject: message.subject ?? "A note from LeadForge",
        body: message.body,
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    return {
      activityId: crypto.randomUUID(),
      status: "ERROR",
      message: `LinkedIn InMail API error: ${errText}`,
    };
  }

  const locationHeader = response.headers.get("location");
  const externalId = locationHeader?.split("/").pop();

  return {
    activityId: crypto.randomUUID(),
    externalMessageId: externalId,
    status: "SENT",
    message: "LinkedIn InMail sent successfully.",
  };
}

/**
 * Get LinkedIn connection status for workspace configuration display.
 */
export function getLinkedInConnectionStatus(): LinkedInConnectionStatus {
  return {
    connected: hasLinkedInCredentials(),
    hasApiAccess: hasLinkedInCredentials(),
    hasSalesNavigator: hasLinkedInSalesNavigator(),
  };
}
