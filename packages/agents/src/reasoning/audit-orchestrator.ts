import { getPrisma } from "@leadforge/db";
import { IdentityAgent } from "./identity-agent";
import { VisionAgent } from "./vision-agent";
import { TechnicalAgent } from "./technical-agent";
import { PerformanceAgent } from "./performance-agent";
import { CopyAgent } from "./copy-agent";

export class AuditOrchestrator {
  static async runFullAudit(leadId: string) {
    const prisma = getPrisma();
    
    // 1. Identity Layer
    const identity = await IdentityAgent.identify(leadId);
    
    // 2. Vision Layer (Multi-Viewport)
    const visionResults = await VisionAgent.analyzeWebsite(leadId);
    
    // 3. Technical & Performance Layers
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    const [technicalFindings, performanceFindings] = await Promise.all([
      TechnicalAgent.audit(lead?.website || ""),
      PerformanceAgent.audit(lead?.website || "")
    ]);

    // 4. Copy Layer (Requires content from Vision Results if possible)
    const copyFindings = await CopyAgent.analyze(lead?.website || "", "Demo content...");

    // 5. Consolidation & Proof Gate
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
        status: "APPROVED" 
      });
    }

    // Process Performance Findings
    for (const perf of performanceFindings) {
      finalFindings.push({
        auditId: audit.id,
        title: perf.metric,
        category: "performance",
        confidence: 0.98,
        sourceEngine: "performance",
        businessImpact: perf.businessImpact,
        outreachHook: perf.hook,
        status: "APPROVED"
      });
    }

    // Process Copy Findings
    for (const copy of copyFindings) {
      finalFindings.push({
        auditId: audit.id,
        title: copy.title,
        category: "copy",
        confidence: 0.82,
        sourceEngine: "copy",
        businessImpact: copy.businessImpact,
        fixSuggestion: copy.fixSuggestion,
        outreachHook: copy.outreachHook,
        status: "NEEDS_REVIEW"
      });
    }

    // Save to DB
    await prisma.auditFinding.createMany({
      data: finalFindings
    });

    return { auditId: audit.id, identity, findingsCount: finalFindings.length };
  }
}
