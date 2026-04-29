"use server";

import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { Client } from "pg";
import { z } from "zod";

import { ApprovalStatus, DraftChannel, LeadStatus } from "@/generated/prisma/enums";
import { auditWebsite, draftOutreach, prepareClientOps, researchLead } from "@/lib/ai-agents";
import { evaluateOutreach, evaluateResearch, evaluateWebsiteAudit } from "@/lib/evaluations";
import { getPrisma, hasDatabaseUrl, resetPrisma } from "@/lib/prisma";

const addLeadSchema = z.object({
  company: z.string().trim().min(2).max(120),
  website: z.string().trim().url().optional().or(z.literal("")),
  contactName: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  segment: z.string().trim().max(100).optional(),
});
const playbookSchema = z.object({
  product: z.string().trim().min(3).max(500),
  idealCustomer: z.string().trim().min(3).max(500),
  industries: z.string().trim().min(2).max(800),
  pains: z.string().trim().min(2).max(1000),
  proofPoints: z.string().trim().min(2).max(1000),
  tone: z.string().trim().min(2).max(240),
  positioning: z.string().trim().max(800).optional(),
});
const discoverySchema = z.object({
  targetMarket: z.string().trim().min(3).max(240),
});
const candidateSchema = z.object({
  candidateId: z.string().trim().min(2),
});

const outcomeSchema = z.enum(["EMAIL_SENT", "REPLIED", "MEETING_BOOKED", "WON", "LOST"]);
const localSetupSchema = z.object({
  databaseUrl: z.string().trim().url().startsWith("postgres"),
  openaiApiKey: z.string().trim().optional(),
});
const execFileAsync = promisify(execFile);

export async function saveLocalSetup(formData: FormData) {
  const parsed = localSetupSchema.safeParse({
    databaseUrl: formData.get("databaseUrl"),
    openaiApiKey: formData.get("openaiApiKey"),
  });

  if (!parsed.success) {
    redirect("/?lead=setup-invalid#start");
  }

  const databaseUrl = parsed.data.databaseUrl;
  const openaiApiKey = parsed.data.openaiApiKey || undefined;

  try {
    await verifyDatabaseConnection(databaseUrl);
    await writeLocalEnv({
      DATABASE_URL: databaseUrl,
      ...(openaiApiKey ? { OPENAI_API_KEY: openaiApiKey } : {}),
    });

    process.env.DATABASE_URL = databaseUrl;
    if (openaiApiKey) {
      process.env.OPENAI_API_KEY = openaiApiKey;
    }

    await resetPrisma();
    await pushPrismaSchema(databaseUrl);
    await resetPrisma();
    const sample = await createSampleLeadRecord("setup-assistant");

    revalidatePath("/");
    redirect(`/leads/${sample.id}?run=setup-complete`);
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?lead=setup-failed#start");
  }
}

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

export async function saveWorkspacePlaybook(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#playbook");
  }

  const parsed = playbookSchema.safeParse({
    product: formData.get("product"),
    idealCustomer: formData.get("idealCustomer"),
    industries: formData.get("industries"),
    pains: formData.get("pains"),
    proofPoints: formData.get("proofPoints"),
    tone: formData.get("tone"),
    positioning: formData.get("positioning"),
  });

  if (!parsed.success) {
    redirect("/?lead=playbook-invalid#playbook");
  }

  try {
    const prisma = getPrisma();
    const workspace = await prisma.workspace.upsert({
      where: { slug: "demo" },
      update: {},
      create: {
        name: "Demo Workspace",
        slug: "demo",
      },
    });

    await prisma.workspacePlaybook.upsert({
      where: { workspaceId: workspace.id },
      update: {
        product: parsed.data.product,
        idealCustomer: parsed.data.idealCustomer,
        industries: parseListInput(parsed.data.industries),
        pains: parseListInput(parsed.data.pains),
        proofPoints: parseListInput(parsed.data.proofPoints),
        tone: parsed.data.tone,
        positioning: parsed.data.positioning || null,
      },
      create: {
        workspaceId: workspace.id,
        product: parsed.data.product,
        idealCustomer: parsed.data.idealCustomer,
        industries: parseListInput(parsed.data.industries),
        pains: parseListInput(parsed.data.pains),
        proofPoints: parseListInput(parsed.data.proofPoints),
        tone: parsed.data.tone,
        positioning: parsed.data.positioning || null,
      },
    });

    revalidatePath("/");
    redirect("/?lead=playbook-saved#playbook");
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?lead=db-unavailable#playbook");
  }
}

