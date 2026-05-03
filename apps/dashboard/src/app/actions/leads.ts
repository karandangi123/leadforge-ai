"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl, LeadStatus } from "@leadforge/db";
import { getActiveWorkspace } from "@/lib/workspace";
import { createSampleLeadRecord } from "@/lib/leads";
import { SecurityService } from "@/lib/security";

import { processOutcomeLearning } from "@/lib/learning-loop";

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
  const workspace = await getActiveWorkspace();


  const duplicateResult = await classifyDuplicateLead(prisma, workspace.id, {
    company: parsed.data.company,
    website: parsed.data.website || null,
    contactEmail: parsed.data.contactEmail || null,
    segment: parsed.data.segment || null,
  });

  if (duplicateResult === "duplicate") {
    redirect("/?lead=duplicate#dashboard");
  }

  const lead = await prisma.lead.create({
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
      nextAction: "Run intelligence research",
    },
  });

  await SecurityService.recordAuditLog({
    workspaceId: workspace.id,
    action: "LEAD_CREATE",
    entityType: "Lead",
    entityId: lead.id,
    metadata: { company: lead.company, source: lead.source },
  });

  await prisma.agentTrace.create({
    data: {
      leadId: lead.id,
      agentName: "Lead Intake",
      status: "SUCCEEDED",
          input: {
            company: parsed.data.company,
            website: parsed.data.website || null,
            tags: parseTagInput(parsed.data.tags),
          },
          output: {
            nextAction: "Run intelligence research",
          },
        },
      });

  revalidatePath("/");
  redirect("/?lead=created#dashboard");
}

export async function createLeadFromInsight(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured");
  }

  const parsed = addLeadSchema.safeParse({
    company: formData.get("company"),
    website: formData.get("website"),
    segment: formData.get("segment"),
    tags: formData.get("tags"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirect("/?lead=invalid");
  }

  try {
    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();


    const source = String(formData.get("source") ?? "insight");

    const lead = await prisma.lead.create({
      data: {
        workspaceId: workspace.id,
        company: parsed.data.company,
        website: parsed.data.website || null,
        segment: parsed.data.segment || null,
        notes: parsed.data.notes || null,
        tags: parseTagInput(parsed.data.tags),
        status: LeadStatus.RESEARCH,
        source: source,
        nextAction: "Run intelligence research",
        agentTraces: {
          create: {
            agentName: "Insight Converter",
            status: "SUCCEEDED",
            input: { source, company: parsed.data.company },
            output: { nextAction: "Run intelligence research" },
          },
        },
      },
    });

    revalidatePath("/");
    redirect(`/leads/${lead.id}?run=insight-saved`);
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?lead=db-unavailable");
  }
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
      },
    });

    await SecurityService.recordAuditLog({
      workspaceId: lead.workspaceId,
      action: "LEAD_STAGE_CHANGE",
      entityType: "Lead",
      entityId: leadId,
      metadata: { from: lead.status, to: status, reason: manualStatusReason },
    });

    await prisma.agentTrace.create({
      data: {
        leadId,
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

  revalidatePath("/");
  redirect(`/leads/${leadId}?run=next-action`);
}

const outcomeSchema = z.enum(["EMAIL_SENT", "REPLIED", "MEETING_BOOKED", "WON", "LOST"]);

export async function recordLeadOutcome(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
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
              fromStatus: lead.status,
              toStatus: outcome.status,
            },
            output: {
              learningSignal: outcome.learningSignal,
              note: outcome.note,
            },
          },
        },
      },
    });

    // 3. Trigger learning loop (background-ish)
    await processOutcomeLearning(leadId, parsed.data);

  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=db-unavailable`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=outcome-recorded`);
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

// Helpers (Copied from actions.ts for now, will move to utils later)

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

export type CsvImportState = {
  message: string;
  results: Array<{
    row: number;
    company: string;
    status: string;
    detail: string;
  }>;
};

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
    const workspace = await getActiveWorkspace();


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
          nextAction: "Run intelligence research",
          agentTraces: {
            create: {
              agentName: "Lead Intake",
              status: "SUCCEEDED",
              input: {
                company: parsedRow.data.company,
                website: parsedRow.data.website || null,
                tags: parseTagInput(parsedRow.data.tags),
              },
              output: {
                nextAction: "Run intelligence research",
              },
            },
          },
        },
      });

      results.push({
        row: rowNumber,
        company: parsedRow.data.company,
        status: "imported",
        detail: "Lead added and ready for research.",
      });
    }

    revalidatePath("/");
    return {
      message: `Import complete. ${results.filter((r) => r.status === "imported").length} leads added.`,
      results,
    };
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: "Database error during import. Review logs.",
      results: [],
    };
  }
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\n" || char === "\r") {
        currentRow.push(currentField);
        if (currentRow.some((field) => field.trim().length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
      } else {
        currentField += char;
      }
    }
  }

  if (currentRow.length > 0 || currentField.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((field) => field.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
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
