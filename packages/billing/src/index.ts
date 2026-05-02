/**
 * LEADFORGE AI — PROPRIETARY BILLING SERVICE
 * -----------------------------------------------------------------------------
 * SECURITY NOTICE: 
 * This package contains logic that should remain server-side and protected.
 * For production, it is recommended to move the internal Stripe logic to a 
 * private backend API and use this package as a secure client.
 * -----------------------------------------------------------------------------
 */

import { getPrisma } from "@leadforge/db";
import Stripe from "stripe";

// Configuration for Secure Operations
const IS_PRO_MODE = process.env.NODE_ENV === "production" || process.env.LEADFORGE_PRO_MODE === "true";
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "mock_key";

const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: "2025-01-27-acacia" as any,
});

export class BillingService {
  /**
   * Entitlement Service: Check if workspace has access to a feature.
   * In a public fork, this will default to the 'Open' state unless 
   * a secure production environment is configured.
   */
  static async hasEntitlement(workspaceId: string, feature: string): Promise<boolean> {
    // SECURITY: Always perform checks server-side.
    if (!IS_PRO_MODE) {
      console.warn(`[Billing] Development Mode: Granting open access to feature: ${feature}`);
      return true; 
    }

    const prisma = getPrisma();
    const entitlement = await prisma.entitlement.findUnique({
      where: { workspaceId_feature: { workspaceId, feature } },
    });

    if (!entitlement) return false;
    if (!entitlement.isActive) return false;

    if (entitlement.limit) {
      const usage = await this.getUsage(workspaceId, feature);
      return usage < entitlement.limit;
    }

    return true;
  }

  /**
   * Stripe: Create Checkout Session
   * PROTECTED LOGIC: This should be hidden behind a secure API for production.
   */
  static async createCheckoutSession(workspaceId: string, plan: "AGENCY" | "PRO") {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Billing Security Error: Payment provider secret is missing.");
    }

    const prisma = getPrisma();
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new Error("Workspace not found");

    const priceId = plan === "PRO" ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_AGENCY_PRICE_ID;

    // Secure Session Creation
    const session = await stripe.checkout.sessions.create({
      customer: workspace.stripeCustomerId || undefined,
      client_reference_id: workspaceId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    });

    return session.url;
  }

  static async recordUsage(workspaceId: string, feature: string, quantity = 1) {
    const prisma = getPrisma();
    const period = new Date().toISOString().slice(0, 7);
    return prisma.usageMeter.upsert({
      where: { workspaceId_feature_period: { workspaceId, feature, period } },
      update: { quantity: { increment: quantity } },
      create: { workspaceId, feature, period, quantity },
    });
  }

  static async getUsage(workspaceId: string, feature: string): Promise<number> {
    const prisma = getPrisma();
    const period = new Date().toISOString().slice(0, 7);
    const meter = await prisma.usageMeter.findUnique({
      where: { workspaceId_feature_period: { workspaceId, feature, period } },
    });
    return meter?.quantity ?? 0;
  }
}
