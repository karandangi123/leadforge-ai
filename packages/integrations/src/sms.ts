/**
 * SMS / Twilio Integration Adapter for LeadForge AI
 *
 * Provides approval-safe SMS outreach capabilities via Twilio:
 * - SMS message sending (outbound)
 * - Inbound webhook handling for reply tracking
 * - Delivery status callback support
 * - Phone number validation (E.164 format enforcement)
 *
 * Integration mode: approval-gated for new leads, webhook-driven for replies.
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 */

export type TwilioCredentials = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
};

export type SmsPayload = {
  to: string;       // E.164 format: +15551234567
  body: string;     // Max 1600 chars (auto-splits to multiple segments)
  leadId?: string;
  statusCallbackUrl?: string;
};

export type SmsResult = {
  success: boolean;
  twilioSid?: string;
  status: "queued" | "sent" | "failed" | "undelivered";
  errorCode?: string;
  errorMessage?: string;
  segments?: number;
  price?: string;
  priceCurrency?: string;
};

export type TwilioStatusWebhook = {
  MessageSid: string;
  MessageStatus: string;
  ErrorCode?: string;
  To: string;
  From: string;
};

export type DialerCallPayload = {
  to: string;               // E.164 format
  callbackUrl: string;      // TwiML URL for call flow
  statusCallbackUrl?: string;
  machineDetection?: boolean;
  recordCall?: boolean;
  leadId?: string;
  note?: string;
};

export type DialerCallResult = {
  success: boolean;
  twilioCallSid?: string;
  status: "queued" | "initiated" | "failed";
  errorMessage?: string;
};

/**
 * Check if Twilio credentials are configured.
 */
export function hasTwilioCredentials() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER,
  );
}

/**
 * Get Twilio credentials from environment.
 */
export function getTwilioCredentials(): TwilioCredentials {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error(
      "Twilio credentials are not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.",
    );
  }

  return { accountSid, authToken, fromNumber };
}

/**
 * Validate and normalize a phone number to E.164 format.
 * Returns null if the number cannot be normalized.
 */
export function normalizePhoneNumber(phone: string): string | null {
  // Strip all non-digit characters except leading +
  const cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, "");
  
  // Already in E.164
  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    return cleaned;
  }

  // US numbers without country code
  if (/^\d{10}$/.test(cleaned)) {
    return `+1${cleaned}`;
  }

  // US numbers with leading 1
  if (/^1\d{10}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Send an SMS via Twilio REST API.
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
 */
export async function sendSmsMessage(
  payload: SmsPayload,
  credentials?: TwilioCredentials,
): Promise<SmsResult> {
  const creds = credentials ?? getTwilioCredentials();
  const normalizedTo = normalizePhoneNumber(payload.to);

  if (!normalizedTo) {
    return {
      success: false,
      status: "failed",
      errorMessage: `Invalid phone number format: ${payload.to}. Use E.164 format (+15551234567).`,
    };
  }

  if (payload.body.length > 1600) {
    return {
      success: false,
      status: "failed",
      errorMessage: "SMS body exceeds 1600 characters. Split into shorter messages.",
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Messages.json`;
  const formData = new URLSearchParams({
    To: normalizedTo,
    From: creds.fromNumber,
    Body: payload.body,
  });

  if (payload.statusCallbackUrl) {
    formData.set("StatusCallback", payload.statusCallbackUrl);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = await response.json() as {
    sid?: string;
    status?: string;
    error_code?: string;
    error_message?: string;
    num_segments?: string;
    price?: string;
    price_unit?: string;
  };

  if (!response.ok) {
    return {
      success: false,
      status: "failed",
      errorCode: String(data.error_code ?? "unknown"),
      errorMessage: data.error_message ?? "SMS send failed",
    };
  }

  return {
    success: true,
    twilioSid: data.sid,
    status: (data.status ?? "queued") as SmsResult["status"],
    segments: data.num_segments ? parseInt(data.num_segments, 10) : 1,
    price: data.price ?? undefined,
    priceCurrency: data.price_unit ?? undefined,
  };
}

/**
 * Initiate an outbound call via Twilio.
 * Uses TwiML for call flow — connect to a browser client or conference.
 */
export async function initiateDialerCall(
  payload: DialerCallPayload,
  credentials?: TwilioCredentials,
): Promise<DialerCallResult> {
  const creds = credentials ?? getTwilioCredentials();
  const normalizedTo = normalizePhoneNumber(payload.to);

  if (!normalizedTo) {
    return {
      success: false,
      status: "failed",
      errorMessage: `Invalid phone number: ${payload.to}`,
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Calls.json`;
  const formData = new URLSearchParams({
    To: normalizedTo,
    From: creds.fromNumber,
    Url: payload.callbackUrl,
  });

  if (payload.statusCallbackUrl) {
    formData.set("StatusCallback", payload.statusCallbackUrl);
    formData.set("StatusCallbackMethod", "POST");
  }

  if (payload.machineDetection) {
    formData.set("MachineDetection", "DetectMessageEnd");
  }

  if (payload.recordCall) {
    formData.set("Record", "true");
    formData.set("RecordingStatusCallback", payload.statusCallbackUrl ?? "");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = await response.json() as {
    sid?: string;
    status?: string;
    error_message?: string;
  };

  if (!response.ok) {
    return {
      success: false,
      status: "failed",
      errorMessage: data.error_message ?? "Call initiation failed",
    };
  }

  return {
    success: true,
    twilioCallSid: data.sid,
    status: "initiated",
  };
}

/**
 * Build a TwiML response for an inbound or outbound call.
 * Returns XML string for Twilio to execute.
 */
export function buildDialerTwiML(options: {
  greeting?: string;
  recordCall?: boolean;
  conferenceRoom?: string;
  forwardTo?: string;
}): string {
  const parts: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', "<Response>"];

  if (options.greeting) {
    parts.push(`  <Say voice="alice">${escapeXml(options.greeting)}</Say>`);
  }

  if (options.recordCall) {
    parts.push("  <Record maxLength=\"3600\" playBeep=\"true\" />");
  }

  if (options.conferenceRoom) {
    parts.push(`  <Dial><Conference>${escapeXml(options.conferenceRoom)}</Conference></Dial>`);
  } else if (options.forwardTo) {
    parts.push(`  <Dial>${escapeXml(options.forwardTo)}</Dial>`);
  }

  parts.push("</Response>");
  return parts.join("\n");
}

/**
 * Parse and validate a Twilio status webhook payload.
 */
export function parseTwilioSmsWebhook(body: Record<string, string>): TwilioStatusWebhook | null {
  if (!body.MessageSid || !body.MessageStatus) return null;
  return {
    MessageSid: body.MessageSid,
    MessageStatus: body.MessageStatus,
    ErrorCode: body.ErrorCode,
    To: body.To,
    From: body.From,
  };
}

/**
 * Validate Twilio webhook signature for security.
 * Prevents spoofed webhook calls.
 */
export async function validateTwilioWebhookSignature(input: {
  signature: string;
  url: string;
  params: Record<string, string>;
}): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  // Sort params alphabetically and concatenate
  const sortedParams = Object.keys(input.params)
    .sort()
    .reduce((acc, key) => acc + key + (input.params[key] ?? ""), "");

  const message = input.url + sortedParams;
  const key = Buffer.from(authToken, "utf-8");
  const msgBuffer = Buffer.from(message, "utf-8");

  const { createHmac } = await import("node:crypto");
  const expectedSig = createHmac("sha1", key)
    .update(msgBuffer)
    .digest("base64");

  return expectedSig === input.signature;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
