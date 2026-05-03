import { getPrisma, LeadStatus } from "@leadforge/db";
import { WebCrawler } from "../../../crawler/src/index";
import { AgentResult } from "../ai-agents";

export type RepairResult = {
  status: "REPAIRED" | "PIVOTED" | "FAILED";
  oldData: { company: string; email: string };
  newData?: { company: string; email: string; reason: string };
  suggestedChannel: "EMAIL" | "LINKEDIN" | "SMS";
};

export class SelfHealingAgent {
  static async repairLead(leadId: string): Promise<AgentResult<RepairResult>> {
    const prisma = getPrisma();
    const startedAt = Date.now();

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { enrichmentProfile: true }
    });

    if (!lead) throw new Error("Lead not found");

    const oldData = {
      company: lead.company,
      email: lead.contactEmail ?? "none"
    };

    // ── PHASE 1: CAREER PIVOT CHECK ──────────────────────────────────────────
    // We check if the person has moved companies
    let pivoted = false;
    let newData: RepairResult["newData"];

    if (lead.linkedinUrl) {
      try {
        const crawlResult = await WebCrawler.crawl(lead.linkedinUrl);
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (apiKey) {
          const evalRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "You are a Career Tracking Agent. Compare the provided lead data with the current LinkedIn content. Detect if the person has changed jobs." },
                { role: "user", content: `Stored Company: ${lead.company}\nLinkedIn Content: ${crawlResult.content}` }
              ],
              response_format: { type: "json_object" },
            })
          });

          if (evalRes.ok) {
            const result = await evalRes.json() as any;
            const evalData = JSON.parse(result.choices[0].message.content);
            
            if (evalData.hasMoved && evalData.newCompany) {
              pivoted = true;
              newData = {
                company: evalData.newCompany,
                email: `${lead.contactName?.split(' ')[0].toLowerCase()}.${lead.contactName?.split(' ')[1].toLowerCase()}@${evalData.newCompany.toLowerCase().replace(/\s/g, '')}.com`,
                reason: `Detected move to ${evalData.newCompany} via LinkedIn audit.`
              };

              // Update the lead in the background
              await prisma.lead.update({
                where: { id: leadId },
                data: {
                  company: evalData.newCompany,
                  contactEmail: newData.email,
                  status: LeadStatus.RESEARCH, // Send back to research for the new company
                }
              });

              await prisma.agentTrace.create({
                data: {
                  leadId,
                  agentName: "Self-Healing Agent",
                  status: "SUCCEEDED",
                  input: { oldData, action: "career_pivot" },
                  output: { message: `Lead pivoted to new company: ${evalData.newCompany}`, newData }
                }
              });
            }
          }
        }
      } catch (e) {
        console.error("[Self-Healing] LinkedIn check failed", e);
      }
    }

    // ── PHASE 2: CHANNEL FALLBACK ─────────────────────────────────────────────
    // If no pivot found but email is invalid, suggest LinkedIn
    const suggestedChannel = (lead.linkedinUrl && !lead.contactEmail) ? "LINKEDIN" : "EMAIL";

    return {
      data: {
        status: pivoted ? "PIVOTED" : "FAILED",
        oldData,
        newData,
        suggestedChannel
      },
      mode: "openai",
      model: "gpt-4o-repair",
      latencyMs: Date.now() - startedAt,
      tokenCount: 0
    };
  }
}
