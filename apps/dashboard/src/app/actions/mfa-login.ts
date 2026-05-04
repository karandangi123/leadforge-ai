"use server";

import { auth } from "@/auth";
import { getPrisma } from "@leadforge/db";
import { verifyMfaToken } from "@/lib/mfa";
import { unstable_update } from "@/auth";

/**
 * Verifies the MFA token during the login flow and updates the session
 */
export async function verifyMfaLogin(token: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true }
  });

  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return { success: false, error: "MFA not enabled for this account." };
  }

  const isValid = verifyMfaToken(token, user.twoFactorSecret);
  if (!isValid) return { success: false, error: "Invalid verification code." };

  // Update the JWT token to mark as verified
  await unstable_update({
    ...session,
    // @ts-ignore
    mfaVerified: true,
  });

  return { success: true };
}
