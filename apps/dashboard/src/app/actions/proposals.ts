"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { 
  createProposalMemoryRecord, 
  updateProposalMemoryRecord,
  ProposalOutcomeStatus
} from "@/lib/workspace-ops-memory";

const saveProposalSchema = z.object({
  proposalTitle: z.string().trim().min(2),
  clientName: z.string().trim().min(2),
  clientType: z.string().trim().min(2),
  templateName: z.string().trim().min(2),
  serviceLine: z.string().trim().min(2),
  niche: z.string().trim().min(2),
  primaryPriceAnchor: z.string().trim().min(1),
  outcome: z.string().trim(),
  notes: z.string().trim().optional().or(z.literal("")),
});

const updateProposalSchema = z.object({
  recordId: z.string().trim().min(2),
  outcome: z.string().trim(),
  notes: z.string().trim().optional().or(z.literal("")),
});

export async function saveProposalMemory(formData: FormData) {
  const parsed = saveProposalSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    redirect("/?lead=proposal-invalid#proposals");
  }

  await createProposalMemoryRecord("demo", {
    proposalTitle: parsed.data.proposalTitle,
    clientName: parsed.data.clientName,
    clientType: parsed.data.clientType,
    templateName: parsed.data.templateName,
    serviceLine: parsed.data.serviceLine,
    niche: parsed.data.niche,
    primaryPriceAnchor: parsed.data.primaryPriceAnchor,
    outcome: parsed.data.outcome as ProposalOutcomeStatus,
    notes: parsed.data.notes || "",
  });

  revalidatePath("/");
  redirect("/?lead=proposal-saved#proposals");
}

export async function updateProposalMemoryOutcome(formData: FormData) {
  const parsed = updateProposalSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    redirect("/?lead=proposal-invalid#proposals");
  }

  await updateProposalMemoryRecord("demo", parsed.data.recordId, {
    outcome: parsed.data.outcome as ProposalOutcomeStatus,
    notes: parsed.data.notes || "",
  });

  revalidatePath("/");
  redirect("/?lead=proposal-updated#proposals");
}
