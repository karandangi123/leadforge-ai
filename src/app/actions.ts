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
import { auditWebsite, draftOutreach, prepareClientOps, researchLead, roastWebsite, runGrowthMode, spyCompetitor } from "@/lib/ai-agents";
import { evaluateOutreach, evaluateResearch, evaluateWebsiteAudit } from "@/lib/evaluations";
import { getPrisma, hasDatabaseUrl, resetPrisma } from "@/lib/prisma";

const addLeadSchema = z.object({
  company: z.string().trim().min(2).max(120),
  website: z.string().trim().url().optional().or(z.literal("")),
  contactName: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  segment: z.string().trim().max(100).optional(),
  ownerName: z.string().trim().max(120).optional(),
  tags: z.string().trim().max(400).optional(),
  notes: z.string().trim().max(4000).optional(),
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
const metadataSchema = z.object({
  leadId: z.string().trim().min(2),
  website: z.string().trim().url().optional().or(z.literal("")),
  contactName: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  segment: z.string().trim().max(100).optional(),
  ownerName: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(4000).optional(),
  tags: z.string().trim().max(400).optional(),
});
const moveLeadStageSchema = z.object({
  leadId: z.string().trim().min(2),
  status: z.nativeEnum(LeadStatus),
  manualStatusReason: z.string().trim().min(3).max(400),
  returnTo: z.string().trim().optional(),
});
const humanNextActionSchema = z.object({
  leadId: z.string().trim().min(2),
  humanNextAction: z.string().trim().max(240),
});
const websiteRoastSchema = z.object({
  url: z.string().trim().url(),
  notes: z.string().trim().max(1000).optional(),
});
const competitorSpySchema = z.object({
  url: z.string().trim().url(),
  notes: z.string().trim().max(1000).optional(),
});
const growthModeSchema = z.object({
  prompt: z.string().trim().min(8).max(1200),
  context: z.string().trim().max(1200).optional(),
});
const localSetupSchema = z.object({
  databaseUrl: z.string().trim().url().startsWith("postgres"),
  openaiApiKey: z.string().trim().optional(),
});
const execFileAsync = promisify(execFile);

export type CsvImportState = {
  message: string;
  results: Array<{
    row: number;
    company: string;
    status: "created" | "skipped duplicate" | "invalid row" | "needs review";
    detail: string;
  }>;
};

export type WebsiteRoastState = {
  message: string;
  result: null | {
    companyName: string;
    url: string;
    mode: "openai" | "fallback";
    model: string;
    overallScore: number;
    designScore: number;
    trustScore: number;
    speedScore: number;
    seoScore: number;
    conversionScore: number;
    headlineRewrite: string;
    subheadlineRewrite: string;
    ctaRewrite: string;
    summary: string;
    topFindings: string[];
    quickWins: string[];
    revenueOpportunity: {
      estimatedMonthlyVisitors: number;
      currentConversionRate: number;
      improvedConversionRate: number;
      estimatedAdditionalMonthlyLeads: number;
      estimatedMonthlyRevenueLiftUsd: number;
    };
  };
};

export type CompetitorSpyState = {
  message: string;
  result: null | {
    competitorName: string;
    url: string;
    mode: "openai" | "fallback";
    model: string;
    summary: string;
    offerPositioning: string;
    ctaStyle: string;
    funnelObservation: string;
    keywordAngles: string[];
    strengths: string[];
    weaknesses: string[];
    differentiationMoves: string[];
    quickAttackPlan: {
      homepageAngle: string;
      proofStrategy: string;
      ctaStrategy: string;
    };
  };
};

export type GrowthModeState = {
  message: string;
  result: null | {
    businessName: string;
    targetOutcome: string;
    mode: "openai" | "fallback";
    model: string;
    summary: string;
    icp: {
      primaryBuyer: string;
      painPoints: string[];
      industries: string[];
    };
    offer: {
      coreOffer: string;
      pricingAngle: string;
      proofHooks: string[];
    };
    leadSources: Array<{
      channel: string;
      whyItWorks: string;
      firstMove: string;
    }>;
    outreachPlan: {
      openingAngle: string;
      channels: string[];
      cadence: string[];
    };
    websiteFixes: string[];
    contentPlan: string[];
    dailyExecutionPlan: string[];
    kpis: Array<{
      label: string;
      target: string;
    }>;
    ninetyDayPlan: {
      days0to30: string[];
      days31to60: string[];
      days61to90: string[];
    };
  };
};

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
    ownerName: formData.get("ownerName"),
    tags: formData.get("tags"),
    notes: formData.get("notes"),
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

  const duplicateResult = await classifyDuplicateLead(prisma, workspace.id, {
    company: parsed.data.company,
    website: parsed.data.website || null,
    contactEmail: parsed.data.contactEmail || null,
    segment: parsed.data.segment || null,
  });

  if (duplicateResult === "duplicate") {
    redirect("/?lead=duplicate#dashboard");
  }

  await prisma.lead.create({
    data: {
      workspaceId: workspace.id,
      company: parsed.data.company,
      website: parsed.data.website || null,
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      segment: parsed.data.segment || null,
      ownerName: parsed.data.ownerName || null,
      notes: parsed.data.notes || null,
      tags: parseTagInput(parsed.data.tags),
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
            tags: parseTagInput(parsed.data.tags),
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

export async function updateLeadMetadata(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#dashboard");
  }

  const parsed = metadataSchema.safeParse({
    leadId: formData.get("leadId"),
    website: formData.get("website"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    segment: formData.get("segment"),
    ownerName: formData.get("ownerName"),
    notes: formData.get("notes"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    redirect(`/leads/${String(formData.get("leadId") ?? "")}?run=invalid`);
  }

  const { leadId } = parsed.data;

  try {
    const prisma = getPrisma();
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        website: parsed.data.website || null,
        contactName: parsed.data.contactName || null,
        contactEmail: parsed.data.contactEmail || null,
        segment: parsed.data.segment || null,
        ownerName: parsed.data.ownerName || null,
        notes: parsed.data.notes || null,
        tags: parseTagInput(parsed.data.tags),
        agentTraces: {
          create: {
            agentName: "Operator Override",
            status: "SUCCEEDED",
            input: { leadId, action: "update-metadata" },
            output: {
              website: parsed.data.website || null,
              contactName: parsed.data.contactName || null,
              contactEmail: parsed.data.contactEmail || null,
              segment: parsed.data.segment || null,
              ownerName: parsed.data.ownerName || null,
              tags: parseTagInput(parsed.data.tags),
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
  redirect(`/leads/${leadId}?run=metadata`);
}

export async function moveLeadStage(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#dashboard");
  }

  const parsed = moveLeadStageSchema.safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
    manualStatusReason: formData.get("manualStatusReason"),
    returnTo: formData.get("returnTo"),
  });

  if (!parsed.success) {
    redirect(`/leads/${String(formData.get("leadId") ?? "")}?run=invalid`);
  }

  const { leadId, status, manualStatusReason } = parsed.data;

  if (status === LeadStatus.REJECTED && manualStatusReason.length < 3) {
    redirect(`/leads/${leadId}?run=invalid`);
  }

  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      redirect(`/leads/${leadId}?run=missing`);
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        manualStatusReason,
        agentTraces: {
          create: {
            agentName: "Operator Override",
            status: "SUCCEEDED",
            input: {
              leadId,
              fromStatus: lead.status,
              toStatus: status,
            },
            output: {
              reason: manualStatusReason,
              aiNextAction: lead.nextAction,
              humanNextAction: lead.humanNextAction,
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
  redirect(parsed.data.returnTo || `/leads/${leadId}?run=stage-moved`);
}

export async function setLeadHumanNextAction(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#dashboard");
  }

  const parsed = humanNextActionSchema.safeParse({
    leadId: formData.get("leadId"),
    humanNextAction: formData.get("humanNextAction"),
  });

  if (!parsed.success) {
    redirect(`/leads/${String(formData.get("leadId") ?? "")}?run=invalid`);
  }

  const { leadId, humanNextAction } = parsed.data;

  try {
    const prisma = getPrisma();
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        humanNextAction: humanNextAction || null,
        agentTraces: {
          create: {
            agentName: "Operator Override",
            status: "SUCCEEDED",
            input: { leadId, action: "set-human-next-action" },
            output: {
              humanNextAction: humanNextAction || null,
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
  redirect(`/leads/${leadId}?run=next-action`);
}

export async function importLeadsCsv(_prevState: CsvImportState, formData: FormData): Promise<CsvImportState> {
  if (!hasDatabaseUrl()) {
    return {
      message: "Connect Postgres before importing leads.",
      results: [],
    };
  }

  const file = formData.get("csvFile");
  if (!(file instanceof File) || file.size === 0) {
    return {
      message: "Choose a CSV file with at least one lead row.",
      results: [],
    };
  }

  const text = await file.text();
  const rows = parseCsvRows(text);

  if (rows.length <= 1) {
    return {
      message: "The CSV needs a header row and at least one lead row.",
      results: [],
    };
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

    const header = rows[0].map((item) => item.trim());
    const results: CsvImportState["results"] = [];

    for (const [index, rawRow] of rows.slice(1).entries()) {
      const rowNumber = index + 2;
      const rowRecord = Object.fromEntries(header.map((key, keyIndex) => [key, rawRow[keyIndex] ?? ""]));
      const parsedRow = addLeadSchema.safeParse({
        company: rowRecord.company,
        website: rowRecord.website,
        contactName: rowRecord.contactName,
        contactEmail: rowRecord.contactEmail,
        segment: rowRecord.segment,
        ownerName: rowRecord.owner,
        tags: rowRecord.tags,
        notes: rowRecord.notes,
      });

      if (!parsedRow.success) {
        results.push({
          row: rowNumber,
          company: String(rowRecord.company ?? "").trim() || `Row ${rowNumber}`,
          status: "invalid row",
          detail: "Required fields are missing or a URL/email format is invalid.",
        });
        continue;
      }

      const duplicateResult = await classifyDuplicateLead(prisma, workspace.id, {
        company: parsedRow.data.company,
        website: parsedRow.data.website || null,
        contactEmail: parsedRow.data.contactEmail || null,
        segment: parsedRow.data.segment || null,
      });

      if (duplicateResult === "duplicate") {
        results.push({
          row: rowNumber,
          company: parsedRow.data.company,
          status: "skipped duplicate",
          detail: "Exact website, email, or company+segment match already exists.",
        });
        continue;
      }

      if (duplicateResult === "needs_review") {
        results.push({
          row: rowNumber,
          company: parsedRow.data.company,
          status: "needs review",
          detail: "A similar company already exists, but the match is ambiguous.",
        });
        continue;
      }

      await prisma.lead.create({
        data: {
          workspaceId: workspace.id,
          company: parsedRow.data.company,
          website: parsedRow.data.website || null,
          contactName: parsedRow.data.contactName || null,
          contactEmail: parsedRow.data.contactEmail || null,
          segment: parsedRow.data.segment || null,
          ownerName: parsedRow.data.ownerName || null,
          notes: parsedRow.data.notes || null,
          tags: parseTagInput(parsedRow.data.tags),
          status: LeadStatus.RESEARCH,
          source: "csv_import",
          nextAction: "Run AI research",
          agentTraces: {
            create: {
              agentName: "Lead Intake",
              status: "SUCCEEDED",
              input: {
                company: parsedRow.data.company,
                source: "csv_import",
              },
              output: {
                nextAction: "Run AI research",
              },
            },
          },
        },
      });

      results.push({
        row: rowNumber,
        company: parsedRow.data.company,
        status: "created",
        detail: "Lead was saved and entered the research queue.",
      });
    }

    revalidatePath("/");
    return {
      message: `Processed ${results.length} row${results.length === 1 ? "" : "s"}.`,
      results,
    };
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: "The import could not reach the database.",
      results: [],
    };
  }
}

export async function runWebsiteRoast(
  _prevState: WebsiteRoastState,
  formData: FormData,
): Promise<WebsiteRoastState> {
  const parsed = websiteRoastSchema.safeParse({
    url: formData.get("url"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      message: "Enter a valid website URL to generate the roast.",
      result: null,
    };
  }

  try {
    const result = await roastWebsite({
      url: parsed.data.url,
      notes: parsed.data.notes,
    });

    return {
      message:
        result.mode === "openai"
          ? `Roast generated with ${result.model}.`
          : "Roast generated in fallback mode. Add OPENAI_API_KEY for a live AI pass.",
      result: {
        companyName: result.data.companyName,
        url: parsed.data.url,
        mode: result.mode,
        model: result.model,
        overallScore: result.data.overallScore,
        designScore: result.data.designScore,
        trustScore: result.data.trustScore,
        speedScore: result.data.speedScore,
        seoScore: result.data.seoScore,
        conversionScore: result.data.conversionScore,
        headlineRewrite: result.data.headlineRewrite,
        subheadlineRewrite: result.data.subheadlineRewrite,
        ctaRewrite: result.data.ctaRewrite,
        summary: result.data.summary,
        topFindings: result.data.topFindings,
        quickWins: result.data.quickWins,
        revenueOpportunity: result.data.revenueOpportunity,
      },
    };
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: "The roast could not be generated right now.",
      result: null,
    };
  }
}

export async function runCompetitorSpy(
  _prevState: CompetitorSpyState,
  formData: FormData,
): Promise<CompetitorSpyState> {
  const parsed = competitorSpySchema.safeParse({
    url: formData.get("url"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      message: "Enter a valid competitor URL to generate the spy brief.",
      result: null,
    };
  }

  try {
    const result = await spyCompetitor({
      url: parsed.data.url,
      notes: parsed.data.notes,
    });

    return {
      message:
        result.mode === "openai"
          ? `Competitor brief generated with ${result.model}.`
          : "Competitor brief generated in fallback mode. Add OPENAI_API_KEY for a live AI pass.",
      result: {
        competitorName: result.data.competitorName,
        url: parsed.data.url,
        mode: result.mode,
        model: result.model,
        summary: result.data.summary,
        offerPositioning: result.data.offerPositioning,
        ctaStyle: result.data.ctaStyle,
        funnelObservation: result.data.funnelObservation,
        keywordAngles: result.data.keywordAngles,
        strengths: result.data.strengths,
        weaknesses: result.data.weaknesses,
        differentiationMoves: result.data.differentiationMoves,
        quickAttackPlan: result.data.quickAttackPlan,
      },
    };
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: "The competitor brief could not be generated right now.",
      result: null,
    };
  }
}

export async function executeGrowthMode(
  _prevState: GrowthModeState,
  formData: FormData,
): Promise<GrowthModeState> {
  const parsed = growthModeSchema.safeParse({
    prompt: formData.get("prompt"),
    context: formData.get("context"),
  });

  if (!parsed.success) {
    return {
      message: "Enter a clear growth prompt so LeadForge can generate the strategy brief.",
      result: null,
    };
  }

  try {
    const result = await runGrowthMode({
      prompt: parsed.data.prompt,
      context: parsed.data.context,
    });

    return {
      message:
        result.mode === "openai"
          ? `Growth strategy generated with ${result.model}.`
          : "Growth strategy generated in fallback mode. Add OPENAI_API_KEY for a live AI pass.",
      result: {
        businessName: result.data.businessName,
        targetOutcome: result.data.targetOutcome,
        mode: result.mode,
        model: result.model,
        summary: result.data.summary,
        icp: result.data.icp,
        offer: result.data.offer,
        leadSources: result.data.leadSources,
        outreachPlan: result.data.outreachPlan,
        websiteFixes: result.data.websiteFixes,
        contentPlan: result.data.contentPlan,
        dailyExecutionPlan: result.data.dailyExecutionPlan,
        kpis: result.data.kpis,
        ninetyDayPlan: result.data.ninetyDayPlan,
      },
    };
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: "The growth strategy could not be generated right now.",
      result: null,
    };
  }
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
  const returnTo = formData.get("returnTo");

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
  redirect(typeof returnTo === "string" && returnTo.length > 0 ? returnTo : `/leads/${leadId}?run=${decision}`);
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

function parseTagInput(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/\n|,/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12)
    .map((item) => item.slice(0, 32));
}

function parseListInput(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

async function classifyDuplicateLead(
  prisma: ReturnType<typeof getPrisma>,
  workspaceId: string,
  input: {
    company: string;
    website: string | null;
    contactEmail: string | null;
    segment: string | null;
  },
) {
  const normalizedCompany = normalizeCompany(input.company);
  const normalizedWebsite = normalizeWebsite(input.website);
  const normalizedEmail = normalizeEmail(input.contactEmail);
  const existing = await prisma.lead.findMany({
    where: { workspaceId },
    select: {
      company: true,
      website: true,
      contactEmail: true,
      segment: true,
    },
  });

  for (const lead of existing) {
    if (normalizedWebsite && normalizeWebsite(lead.website) === normalizedWebsite) {
      return "duplicate" as const;
    }
    if (normalizedEmail && normalizeEmail(lead.contactEmail) === normalizedEmail) {
      return "duplicate" as const;
    }

    if (
      normalizeCompany(lead.company) === normalizedCompany &&
      normalizeSegment(lead.segment) === normalizeSegment(input.segment)
    ) {
      return "duplicate" as const;
    }

    if (normalizeCompany(lead.company) === normalizedCompany) {
      return "needs_review" as const;
    }
  }

  return "unique" as const;
}

function normalizeCompany(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeSegment(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeWebsite(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      if (row.some((item) => item.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((item) => item.trim().length > 0)) {
    rows.push(row);
  }

  return rows;
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
      ownerName: "Karan Dangi",
      notes: "Sample lead created for first-run onboarding and demo screenshots.",
      tags: ["sample", "healthcare", "demo"],
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
