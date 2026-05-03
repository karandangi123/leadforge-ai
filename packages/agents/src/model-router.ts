import { PromptKind } from "@leadforge/db";

export type ModelConfig = {
  provider: "openai" | "anthropic" | "groq" | "local";
  modelId: string;
  maxTokens?: number;
  temperature?: number;
};

export const MODEL_REGISTRY: Record<PromptKind, ModelConfig> = {
  [PromptKind.RESEARCH]: {
    provider: "groq",
    modelId: "llama-3.1-70b-versatile",
    temperature: 0.2,
  },
  [PromptKind.WEBSITE_AUDIT]: {
    provider: "groq",
    modelId: "llama-3.1-8b-instant",
    temperature: 0.1,
  },
  [PromptKind.OUTREACH]: {
    provider: "groq",
    modelId: "llama-3.1-70b-versatile",
    temperature: 0.7,
  },
  [PromptKind.REVIEWER]: {
    provider: "groq",
    modelId: "llama-3.1-8b-instant",
    temperature: 0.3,
  },
  [PromptKind.FOLLOW_UP]: {
    provider: "groq",
    modelId: "llama-3.1-8b-instant",
    temperature: 0.5,
  },
  [PromptKind.EVAL]: {
    provider: "groq",
    modelId: "llama-3.1-70b-versatile",
    temperature: 0,
  },
  [PromptKind.SIGNAL_DISCOVERY]: {
    provider: "openai",
    modelId: "gpt-4o",
    temperature: 0.2,
  },
};

export class ModelRouter {
  static getModelForKind(kind: PromptKind): ModelConfig {
    return MODEL_REGISTRY[kind] || {
      provider: "openai",
      modelId: "gpt-4o-mini",
    };
  }

  static calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    // Pricing in cents per 1M tokens (approximate)
    const pricing: Record<string, { input: number; output: number }> = {
      "gpt-4o": { input: 500, output: 1500 },
      "gpt-4o-mini": { input: 15, output: 60 },
      "llama-3.3-70b-versatile": { input: 0, output: 0 }, // Free on Groq tier
      "llama-3.1-8b-instant": { input: 0, output: 0 }, // Free on Groq tier
    };

    const rates = pricing[modelId] || pricing["gpt-4o-mini"];
    const inputCost = (inputTokens / 1_000_000) * rates.input;
    const outputCost = (outputTokens / 1_000_000) * rates.output;

    return Math.ceil((inputCost + outputCost) * 100); // return in micro-cents or similar for precision? Bible says costCents.
  }
}
