import { VisionAgent } from "../../../agents/src/reasoning/vision-agent";

/**
 * The Browsing (The "Eyes")
 * Playwright + LLM Vision agents to audit visual properties.
 */
export class Eyes {
  static async audit(url: string) {
    return VisionAgent.analyzeWebsite(url);
  }
}
