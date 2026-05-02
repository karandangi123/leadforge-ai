import { PrismaPg } from "@prisma/adapter-pg";

import { ApprovalStatus, DraftChannel, JobKind, JobStatus, LeadStatus, PromptKind, AgentRunStatus, PrismaClient } from "./generated/prisma";



export { ApprovalStatus, DraftChannel, JobKind, JobStatus, LeadStatus, PromptKind, AgentRunStatus, PrismaClient };

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }

  return globalForPrisma.prisma;
}

export async function resetPrisma() {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }
}
