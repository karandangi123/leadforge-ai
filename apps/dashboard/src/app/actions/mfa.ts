"use server";

import { auth } from "@/auth";
import { generateMfaSecret, verifyMfaToken, enableMfaForUser, disableMfaForUser } from "@/lib/mfa";
import { revalidatePath } from "next/cache";
import { SecurityService } from "@/lib/security";
import { z } from "zod";

/**
 * Initiates the MFA setup process
 */
export async function startMfaSetup() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const { secret, qrCodeUrl } = await generateMfaSecret(session.user.id, session.user.email);
  return { secret, qrCodeUrl };
}

/**
 * Completes the MFA setup by verifying the first token
 */
export async function completeMfaSetup(rawSecret: string, rawToken: string) {
  const secret = z.string().min(1).parse(rawSecret);
  const token = z.string().min(6).max(8).parse(rawToken);
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isValid = verifyMfaToken(token, secret);
  if (!isValid) return { success: false, error: "Invalid verification code." };

  const backupCodes = await enableMfaForUser(session.user.id, secret);

  await SecurityService.recordAuditLog({
    workspaceId: (session.user as any).memberships[0]?.workspaceId || "unknown",
    userId: session.user.id,
    action: "MFA_ENABLED",
    entityType: "User",
    entityId: session.user.id,
  });

  revalidatePath("/?view=security");
  return { success: true, backupCodes };
}

/**
 * Disables MFA for the current user
 */
export async function removeMfa() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await disableMfaForUser(session.user.id);

  await SecurityService.recordAuditLog({
    workspaceId: (session.user as any).memberships[0]?.workspaceId || "unknown",
    userId: session.user.id,
    action: "MFA_DISABLED",
    entityType: "User",
    entityId: session.user.id,
  });

  revalidatePath("/?view=security");
  return { success: true };
}
