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

    return {
      id: lead.id,
      company: lead.company,
      website: lead.website || "",
      score: brief.score,
      auditScore: latestAudit?.overallScore,
      status: lead.status,
      executiveSummary: brief.executiveSummary,
      silverBulletHook: brief.silverBulletHook,
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

  const desktop = audit.screenshots.find(s => s.viewport === 'DESKTOP' || s.viewport === 'desktop');
  if (!desktop) return null;

  return {
    screenshotUrl: desktop.imageUrl,
    findings: desktop.annotations.map(a => ({
      x: a.x,
      y: a.y,
      finding: a.label,
      recommendation: a.recommendation,
      severity: a.severity
    }))
  };
}
