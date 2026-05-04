import { AuditOrchestrator } from "../reasoning/audit-orchestrator";
import { getPrisma } from "@leadforge/db";

/**
 * LeadForge Stress Test Runner
 * Validates system resilience under high concurrent load.
 */
async function runStressTest() {
  const prisma = getPrisma();
  
  const testLeads = [
    { company: "Vercel", website: "https://vercel.com", type: "SaaS" },
    { company: "Shopify", website: "https://shopify.com", type: "E-com" },
    { company: "Linear", website: "https://linear.app", type: "SaaS" },
    { company: "Stripe", website: "https://stripe.com", type: "Fintech" },
    { company: "Framer", website: "https://framer.com", type: "Agency/Tool" }
  ];

  console.log(`[StressTest] Starting concurrent audit of ${testLeads.length} elite architectures...`);
  const startTime = Date.now();

  const results = await Promise.allSettled(
    testLeads.map(async (leadData) => {
      // 1. Create temporary lead
      const lead = await prisma.lead.create({
        data: {
          company: leadData.company,
          website: leadData.website,
          status: "QUEUED",
          workspaceId: "stress-test-workspace" // Assuming a fixed ID for testing
        }
      });

      console.log(`[StressTest] Launching forensic audit for ${leadData.company} (${leadData.website})...`);
      
      // 2. Trigger Orchestrator
      return await AuditOrchestrator.runFullAudit(lead.id);
    })
  );

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n[StressTest] Completed in ${duration.toFixed(2)}s`);

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`[StressTest] Results: ${successful} Successes, ${failed} Failures`);

  if (failed > 0) {
    console.error("[StressTest] Warning: Partial failures detected. Review orchestrator logs.");
  }

  process.exit(0);
}

runStressTest().catch(err => {
  console.error("[StressTest] Critical Failure:", err);
  process.exit(1);
});
