import { NextRequest, NextResponse } from "next/server";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { validateTwilioWebhookSignature } from "@leadforge/integrations";

/**
 * Twilio Call status callback webhook.
 * Receives call lifecycle events: initiated → ringing → in-progress → completed/failed.
 * Updates DialerCall records and logs traces for completed calls.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody).entries());

  const isValid = await validateTwilioWebhookSignature({
    signature,
    url: request.url,
    params,
  });

  const isDev = process.env.NODE_ENV !== "production";
  if (!isValid && !isDev) {
    return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 403 });
  }

  const callSid = params.CallSid;
  const callStatus = params.CallStatus;
  const callDuration = params.CallDuration ? parseInt(params.CallDuration, 10) : undefined;
  const recordingUrl = params.RecordingUrl;

  if (!callSid || !callStatus) {
    return NextResponse.json({ error: "Missing CallSid or CallStatus" }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ received: true, note: "No database configured." });
  }

  try {
    const prisma = getPrisma();
    const status = mapTwilioCallStatus(callStatus);

    await prisma.dialerCall.updateMany({
      where: { twilioCallSid: callSid },
      data: {
        status,
        durationSeconds: callDuration ?? undefined,
        recordingUrl: recordingUrl ?? undefined,
        endedAt:
          ["COMPLETED", "NO_ANSWER", "VOICEMAIL", "FAILED", "CANCELLED"].includes(status)
            ? new Date()
            : undefined,
      },
    });

    // Log a trace on completion or failure
    if (["COMPLETED", "FAILED", "NO_ANSWER", "VOICEMAIL"].includes(status)) {
      const call = await prisma.dialerCall.findUnique({
        where: { twilioCallSid: callSid },
      });
      if (call) {
        await prisma.agentTrace.create({
          data: {
            leadId: call.leadId,
            agentName: "Dialer Bridge",
            status: status === "COMPLETED" ? "SUCCEEDED" : "FAILED",
            input: { twilioCallSid: callSid, to: call.contactPhone },
            output: {
              message: `Call ${status.toLowerCase()}. Duration: ${callDuration ?? 0}s.`,
              recordingUrl: recordingUrl ?? null,
            },
            errorMessage: status === "FAILED" ? "Twilio call failed." : undefined,
          },
        });
      }
    }
  } catch (err) {
    console.error("[Twilio Call Webhook] DB update failed:", err);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function mapTwilioCallStatus(
  status: string,
): "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "NO_ANSWER" | "VOICEMAIL" | "FAILED" | "CANCELLED" {
  switch (status) {
    case "initiated":
    case "queued":
    case "ringing":
      return "IN_PROGRESS";
    case "in-progress":
      return "IN_PROGRESS";
    case "completed":
      return "COMPLETED";
    case "no-answer":
      return "NO_ANSWER";
    case "busy":
      return "NO_ANSWER";
    case "failed":
      return "FAILED";
    case "canceled":
      return "CANCELLED";
    default:
      return "IN_PROGRESS";
  }
}
