"use server";

import { GlobalSignalAgent } from "@leadforge/agents";
import { z } from "zod";

/**
 * Server Action: Run a Global Signal Lab analysis for a specific industry
 */
export async function analyzeGlobalIndustry(rawIndustry: string) {
  const industry = z.string().min(2).max(100).parse(rawIndustry);
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
