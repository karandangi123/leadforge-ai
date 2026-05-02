import { getPrisma } from "@leadforge/db";

export async function processOutcomeLearning(leadId: string, eventType: string) {
  const prisma = getPrisma();
  
  // 1. Fetch full lead context
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      researchRuns: { orderBy: { createdAt: "desc" }, take: 1 },
      websiteAudits: { orderBy: { createdAt: "desc" }, take: 1 },
      outreachDrafts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!lead) return;

  const playbook = await prisma.workspacePlaybook.findUnique({
    where: { workspaceId: lead.workspaceId },
  });

  if (!playbook) return;

  // 2. Extract signals based on outcome
  const isPositive = ["REPLIED", "MEETING_BOOKED", "WON"].includes(eventType);
  const isNegative = ["LOST", "REJECTED"].includes(eventType);

  if (!isPositive && !isNegative) return;

  const newPains = new Set(playbook.pains as string[]);
  const newProofPoints = new Set(playbook.proofPoints as string[]);

  if (isPositive) {
    // Add segment to industries if not present
    if (lead.segment && ! (playbook.industries as string[]).includes(lead.segment)) {
      const updatedIndustries = [...(playbook.industries as string[]), lead.segment].slice(0, 15);
      await prisma.workspacePlaybook.update({
        where: { id: playbook.id },
        data: { industries: updatedIndustries },
      });
    }

    // Extract pain from research if successful
    const research = lead.researchRuns[0];
    if (research && research.signals) {
      const signals = research.signals as { pains?: unknown } | null;
      if (Array.isArray(signals?.pains)) {
        signals.pains
          .filter((pain): pain is string => typeof pain === "string")
          .forEach((pain) => newPains.add(pain));
      }
    }
  }

  // 3. Update Playbook with refined context
  await prisma.workspacePlaybook.update({
    where: { id: playbook.id },
    data: {
      pains: Array.from(newPains).slice(0, 15),
      proofPoints: Array.from(newProofPoints).slice(0, 15),
      positioning: isPositive 
        ? `${playbook.positioning || ""}\n[Learning] High resonance with ${lead.segment} companies using ${lead.company}'s profile.`
        : playbook.positioning,
    },
  });

  // 4. Record the learning trace
  await prisma.agentTrace.create({
    data: {
      leadId,
      agentName: "Learning Loop",
      status: "SUCCEEDED",
      input: { leadId, eventType, leadCompany: lead.company },
      output: { 
        message: isPositive ? "Refined playbook with positive resonance signals." : "Recorded disqualification signal.",
        updatedFields: isPositive ? ["pains", "industries", "positioning"] : [],
      },
    },
  });
}