export async function createSampleLead() {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#start");
  }

  try {
    const sample = await createSampleLeadRecord("dashboard-start-here");

    revalidatePath("/");
    redirect(`/leads/${sample.id}?run=sample`);
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?lead=db-unavailable#start");
  }
}

export async function runLeadDiscovery(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#discover");
  }

  const parsed = discoverySchema.safeParse({
    targetMarket: formData.get("targetMarket"),
  });

  if (!parsed.success) {
    redirect("/?lead=discovery-invalid#discover");
  }

  try {
    const prisma = getPrisma();
    const workspace = await prisma.workspace.upsert({
      where: { slug: "demo" },
      update: {},
      create: {
        name: "Demo Workspace",
        slug: "demo",
      },
    });
    const playbook = await prisma.workspacePlaybook.findUnique({ where: { workspaceId: workspace.id } });
    const discovery = buildDiscoveryPlan(parsed.data.targetMarket, mapAgentPlaybook(playbook));

    await prisma.discoveryRun.create({
      data: {
        workspaceId: workspace.id,
        targetMarket: parsed.data.targetMarket,
        queryPlan: discovery.queryPlan,
        sourcePolicy: discovery.sourcePolicy,
        summary: discovery.summary,
        candidateLeads: {
          create: discovery.candidates,
        },
      },
    });

    await prisma.agentTrace.create({
      data: {
        agentName: "Lead Discovery Agent",
        status: "SUCCEEDED",
        input: {
          targetMarket: parsed.data.targetMarket,
          playbook: playbook ? "workspace-playbook" : "none",
        },
        output: {
          generatedQueries: discovery.queryPlan.length,
          candidates: discovery.candidates.length,
          sourcePolicy: discovery.sourcePolicy,
        },
      },
    });

    revalidatePath("/");
    redirect("/?lead=discovery-created#discover");
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?lead=db-unavailable#discover");
  }
}

