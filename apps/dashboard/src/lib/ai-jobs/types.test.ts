import test from "node:test";
import assert from "node:assert/strict";
import { JobKind, JobStatus } from "@leadforge/db";
import { getCompletedRunKey, getExecutionModeFromPayload, getQueuedRunKey, serializeAsyncJob } from "./types";

test("serializeAsyncJob uses latest event message and payload execution mode", () => {
  const snapshot = serializeAsyncJob({
    id: "job_123",
    leadId: "lead_123",
    kind: JobKind.RESEARCH,
    status: JobStatus.RUNNING,
    payload: { executionMode: "live" },
    result: { fitScore: 92 },
    errorMessage: null,
    attemptCount: 2,
    queuedAt: new Date("2026-04-30T10:00:00.000Z"),
    startedAt: new Date("2026-04-30T10:00:01.000Z"),
    completedAt: null,
    updatedAt: new Date("2026-04-30T10:00:05.000Z"),
    events: [
      {
        id: "evt_latest",
        status: JobStatus.RUNNING,
        message: "Research is running.",
        createdAt: new Date("2026-04-30T10:00:05.000Z"),
        meta: { step: "agent" },
      },
      {
        id: "evt_old",
        status: JobStatus.QUEUED,
        message: "Research queued.",
        createdAt: new Date("2026-04-30T10:00:00.000Z"),
        meta: {},
      },
    ],
  });

  assert.equal(snapshot.executionMode, "live");
  assert.equal(snapshot.message, "Research is running.");
  assert.equal(snapshot.attemptCount, 2);
  assert.equal(snapshot.events[0]?.id, "evt_latest");
});

test("job run keys stay aligned with public lead detail notices", () => {
  assert.equal(getQueuedRunKey(JobKind.WEBSITE_AUDIT), "audit-queued");
  assert.equal(getCompletedRunKey(JobKind.CLIENT_OPS), "client-ops");
});

test("payload execution mode falls back to degraded for unknown values", () => {
  assert.equal(getExecutionModeFromPayload({ executionMode: "bogus" }), "degraded");
  assert.equal(getExecutionModeFromPayload({}), "degraded");
});
