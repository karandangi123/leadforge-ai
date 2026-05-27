"use server";

import { BillingService } from "@leadforge/billing";
import { getActiveWorkspace } from "@/lib/workspace";
import { SecurityService } from "@/lib/security";
import { z } from "zod";

export async function createCheckoutSession(rawPlan: "PRO" | "AGENCY") {
  const plan = z.enum(["PRO", "AGENCY"]).parse(rawPlan);
  try {
    const workspace = await getActiveWorkspace();
    const url = await BillingService.createCheckoutSession(workspace.id, plan);

    await SecurityService.recordAuditLog({
      workspaceId: workspace.id,
      action: "BILLING_CHECKOUT_INIT",
      entityType: "Workspace",
      entityId: workspace.id,
      metadata: { plan },
    });

    return url;
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw new Error("Checkout failed");
  }
}
