"use server";

import { getPrisma, LeadStatus } from "@leadforge/db";
import { getActiveWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const IdSchema = z.string().min(1);
const LeadStatusEnum = z.enum(["NEW", "RESEARCH", "AUDIT", "DRAFTED", "APPROVAL", "READY", "SYNCED", "REJECTED"]);

const LeadCreateSchema = z.object({
  company: z.string().min(1),
  website: z.string().min(3),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  segment: z.string().optional(),
  ownerName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/**
 * Fetch all leads for the active workspace with basic enrichment profiles
 */
export async function getLeads() {
  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();

  try {
    const leads = await prisma.lead.findMany({
      where: { 
        workspaceId: workspace.id 
      },
      orderBy: { createdAt: "desc" },
      take: 100 // Safety limit for bulk view
    });
    return leads;
  } catch (error) {
    console.error("[LeadsAction] Failed to fetch leads", error);
    throw new Error("Could not load leads");
  }
}

/**
 * Update lead status manually (e.g. Reject, Approve, Mark as Research)
 */
export async function updateLeadStatus(rawLeadId: string, rawStatus: string) {
  const leadId = IdSchema.parse(rawLeadId);
  const status = LeadStatusEnum.parse(rawStatus) as LeadStatus;
  const prisma = getPrisma();
  
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status }
    });
    revalidatePath("/leads");
     
  } catch (error) {
    console.error("[LeadsAction] Failed to update lead status", error);
     
  }
}

/**
 * Bulk delete or archive leads
 */
export async function bulkUpdateLeads(rawLeadIds: string[], rawData: any) {
  const leadIds = z.array(IdSchema).parse(rawLeadIds);
  const data = z.object({
    status: LeadStatusEnum.optional(),
    ownerName: z.string().optional(),
    segment: z.string().optional(),
  }).parse(rawData);
  const prisma = getPrisma();

  try {
    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data
    });
    revalidatePath("/leads");
     
  } catch (error) {
    console.error("[LeadsAction] Bulk update failed", error);
     
  }
}

/**
 * Move a lead to a new stage (Supports both direct call and Form Action)
 */
export async function moveLeadStage(leadIdOrFormData: string | FormData, status?: string) {
  const prisma = getPrisma();
  let id: string;
  let newStatus: LeadStatus;

  if (leadIdOrFormData instanceof FormData) {
    id = IdSchema.parse(leadIdOrFormData.get("leadId"));
    newStatus = LeadStatusEnum.parse(leadIdOrFormData.get("status")) as LeadStatus;
  } else {
    id = IdSchema.parse(leadIdOrFormData);
    if (!status) throw new Error("Status is required for stage movement");
    newStatus = LeadStatusEnum.parse(status) as LeadStatus;
  }
  
  try {
    await prisma.lead.update({
      where: { id: id },
      data: { status: newStatus }
    });
    revalidatePath("/dashboard");
    revalidatePath("/leads");
  } catch (error) {
    console.error("[LeadsAction] Move lead stage failed", error);
  }
}

/**
 * Add a new lead manually
 */
/**
 * Add a new lead manually (Supports both direct call and Form Action)
 */
export async function addLead(dataOrFormData: any) {
  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();
  let rawData: any;

  if (dataOrFormData instanceof FormData) {
    rawData = {
      company: dataOrFormData.get("company"),
      website: dataOrFormData.get("website"),
      contactName: dataOrFormData.get("contactName"),
      contactEmail: dataOrFormData.get("contactEmail"),
      segment: dataOrFormData.get("segment"),
      ownerName: dataOrFormData.get("ownerName"),
      tags: (dataOrFormData.get("tags") as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
      notes: dataOrFormData.get("notes"),
    };
  } else {
    rawData = dataOrFormData;
  }

  const data = LeadCreateSchema.parse(rawData);

  try {
    await prisma.lead.create({
      data: {
        ...data,
        workspaceId: workspace.id,
        status: "NEW",
      },
    });
    revalidatePath("/leads");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("[LeadsAction] Add lead failed", error);
  }
}

/**
 * Create a lead from a Competitor Spy insight or Discovery run
 */
export async function createLeadFromInsight(dataOrFormData: { company: string; website: string } | FormData) {
  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();
  let data: any;

  if (dataOrFormData instanceof FormData) {
    data = {
      company: dataOrFormData.get("company") as string,
      website: dataOrFormData.get("website") as string,
    };
  } else {
    data = dataOrFormData;
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        company: data.company,
        website: data.website,
        workspaceId: workspace.id,
        status: "NEW",
        source: "discovery"
      }
    });
    revalidatePath("/dashboard");
    
    
    
  } catch (error) {
    console.error("[LeadsAction] Create from insight failed", error);
  }
}

export type CsvImportState = {
  message: string;
  count?: number;
  results: Array<{ row: number; company: string; status: string; detail: string }>;
};

/**
 * Handle CSV import of leads
 */
export async function importLeadsCsv(state: CsvImportState, formData: FormData): Promise<CsvImportState> {
  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();
  
  // Simulation of CSV parsing logic for now
  try {
    const file = formData.get("file") as File;
    if (!file) return { message: "No file uploaded", results: [] };

    return { message: "Successfully imported leads (Simulation)", count: 12, results: [] };
  } catch (e) {
    return { message: "Failed to parse CSV", results: [] };
  }
}

/**
 * Demo: Create a sample lead
 */
export async function createSampleLead(formData: FormData) {
  await addLead({
    company: "Future AI",
    website: "futureai.io",
    contactName: "Sam Altman (Sample)",
    contactEmail: "sam@futureai.io",
    segment: "SaaS",
  });
}
/**
 * Log a lead outcome (won/lost/etc) for analytics
 */
export async function recordLeadOutcome(formData: FormData) {
  const prisma = getPrisma();
  const leadId = IdSchema.parse(formData.get("leadId"));
  const eventType = z.string().min(1).parse(formData.get("eventType"));

  try {
    await prisma.outcomeEvent.create({
      data: {
        leadId,
        eventType,
        note: `Manual outcome logged via dashboard`
      }
    });
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/dashboard");
     
  } catch (error) {
    console.error("[LeadsAction] Failed to record outcome", error);
     
  }
}

/**
 * Update lead metadata (website, contact, segment, etc)
 */
export async function updateLeadMetadata(formData: FormData) {
  const prisma = getPrisma();
  const leadId = formData.get("leadId") as string;
  
  const data: Partial<{ website: string; contactName: string; contactEmail: string; segment: string; ownerName: string; tags: string[]; notes: string }> & { [key: string]: any } = {};
  const fields = ["website", "contactName", "contactEmail", "segment", "ownerName", "tags", "notes"];
  
  fields.forEach(field => {
    const value = formData.get(field);
    if (value !== null) {
      if (field === "tags") {
        data.tags = (value as string).split(",").map(t => t.trim()).filter(t => t);
      } else {
        data[field] = value;
      }
    }
  });

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data
    });
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/leads");
    revalidatePath("/dashboard");
     
  } catch (error) {
    console.error("[LeadsAction] Failed to update metadata", error);
     
  }
}

/**
 * Set a human-defined next action for a lead
 */
export async function setLeadHumanNextAction(formData: FormData) {
  const prisma = getPrisma();
  const leadId = formData.get("leadId") as string;
  const humanNextAction = formData.get("humanNextAction") as string;

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { humanNextAction }
    });
    revalidatePath(`/leads/${leadId}`);
     
  } catch (error) {
    console.error("[LeadsAction] Failed to set human action", error);
     
  }
}
