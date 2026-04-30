export type RuntimeMode = "live" | "degraded" | "demo";

export function hasRedisUrl() {
  return Boolean(process.env.REDIS_URL);
}

export function getAiRuntimeMode(): RuntimeMode {
  if (!process.env.DATABASE_URL) {
    return "demo";
  }

  return hasRedisUrl() ? "live" : "degraded";
}

export function getRuntimeModeLabel(mode: RuntimeMode) {
  if (mode === "live") {
    return "Live queue";
  }

  if (mode === "degraded") {
    return "Inline degraded";
  }

  return "Demo mode";
}
