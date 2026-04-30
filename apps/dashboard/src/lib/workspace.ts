import { getPrisma } from "@leadforge/db";

export const DEFAULT_WORKSPACE_SLUG = "demo";
export const GOOGLE_PROVIDER = "GOOGLE_GMAIL";

export async function getOrCreateDefaultWorkspace() {
  const prisma = getPrisma();
  return prisma.workspace.upsert({
    where: { slug: DEFAULT_WORKSPACE_SLUG },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: DEFAULT_WORKSPACE_SLUG,
    },
  });
}
