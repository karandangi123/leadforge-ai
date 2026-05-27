"use server";

import { revalidatePath } from "next/cache";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { getActiveWorkspace } from "@/lib/workspace";
import { SecurityService } from "@/lib/security";
import { z } from "zod";

const dncSchema = z.object({
  type: z.enum(["EMAIL", "DOMAIN", "PHONE"]),
  value: z.string().min(1),
  reason: z.string().optional(),
});

export async function addDncEntry(formData: FormData) {
  if (!hasDatabaseUrl()) return { success: false, error: "Database not configured" };

  const parsed = dncSchema.safeParse({
    type: formData.get("type"),
    value: formData.get("value"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) return { success: false, error: "Invalid input" };

  try {
    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();

    const entry = await prisma.doNotContact.create({
      data: {
        workspaceId: workspace.id,
        type: parsed.data.type,
        value: parsed.data.value,
        reason: parsed.data.reason,
      },
    });

    await SecurityService.recordAuditLog({
      workspaceId: workspace.id,
      action: "DNC_ENTRY_ADD",
      entityType: "DoNotContact",
      entityId: entry.id,
      metadata: { type: entry.type, value: entry.value },
    });

    revalidatePath("/?view=security");
    return { success: true };
  } catch (error) {
    console.error("DNC entry failed:", error);
    return { success: false, error: "Failed to add DNC entry" };
  }
}

export async function toggleSso(rawEnabled: boolean) {
  const enabled = z.boolean().parse(rawEnabled);
  if (!hasDatabaseUrl()) return { success: false };
  try {
    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { ssoEnabled: enabled },
    });

    await SecurityService.recordAuditLog({
      workspaceId: workspace.id,
      action: "SSO_CONFIG_CHANGE",
      entityType: "Workspace",
      entityId: workspace.id,
      metadata: { enabled },
    });

    revalidatePath("/?view=security");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function getAuditLogs() {
  if (!hasDatabaseUrl()) return [];
  try {
    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();

    return await prisma.auditLog.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch (e) {
    return [];
  }
}

export async function getDncEntries() {
  if (!hasDatabaseUrl()) return [];
  try {
    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();

    return await prisma.doNotContact.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    return [];
  }
}
