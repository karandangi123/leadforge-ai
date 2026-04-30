"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl, resetPrisma } from "@leadforge/db";
import { saveWorkspaceBranding } from "@/lib/workspace-branding";
import { deleteTraceSavedView, saveTraceSavedView } from "@/lib/workspace-ops-memory";
import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { createSampleLeadRecord } from "@/lib/leads";

const execFileAsync = promisify(execFile);

const playbookSchema = z.object({
  product: z.string().trim().min(3).max(500),
  idealCustomer: z.string().trim().min(3).max(500),
  industries: z.string().trim().min(2).max(800),
  pains: z.string().trim().min(2).max(1000),
  proofPoints: z.string().trim().min(2).max(1000),
  tone: z.string().trim().min(2).max(240),
  positioning: z.string().trim().max(800).optional(),
  brandName: z.string().trim().min(2).max(120),
  tagLine: z.string().trim().min(3).max(240),
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  secondaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  defaultServiceLine: z.string().trim().min(2).max(80),
  defaultNiche: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email(),
  websiteUrl: z.string().trim().url(),
  signoffName: z.string().trim().min(2).max(120),
  legalFooter: z.string().trim().min(8).max(400),
  proposalVoice: z.string().trim().min(6).max(240),
  pricingFootnote: z.string().trim().min(8).max(400),
});

const traceSavedViewSchema = z.object({
  name: z.string().trim().min(2).max(120),
  search: z.string().trim().max(240).optional(),
  agent: z.string().trim().max(120),
  status: z.string().trim().max(120),
  pinned: z.enum(["1", "0"]).optional(),
});

const localSetupSchema = z.object({
  databaseUrl: z.string().trim().url().startsWith("postgres"),
  openaiApiKey: z.string().trim().optional(),
});

export async function saveWorkspacePlaybook(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#playbook");
  }

  const parsed = playbookSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    redirect("/?lead=invalid#playbook");
  }

  try {
    const prisma = getPrisma();
    const workspace = await prisma.workspace.upsert({
      where: { slug: "demo" },
      update: {},
      create: { name: "Demo Workspace", slug: "demo" },
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

    await saveWorkspaceBranding("demo", {
      brandName: parsed.data.brandName,
      tagLine: parsed.data.tagLine,
      primaryColor: parsed.data.primaryColor,
      secondaryColor: parsed.data.secondaryColor,
      accentColor: parsed.data.accentColor,
      defaultServiceLine: parsed.data.defaultServiceLine,
      defaultNiche: parsed.data.defaultNiche,
      contactEmail: parsed.data.contactEmail,
      websiteUrl: parsed.data.websiteUrl,
      signoffName: parsed.data.signoffName,
      legalFooter: parsed.data.legalFooter,
      proposalVoice: parsed.data.proposalVoice,
      pricingFootnote: parsed.data.pricingFootnote,
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?lead=db-unavailable#playbook");
  }

  revalidatePath("/");
  redirect("/?lead=playbook-saved#playbook");
}

export async function saveGrowthModeToPlaybook(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/?lead=db-not-configured#playbook");
  }

  const prisma = getPrisma();
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: { name: "Demo Workspace", slug: "demo" },
  });

  const product = String(formData.get("product") ?? "");
  const idealCustomer = String(formData.get("idealCustomer") ?? "");
  const industries = String(formData.get("industries") ?? "");
  const pains = String(formData.get("pains") ?? "");
  const proofPoints = String(formData.get("proofPoints") ?? "");
  const tone = String(formData.get("tone") ?? "");
  const positioning = String(formData.get("positioning") ?? "");

  try {
    await prisma.workspacePlaybook.upsert({
      where: { workspaceId: workspace.id },
      update: {
        product,
        idealCustomer,
        industries: parseListInput(industries),
        pains: parseListInput(pains),
        proofPoints: parseListInput(proofPoints),
        tone,
        positioning,
      },
      create: {
        workspaceId: workspace.id,
        product,
        idealCustomer,
        industries: parseListInput(industries),
        pains: parseListInput(pains),
        proofPoints: parseListInput(proofPoints),
        tone,
        positioning,
      },
    });

    revalidatePath("/");
    redirect("/?lead=playbook-saved#playbook");
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?lead=db-unavailable#playbook");
  }
}

export async function createTraceSavedView(formData: FormData) {
  const parsed = traceSavedViewSchema.safeParse({
    name: formData.get("name"),
    search: formData.get("search"),
    agent: formData.get("agent"),
    status: formData.get("status"),
    pinned: formData.get("pinned"),
  });

  if (!parsed.success) {
    redirect("/?view=traces&run=invalid");
  }

  await saveTraceSavedView("demo", {
    name: parsed.data.name,
    search: parsed.data.search || "",
    agent: parsed.data.agent,
    status: parsed.data.status,
    pinned: parsed.data.pinned === "1",
  });

  revalidatePath("/");
  redirect("/?view=traces&run=view-saved");
}

export async function removeTraceSavedView(formData: FormData) {
  const viewId = formData.get("viewId");
  if (typeof viewId !== "string") {
    redirect("/?view=traces&run=invalid");
  }

  await deleteTraceSavedView("demo", viewId);
  revalidatePath("/");
  redirect("/?view=traces&run=view-removed");
}

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

export async function disconnectGoogleConnection() {
  if (!hasDatabaseUrl()) {
    redirect("/?view=setup&run=db-not-configured");
  }

  try {
    const prisma = getPrisma();
    const workspace = await prisma.workspace.findUnique({
      where: { slug: "demo" },
    });

    if (workspace) {
      await prisma.workspaceIntegrationConnection.deleteMany({
        where: {
          workspaceId: workspace.id,
          provider: "GOOGLE_GMAIL",
        },
      });
    }

    revalidatePath("/");
    redirect("/?view=setup&run=gmail-oauth-disconnected");
  } catch (error) {
    unstable_rethrow(error);
    redirect("/?view=setup&run=gmail-oauth-failed");
  }
}

// Helpers

function parseListInput(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

async function verifyDatabaseConnection(url: string) {
  const { Client } = await import("pg");
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query("SELECT 1");
  } finally {
    await client.end();
  }
}

async function writeLocalEnv(vars: Record<string, string | undefined>) {
  const envPath = path.join(process.cwd(), ".env.local");
  const current = await readLocalEnv(envPath);

  for (const [key, value] of Object.entries(vars)) {
    if (value && value.length > 0) {
      current[key] = value;
    } else {
      delete current[key];
    }
  }

  const lines = Object.entries(current).map(([k, v]) => `${k}="${v}"`);
  await writeFile(envPath, `${lines.join("\n")}\n`, "utf-8");
}

async function pushPrismaSchema(url: string) {
  await execFileAsync("npx", ["prisma", "db", "push"], {
    env: { ...process.env, DATABASE_URL: url },
  });
}

async function readLocalEnv(envPath: string) {
  try {
    const raw = await readFile(envPath, "utf-8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((acc, line) => {
        const [key, ...rest] = line.split("=");
        if (!key || rest.length === 0) {
          return acc;
        }

        acc[key] = rest.join("=").replace(/^"/, "").replace(/"$/, "");
        return acc;
      }, {});
  } catch {
    return {};
  }
}
