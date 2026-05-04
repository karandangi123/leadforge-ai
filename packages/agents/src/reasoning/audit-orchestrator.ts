import { getPrisma } from "@leadforge/db";
import { IdentityAgent } from "./identity-agent";
import { VisionAgent } from "./vision-agent";
import { TechnicalAgent } from "./technical-agent";
import { PerformanceAgent } from "./performance-agent";
import { CopyAgent } from "./copy-agent";

export class AuditOrchestrator {
  static async runFullAudit(leadId: string, jobId?: string) {
    const prisma = getPrisma();
    
    // 0. Idempotency & Initialization (Failure 8 Protection)
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead target not found.");

    const normalizedDomain = lead.website?.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0].toLowerCase() || "unknown";
    
    // Check for recent successful audit (Idempotency)
    const recentAudit = await prisma.websiteAudit.findFirst({
      where: { leadId, status: "SUCCEEDED", createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } }
    });
    if (recentAudit && !jobId) return { auditId: recentAudit.id, status: "REUSED_FRESH_RESULTS" };

    const audit = await prisma.websiteAudit.create({
      data: {
        leadId,
        inputUrl: lead.website,
        normalizedDomain,
        status: "RUNNING",
        progress: 0
      }
    });

    const engineStatus: Record<string, "SUCCESS" | "FAILED"> = {};
    let partialFailure = false;

    const logEvent = async (msg: string, progress: number) => {
      await prisma.websiteAudit.update({ where: { id: audit.id }, data: { progress } });
      if (jobId) {
        await prisma.asyncJob.update({ where: { id: jobId }, data: { progress } });
        await prisma.asyncJobEvent.create({ data: { asyncJobId: jobId, status: "RUNNING", message: msg } });
      }
    };
    
    // 1. Identity Layer (Lifecycle: IDENTIFYING_COMPANY)
    await logEvent("IDENTIFYING_COMPANY: Contextualizing digital perimeter...", 10);
    let identity: any = null;
    try {
      identity = await IdentityAgent.identify(leadId);
      engineStatus["identity"] = "SUCCESS";
    } catch (e) {
      engineStatus["identity"] = "FAILED";
      partialFailure = true;
    }
    
    // 2. Vision Layer (Lifecycle: CAPTURING_SCREENSHOTS -> RUNNING_VISION_AUDIT)
    await logEvent("CAPTURING_SCREENSHOTS: Engaging multi-viewport lenses...", 25);
    let visionResults: any = null;
    try {
      visionResults = await VisionAgent.analyzeWebsite(leadId);
      await logEvent("RUNNING_VISION_AUDIT: Processing visual forensic signals...", 35);
      
      // Store screenshots as assets
      if (visionResults.screenshots) {
        await prisma.auditAsset.createMany({
          data: visionResults.screenshots.map((s: any) => ({
            auditId: audit.id,
            type: s.viewport,
            url: s.url,
            storageKey: `audits/${audit.id}/${s.viewport}.jpg`
          }))
        });
      }
      engineStatus["vision"] = "SUCCESS";
    } catch (e) {
      console.error("[Orchestrator] Vision failed:", e);
      engineStatus["vision"] = "FAILED";
      partialFailure = true;
    }
    
    // 3. Technical Layer (Lifecycle: RUNNING_TECHNICAL_CHECKS)
    await logEvent("RUNNING_TECHNICAL_CHECKS: Verifying deterministic security...", 50);
    let technicalFindings: any[] = [];
    try {
      technicalFindings = await TechnicalAgent.audit(lead?.website || "");
      engineStatus["technical"] = "SUCCESS";
    } catch (e) {
      engineStatus["technical"] = "FAILED";
      partialFailure = true;
    }

    // 4. Performance Layer (Lifecycle: RUNNING_PERFORMANCE_CHECKS)
    await logEvent("RUNNING_PERFORMANCE_CHECKS: Analyzing web quality signals...", 65);
    let performanceFindings: any[] = [];
    try {
      performanceFindings = await PerformanceAgent.audit(lead?.website || "");
      engineStatus["performance"] = "SUCCESS";
    } catch (e) {
      engineStatus["performance"] = "FAILED";
      partialFailure = true;
    }

    // 5. Copy Layer (Lifecycle: ANALYZING_COPY)
    await logEvent("ANALYZING_COPY: Synthesizing UX copy signals...", 80);
    let copyFindings: any[] = [];
    try {
      copyFindings = await CopyAgent.analyze(lead?.website || "", "Demo content...");
      engineStatus["copy"] = "SUCCESS";
    } catch (e) {
      engineStatus["copy"] = "FAILED";
      partialFailure = true;
    }

    // 6. Hook Synthesis (Lifecycle: GENERATING_HOOKS)
    await logEvent("GENERATING_HOOKS: Building high-fidelity sales hooks...", 90);
    
    const finalFindings: any[] = [];

    // Aggregating available findings despite partial failures
    if (visionResults && visionResults.signals) {
      for (const signal of visionResults.signals) {
        if (signal.confidence >= 0.70) {
          finalFindings.push({
            auditId: audit.id,
            title: signal.finding,
            category: "ux",
            confidence: signal.confidence,
            sourceEngine: "vision",
            businessImpact: signal.recommendation || "Potential UX friction point impacting conversion.",
            fixSuggestion: signal.recommendation,
            status: "APPROVED",
            x: signal.x,
            y: signal.y,
            viewport: signal.viewport
          });
        }
      }
    }

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

    for (const perf of performanceFindings) {
      finalFindings.push({
        auditId: audit.id,
        title: perf.metric,
        category: "performance",
        confidence: 0.98,
        sourceEngine: "performance",
        businessImpact: perf.businessImpact,
        status: "APPROVED"
      });
    }

    for (const copy of copyFindings) {
      finalFindings.push({
        auditId: audit.id,
        title: copy.title,
        category: "copy",
        confidence: 0.82,
        sourceEngine: "copy",
        businessImpact: copy.businessImpact,
        fixSuggestion: copy.fixSuggestion,
        status: "NEEDS_REVIEW"
      });
    }

    // Rank by OutreachValueScore
    const scoredFindings = finalFindings.map(f => {
      const detectionConfidence = f.confidence;
      let evidenceStrength = f.sourceEngine === 'vision' ? 0.95 : f.sourceEngine === 'technical' ? 0.85 : 0.75;
      let businessImpactScore = f.sourceEngine === 'vision' ? 0.85 : f.sourceEngine === 'technical' ? 0.80 : 0.60;
      let outreachQualityScore = 0.88; // Default synthesized quality

      const overallSendability = (detectionConfidence * 0.30) + 
                                (evidenceStrength * 0.25) + 
                                (businessImpactScore * 0.25) + 
                                (outreachQualityScore * 0.20);

      // Generate "Why this one" reason
      let why = "High confidence and clear business impact.";
      if (evidenceStrength > 0.9) why = "High confidence, visually provable, and revenue-related.";

      return { 
        ...f, 
        detectionConfidence,
        evidenceStrength,
        businessImpactScore,
        outreachQualityScore,
        overallSendability,
        outreachValueScore: overallSendability, // Sync for sorting
        whyThisFinding: why 
      };
    });

    const sortedFindings = scoredFindings.sort((a, b) => (b.overallSendability || 0) - (a.overallSendability || 0));
    const bestFinding = sortedFindings[0];
    
    let readyToSendMessage = "";
    if (bestFinding) {
      const observation = bestFinding.title;
      const risk = bestFinding.businessImpact || "Potential drop-offs from high-intent visitors.";
      readyToSendMessage = `Hey, noticed something specific on ${lead?.company}'s site — ${observation.toLowerCase()}. I marked the exact evidence here: {{proofUrl}}. Worth fixing because ${risk.toLowerCase()} I recorded a quick forensic walkthrough of how to fix this for you.`;
    }

    // 7. Finalization (Lifecycle: BUILDING_PROOF_ASSETS)
    await logEvent("BUILDING_PROOF_ASSETS: Finalizing forensic package...", 95);

    await prisma.websiteAudit.update({
      where: { id: audit.id },
      data: {
        status: "SUCCEEDED",
        progress: 100,
        completedAt: new Date(),
        readyToSendMessage,
        businessImpact: bestFinding?.businessImpact || "Conversion friction detected.",
        overallScore: Math.round((bestFinding?.outreachValueScore || 0.8) * 100),
        partialFailure,
        engineStatus: engineStatus as any,
        errorMessage: partialFailure ? "Some intelligence engines failed to report, but core findings are ready." : null
      }
    });

    const processedFindings = sortedFindings.map((f, idx) => ({
      ...f,
      outreachHook: `Noticed ${f.title.toLowerCase()} on your ${f.viewport || 'site'}. ${f.businessImpact}`,
      status: idx < 4 ? "APPROVED" : "NEEDS_REVIEW_HIDDEN"
    }));

    await prisma.auditFinding.createMany({ data: processedFindings });

    return { auditId: audit.id, identity, findingsCount: processedFindings.length, partialFailure };
  }
}
