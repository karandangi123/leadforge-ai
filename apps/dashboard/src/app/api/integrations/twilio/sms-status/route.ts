import { NextRequest, NextResponse } from "next/server";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { parseTwilioSmsWebhook, validateTwilioWebhookSignature } from "@leadforge/integrations";

/**
 * Twilio SMS status callback webhook.
 * Receives delivery status updates for outbound SMS messages.
 * Validates the Twilio signature before processing.
 */
export async function POST(request: NextRequest) {
  // Validate Twilio signature
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody).entries());

  const isValid = await validateTwilioWebhookSignature({
    signature,
    url: request.url,
    params,
  });

  // In dev mode, skip signature validation (no real Twilio)
  const isDev = process.env.NODE_ENV !== "production";
  if (!isValid && !isDev) {
    return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 403 });
  }

  const webhook = parseTwilioSmsWebhook(params);
  if (!webhook) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ received: true, note: "No database configured." });
  }

  try {
    const prisma = getPrisma();
    const status = mapTwilioSmsStatus(webhook.MessageStatus);

    await prisma.smsMessage.updateMany({
      where: { twilioSid: webhook.MessageSid },
      data: {
        status,
        deliveredAt: status === "DELIVERED" ? new Date() : undefined,
        twilioError: webhook.ErrorCode
          ? `Twilio error code: ${webhook.ErrorCode}`
          : null,
      },
    });

    // Log a trace if the message failed
    if (status === "FAILED" || status === "UNDELIVERED") {
      const sms = await prisma.smsMessage.findUnique({
        where: { twilioSid: webhook.MessageSid },
      });
      if (sms) {
        await prisma.agentTrace.create({
          data: {
            leadId: sms.leadId,
            agentName: "SMS Bridge",
            status: "FAILED",
            input: { twilioSid: webhook.MessageSid, to: webhook.To },
            output: {
              message: `SMS delivery failed (${status}). Error code: ${webhook.ErrorCode ?? "none"}`,
            },
            errorMessage: webhook.ErrorCode ? `Twilio error: ${webhook.ErrorCode}` : "SMS undelivered",
          },
        });
      }
    }
  } catch (err) {
    console.error("[Twilio SMS Webhook] DB update failed:", err);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function mapTwilioSmsStatus(
  status: string,
): "QUEUED" | "SENT" | "DELIVERED" | "FAILED" | "UNDELIVERED" {
  switch (status) {
    case "queued":
    case "sending":
      return "QUEUED";
    case "sent":
      return "SENT";
    case "delivered":
      return "DELIVERED";
    case "failed":
      return "FAILED";
    case "undelivered":
      return "UNDELIVERED";
    default:
      return "QUEUED";
  }
}
