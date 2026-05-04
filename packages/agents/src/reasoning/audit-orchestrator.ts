import { getPrisma } from "@leadforge/db";
import { IdentityAgent } from "./identity-agent";
import { VisionAgent } from "./vision-agent";
import { TechnicalAgent } from "./technical-agent";

export class AuditOrchestrator {
  static async runFullAudit(leadId: string) {
    const prisma = getPrisma();
    
    // 1. Identity Layer
    const identity = await IdentityAgent.identify(leadId);
    
    // 2. Vision Layer (Multi-Viewport)
    const visionResults = await VisionAgent.analyzeWebsite(leadId);
    
    // 3. Technical Layer
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    const technicalFindings = await TechnicalAgent.audit(lead?.website || "");

    // 4. Consolidation & Proof Gate
    const audit = await prisma.websiteAudit.findFirst({
      where: { leadId },
      orderBy: { createdAt: "desc" }
    });

    if (!audit) throw new Error("Audit record missing during orchestration.");

    const finalFindings = [];

    // Process Vision Findings with Strictest Confidence Gate (Failure 1 Mitigation)
    if (visionResults.success && visionResults.data) {
      for (const signal of visionResults.data.signals) {
        let status = "REJECTED";
        if (signal.confidence >= 0.85) status = "APPROVED";
        else if (signal.confidence >= 0.70) status = "NEEDS_REVIEW";
        else if (signal.confidence >= 0.50) status = "NEEDS_REVIEW_HIDDEN";

        if (status !== "REJECTED") {
          finalFindings.push({
            auditId: audit.id,
            title: signal.finding,
            category: "ux",
            confidence: signal.confidence,
            sourceEngine: "vision",
            businessImpact: signal.recommendation || "Potential UX friction point impacting conversion.",
            fixSuggestion: signal.recommendation,
            outreachHook: `Noticed your ${signal.viewport} site has a ${signal.finding.toLowerCase()} issue that might be affecting your user flow.`,
            status,
            x: signal.x,
            y: signal.y,
            viewport: signal.viewport
          });
        }
      }
    }

    // Process Technical Findings
    for (const tech of technicalFindings) {
      finalFindings.push({
        auditId: audit.id,
        title: tech.title,
        category: tech.category,
        confidence: tech.confidence,
        sourceEngine: "technical",
        businessImpact: tech.businessImpact,
        status: "APPROVED" // Technical is deterministic, so approved by default
      });
    }

    // Save to DB
    await prisma.auditFinding.createMany({
      data: finalFindings
    });

    return { auditId: audit.id, identity, findingsCount: finalFindings.length };
  }
}
