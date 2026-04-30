import {
  DraftChannel,
  getPrisma,
  JobKind,
  JobStatus,
  LeadStatus,
  type PrismaClient,
} from "@leadforge/db";
import { auditWebsite, draftOutreach, prepareClientOps, researchLead } from "@leadforge/agents";
import { roastWebsite } from "@leadforge/agents";
import { generateFounderContent, generateProposal, runGrowthMode, spyCompetitor } from "@leadforge/agents";
import { evaluateOutreach, evaluateResearch, evaluateWebsiteAudit } from "@leadforge/evals";
import { getAiRuntimeMode, type RuntimeMode } from "../runtime-mode";
import { readRecord, serializeAsyncJob, type AsyncJobSnapshot } from "./types";

export async function executeAsyncJobById(jobId: string): Promise<AsyncJobSnapshot> {
  const prisma = getPrisma();
  const existing = await prisma.asyncJob.findUnique({
    where: { id: jobId },
    include: {
      lead: true,
      events: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  if (!existing) {
    throw new Error(`Async job ${jobId} was not found.`);
  }

  if (existing.status === JobStatus.SUCCEEDED) {
    return serializeAsyncJob(existing);
  }

  const playbook = await prisma.workspacePlaybook.findUnique({
    where: { workspaceId: existing.workspaceId },
  });

  await prisma.asyncJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.RUNNING,
      attemptCount: { increment: 1 },
      startedAt: existing.startedAt ?? new Date(),
      errorMessage: null,
      events: {
        create: {
          status: JobStatus.RUNNING,
          message: `${getJobActionLabel(existing.kind)} is running.`,
          meta: {
            executionMode: getExecutionMode(existing.payload),
          },
        },
      },
    },
  });

  try {
    if (existing.kind === JobKind.RESEARCH) {
      await runResearchJob(prisma, existing.id, existing.lead, playbook);
    } else if (existing.kind === JobKind.WEBSITE_AUDIT) {
      await runWebsiteAuditJob(prisma, existing.id, existing.lead, playbook);
    } else if (existing.kind === JobKind.OUTREACH_DRAFT) {
      await runOutreachJob(prisma, existing.id, existing.lead, playbook);
    } else if (existing.kind === JobKind.WEBSITE_ROAST) {
      await runWebsiteRoastJob(prisma, existing.id, existing.payload);
    } else if (existing.kind === JobKind.COMPETITOR_SPY) {
      await runCompetitorSpyJob(prisma, existing.id, existing.payload);
    } else if (existing.kind === JobKind.GROWTH_MODE) {
      await runGrowthModeJob(prisma, existing.id, existing.payload);
    } else if (existing.kind === JobKind.FOUNDER_CONTENT) {
      await runFounderContentJob(prisma, existing.id, existing.payload);
    } else if (existing.kind === JobKind.PROPOSAL_GENERATOR) {
      await runProposalGeneratorJob(prisma, existing.id, existing.payload);
    } else {
      await runClientOpsJob(prisma, existing.id, existing.lead, playbook);
    }
  } catch (error) {
    const message = toErrorMessage(error);
    await prisma.asyncJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        completedAt: new Date(),
        errorMessage: message,
        events: {
          create: {
            status: JobStatus.FAILED,
            message,
            meta: {
              kind: existing.kind,
            },
          },
        },
      },
    });
    throw error;
  }

  const finished = await prisma.asyncJob.findUniqueOrThrow({
    where: { id: jobId },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  return serializeAsyncJob(finished);
}

export async function getAsyncJobSnapshotById(jobId: string) {
  const prisma = getPrisma();
  const job = await prisma.asyncJob.findUnique({
    where: { id: jobId },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  return job ? serializeAsyncJob(job) : null;
}

async function runResearchJob(
  prisma: PrismaClient,
  jobId: string,
  lead: LeadShape | null,
  playbook: PlaybookShape,
) {
  if (!lead) {
    throw new Error("Research job is missing its lead context.");
  }
  const agentResult = await researchLead(buildLeadAgentInput(lead, playbook));
  const evaluation = evaluateResearch(agentResult.data);

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: lead.id },
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
            input: { leadId: lead.id, company: lead.company, website: lead.website, jobId },
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

    await markJobSucceeded(tx, jobId, {
      message: "Research completed and lead context was updated.",
      result: {
        nextAction: agentResult.data.nextAction,
        fitScore: agentResult.data.fitScore,
        confidence: agentResult.data.confidence,
      },
    });
  });
}

