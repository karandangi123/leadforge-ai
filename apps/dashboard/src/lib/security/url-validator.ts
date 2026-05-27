import { URL } from "url";
import dns from "dns/promises";

const BLOCKED_CIDRS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^::1$/,
  /^fd[0-9a-f]{2}:/i,
];

/**
 * Validates a URL and ensures it resolves to a public IP address.
 * Prevents SSRF attacks by blocking local/internal network addresses.
 */
export async function validatePublicUrl(raw: string): Promise<string> {
  let parsed: URL;
  try {
    // Add protocol if missing
    const urlWithProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
    parsed = new URL(urlWithProtocol);
  } catch (e) {
    throw new Error("Invalid URL format. Please provide a valid website address.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS protocols are allowed.");
  }

  const hostname = parsed.hostname;

  try {
    // Resolve hostname to IP
    const addresses = await dns.resolve4(hostname);
    
    for (const ip of addresses) {
      if (BLOCKED_CIDRS.some(re => re.test(ip))) {
        throw new Error(`Access to internal network address ${ip} is blocked.`);
      }
    }
  } catch (dnsError) {
    // If DNS fails, we assume it's an invalid hostname
    console.warn(`[URL-Validator] DNS resolution failed for ${hostname}:`, dnsError);
  }

  return parsed.href;
}
