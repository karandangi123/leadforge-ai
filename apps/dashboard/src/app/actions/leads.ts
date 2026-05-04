"use server";

import { getPrisma } from "@leadforge/db";
import { getActiveWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

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
export async function updateLeadStatus(leadId: string, status: any) {
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
export async function bulkUpdateLeads(leadIds: string[], data: any) {
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
export async function moveLeadStage(leadIdOrFormData: string | FormData, status?: any) {
  const prisma = getPrisma();
  let id: string;
  let newStatus: any;

  if (leadIdOrFormData instanceof FormData) {
    id = leadIdOrFormData.get("leadId") as string;
    newStatus = leadIdOrFormData.get("status") as any;
  } else {
    id = leadIdOrFormData;
    newStatus = status;
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
export async function addLead(data: any) {
  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();

  try {
    const lead = await prisma.lead.create({
      data: {
        ...data,
        workspaceId: workspace.id,
        status: "NEW",
      },
    });
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { success: true, lead };
  } catch (error) {
    console.error("[LeadsAction] Add lead failed", error);
     
  }
}

/**
 * Create a lead from a Competitor Spy insight or Discovery run
 */
export async function createLeadFromInsight(data: any) {
  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();

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
    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("[LeadsAction] Create from insight failed", error);
     
  }
}

export type CsvImportState = {
  message: string;
  count?: number;
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
    if (!file) return { message: "No file uploaded" };

    return { message: "Successfully imported leads (Simulation)", count: 12 };
  } catch (e) {
    return { message: "Failed to parse CSV" };
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
  const leadId = formData.get("leadId") as string;
  const eventType = formData.get("eventType") as string;

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
  
  const data: any = {};
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
