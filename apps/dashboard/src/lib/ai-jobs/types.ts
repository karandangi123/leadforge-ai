import { JobKind, JobStatus } from "@leadforge/db";
import type { RuntimeMode } from "../runtime-mode";

export const AI_JOB_QUEUE_NAME = "leadforge-ai-jobs";

export type AsyncJobSnapshot = {
  id: string;
  leadId: string | null;
  kind: JobKind;
  status: JobStatus;
  executionMode: RuntimeMode;
  errorMessage: string | null;
  message: string;
  attemptCount: number;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
  events: AsyncJobEventSnapshot[];
  result: Record<string, unknown>;
};

export type AsyncJobEventSnapshot = {
  id: string;
  status: JobStatus;
  message: string;
  createdAt: string;
  meta: Record<string, unknown>;
};

type AsyncJobRecordLike = {
  id: string;
  leadId: string | null;
  kind: JobKind;
  status: JobStatus;
  payload: unknown;
  result: unknown;
  errorMessage: string | null;
  attemptCount: number;
  queuedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
  events: Array<{
    id: string;
    status: JobStatus;
    message: string;
    createdAt: Date;
    meta: unknown;
  }>;
};

const jobLabels: Record<JobKind, string> = {
  RESEARCH: "Research",
  WEBSITE_AUDIT: "Website Audit",
  OUTREACH_DRAFT: "Outreach Draft",
  CLIENT_OPS: "Client Ops",
  WEBSITE_ROAST: "Website Roast",
  COMPETITOR_SPY: "Competitor Spy",
  GROWTH_MODE: "Growth Mode",
  FOUNDER_CONTENT: "Founder Content",
  PROPOSAL_GENERATOR: "Proposal Generator",
  SMS_SEND: "SMS Send",
  LINKEDIN_MESSAGE: "LinkedIn Message",
  DIALER_CALL: "Dialer Call",
  SEQUENCE_STEP: "Sequence Step",
  LEAD_ENRICHMENT: "Lead Enrichment",
};

const queuedRunKeys: Record<JobKind, string> = {
  RESEARCH: "research-queued",
  WEBSITE_AUDIT: "audit-queued",
  OUTREACH_DRAFT: "draft-queued",
  CLIENT_OPS: "client-ops-queued",
  WEBSITE_ROAST: "roast-queued",
  COMPETITOR_SPY: "competitor-queued",
  GROWTH_MODE: "growth-queued",
  FOUNDER_CONTENT: "content-queued",
  PROPOSAL_GENERATOR: "proposal-queued",
  SMS_SEND: "sms-queued",
  LINKEDIN_MESSAGE: "linkedin-queued",
  DIALER_CALL: "call-queued",
  SEQUENCE_STEP: "sequence-queued",
  LEAD_ENRICHMENT: "enrich-queued",
};

const completedRunKeys: Record<JobKind, string> = {
  RESEARCH: "research",
  WEBSITE_AUDIT: "audit",
  OUTREACH_DRAFT: "draft",
  CLIENT_OPS: "client-ops",
  WEBSITE_ROAST: "roast",
  COMPETITOR_SPY: "competitor",
  GROWTH_MODE: "growth",
  FOUNDER_CONTENT: "content",
  PROPOSAL_GENERATOR: "proposal",
  SMS_SEND: "sms-sent",
  LINKEDIN_MESSAGE: "linkedin-sent",
  DIALER_CALL: "call-completed",
  SEQUENCE_STEP: "sequence-step",
  LEAD_ENRICHMENT: "enriched",
};

export function getAsyncJobLabel(kind: JobKind) {
  return jobLabels[kind];
}

export function getQueuedRunKey(kind: JobKind) {
  return queuedRunKeys[kind];
}

export function getCompletedRunKey(kind: JobKind) {
  return completedRunKeys[kind];
}

export function serializeAsyncJob(job: AsyncJobRecordLike): AsyncJobSnapshot {
  const result = readRecord(job.result);
  const latestEvent = job.events[0];

  return {
    id: job.id,
    leadId: job.leadId,
    kind: job.kind,
    status: job.status,
    executionMode: getExecutionModeFromPayload(job.payload),
    errorMessage: job.errorMessage,
    message: latestEvent?.message ?? getDefaultStatusMessage(job.kind, job.status),
    attemptCount: job.attemptCount,
    queuedAt: job.queuedAt.toISOString(),
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    updatedAt: job.updatedAt.toISOString(),
    events: job.events.map((event) => ({
      id: event.id,
      status: event.status,
      message: event.message,
      createdAt: event.createdAt.toISOString(),
      meta: readRecord(event.meta),
    })),
    result,
  };
}

export function getExecutionModeFromPayload(payload: unknown): RuntimeMode {
  const executionMode = readRecord(payload).executionMode;

  if (executionMode === "live" || executionMode === "degraded" || executionMode === "demo") {
    return executionMode;
  }

  return "degraded";
}

export function getDefaultStatusMessage(kind: JobKind, status: JobStatus) {
  const label = getAsyncJobLabel(kind);

  if (status === JobStatus.QUEUED) {
    return `${label} job is queued.`;
  }

  if (status === JobStatus.RUNNING) {
    return `${label} job is running.`;
  }

  if (status === JobStatus.SUCCEEDED) {
    return `${label} job completed successfully.`;
  }

  if (status === JobStatus.CANCELLED) {
    return `${label} job was cancelled.`;
  }

  return `${label} job failed.`;
}

export function readRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

export function isTerminalJobStatus(status: JobStatus) {
  return status === JobStatus.SUCCEEDED || status === JobStatus.FAILED || status === JobStatus.CANCELLED;
}
