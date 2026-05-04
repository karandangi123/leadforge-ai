import { generateMfaSecret, verifyMfaToken } from "../src/lib/mfa";
import { totp } from "otplib";

async function test() {
  console.log("--- Starting MFA Backend Test ---");
  
  const userId = "test-user-id";
  const email = "test@example.com";
  
  console.log(`Generating secret for ${email}...`);
  const { secret, qrCodeUrl } = await generateMfaSecret(userId, email);
  
  console.log("Secret Generated:", secret);
  console.log("QR Code URL Length:", qrCodeUrl.length);
  
  if (!secret) {
    throw new Error("Failed to generate secret");
  }

  console.log("\nVerifying positive case...");
  const token = totp.generate(secret);
  console.log("Generated Token from Secret:", token);
  
  const isValid = verifyMfaToken(token, secret);
  console.log("Verification Result (Should be true):", isValid);
  
  if (!isValid) {
    throw new Error("Verification failed for valid token");
  }

  console.log("\nVerifying negative case...");
  const invalidToken = "123456";
  const isInvalid = verifyMfaToken(invalidToken, secret);
  console.log("Verification Result (Should be false):", isInvalid);
  
  if (isInvalid) {
    throw new Error("Verification succeeded for invalid token");
  }

  console.log("\n--- MFA Backend Test Passed Successfully ---");
}

test().catch(err => {
  console.error("MFA Test Failed:", err);
  process.exit(1);
});
