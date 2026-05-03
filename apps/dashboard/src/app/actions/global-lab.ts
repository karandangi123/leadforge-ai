"use server";

import { GlobalSignalAgent } from "@leadforge/agents";

/**
 * Server Action: Run a Global Signal Lab analysis for a specific industry
 */
export async function analyzeGlobalIndustry(industry: string) {
  try {
    const report = await GlobalSignalAgent.analyzeMarketSegment(industry);
    return { 
      success: true, 
      report: report.data 
    };
  } catch (error) {
    console.error("[GlobalSignalLab] Failed to analyze industry", error);
    return { success: false, error: "Failed to analyze industry" };
  }
}
