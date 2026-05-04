"use server";

import { getPrisma } from "@leadforge/db";
import { getActiveWorkspace } from "@/lib/workspace";
import { BriefSynthesisAgent } from "@leadforge/agents";

export async function getWarRoomLeads() {
  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();

  const leads = await prisma.lead.findMany({
    where: { 
      workspaceId: workspace.id,
      status: { not: "REJECTED" }
    },
    include: {
      enrichmentProfile: {
        include: { signals: true }
      },
      websiteAudits: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { screenshots: { include: { annotations: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  if (leads.length === 0) return [];

  // 3. Fast return: No synthesis during list fetch
  const enrichedLeads = leads.map(lead => {
    const brief = (lead.enrichmentProfile?.salesBrief as any) || {
      executiveSummary: lead.enrichmentProfile?.description?.split('\n\n')[0] || "Synthesis pending...",
      silverBulletHook: "Contextual hook pending...",
      competitorGap: "Intelligence gathering in progress.",
      visualSignal: "Visual audit pending.",
      score: lead.fitScore || 70,
      isPending: true
    };

    const latestAudit = lead.websiteAudits[0];
    const silverBullet = latestAudit?.readyToSendMessage || brief.silverBulletHook;

    return {
      id: lead.id,
      company: lead.company,
      website: lead.website || "",
      score: brief.score,
      auditScore: latestAudit?.overallScore,
      status: lead.status,
      executiveSummary: brief.executiveSummary,
      silverBulletHook: silverBullet,
      competitorGap: brief.competitorGap,
      visualSignal: brief.visualSignal,
      isPending: brief.isPending || false
    };
  });

  return enrichedLeads;
}

export async function getLeadSynthesis(leadId: string) {
  try {
    const synthesis = await BriefSynthesisAgent.synthesize(leadId);
    return synthesis.data;
  } catch (e) {
    console.error("Synthesis failed:", e);
    return null;
  }
}

export async function getLeadForensicData(leadId: string) {
  const prisma = getPrisma();
  
  const audit = await prisma.websiteAudit.findFirst({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    include: {
      screenshots: {
        include: { annotations: true }
      }
    }
  });

  if (!audit) return null;

  const desktop = audit.screenshots.find(s => s.viewport === 'desktop' || s.viewport === 'DESKTOP');
  if (!desktop) return null;

  const findings = await prisma.auditFinding.findMany({
    where: { auditId: audit.id, status: { in: ["APPROVED", "NEEDS_REVIEW"] } },
    orderBy: { confidence: "desc" }
  });

  return {
    screenshotUrl: desktop.imageUrl,
    businessImpact: audit.businessImpact,
    readyToSendMessage: audit.readyToSendMessage,
    confidence: audit.confidence || 0.95,
    publicProofId: audit.publicProofId,
    findings: findings.map(f => ({
      id: f.id,
      x: f.x,
      y: f.y,
      finding: f.title,
      recommendation: f.fixSuggestion,
      severity: f.severity,
      category: f.category,
      source: f.sourceEngine,
      confidence: f.confidence,
      businessImpact: f.businessImpact,
      outreachHook: f.outreachHook,
      outreachValueScore: f.outreachValueScore,
      whyThisFinding: f.whyThisFinding,
      status: f.status,
      humanNotes: f.humanNotes,
      detectionConfidence: f.detectionConfidence,
      evidenceStrength: f.evidenceStrength,
      businessImpactScore: f.businessImpactScore,
      outreachQualityScore: f.outreachQualityScore,
      overallSendability: f.overallSendability
    }))
  };
}

/**
 * Delete a lead and all associated audit data from the War Room
 */
export async function deleteWarRoomLead(leadId: string) {
  const prisma = getPrisma();
  
  try {
    await prisma.$transaction([
      prisma.websiteAudit.deleteMany({ where: { leadId } }),
      prisma.asyncJob.deleteMany({ where: { leadId } }),
      prisma.lead.delete({ where: { id: leadId } })
    ]);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return { success: false };
  }
}

/**
 * Emergency cleanup for audits stuck in 'AUDIT' status
 */
export async function cleanupHungAudits() {
  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();
  
  // Find leads in AUDIT status older than 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  try {
    const hungLeads = await prisma.lead.updateMany({
      where: {
        workspaceId: workspace.id,
        status: "AUDIT",
        updatedAt: { lt: fiveMinutesAgo }
      },
      data: { status: "NEW" }
    });
    
    return { success: true, count: hungLeads.count };
  } catch (error) {
    return { success: false };
  }
}
export async function exportLeadToHubSpot(leadId: string) {
  const prisma = getPrisma();
  
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { 
        websiteAudits: {
          include: { findings: { orderBy: { overallSendability: 'desc' } } }
        }
      }
    });

    if (!lead || lead.websiteAudits.length === 0) throw new Error("No audit data found.");

    const bestAudit = lead.websiteAudits[0];
    const bestFinding = bestAudit.findings[0];

    // Simulate HubSpot API call
    console.log(`[HubSpot] Exporting lead ${lead.company} with finding: ${bestFinding?.title}`);
    
    await prisma.integrationSync.create({
      data: {
        leadId,
        provider: "HUBSPOT",
        status: "SUCCESS",
        payload: {
          finding: bestFinding?.title,
          hook: bestFinding?.outreachHook,
          score: bestFinding?.overallSendability,
          proofUrl: `https://leadforge.ai/proof/${bestAudit.publicProofId}`
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("[HubSpot] Export failed:", error);
    return { success: false };
  }
}

/**
 * Generate a CSV of approved leads for export to Clay/Apollo
 */
export async function exportLeadsToCSV() {
  const prisma = getPrisma();
  
  try {
    const leads = await prisma.lead.findMany({
      where: { status: "READY" },
      include: {
        websiteAudits: {
          where: { status: "SUCCEEDED" },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { findings: { where: { status: "APPROVED" }, orderBy: { overallSendability: 'desc' } } }
        }
      }
    });

    const headers = ["Company", "Domain", "Primary Finding", "Outreach Hook", "Sendability Score", "Proof Link"];
    const rows = leads.map(l => {
      const audit = l.websiteAudits[0];
      const finding = audit?.findings[0];
      return [
        l.company,
        l.website,
        finding?.title || "",
        finding?.outreachHook || "",
        finding?.overallSendability ? `${Math.round(finding.overallSendability * 100)}%` : "",
        audit?.publicProofId ? `https://leadforge.ai/proof/${audit.publicProofId}` : ""
      ].map(cell => `"${cell.replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    return { success: true, csv: csvContent };
  } catch (error) {
    console.error("[CSV] Export failed:", error);
    return { success: false };
  }
}

/**
 * Update a specific forensic finding (Approve, Edit, Reject)
 */
export async function updateFinding(findingId: string, data: {
  status?: string;
  outreachHook?: string;
  severity?: string;
  humanNotes?: string;
}) {
  const prisma = getPrisma();
  
  try {
    const updated = await prisma.auditFinding.update({
      where: { id: findingId },
      data
    });
    return { success: true, finding: updated };
  } catch (error) {
    console.error("Failed to update finding:", error);
    return { success: false };
  }
}
