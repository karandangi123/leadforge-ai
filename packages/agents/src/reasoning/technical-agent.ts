import { getPrisma } from "@leadforge/db";
import { WebCrawler } from "../../../crawler/src/index";

export type TechnicalFinding = {
  title: string;
  category: "security" | "technical" | "seo";
  observed: string;
  businessImpact: string;
  confidence: number;
};

export class TechnicalAgent {
  static async audit(url: string): Promise<TechnicalFinding[]> {
    // In a real scenario, this would use Playwright to check headers, console errors, etc.
    const findings: TechnicalFinding[] = [];

    // Deterministic Mock for Demo
    if (!url.includes("https")) {
      findings.push({
        title: "Missing SSL/HTTPS Encryption",
        category: "security",
        observed: "HTTP only",
        businessImpact: "Visitors see 'Not Secure' warnings, destroying brand trust immediately.",
        confidence: 0.99
      });
    }

    // Checking for common security headers (Simulated)
    findings.push({
      title: "Missing Content-Security-Policy (CSP)",
      category: "security",
      observed: "Header not found",
      businessImpact: "Leaves the site vulnerable to XSS and data injection attacks.",
      confidence: 0.98
    });

    return findings;
  }
}
