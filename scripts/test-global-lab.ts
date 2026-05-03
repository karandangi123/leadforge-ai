import { GlobalSignalAgent } from "../packages/agents/src/reasoning/global-signal-lab";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  console.log("🚀 Starting Global Signal Lab Analysis: SaaS - HR Tech...");
  
  try {
    const report = await GlobalSignalAgent.analyzeMarketSegment("SaaS");
    
    console.log("\n📊 GLOBAL SIGNAL REPORT");
    console.log("==========================");
    console.log(`Total Leads Audited: ${report.data.totalAudited}`);
    console.log(`Dominant Strategy: ${report.data.dominantStrategy}`);
    
    console.log("\n🔍 MARKET GAPS IDENTIFIED:");
    report.data.gaps.forEach((gap, i) => {
      console.log(`${i+1}. ${gap.signalName} (${gap.prevalence}% prevalence)`);
      console.log(`   Impact: ${gap.impact}`);
      console.log(`   Detail: ${gap.description}\n`);
    });

  } catch (error) {
    console.error("❌ Analysis failed:", error);
  }
}

main();
