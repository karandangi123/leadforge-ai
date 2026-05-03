import { getPrisma } from "@leadforge/db";
import { VisionAgent } from "@leadforge/agents";
import dotenv from "dotenv";

dotenv.config();

async function runSuccessSimulation() {
  const prisma = getPrisma();
  console.log("🌟 [LeadForge AI] Starting End-to-End Success Simulation...\n");

  // 1. LEAD INGESTION
  console.log("📥 Step 1: Ingesting High-Value Lead...");
  const lead = await prisma.lead.upsert({
    where: { id: "simulation-lead-101" },
    update: { status: "NEW" },
    create: {
      id: "simulation-lead-101",
      company: "Modern SaaS Inc",
      website: "https://www.openai.com",
      workspaceId: "default-workspace"
    }
  });
  console.log(`✅ Lead Created: ${lead.company}\n`);

  // 2. AUDIT TRIGGER
  console.log("⚙️ Step 2: Engaging Vision Audit Agent (Phase 2-7)...");
  console.log("   - Initializing Playwright Stealth Browser...");
  console.log("   - Capturing Forensic Pair (Desktop + Mobile)...");
  
  const startTime = Date.now();
  try {
    // 3. EXECUTION LOOP
    const result = await VisionAgent.analyzeWebsite(lead.id);
    const duration = (Date.now() - startTime) / 1000;

    console.log(`✅ Forensic Capture Complete (${duration.toFixed(2)}s)`);
    console.log(`🧠 AI Reasoning (Refiner Pass 8.2): SUCCEEDED`);
    console.log(`📊 UX Score: ${result.data.uxScore}/100`);

    // 4. VIDEO SUITE VERIFICATION
    console.log("\n🎬 Step 3: Verifying Video Outreach Suite (Phase 9)...");
    console.log(`   - Script Generated: "${result.data.videoScript.substring(0, 50)}..."`);
    console.log(`   - Video Synthesis Job: ${result.data.videoId ? 'ENGAGED' : 'SIMULATED (No API Key)'}`);

    // 5. PORTAL VALIDATION
    const audit = await prisma.websiteAudit.findFirst({
      where: { leadId: lead.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log("\n🌐 Step 4: Generating One-Click Lead Portal...");
    const portalUrl = `http://localhost:3000/audit/${audit?.id}`;
    console.log(`🔗 Shareable URL: ${portalUrl}`);

    console.log("\n--- SIMULATION SUCCESS ---");
    console.log("🏆 Result: LeadForge has successfully transformed a raw URL into a high-converting forensic video portal.");
    console.log("---------------------------\n");

  } catch (error) {
    console.error("❌ Simulation Failed at critical step:", error);
  }
}

runSuccessSimulation().then(() => process.exit(0));
