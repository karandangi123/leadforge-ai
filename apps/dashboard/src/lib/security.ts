import { getPrisma } from "@leadforge/db";

export class SecurityService {
  /**
   * Audit Logging: Record a security or operational event
   */
  static async recordAuditLog(params: {
    workspaceId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: any;
  }) {
    const prisma = getPrisma();
    return prisma.auditLog.create({
      data: {
        workspaceId: params.workspaceId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata || {},
      },
    });
  }

  /**
   * DNC Check: Verify if a contact or domain is on the suppression list
   */
  static async isSuppressed(workspaceId: string, email: string, phone?: string): Promise<{ suppressed: boolean; reason?: string }> {
    const prisma = getPrisma();
    const domain = email.split("@")[1];

    const match = await prisma.doNotContact.findFirst({
      where: {
        workspaceId,
        OR: [
          { type: "EMAIL", value: email },
          { type: "DOMAIN", value: domain },
          { type: "PHONE", value: phone || "NONE" },
        ],
      },
    });

    if (match) {
      return { suppressed: true, reason: match.reason || "Manual suppression list match" };
    }

    return { suppressed: false };
  }

  /**
   * Lead Scrubbing: Bulk check leads against DNC list
   */
  static async scrubLeads(workspaceId: string, leadIds: string[]) {
    const prisma = getPrisma();
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds }, workspaceId },
    });

    for (const lead of leads) {
      if (lead.contactEmail) {
        const { suppressed } = await this.isSuppressed(workspaceId, lead.contactEmail, lead.contactPhone || undefined);
        if (suppressed) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { isDnc: true, status: "REJECTED", manualStatusReason: "Automated DNC suppression match during scrubbing." },
          });
        }
      }
    }
  }

  /**
   * Role Check: Centralized RBAC logic
   */
  static canAccess(role: string, permission: "BILLING" | "SECURITY" | "OUTREACH" | "RESEARCH") {
    const roles: Record<string, string[]> = {
      OWNER: ["BILLING", "SECURITY", "OUTREACH", "RESEARCH"],
      ADMIN: ["SECURITY", "OUTREACH", "RESEARCH"],
      OPERATOR: ["OUTREACH", "RESEARCH"],
      CLIENT: ["OUTREACH"], // Restricted
    };

    return roles[role]?.includes(permission) || false;
  }
}
