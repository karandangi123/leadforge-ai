"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl, LeadStatus } from "@leadforge/db";
import { runLeadDiscovery as agentDiscovery } from "@leadforge/agents";

const discoverySchema = z.object({
  targetMarket: z.string().trim().min(3).max(240),
  geography: z.string().trim().max(120).optional(),
  companySize: z.string().trim().max(120).optional(),
  sector: z.string().trim().max(120).optional(),
  painFocus: z.string().trim().max(240).optional(),
  websiteQualityBias: z.string().trim().max(120).optional(),
  icpStrictness: z.string().trim().max(120).optional(),
});

const candidateSchema = z.object({
  candidateId: z.string().trim().min(2),
});

export async function runLeadDiscovery(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#discover");
  }

  const parsed = discoverySchema.safeParse({
    targetMarket: formData.get("targetMarket"),
    geography: formData.get("geography"),
    companySize: formData.get("companySize"),
    sector: formData.get("sector"),
    painFocus: formData.get("painFocus"),
    websiteQualityBias: formData.get("websiteQualityBias"),
    icpStrictness: formData.get("icpStrictness"),
  });

  if (!parsed.success) {
    redirect("/?lead=invalid#discover");
  }

  try {
    const prisma = getPrisma();
    const workspace = await prisma.workspace.upsert({
      where: { slug: "demo" },
      update: {},
      create: { name: "Demo Workspace", slug: "demo" },
    });

    const playbook = await prisma.workspacePlaybook.findUnique({ where: { workspaceId: workspace.id } });
    const agentResult = await agentDiscovery({
      targetMarket: parsed.data.targetMarket,
      playbook: playbook ? {
        product: playbook.product,
        idealCustomer: playbook.idealCustomer,
        industries: playbook.industries as string[],
        pains: playbook.pains as string[],
        proofPoints: playbook.proofPoints as string[],
        tone: playbook.tone,
        positioning: playbook.positioning,
      } : null,
    });

    await prisma.discoveryRun.create({
      data: {
        workspaceId: workspace.id,
        targetMarket: parsed.data.targetMarket,
        summary: agentResult.data.summary,
        queryPlan: agentResult.data.queryPlan,
        candidateLeads: {
          create: agentResult.data.candidates.map((c) => ({
            company: c.company,
            website: c.website,
            segment: c.segment,
            sourceType: c.sourceType,
            sourceUrl: c.sourceUrl,
            evidence: c.evidence,
            fitScore: c.fitScore,
            auditHintScore: c.auditHintScore,
            confidence: c.confidence,
            reason: c.reason,
            status: "NEW",
          })),
        },
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?lead=db-unavailable#discover");
  }

  revalidatePath("/");
  redirect("/?lead=discovery-complete#discover");
}

export async function saveCandidateLead(formData: FormData) {
  const parsed = candidateSchema.safeParse({
    candidateId: formData.get("candidateId"),
  });

  if (!parsed.success) {
    redirect("/?lead=invalid#discover");
  }

  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#discover");
  }

  try {
    const prisma = getPrisma();
    const candidate = await prisma.candidateLead.findUnique({
      where: { id: parsed.data.candidateId },
      include: { discoveryRun: true },
    });

    if (!candidate || candidate.status === "SAVED") {
      redirect("/?lead=invalid#discover");
    }

    const lead = await prisma.lead.create({
      data: {
        workspaceId: candidate.discoveryRun.workspaceId,
        company: candidate.company,
        website: candidate.website,
        segment: candidate.segment,
        status: LeadStatus.RESEARCH,
        source: `discovery:${candidate.sourceType}`,
        nextAction: "Run AI research",
      },
    });

    await prisma.candidateLead.update({
      where: { id: candidate.id },
      data: {
        status: "SAVED",
        savedLeadId: lead.id,
      },
    });

    revalidatePath("/");
    redirect(`/leads/${lead.id}?run=discovery-saved`);
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?lead=db-unavailable#discover");
  }
}
