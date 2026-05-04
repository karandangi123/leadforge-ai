import { AuditOrchestrator } from "../src/reasoning/audit-orchestrator";
import { getPrisma } from "@leadforge/db";

async function runStressTest(concurrency: number = 50) {
  const prisma = getPrisma();
  console.log(`🚀 Starting Production Stress Test: ${concurrency} Concurrent Audits`);
  
  const startTime = Date.now();
  
  // 1. Create 50 Mock Leads
  const leads = [];
  for (let i = 0; i < concurrency; i++) {
    const lead = await prisma.lead.create({
      data: {
        company: `StressTest_${i}`,
        website: `https://example-${i}.com`,
        status: "NEW",
        workspaceId: "prod-stress-workspace", // Ensure this exists or mock it
      }
    });
    leads.push(lead);
  }

  console.log(`✅ ${concurrency} Leads Provisioned. Engaging Forensic Engines...`);

  // 2. Trigger Concurrent Audits
  const results = await Promise.allSettled(
    leads.map(lead => AuditOrchestrator.runFullAudit(lead.id))
  );

  const duration = (Date.now() - startTime) / 1000;
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log("\n" + "=".repeat(50));
  console.log("📊 STRESS TEST RESULTS");
  console.log("=".repeat(50));
  console.log(`Total Audits:    ${concurrency}`);
  console.log(`Succeeded:       ${succeeded}`);
  console.log(`Failed:          ${failed}`);
  console.log(`Total Duration:  ${duration.toFixed(2)}s`);
  console.log(`Avg Latency:     ${(duration / concurrency).toFixed(2)}s/audit`);
  console.log(`Throughput:      ${(concurrency / (duration / 60)).toFixed(2)} audits/min`);
  console.log("=".repeat(50));

  if (failed > 0) {
    console.error("❌ Stress test failed with errors. Check logs for infrastructure bottlenecks.");
    const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
    console.error("First Error Sample:", firstError.reason);
    process.exit(1);
  } else {
    console.log("💎 Production stability confirmed. System is resilient under high-concurrency forensic load.");
    process.exit(0);
  }
}

// Ensure the workspace exists
async function ensureWorkspace() {
  const prisma = getPrisma();
  await prisma.workspace.upsert({
    where: { id: "prod-stress-workspace" },
    update: {},
    create: {
      id: "prod-stress-workspace",
      name: "Production Stress Test Workspace",
      slug: "prod-stress-test",
    }
  });
}

ensureWorkspace().then(() => runStressTest(50));
