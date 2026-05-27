import "server-only";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const DEFAULT_WORKSPACE_SLUG = "demo";
export const GOOGLE_PROVIDER = "GOOGLE_GMAIL";

export type UserRole = "OWNER" | "ADMIN" | "OPERATOR";

type PersonalWorkspaceUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type WorkspaceMembershipWithWorkspace = Awaited<ReturnType<typeof getFirstMembershipForUser>>;

export async function getActiveWorkspace(slug?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const demoWorkspace = {
    id: "demo",
    name: "Demo Workspace",
    slug: "demo",
    role: "OWNER" as UserRole,
  };

  if (session.user.id === "demo-user") {
    if (hasDatabaseUrl()) {
      try {
        const prisma = getPrisma();
        await prisma.workspace.upsert({
          where: { id: "demo" },
          update: {},
          create: {
            id: "demo",
            name: "Demo Workspace",
            slug: "demo",
          },
        });
      } catch (e) {
        console.warn("Failed to ensure demo workspace in DB:", e);
      }
    }
    return demoWorkspace;
  }

  try {
    const prisma = getPrisma();

    if (!slug) {
      const { membership } = await ensurePersonalWorkspaceForUser(
        {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        prisma,
      );

      return { ...membership.workspace, role: membership.role as UserRole };
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        workspace: {
          OR: [{ id: slug }, { slug }],
        },
      },
      include: { workspace: true },
    });

    if (!membership) {
      return demoWorkspace;
    }

    return { ...membership.workspace, role: membership.role as UserRole };
  } catch (error) {
    console.error("Failed to fetch active workspace, falling back to demo:", error);
    return demoWorkspace;
  }
}

export async function ensurePersonalWorkspaceForUser(
  user: PersonalWorkspaceUser,
  prisma = getPrisma(),
): Promise<{ membership: NonNullable<WorkspaceMembershipWithWorkspace>; created: boolean }> {
  const existingMembership = await getFirstMembershipForUser(prisma, user.id);
  if (existingMembership) {
    return { membership: existingMembership, created: false };
  }

  const membership = await prisma.membership.create({
    data: {
      role: "OWNER",
      user: {
        connect: {
          id: user.id,
        },
      },
      workspace: {
        create: {
          name: getPersonalWorkspaceName(user.name),
          slug: await generateUniqueWorkspaceSlug(prisma, getWorkspaceSlugBase(user.email, user.name)),
        },
      },
    },
    include: { workspace: true },
  });

  return { membership, created: true };
}

export async function logAudit(
  workspaceId: string,
  action: string,
  entityType: string,
  entityId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any = {},
) {
  const session = await auth();
  if (session?.user?.id === "demo-user") return null;
  const prisma = getPrisma();

  return prisma.auditLog.create({
    data: {
      workspaceId,
      userId: session?.user?.id,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}

export function ensureRole(currentRole: UserRole, requiredRoles: UserRole[]) {
  if (!requiredRoles.includes(currentRole)) {
    throw new Error("Unauthorized: Insufficient permissions");
  }
}

async function getFirstMembershipForUser(prisma: ReturnType<typeof getPrisma>, userId: string) {
  return prisma.membership.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
}

function getPersonalWorkspaceName(name?: string | null) {
  const firstName = name?.trim().split(/\s+/)[0];
  if (!firstName) {
    return "My Workspace";
  }

  return `${firstName}'s Workspace`;
}

function getWorkspaceSlugBase(email?: string | null, name?: string | null) {
  const candidate = email?.split("@")[0] || name || "personal";
  const normalized = candidate
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return normalized || "personal";
}

async function generateUniqueWorkspaceSlug(prisma: ReturnType<typeof getPrisma>, base: string) {
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