async function runWebsiteAuditJob(
  prisma: PrismaClient,
  jobId: string,
  lead: LeadShape | null,
  playbook: PlaybookShape,
) {
  if (!lead) {
    throw new Error("Website audit job is missing its lead context.");
  }
  const agentResult = await auditWebsite(buildLeadAgentInput(lead, playbook));
  const evaluation = evaluateWebsiteAudit(agentResult.data);

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: lead.id },
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
            input: { leadId: lead.id, website: lead.website, jobId },
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

    await markJobSucceeded(tx, jobId, {
      message: "Website audit completed and scores were saved.",
      result: {
        nextAction: agentResult.data.nextAction,
        overallScore: agentResult.data.overallScore,
      },
    });
  });
}

async function runOutreachJob(
  prisma: PrismaClient,
  jobId: string,
  lead: LeadShape | null,
  playbook: PlaybookShape,
) {
  if (!lead) {
    throw new Error("Outreach job is missing its lead context.");
  }
  const agentResult = await draftOutreach(buildLeadAgentInput(lead, playbook));
  const evaluation = evaluateOutreach(agentResult.data);

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: lead.id },
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
                leadId: lead.id,
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
            input: { leadId: lead.id, company: lead.company, segment: lead.segment, jobId },
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

    await markJobSucceeded(tx, jobId, {
      message: "Outreach draft completed and entered the approval queue.",
      result: {
        nextAction: agentResult.data.nextAction,
        subject: agentResult.data.subject,
      },
    });
  });
}

async function runClientOpsJob(
  prisma: PrismaClient,
  jobId: string,
  lead: LeadShape | null,
  playbook: PlaybookShape,
) {
  if (!lead) {
    throw new Error("Client ops job is missing its lead context.");
  }
  const agentResult = await prepareClientOps(buildLeadAgentInput(lead, playbook));
  const dueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: lead.id },
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
            input: { leadId: lead.id, company: lead.company, contactEmail: lead.contactEmail, jobId },
            output: { ...agentResult.data, mode: agentResult.mode, dueAt: dueAt.toISOString() },
            tokenCount: agentResult.tokenCount,
            latencyMs: agentResult.latencyMs,
          },
        },
      },
    });

    await markJobSucceeded(tx, jobId, {
      message: "Client ops assets were prepared and queued for review.",
      result: {
        nextAction: agentResult.data.nextAction,
        dueAt: dueAt.toISOString(),
      },
    });
  });
}

async function runWebsiteRoastJob(
  prisma: PrismaClient,
  jobId: string,
  payload: unknown,
) {
  const input = readRecord(payload);
  const url = typeof input.url === "string" ? input.url : "";
  const notes = typeof input.notes === "string" ? input.notes : undefined;

  if (!url) {
    throw new Error("Website roast job is missing its URL.");
  }

  const agentResult = await roastWebsite({ url, notes });

  await markJobSucceeded(prisma, jobId, {
    message: "Website roast completed with summary, rewrites, and revenue upside.",
    result: {
      ...agentResult.data,
      mode: agentResult.mode,
      model: agentResult.model,
    },
  });
}

async function runCompetitorSpyJob(
  prisma: PrismaClient,
  jobId: string,
  payload: unknown,
) {
  const input = readRecord(payload);
  const url = typeof input.url === "string" ? input.url : "";
  const notes = typeof input.notes === "string" ? input.notes : undefined;

  if (!url) {
    throw new Error("Competitor Spy job is missing its URL.");
  }

  const agentResult = await spyCompetitor({ url, notes });
  await markJobSucceeded(prisma, jobId, {
    message: "Competitor brief completed with positioning and attack-plan insights.",
    result: {
      ...agentResult.data,
      mode: agentResult.mode,
      model: agentResult.model,
    },
  });
}

async function runGrowthModeJob(
  prisma: PrismaClient,
  jobId: string,
  payload: unknown,
) {
  const input = readRecord(payload);
  const prompt = typeof input.prompt === "string" ? input.prompt : "";
  const context = typeof input.context === "string" ? input.context : undefined;

  if (!prompt) {
    throw new Error("Growth Mode job is missing its prompt.");
  }

  const agentResult = await runGrowthMode({ prompt, context });
  await markJobSucceeded(prisma, jobId, {
    message: "Growth brief completed with ICP, execution, and roadmap guidance.",
    result: {
      ...agentResult.data,
      mode: agentResult.mode,
      model: agentResult.model,
    },
  });
}

