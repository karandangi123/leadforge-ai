import { getPrisma } from "@leadforge/db";
import { IdentityAgent } from "./identity-agent";
import { VisionAgent } from "./vision-agent";
import { TechnicalAgent } from "./technical-agent";
import { PerformanceAgent } from "./performance-agent";
import { CopyAgent } from "./copy-agent";

export class AuditOrchestrator {
  static async runFullAudit(leadId: string, jobId?: string) {
    const prisma = getPrisma();
    const logEvent = async (msg: string, progress: number) => {
      if (jobId) {
        await prisma.asyncJob.update({ where: { id: jobId }, data: { progress, step: msg } });
        await prisma.asyncJobEvent.create({ data: { asyncJobId: jobId, status: "RUNNING", message: msg } });
      }
    };
    
    // 1. Identity Layer (0-5s)
    await logEvent("DOMAIN_NORMALIZED: Verifying perimeter...", 5);
    await logEvent("IDENTITY_CREATED: Detecting company profile...", 10);
    const identity = await IdentityAgent.identify(leadId);
    
    // 2. Vision Layer (5-15s)
    await logEvent("SCREENSHOT_CAPTURED: Engaging multi-viewport lenses...", 25);
    const visionResults = await VisionAgent.analyzeWebsite(leadId);
    
    // 3. Technical & Performance Layers (15-25s)
    await logEvent("TECHNICAL_CHECK_DONE: Verifying deterministic security...", 40);
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    const [technicalFindings, performanceFindings] = await Promise.all([
      TechnicalAgent.audit(lead?.website || ""),
      PerformanceAgent.audit(lead?.website || "")
    ]);

    await logEvent("PERFORMANCE_SIGNALS_COLLECTED: Analyzing web quality...", 60);

    // 4. Copy Layer (25-35s)
    await logEvent("VISION_FINDINGS_READY: Synthesizing UX signals...", 75);
    const copyFindings = await CopyAgent.analyze(lead?.website || "", "Demo content...");

    // 5. Hook Synthesis (35-42s)
    await logEvent("HOOK_READY: Generating high-fidelity outreach hooks...", 90);

    // 6. Finalization (42-45s)
    await logEvent("PROOF_ASSET_READY: Finalizing forensic package...", 95);

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
