import { SocialPulseAgent } from "../../../agents/src/reasoning/social-pulse";
import { CompetitorSpyAgent } from "../../../agents/src/reasoning/competitor-spy";

/**
 * The Sentiment (The "Pulse")
 * Real-time Social/News tracking and Competitor Spying.
 */
export class Pulse {
  static async trackSocial(url: string, html: string) {
    return SocialPulseAgent.analyzeSocialInteractions(url, html);
  }

  static async spyCompetitors(url: string, html: string) {
    return CompetitorSpyAgent.scanForCompetitors(url, html);
  }
}