async function runFounderContentJob(
  prisma: PrismaClient,
  jobId: string,
  payload: unknown,
) {
  const input = readRecord(payload);
  const business = typeof input.business === "string" ? input.business : "";
  const audience = typeof input.audience === "string" ? input.audience : "";
  const offer = typeof input.offer === "string" ? input.offer : "";
  const contentGoal = typeof input.contentGoal === "string" ? input.contentGoal : "";
  const platforms = typeof input.platforms === "string" ? input.platforms : undefined;
  const tone = typeof input.tone === "string" ? input.tone : undefined;
  const proofAssets = typeof input.proofAssets === "string" ? input.proofAssets : undefined;

  if (!business || !audience || !offer || !contentGoal) {
    throw new Error("Founder Content job is missing one or more required fields.");
  }

  const agentResult = await generateFounderContent({
    business,
    audience,
    offer,
    contentGoal,
    platforms,
    tone,
    proofAssets,
  });
  await markJobSucceeded(prisma, jobId, {
    message: "Founder content engine completed with drafts, pillars, and a publishing system.",
    result: {
      ...agentResult.data,
      mode: agentResult.mode,
      model: agentResult.model,
    },
  });
}

async function runProposalGeneratorJob(
  prisma: PrismaClient,
  jobId: string,
  payload: unknown,
) {
  const input = readRecord(payload);
  const clientName = typeof input.clientName === "string" ? input.clientName : "";
  const clientType = typeof input.clientType === "string" ? input.clientType : "";
  const projectType = typeof input.projectType === "string" ? input.projectType : "";
  const serviceLine = typeof input.serviceLine === "string" ? input.serviceLine : undefined;
  const niche = typeof input.niche === "string" ? input.niche : undefined;
  const desiredOutcome = typeof input.desiredOutcome === "string" ? input.desiredOutcome : "";

  if (!clientName || !clientType || !projectType || !desiredOutcome) {
    throw new Error("Proposal Generator job is missing one or more required fields.");
  }

  const agentResult = await generateProposal({
    clientName,
    clientType,
    projectType,
    desiredOutcome,
    serviceLine,
    niche,
  });
  await markJobSucceeded(prisma, jobId, {
    message: "Proposal package completed and is ready for export.",
    result: {
      ...agentResult.data,
      mode: agentResult.mode,
      model: agentResult.model,
    },
  });
}

async function markJobSucceeded(
  prisma: Pick<PrismaClient, "asyncJob">,
  jobId: string,
  input: {
    message: string;
    result: Record<string, unknown>;
  },
) {
  await prisma.asyncJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.SUCCEEDED,
      completedAt: new Date(),
      errorMessage: null,
      result: toJsonValue(input.result),
      events: {
        create: {
          status: JobStatus.SUCCEEDED,
          message: input.message,
          meta: toJsonValue(input.result),
        },
      },
    },
  });
}

function buildLeadAgentInput(lead: LeadShape, playbook: PlaybookShape) {
  return {
    company: lead.company,
    website: lead.website,
    contactName: lead.contactName,
    contactEmail: lead.contactEmail,
    segment: lead.segment,
    source: lead.source,
    playbook: mapAgentPlaybook(playbook),
  };
}

function mapAgentPlaybook(playbook: PlaybookShape) {
  if (!playbook) {
    return null;
  }

  if (!playbook.product || !playbook.idealCustomer || !playbook.tone) {
    return null;
  }

  return {
    product: playbook.product,
    idealCustomer: playbook.idealCustomer,
    industries: readStringArray(playbook.industries),
    pains: readStringArray(playbook.pains),
    proofPoints: readStringArray(playbook.proofPoints),
    tone: playbook.tone,
    positioning: playbook.positioning,
  };
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown async job failure";
}

function getJobActionLabel(kind: JobKind) {
  if (kind === JobKind.RESEARCH) {
    return "Research";
  }

  if (kind === JobKind.WEBSITE_AUDIT) {
    return "Website audit";
  }

  if (kind === JobKind.OUTREACH_DRAFT) {
    return "Outreach draft";
  }

  if (kind === JobKind.WEBSITE_ROAST) {
    return "Website roast";
  }

  if (kind === JobKind.COMPETITOR_SPY) {
    return "Competitor Spy";
  }

  if (kind === JobKind.GROWTH_MODE) {
    return "Growth Mode";
  }

  if (kind === JobKind.FOUNDER_CONTENT) {
    return "Founder Content";
  }

  if (kind === JobKind.PROPOSAL_GENERATOR) {
    return "Proposal Generator";
  }

  return "Client ops";
}

function getExecutionMode(payload: unknown): RuntimeMode {
  const executionMode = readRecord(payload).executionMode;

  if (executionMode === "live" || executionMode === "degraded" || executionMode === "demo") {
    return executionMode;
  }

  return getAiRuntimeMode();
}

function toJsonValue(value: Record<string, unknown>) {
  return value as unknown as Parameters<PrismaClient["asyncJob"]["update"]>[0]["data"]["result"];
}

type LeadShape = {
  id: string;
  company: string;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  segment: string | null;
  source: string;
  workspaceId: string;
};

type PlaybookShape = {
  product: string | null;
  idealCustomer: string | null;
  industries: unknown;
  pains: unknown;
  proofPoints: unknown;
  tone: string | null;
  positioning: string | null;
} | null;
