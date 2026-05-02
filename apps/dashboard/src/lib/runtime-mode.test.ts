import test from "node:test";
import assert from "node:assert/strict";
import { getAiRuntimeMode, getRuntimeModeLabel, hasRedisUrl } from "./runtime-mode";

test("runtime mode resolves demo, degraded, and live from env state", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalRedisUrl = process.env.REDIS_URL;

  delete process.env.DATABASE_URL;
  delete process.env.REDIS_URL;
  assert.equal(getAiRuntimeMode(), "demo");

  process.env.DATABASE_URL = "postgres://localhost/leadforge";
  delete process.env.REDIS_URL;
  assert.equal(getAiRuntimeMode(), "degraded");
  assert.equal(hasRedisUrl(), false);

  process.env.REDIS_URL = "redis://localhost:6379";
  assert.equal(getAiRuntimeMode(), "live");
  assert.equal(getRuntimeModeLabel("live"), "Live queue");

  if (originalDatabaseUrl) {
    process.env.DATABASE_URL = originalDatabaseUrl;
  } else {
    delete process.env.DATABASE_URL;
  }

  if (originalRedisUrl) {
    process.env.REDIS_URL = originalRedisUrl;
  } else {
    delete process.env.REDIS_URL;
  }
});
