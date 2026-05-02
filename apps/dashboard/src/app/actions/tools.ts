"use server";

import { z } from "zod";
import { getPrisma, hasDatabaseUrl, JobKind, JobStatus } from "@leadforge/db";
import { 
  roastWebsite, 
  spyCompetitor, 
  runGrowthMode, 
  generateFounderContent, 
  generateProposal,
  type WebsiteRoastOutput,
  type CompetitorSpyOutput,
  type GrowthModeOutput,
  type FounderContentOutput,
  type ProposalGeneratorOutput,
  type AgentResult
} from "@leadforge/agents";
import { executeAsyncJobById } from "@/lib/ai-jobs/executor";
import { enqueueAsyncJob } from "@/lib/ai-jobs/queue";
import { getAiRuntimeMode, hasRedisUrl } from "@/lib/runtime-mode";
import { getActiveWorkspace } from "@/lib/workspace";

export type WebsiteRoastState = {
  message: string;
  jobId: string | null;
  result: (WebsiteRoastOutput & Pick<AgentResult<any>, "mode" | "model">) | null;
};

export type CompetitorSpyState = {
  message: string;
  jobId: string | null;
  result: (CompetitorSpyOutput & Pick<AgentResult<any>, "mode" | "model">) | null;
};

export type GrowthModeState = {
  message: string;
  jobId: string | null;
  result: (GrowthModeOutput & Pick<AgentResult<any>, "mode" | "model">) | null;
};

export type FounderContentState = {
  message: string;
  jobId: string | null;
  result: (FounderContentOutput & Pick<AgentResult<any>, "mode" | "model">) | null;
};

export type ProposalGeneratorState = {
  message: string;
  jobId: string | null;
  result: (ProposalGeneratorOutput & Pick<AgentResult<any>, "mode" | "model">) | null;
};

const websiteRoastSchema = z.object({
  url: z.string().trim().url(),
  notes: z.string().trim().max(1000).optional(),
  persona: z.enum(["founder", "cfo", "dev", "marketing"]).optional(),
});

const competitorSpySchema = z.object({
  url: z.string().trim().url(),
  notes: z.string().trim().max(1000).optional(),
});

const growthModeSchema = z.object({
  prompt: z.string().trim().min(8).max(1200),
  context: z.string().trim().max(1200).optional(),
});

const founderContentSchema = z.object({
  business: z.string().trim().min(3).max(300),
  audience: z.string().trim().min(3).max(240),
  offer: z.string().trim().min(3).max(320),
  contentGoal: z.string().trim().min(8).max(600),
});

const proposalSchema = z.object({
  clientName: z.string().trim().min(2).max(160),
  clientType: z.string().trim().min(2).max(200),
  projectType: z.string().trim().min(2).max(200),
  serviceLine: z.string().trim().min(2).max(80),
  niche: z.string().trim().min(2).max(120),
  desiredOutcome: z.string().trim().min(8).max(600),
});

export async function runWebsiteRoast(_prevState: WebsiteRoastState, formData: FormData) {
  const parsed = websiteRoastSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { message: "Invalid URL or notes.", jobId: null, result: null };
  return runWorkspaceToolJob({
    kind: JobKind.WEBSITE_ROAST,
    surface: "roast_lab",
    input: parsed.data,
    fallbackMessage: "Roast complete.",
    queuedMessage: "Roast queued. Live updates will appear here as the job runs.",
    inline: async () => {
      const result = await roastWebsite({ 
        url: parsed.data.url, 
        notes: parsed.data.notes, 
        persona: parsed.data.persona 
      });
      return { ...result.data, mode: result.mode, model: result.model };
    },
  });
}

