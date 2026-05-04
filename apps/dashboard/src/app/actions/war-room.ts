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
    take: 20
  });

  if (leads.length === 0) return [];

  const enrichedLeads = await Promise.all(leads.map(async (lead) => {
    let brief;
    try {
      const synthesis = await BriefSynthesisAgent.synthesize(lead.id);
      brief = synthesis.data;
    } catch (e) {
      brief = {
        executiveSummary: lead.enrichmentProfile?.description?.split('\n\n')[0] || "No summary available.",
        silverBulletHook: "Generating hook...",
        competitorGap: "No competitor signals detected yet.",
        visualSignal: "Visual audit pending.",
        score: 70
      };
    }

    const latestAudit = lead.websiteAudits[0];
    const desktopScreenshot = latestAudit?.screenshots.find(s => s.viewport === 'DESKTOP');

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
      screenshotUrl: desktopScreenshot?.imageUrl,
      findings: desktopScreenshot?.annotations?.map(a => ({
        x: a.x,
        y: a.y,
        label: a.label,
        severity: a.severity
      })) || []
    };
  }));

  return enrichedLeads;
}