export async function saveCandidateLead(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#discover");
  }

  const parsed = candidateSchema.safeParse({
    candidateId: formData.get("candidateId"),
  });

  if (!parsed.success) {
    redirect("/?lead=invalid#discover");
  }

  try {
    const prisma = getPrisma();
    const candidate = await prisma.candidateLead.findUnique({
      where: { id: parsed.data.candidateId },
      include: { discoveryRun: true },
    });

    if (!candidate) {
      redirect("/?lead=invalid#discover");
    }

    if (candidate.savedLeadId) {
      redirect(`/?lead=candidate-duplicate#discover`);
    }

    const lead = await prisma.lead.create({
      data: {
        workspaceId: candidate.discoveryRun.workspaceId,
        company: candidate.company,
        website: candidate.website,
        segment: candidate.segment,
        source: `discovery:${candidate.sourceType}`,
        status: LeadStatus.RESEARCH,
        fitScore: candidate.fitScore,
        auditScore: candidate.auditHintScore,
        nextAction: "Run AI research",
        researchRuns: {
          create: {
            status: "SUCCEEDED",
            summary: candidate.reason,
            confidence: candidate.confidence,
            citations: candidate.sourceUrl ? [candidate.sourceUrl] : [],
            signals: {
              discoveryRunId: candidate.discoveryRunId,
              sourceType: candidate.sourceType,
              evidence: candidate.evidence,
            },
          },
        },
        agentTraces: {
          create: {
            agentName: "Lead Discovery Agent",
            status: "SUCCEEDED",
            input: {
              candidateId: candidate.id,
              targetMarket: candidate.discoveryRun.targetMarket,
            },
            output: {
              savedAsLead: true,
              fitScore: candidate.fitScore,
              auditHintScore: candidate.auditHintScore,
              evidence: candidate.evidence,
            },
          },
        },
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

    const playbook = await prisma.workspacePlaybook.findUnique({ where: { workspaceId: lead.workspaceId } });
    const agentResult = await researchLead({
      company: lead.company,
      website: lead.website,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      segment: lead.segment,
      source: lead.source,
      playbook: mapAgentPlaybook(playbook),
    });
    const evaluation = evaluateResearch(agentResult.data);

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
        evaluations: {
          create: {
            category: evaluation.category,
            score: evaluation.score,
            passed: evaluation.passed,
            report: { checks: evaluation.checks, mode: agentResult.mode },
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

    const playbook = await prisma.workspacePlaybook.findUnique({ where: { workspaceId: lead.workspaceId } });
    const agentResult = await auditWebsite({
      company: lead.company,
      website: lead.website,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      segment: lead.segment,
      source: lead.source,
      playbook: mapAgentPlaybook(playbook),
    });
    const evaluation = evaluateWebsiteAudit(agentResult.data);

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
        evaluations: {
          create: {
            category: evaluation.category,
            score: evaluation.score,
            passed: evaluation.passed,
            report: { checks: evaluation.checks, mode: agentResult.mode },
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

    const playbook = await prisma.workspacePlaybook.findUnique({ where: { workspaceId: lead.workspaceId } });
    const agentResult = await draftOutreach({
      company: lead.company,
      website: lead.website,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      segment: lead.segment,
      source: lead.source,
      playbook: mapAgentPlaybook(playbook),
    });
    const evaluation = evaluateOutreach(agentResult.data);

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
        evaluations: {
          create: {
            category: evaluation.category,
            score: evaluation.score,
            passed: evaluation.passed,
            report: { checks: evaluation.checks, mode: agentResult.mode },
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

export async function prepareClientOperations(formData: FormData) {
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

    const playbook = await prisma.workspacePlaybook.findUnique({ where: { workspaceId: lead.workspaceId } });
    const agentResult = await prepareClientOps({
      company: lead.company,
      website: lead.website,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      segment: lead.segment,
      source: lead.source,
      playbook: mapAgentPlaybook(playbook),
    });
    const dueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.READY,
        nextAction: agentResult.data.nextAction,
        outreachDrafts: {
          create: [
            {
              channel: DraftChannel.LOOM_SCRIPT,
              body: agentResult.data.loomScript,
              promptVersion: "client-ops:v1",
            },
            {
              channel: DraftChannel.CRM_NOTE,
              body: agentResult.data.crmNote,
              promptVersion: "client-ops:v1",
            },
          ],
        },
        approvals: {
          create: {
            status: "PENDING",
            requestedAction: "Approve Gmail draft, Loom script, and CRM sync payload",
            notes: "Review final assets before creating external drafts or syncing records.",
          },
        },
        integrationSyncs: {
          create: [
            {
              provider: "AIRTABLE",
              status: "READY",
              payload: agentResult.data.airtableFields,
            },
            {
              provider: "CRM",
              status: "READY",
              payload: {
                company: lead.company,
                contactName: lead.contactName,
                contactEmail: lead.contactEmail,
                note: agentResult.data.crmNote,
                nextAction: agentResult.data.nextAction,
              },
            },
          ],
        },
        followUpReminders: {
          create: {
            dueAt,
            channel: "EMAIL",
            status: "SCHEDULED",
            note: agentResult.data.followUpReminder,
          },
        },
        agentTraces: {
          create: {
            agentName: "Client Ops Agent",
            status: "SUCCEEDED",
            model: agentResult.model,
            input: { leadId, company: lead.company, contactEmail: lead.contactEmail },
            output: { ...agentResult.data, mode: agentResult.mode, dueAt: dueAt.toISOString() },
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
  redirect(`/leads/${leadId}?run=client-ops`);
}

export async function approveLeadWork(formData: FormData) {
  return reviewLeadWork(formData, "approve");
}

export async function rejectLeadWork(formData: FormData) {
  return reviewLeadWork(formData, "reject");
}

export async function recordLeadOutcome(formData: FormData) {
  const leadId = readLeadId(formData);
  const parsed = outcomeSchema.safeParse(formData.get("eventType"));

  if (!parsed.success) {
    redirect(`/leads/${leadId}?run=invalid`);
  }

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    const outcome = getOutcomeTransition(parsed.data);

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: outcome.status,
        nextAction: outcome.nextAction,
        outcomeEvents: {
          create: {
            eventType: parsed.data,
            note: outcome.note,
            source: "manual",
            metadata: {
              company: lead.company,
              fitScore: lead.fitScore,
              auditScore: lead.auditScore,
            },
          },
        },
        agentTraces: {
          create: {
            agentName: "Outcome Learning Agent",
            status: "SUCCEEDED",
            input: {
              leadId,
              eventType: parsed.data,
            },
            output: {
              eventType: parsed.data,
              nextAction: outcome.nextAction,
              learningSignal: outcome.learningSignal,
            },
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
  redirect(`/leads/${leadId}?run=outcome`);
}

async function reviewLeadWork(formData: FormData, decision: "approve" | "reject") {
  const leadId = readLeadId(formData);
  const approvalId = readApprovalId(formData);

  if (!hasDatabaseUrl()) {
    redirect(`/leads/${leadId}?run=db-not-configured`);
  }

  try {
    const prisma = getPrisma();
    const approval = await prisma.approval.findFirst({
      where: {
        id: approvalId,
        leadId,
      },
    });

    if (!approval) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    const approved = decision === "approve";
    await prisma.$transaction([
      prisma.approval.update({
        where: { id: approval.id },
        data: {
          status: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
          decidedAt: new Date(),
          notes: approved
            ? appendReviewNote(approval.notes, "Approved by reviewer. External actions are now ready to execute.")
            : appendReviewNote(approval.notes, "Rejected by reviewer. Regenerate or edit the assets before continuing."),
        },
      }),
      prisma.integrationSync.updateMany({
        where: {
          leadId,
          status: "READY",
        },
        data: {
          status: approved ? "APPROVED" : "BLOCKED",
        },
      }),
      prisma.lead.update({
        where: { id: leadId },
        data: {
          status: approved ? LeadStatus.READY : LeadStatus.REJECTED,
          nextAction: approved ? "Create Gmail draft and sync CRM" : "Revise outreach assets",
          agentTraces: {
            create: {
              agentName: "Reviewer Agent",
              status: "SUCCEEDED",
              input: {
                leadId,
                approvalId,
                decision,
              },
              output: {
                approvalStatus: approved ? "APPROVED" : "REJECTED",
                syncStatus: approved ? "APPROVED" : "BLOCKED",
                nextAction: approved ? "Create Gmail draft and sync CRM" : "Revise outreach assets",
              },
            },
          },
        },
      }),
    ]);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=db-unavailable`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=${decision}`);
}

function readLeadId(formData: FormData) {
  const leadId = formData.get("leadId");

  if (typeof leadId !== "string" || leadId.length < 2) {
    redirect("/?lead=invalid#dashboard");
  }

  return leadId;
}

function readApprovalId(formData: FormData) {
  const approvalId = formData.get("approvalId");

  if (typeof approvalId !== "string" || approvalId.length < 2) {
    redirect("/?lead=invalid#dashboard");
  }

  return approvalId;
}

function appendReviewNote(current: string | null, next: string) {
  return current ? `${current}\n\n${next}` : next;
}

function parseListInput(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function mapAgentPlaybook(
  playbook: {
    product: string;
    idealCustomer: string;
    industries: unknown;
    pains: unknown;
    proofPoints: unknown;
    tone: string;
    positioning: string | null;
  } | null,
) {
  if (!playbook) {
    return null;
  }

  return {
    product: playbook.product,
    idealCustomer: playbook.idealCustomer,
    industries: readStringList(playbook.industries),
    pains: readStringList(playbook.pains),
    proofPoints: readStringList(playbook.proofPoints),
    tone: playbook.tone,
    positioning: playbook.positioning,
  };
}

function readStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => (typeof item === "string" ? [item] : []));
}

function getOutcomeTransition(eventType: z.infer<typeof outcomeSchema>) {
  if (eventType === "EMAIL_SENT") {
    return {
      status: LeadStatus.SYNCED,
      nextAction: "Wait for reply",
      note: "Approved outreach was marked as sent.",
      learningSignal: "delivery",
    };
  }

  if (eventType === "REPLIED") {
    return {
      status: LeadStatus.READY,
      nextAction: "Book meeting",
      note: "Lead replied. Review the response and book the next step.",
      learningSignal: "reply",
    };
  }

  if (eventType === "MEETING_BOOKED") {
    return {
      status: LeadStatus.READY,
      nextAction: "Prepare meeting notes",
      note: "Meeting booked. Capture what message and angle created the conversion.",
      learningSignal: "meeting",
    };
  }

  if (eventType === "WON") {
    return {
      status: LeadStatus.SYNCED,
      nextAction: "Add winning pattern to playbook",
      note: "Opportunity marked won. Use this outcome to tune fit scoring and prompts.",
      learningSignal: "won",
    };
  }

  return {
    status: LeadStatus.REJECTED,
    nextAction: "Review loss reason",
    note: "Opportunity marked lost. Review fit, audit, and outreach assumptions.",
    learningSignal: "lost",
  };
}

function buildDiscoveryPlan(targetMarket: string, playbook: ReturnType<typeof mapAgentPlaybook>) {
  const normalizedTarget = targetMarket.trim();
  const targetWords = normalizedTarget
    .split(/[,\s]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9-]/g, ""))
    .filter((word) => word.length > 2)
    .slice(0, 4);
  const slug = targetWords.join("-").toLowerCase() || "target-market";
  const targetTitle = toTitleCase(normalizedTarget);
  const industries = playbook?.industries?.length ? playbook.industries : [normalizedTarget];
  const primaryPain = playbook?.pains?.[0] ?? "manual qualification and inconsistent follow-up";
  const proof = playbook?.proofPoints?.[0] ?? "traceable research, scoring, and approval controls";
  const tone = playbook?.tone ?? "specific, useful, and concise";
  const sourcePolicy = {
    allowed: [
      "Company websites",
      "Search result snippets",
      "Public directories",
      "GitHub organizations",
      "Job posts",
      "News pages",
      "Public tech hints",
    ],
    blocked: [
      "Undetectable scraping",
      "Login-gated scraping",
      "CAPTCHA bypass",
      "LinkedIn automation without explicit user import",
    ],
    linkedin: "Manual CSV/import only. Do not automate LinkedIn browsing or messaging.",
  };
  const queryPlan = [
    `${normalizedTarget} companies ${industries[0]} case studies`,
    `${normalizedTarget} software platforms hiring revops operations`,
    `site:github.com/orgs ${normalizedTarget} company engineering`,
    `${normalizedTarget} startup funding news customer operations`,
    `${normalizedTarget} public directory ${playbook?.idealCustomer ?? "B2B teams"}`,
    `${normalizedTarget} careers ${primaryPain}`,
  ];
  const candidateSeeds = [
    {
      company: `${targetTitle} Operations Group`,
      sourceType: "company_website",
      sourceUrl: `https://${slug}-ops.example`,
      evidence: [
        `Website copy matches ${normalizedTarget}.`,
        `Likely pain: ${primaryPain}.`,
        `Outreach can reference ${proof}.`,
      ],
      scoreBump: 8,
    },
    {
      company: `${targetTitle} Systems Lab`,
      sourceType: "github_org",
      sourceUrl: `https://github.com/${slug}-systems`,
      evidence: [
        "Public GitHub organization suggests an active technical team.",
        `Repository language indicates fit for ${playbook?.product ?? "AI-assisted RevOps workflows"}.`,
        "Use GitHub as context only, not as a personal-data source.",
      ],
      scoreBump: 3,
    },
    {
      company: `${targetTitle} Growth Partners`,
      sourceType: "public_directory",
      sourceUrl: `https://directory.example/${slug}`,
      evidence: [
        "Public directory listing indicates service or SaaS category fit.",
        `ICP overlap: ${playbook?.idealCustomer ?? "B2B teams with outbound motion"}.`,
        `Recommended tone: ${tone}.`,
      ],
      scoreBump: 0,
    },
    {
      company: `${targetTitle} Hiring Signal Co`,
      sourceType: "job_post",
      sourceUrl: `https://jobs.example/${slug}-operations`,
      evidence: [
        "Job post implies active investment in operations or growth roles.",
        "Hiring pages can create timely outreach triggers.",
        `Pain to validate: ${primaryPain}.`,
      ],
      scoreBump: -4,
    },
    {
      company: `${targetTitle} Market Notes`,
      sourceType: "news_page",
      sourceUrl: `https://news.example/${slug}-expansion`,
      evidence: [
        "News page creates a public trigger for timely outreach.",
        "Use the article as a citation candidate after human review.",
        `Potential angle: ${playbook?.positioning ?? "improve lead research and approved outreach quality"}.`,
      ],
      scoreBump: -8,
    },
  ];

  return {
    queryPlan,
    sourcePolicy,
    summary:
      "Discovery generated a professional query plan, compliant source boundaries, and scored candidate leads. LinkedIn remains manual-import only.",
    candidates: candidateSeeds.map((candidate, index) => {
      const fitScore = clampScore(82 + candidate.scoreBump + Math.min(playbook?.industries?.length ?? 0, 5));

      return {
        company: candidate.company,
        website: candidate.sourceType === "company_website" ? candidate.sourceUrl : null,
        segment: industries[index % industries.length] ?? normalizedTarget,
        sourceType: candidate.sourceType,
        sourceUrl: candidate.sourceUrl,
        evidence: candidate.evidence,
        fitScore,
        auditHintScore: candidate.sourceType === "company_website" ? clampScore(fitScore - 12) : null,
        confidence: Number((0.68 + index * 0.04).toFixed(2)),
        reason: `${candidate.company} appears relevant to ${normalizedTarget} because ${candidate.evidence[0]} Save only after reviewing the source.`,
      };
    }),
  };
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}

async function createSampleLeadRecord(source: string) {
  const prisma = getPrisma();
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo",
    },
  });

  return prisma.lead.create({
    data: {
      workspaceId: workspace.id,
      company: `Atlas Clinic Ops ${new Date().toISOString().slice(11, 16)}`,
      website: "https://atlasclinic.example",
      contactName: "Priya Raman",
      contactEmail: "priya@atlasclinic.example",
      segment: "Healthcare operations",
      status: LeadStatus.RESEARCH,
      source: "sample",
      nextAction: "Run AI research",
      agentTraces: {
        create: {
          agentName: "Sample Lead Generator",
          status: "SUCCEEDED",
          input: { source },
          output: {
            nextAction: "Run AI research",
            note: "Sample lead created for first-run onboarding.",
          },
        },
      },
    },
  });
}

async function verifyDatabaseConnection(databaseUrl: string) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await client.query("select 1");
  await client.end();
}

async function pushPrismaSchema(databaseUrl: string) {
  await execFileAsync("npx", ["prisma", "db", "push", "--skip-generate"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    timeout: 60_000,
  });
}

async function writeLocalEnv(values: Record<string, string>) {
  const envPath = path.join(process.cwd(), ".env.local");
  const current = await readFile(envPath, "utf8").catch(() => "");
  const lines = current
    .split("\n")
    .filter((line) => line.trim().length > 0 && !Object.keys(values).some((key) => line.startsWith(`${key}=`)));

  for (const [key, value] of Object.entries(values)) {
    lines.push(`${key}=${JSON.stringify(value)}`);
  }

  await writeFile(envPath, `${lines.join("\n")}\n`);
}
