import { getPrisma } from "@leadforge/db";
import { AgentResult } from "../ai-agents";

export type CloneContent = {
  script: string;
  mediaUrl: string; // URL to the generated voice/video file
  thumbnailUrl?: string;
  provider: "ELEVEN_LABS" | "HEYGEN" | "TAVUS";
};

export class CloneAgent {
  /**
   * Generates a Personalized AI Video Clone script and metadata
   */
  static async generateVideoClone(leadId: string, silverBullet: string): Promise<AgentResult<CloneContent>> {
    const startedAt = Date.now();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    // 1. Generate the script optimized for video (short, punchy, mentions the specific signal)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a Video Scriptwriter for Elite Sales Outreach. Create a 15-second script for an AI Video Avatar. The script MUST mention the lead's company and the 'Silver Bullet' insight. It should sound 100% human and conversational." 
          },
          { 
            role: "user", 
            content: `Signal: ${silverBullet}. Write a script that sounds like a casual Loom but is actually an AI clone.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    const result = await response.json() as any;
    const script = result.choices[0].message.content;

    // 2. Mocking the API call to HeyGen/Tavus (In a real app, you'd trigger their webhook)
    // We'll return a placeholder that the UI will recognize as "Generating..."
    const mediaUrl = `https://api.heygen.com/v1/video/placeholder_${crypto.randomUUID()}`;

    return {
      data: {
        script,
        mediaUrl,
        provider: "HEYGEN",
        thumbnailUrl: "https://static.heygen.com/avatars/placeholder.png"
      },
      mode: "openai",
      model: "gpt-4o-creative",
      latencyMs: Date.now() - startedAt,
      tokenCount: result.usage?.total_tokens ?? 0
    };
  }

  /**
   * Generates a Personalized AI Voice Note
   */
  static async generateVoiceNote(leadId: string, text: string): Promise<AgentResult<CloneContent>> {
    const startedAt = Date.now();
    // Simulate ElevenLabs call
    const mediaUrl = `https://api.elevenlabs.io/v1/text-to-speech/voice_id/output.mp3`;

    return {
      data: {
        script: text,
        mediaUrl,
        provider: "ELEVEN_LABS"
      },
      mode: "local",
      model: "eleven-labs-clone",
      latencyMs: Date.now() - startedAt,
      tokenCount: 0
    };
  }
}
