/**
 * HeyGen AI Video Synthesis Integration (Phase 9.2)
 */
export class HeyGenAdapter {
  private static API_BASE = "https://api.heygen.com/v2";

  /**
   * Starts a video generation job from a script
   */
  static async generateAuditVideo(script: string, avatarId: string = "josh_video_outreach_20230510"): Promise<string | null> {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      console.warn("[HeyGenAdapter] No API Key found, skipping video synthesis.");
      return null;
    }

    try {
      const response = await fetch(`${this.API_BASE}/video/generate`, {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: "avatar",
                avatar_id: avatarId,
                avatar_style: "normal"
              },
              voice: {
                type: "text",
                input_text: script,
                voice_id: "2d5b0ad6daed4693b7319d0337775988" // Friendly professional voice
              }
            }
          ],
          dimension: {
            width: 1280,
            height: 720
          }
        })
      });

      const data = await response.json() as any;
      if (data.error) throw new Error(data.error.message);

      return data.data.video_id; // Returns the Job ID for tracking
    } catch (error) {
      console.error("[HeyGenAdapter] Generation failed:", error);
      return null;
    }
  }

  /**
   * Polls for video status (or can be used in a webhook)
   */
  static async checkVideoStatus(videoId: string): Promise<{ status: string, url?: string }> {
    const apiKey = process.env.HEYGEN_API_KEY;
    try {
      const response = await fetch(`${this.API_BASE}/video/get_video_info?video_id=${videoId}`, {
        headers: { "X-Api-Key": apiKey || "" }
      });
      const data = await response.json() as any;
      return {
        status: data.data.status, // "completed", "processing", "failed"
        url: data.data.video_url
      };
    } catch (error) {
      return { status: "failed" };
    }
  }
}
