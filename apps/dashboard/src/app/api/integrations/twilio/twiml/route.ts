import { NextRequest, NextResponse } from "next/server";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { buildDialerTwiML } from "@leadforge/integrations";

/**
 * TwiML endpoint for Twilio to call during outbound calls.
 * Returns XML instructions for the call flow.
 */
export async function POST(request: NextRequest) {
  const body = await request.formData();
  const leadId = request.nextUrl.searchParams.get("leadId");
  const callSid = body.get("CallSid") as string;
  const callStatus = body.get("CallStatus") as string;

  // Build a simple greeting TwiML
  const greeting = leadId
    ? `Hi, this is an outreach call from your LeadForge workspace. Please hold while we connect you.`
    : `Hello, this is an automated outreach call.`;

  const twiml = buildDialerTwiML({
    greeting,
    recordCall: request.nextUrl.searchParams.get("record") === "1",
  });

  // Update call status in DB if we have context
  if (hasDatabaseUrl() && callSid) {
    try {
      const prisma = getPrisma();
      await prisma.dialerCall.updateMany({
        where: { twilioCallSid: callSid },
        data: {
          status: callStatus === "in-progress" ? "IN_PROGRESS" : "SCHEDULED",
          startedAt: callStatus === "in-progress" ? new Date() : undefined,
        },
      });
    } catch {
      // Non-critical: continue serving TwiML
    }
  }

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET() {
  const twiml = buildDialerTwiML({ greeting: "LeadForge dialer ready." });
  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
