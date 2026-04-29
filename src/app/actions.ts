"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";

import { DraftChannel, LeadStatus } from "@/generated/prisma/enums";
import { auditWebsite, draftOutreach, researchLead } from "@/lib/ai-agents";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

const addLeadSchema = z.object({
  company: z.string().trim().min(2).max(120),
  website: z.string().trim().url().optional().or(z.literal("")),
  contactName: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  segment: z.string().trim().max(100).optional(),
});

export async function addLead(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#add-lead");
  }

  const parsed = addLeadSchema.safeParse({
    company: formData.get("company"),
    website: formData.get("website"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    segment: formData.get("segment"),
  });

  if (!parsed.success) {
    redirect("/?lead=invalid#add-lead");
  }

  const prisma = getPrisma();
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo",
    },
  });

  await prisma.lead.create({
    data: {
      workspaceId: workspace.id,
      company: parsed.data.company,
      website: parsed.data.website || null,
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      segment: parsed.data.segment || null,
      status: LeadStatus.RESEARCH,
      source: "manual",
      nextAction: "Run AI research",
      agentTraces: {
        create: {
          agentName: "Lead Intake",
          status: "SUCCEEDED",
          input: {
            company: parsed.data.company,
            website: parsed.data.website || null,
          },
          output: {
            nextAction: "Run AI research",
          },
        },
      },
    },
  });

  revalidatePath("/");
  redirect("/?lead=created#dashboard");
}

export async function runResearch(formData: FormData) {
  const leadId = readLeadId(formData);
  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    const agentResult = await researchLead({
      company: lead.company,
      website: lead.website,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      segment: lead.segment,
      source: lead.source,
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.AUDIT,
        fitScore: agentResult.data.fitScore,
        nextAction: agentResult.data.nextAction,
        researchRuns: {
          create: {
            status: "SUCCEEDED",
            summary: agentResult.data.summary,
            confidence: agentResult.data.confidence,
            citations: agentResult.data.citations,
            signals: agentResult.data.signals,
          },
        },
        agentTraces: {
          create: {
            agentName: "Research Agent",
            status: "SUCCEEDED",
            model: agentResult.model,
            input: { leadId, company: lead.company, website: lead.website },
            output: { ...agentResult.data, mode: agentResult.mode },
            tokenCount: agentResult.tokenCount,
            latencyMs: agentResult.latencyMs,
          },
        },
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=db-unavailable`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=research`);
}

export async function runWebsiteAudit(formData: FormData) {
  const leadId = readLeadId(formData);
  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    const agentResult = await auditWebsite({
      company: lead.company,
      website: lead.website,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      segment: lead.segment,
      source: lead.source,
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.DRAFTED,
        auditScore: agentResult.data.overallScore,
        nextAction: agentResult.data.nextAction,
        websiteAudits: {
          create: {
            status: "SUCCEEDED",
            clarityScore: agentResult.data.clarityScore,
            conversionScore: agentResult.data.conversionScore,
            trustScore: agentResult.data.trustScore,
            seoScore: agentResult.data.seoScore,
            speedScore: agentResult.data.speedScore,
            overallScore: agentResult.data.overallScore,
            findings: agentResult.data.findings,
          },
        },
        agentTraces: {
          create: {
            agentName: "Website Audit Agent",
            status: "SUCCEEDED",
            model: agentResult.model,
            input: { leadId, website: lead.website },
            output: { ...agentResult.data, mode: agentResult.mode },
            tokenCount: agentResult.tokenCount,
            latencyMs: agentResult.latencyMs,
          },
        },
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=db-unavailable`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=audit`);
}

export async function generateOutreachDraft(formData: FormData) {
  const leadId = readLeadId(formData);
  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    const agentResult = await draftOutreach({
      company: lead.company,
      website: lead.website,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      segment: lead.segment,
      source: lead.source,
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.APPROVAL,
        nextAction: agentResult.data.nextAction,
        outreachDrafts: {
          create: {
            channel: DraftChannel.EMAIL,
            subject: agentResult.data.subject,
            body: agentResult.data.body,
            promptVersion: "outreach:v1",
            approvals: {
              create: {
                leadId,
                status: "PENDING",
                requestedAction: "Create Gmail draft after approval",
                notes: agentResult.data.approvalNotes,
              },
            },
          },
        },
        agentTraces: {
          create: {
            agentName: "Outreach Agent",
            status: "SUCCEEDED",
            model: agentResult.model,
            input: { leadId, company: lead.company, segment: lead.segment },
            output: { ...agentResult.data, mode: agentResult.mode },
            tokenCount: agentResult.tokenCount,
            latencyMs: agentResult.latencyMs,
          },
        },
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=db-unavailable`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=draft`);
}

function readLeadId(formData: FormData) {
  const leadId = formData.get("leadId");

  if (typeof leadId !== "string" || leadId.length < 2) {
    redirect("/?lead=invalid#dashboard");
  }

  return leadId;
}
