import { getPrisma } from "@leadforge/db";
import { AgentResult } from "../ai-agents";

export type SocialIntentSignal = {
  personName: string;
  companyName?: string;
  interactionType: "COMMENT" | "LIKE" | "SHARE";
  content: string; // The text of the comment
  intentScore: number; // 0-100
  intentCategory: "SWITCH_INTEREST" | "PRICING_INQUIRY" | "PAIN_ADMISSION" | "GENERAL_INTEREST";
  suggestedHook: string;
};

export type SocialPulseResult = {
  signals: SocialIntentSignal[];
  summary: string;
  isRecentActivity: boolean; // Flag if activity < 7 days ago
  suggestedScoreBoost: number; // e.g. 20
};

export class SocialPulseAgent {
  static async analyzeSocialInteractions(postUrl: string, rawHtml: string): Promise<AgentResult<SocialPulseResult>> {
    const startedAt = Date.now();
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    // 1. LLM-based Social Extraction
    const systemPrompt = `You are a Social Intent Intelligence Agent.
Analyze the provided data.
Check the DATE of the most recent interaction. If it is within the last 7 days from today (2026-05-03), set isRecentActivity to true and suggestedScoreBoost to 20.
Otherwise, set them to false and 0.

Return a JSON object matching the SocialPulseResult type.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use high-fidelity for complex social context
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Post URL: ${postUrl}\nRaw Data: ${rawHtml.substring(0, 20000)}` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
    });

    if (!response.ok) throw new Error(`Social analysis failed: ${response.status}`);
    
    const result = await response.json() as any;
    const pulseData = JSON.parse(result.choices[0].message.content) as SocialPulseResult;

    return {
      data: pulseData,
      mode: "openai",
      model: "gpt-4o-pulse",
      latencyMs: Date.now() - startedAt,
      tokenCount: result.usage?.total_tokens ?? 0
    };
  }
}
