import { isIP } from "net";
import dns from "dns/promises";

/**
 * Robust SSRF Protection Utility
 * Prevents access to internal networks, localhost, and metadata services.
 */
export class URLValidator {
  private static readonly BANNED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "169.254.169.254", // AWS/GCP Metadata
  ];

  private static readonly BANNED_RANGES = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^fc00:/,
    /^fe80:/
  ];

  /**
   * Validates a URL for SSRF safety.
   * Performs both hostname and DNS-level checks.
   */
  static async validate(urlStr: string): Promise<{ safe: boolean; error?: string; ip?: string }> {
    try {
      const url = new URL(urlStr);
      
      // 1. Basic Protocol Check
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { safe: false, error: "Unsupported protocol. Use HTTP or HTTPS." };
      }

      const hostname = url.hostname.toLowerCase();

      // 2. Static Hostname Check
      if (this.BANNED_HOSTS.includes(hostname)) {
        return { safe: false, error: "Access Restricted: Private host detected." };
      }

      // 3. DNS Resolution & IP Check (DNS Rebinding Protection)
      const lookup = await dns.lookup(hostname).catch(() => null);
      if (!lookup) {
        return { safe: false, error: "DNS Resolution Failed: Host unreachable." };
      }

      const ip = lookup.address;
      
      // 4. IP Range Check
      if (this.isPrivateIP(ip)) {
        return { safe: false, error: "Access Restricted: Private IP range detected." };
      }

      return { safe: true, ip };
    } catch (e: any) {
      return { safe: false, error: `Invalid URL: ${e.message}` };
    }
  }

  private static isPrivateIP(ip: string): boolean {
    if (isIP(ip) === 0) return true; // Invalid IP
    return this.BANNED_RANGES.some(range => range.test(ip));
  }
}
