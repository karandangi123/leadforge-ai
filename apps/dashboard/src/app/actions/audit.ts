"use server";

import { getPrisma } from "@leadforge/db";
import { z } from "zod";

/**
 * Fetch public audit data for the Lead Portal
 */
export async function getPublicAudit(rawAuditId: string) {
  const auditId = z.string().min(1).parse(rawAuditId);
  const prisma = getPrisma();
  
  try {
    const audit = await prisma.websiteAudit.findUnique({
      where: { id: auditId },
      include: {
        lead: true,
        screenshots: true,
        findings: true
      }
    });

    if (!audit || audit.status !== "SUCCEEDED") return null;

    // Get the primary (usually home) screenshot
    const homeScreenshot = audit.screenshots.find(s => s.pageType === "home") || audit.screenshots[0];

    return {
      companyName: audit.lead.company,
      videoUrl: audit.videoUrl, // In prod, this is the HeyGen URL
      screenshotUrl: homeScreenshot?.imageUrl,
      uxScore: audit.overallScore || 0,
      // @ts-ignore
      annotations: audit.findings.map(a => ({
        x: a.x,
        y: a.y,
        finding: a.title,
        recommendation: a.fixSuggestion,
        severity: a.severity
      })) || []
    };
  } catch (error) {
    console.error("[AuditAction] Failed to fetch public audit:", error);
    return null;
  }
}
