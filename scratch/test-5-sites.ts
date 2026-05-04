import { getPrisma } from "../packages/db/src/index";
import { runVisionAudit, fastAudit } from "../apps/dashboard/src/app/actions/vision-audit";

async function testFiveSites() {
  const sites = [
    "https://stripe.com",
    "https://airbnb.com",
    "https://salesforce.com",
    "https://slack.com",
    "https://notion.so"
  ];

  console.log("🚀 Starting 5-Site Forensic Audit Test...");

  for (const url of sites) {
    console.log(`\n🔍 Ingesting: ${url}`);
    try {
      const ingestRes = await fastAudit(url);
      if (ingestRes.success && ingestRes.trackingId) {
        console.log(`✅ Ingested. Lead ID: ${ingestRes.trackingId}`);
        console.log(`⚡ Launching Vision Audit...`);
        const auditRes = await runVisionAudit(ingestRes.trackingId);
        console.log(`📡 Audit Enqueued. Tracking ID: ${auditRes.trackingId}`);
      } else {
        console.error(`❌ Ingest failed for ${url}:`, ingestRes.error);
      }
    } catch (e) {
      console.error(`💥 Error testing ${url}:`, e);
    }
  }

  console.log("\n🏁 All 5 tests enqueued. Results will appear in the War Room as workers process them.");
}

testFiveSites().catch(console.error);
