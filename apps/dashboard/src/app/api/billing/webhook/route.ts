import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { BillingService } from "@leadforge/billing";
import { SecurityService } from "@/lib/security";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await BillingService.handleWebhook(body, signature, webhookSecret);

    // Record system audit for the event
    await SecurityService.recordAuditLog({
      workspaceId: "system",
      action: "STRIPE_WEBHOOK_RECEIVED",
      entityType: "Payment",
      entityId: "stripe",
      metadata: { status: "success" },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Stripe Webhook Error]", error);

    await SecurityService.recordAuditLog({
      workspaceId: "system",
      action: "STRIPE_WEBHOOK_FAILED",
      entityType: "Payment",
      entityId: "stripe",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

// Ensure the body is not parsed as JSON by Next.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
