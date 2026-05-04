import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Enterprise-grade Token Encryption Utility
 * Uses AES-256-GCM for secure storage of OAuth tokens.
 */
export class TokenCrypto {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly KEY = scryptSync(
    process.env.ENCRYPTION_SECRET || "leadforge-default-secret-change-me",
    "salt",
    32
  );

  /**
   * Encrypts a sensitive string (e.g., OAuth refresh token)
   */
  static encrypt(text: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(this.ALGORITHM, this.KEY, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const tag = cipher.getAuthTag().toString("hex");
    
    // Format: iv:encrypted:tag
    return `${iv.toString("hex")}:${encrypted}:${tag}`;
  }

  /**
   * Decrypts an encrypted token string
   */
  static decrypt(encryptedData: string): string {
    const [ivHex, encrypted, tagHex] = encryptedData.split(":");
    
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = createDecipheriv(this.ALGORITHM, this.KEY, iv);
    
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  }
}
