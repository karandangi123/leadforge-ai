import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { getPrisma } from "@leadforge/db";

/**
 * Generates a new TOTP secret and QR code for a user
 */
export async function generateMfaSecret(userId: string, email: string) {
  const secret = generateSecret();
  const otpauth = generateURI({ secret, label: email, issuer: "LeadForge AI" });
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return { secret, qrCodeUrl };
}

/**
 * Verifies a TOTP token against a secret
 */
export function verifyMfaToken(token: string, secret: string) {
  return verify({ token, secret });
}

/**
 * Enables MFA for a user after successful verification
 */
export async function enableMfaForUser(userId: string, secret: string) {
  const prisma = getPrisma();
  
  // Generate 10 backup codes
  const backupCodes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
      twoFactorBackupCodes: backupCodes,
    },
  });

  return backupCodes;
}

/**
 * Disables MFA for a user
 */
export async function disableMfaForUser(userId: string) {
  const prisma = getPrisma();
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: null,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
    },
  });
}
