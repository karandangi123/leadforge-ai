import { getPrisma } from "@leadforge/db";

export type CopyFinding = {
  title: string;
  observedText: string;
  issue: string;
  businessImpact: string;
  fixSuggestion: string;
  outreachHook: string;
};

export class CopyAgent {
  static async analyze(url: string, content: string): Promise<CopyFinding[]> {
    // In production, this would use an LLM to "roast" the copy.
    
    // Example Finding (Deterministic for Demo)
    return [
      {
        title: "Generic Hero Positioning",
        observedText: "Empowering teams for the future",
        issue: "The hero section uses 'Power words' but doesn't explain the specific business outcome or who it's for.",
        businessImpact: "Visitors may not understand the product value in the first 5 seconds, leading to immediate drop-offs.",
        fixSuggestion: "Rewrite hero around specific ICP + outcome + social proof.",
        outreachHook: "Your site looks polished, but the hero section doesn't clearly say who you help or what result you create in the first 5 seconds."
      }
    ];
  }
}