export async function runCompetitorSpy(_prevState: CompetitorSpyState, formData: FormData) {
  const parsed = competitorSpySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { message: "Invalid URL or notes.", jobId: null, result: null };
  return runWorkspaceToolJob({
    kind: JobKind.COMPETITOR_SPY,
    surface: "competitor_spy",
    input: parsed.data,
    fallbackMessage: "Competitor brief complete.",
    queuedMessage: "Competitor brief queued. Live updates will appear here as the job runs.",
    inline: async () => {
      const result = await spyCompetitor({ url: parsed.data.url, notes: parsed.data.notes });
      return { ...result.data, mode: result.mode, model: result.model };
    },
  });
}

export async function executeGrowthMode(_prevState: GrowthModeState, formData: FormData) {
  const parsed = growthModeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { message: "Invalid prompt or context.", jobId: null, result: null };
  return runWorkspaceToolJob({
    kind: JobKind.GROWTH_MODE,
    surface: "growth_mode",
    input: parsed.data,
    fallbackMessage: "Growth brief ready.",
    queuedMessage: "Growth brief queued. Live updates will appear here as the job runs.",
    inline: async () => {
      const result = await runGrowthMode({ prompt: parsed.data.prompt, context: parsed.data.context });
      return { ...result.data, mode: result.mode, model: result.model };
    },
  });
}

export async function runFounderContentEngine(_prevState: FounderContentState, formData: FormData) {
  const parsed = founderContentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { message: "Invalid content parameters.", jobId: null, result: null };
  return runWorkspaceToolJob({
    kind: JobKind.FOUNDER_CONTENT,
    surface: "founder_content",
    input: parsed.data,
    fallbackMessage: "Content strategy ready.",
    queuedMessage: "Content strategy queued. Live updates will appear here as the job runs.",
    inline: async () => {
      const result = await generateFounderContent(parsed.data);
      return { ...result.data, mode: result.mode, model: result.model };
    },
  });
}

export async function runProposalGenerator(_prevState: ProposalGeneratorState, formData: FormData) {
  const parsed = proposalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { message: "Invalid proposal parameters.", jobId: null, result: null };
  return runWorkspaceToolJob({
    kind: JobKind.PROPOSAL_GENERATOR,
    surface: "proposal_generator",
    input: parsed.data,
    fallbackMessage: "Proposal ready.",
    queuedMessage: "Proposal queued. Live updates will appear here as the job runs.",
    inline: async () => {
      const result = await generateProposal(parsed.data);
      return { ...result.data, mode: result.mode, model: result.model };
    },
  });
}

async function runWorkspaceToolJob<TInput extends Record<string, unknown>, TResult>({
  kind,
  surface,
  input,
  fallbackMessage,
  queuedMessage,
  inline,
}: {
  kind: JobKind;
  surface: string;
  input: TInput;
  fallbackMessage: string;
  queuedMessage: string;
  inline: () => Promise<TResult>;
}) {
  if (!hasDatabaseUrl()) {
    return {
      message: fallbackMessage,
      jobId: null,
      result: await inline(),
    };
  }

  const prisma = getPrisma();
  const workspace = await getActiveWorkspace();
  const executionMode = getAiRuntimeMode();
  const job = await prisma.asyncJob.create({
    data: {
      workspaceId: workspace.id,
      kind,
      status: JobStatus.QUEUED,
      payload: ({
        executionMode,
        surface,
        ...input,
      } as any),
      events: {
        create: {
          status: JobStatus.QUEUED,
          message:
            executionMode === "live"
              ? `${surface.replaceAll("_", " ")} queued for background execution.`
              : `Queue unavailable. Running ${surface.replaceAll("_", " ")} inline in degraded mode.`,
          meta: {
            executionMode,
            surface,
          },
        },
      },
    },
  });

  if (hasRedisUrl()) {
    await enqueueAsyncJob(job.id);
    return {
      message: queuedMessage,
      jobId: job.id,
      result: null,
    };
  }

  const completed = await executeAsyncJobById(job.id);
  return {
    message: fallbackMessage,
    jobId: completed.id,
    result: completed.result as TResult,
  };
}
