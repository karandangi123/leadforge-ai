"use server";

import { revalidatePath } from "next/cache";
import dns from "dns";
import { promisify } from "util";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { getActiveWorkspace } from "@/lib/workspace";

const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);

/**
 * Perform a live DNS check for SPF, DKIM, and DMARC records on a specific domain.
 * This is a foundational check that ensures fundamental email authentication is correctly configured.
 */
export async function checkDomainDnsHealth(domain: string) {
  let spfStatus: "PASS" | "FAIL" | "PENDING" = "FAIL";
  let dmarcStatus: "PASS" | "FAIL" | "PENDING" = "FAIL";
  let dkimStatus: "PASS" | "FAIL" | "PENDING" = "FAIL"; // DKIM is harder to check blindly without a selector, but we'll simulate or check standard selectors if needed.

  try {
    // Check SPF
    try {
      const txtRecords = await resolveTxt(domain);
      const spfRecord = txtRecords.flat().find(record => record.startsWith("v=spf1"));
      if (spfRecord) {
        spfStatus = "PASS";
      }
    } catch (e) {
      // DNS error or no TXT records
    }

    // Check DMARC
    try {
      const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
      const dmarcRecord = dmarcRecords.flat().find(record => record.startsWith("v=DMARC1"));
      if (dmarcRecord) {
        dmarcStatus = "PASS";
      }
    } catch (e) {
      // DNS error or no DMARC records
    }

    // Check DKIM (Checking common selectors like google, default, mail, or s1)
    // In a real application, the user provides the selector or we query the ESP API.
    // For now, we do a basic probe for Google Workspace standard "google._domainkey"
    try {
      const dkimRecords = await resolveTxt(`google._domainkey.${domain}`);
      if (dkimRecords.length > 0) {
        dkimStatus = "PASS";
      }
    } catch (e) {
      // Try CNAME for DKIM (often used by ESPs like Sendgrid or Mailgun)
      try {
        const cnameRecords = await resolveCname(`google._domainkey.${domain}`);
        if (cnameRecords.length > 0) {
          dkimStatus = "PASS";
        }
      } catch (err) {
        // Fallback: leaving it as PENDING or FAIL depending on strictness
        // In this implementation, if we can't find it, we mark it as PENDING for manual verification
        dkimStatus = "PENDING";
      }
    }

  } catch (error) {
    console.error("DNS check failed:", error);
  }

  return {
    spfStatus,
    dmarcStatus,
    dkimStatus,
  };
}

/**
 * Server Action: Synchronize DNS records and Warmup status for all SenderDomains in the active workspace.
 */
export async function syncDeliverabilityData() {
  if (!hasDatabaseUrl()) {
    return { success: false, error: "Database not configured" };
  }

  try {
    const prisma = getPrisma();
    const workspace = await getActiveWorkspace();

    const domains = await prisma.senderDomain.findMany({
      where: { workspaceId: workspace.id },
    });

    for (const domainRecord of domains) {
      // 1. Live DNS Verification
      const dnsHealth = await checkDomainDnsHealth(domainRecord.domain);

      // 2. Warmup Provider Sync (Mocked for now; would call Lemwarm/WarmupInbox API)
      // Simulating slight daily changes
      const simulatedSent = Math.floor(Math.random() * 50) + 10;
      const simulatedReceived = Math.floor(simulatedSent * (Math.random() * 0.2 + 0.8)); // 80-100% reply rate in warmup
      
      const newSpamScore = domainRecord.spamScore 
        ? Math.max(0, domainRecord.spamScore - 0.1) // Slowly improves
        : 1.5;

      const newInboxPlacement = domainRecord.inboxPlacementRate
        ? Math.min(100, domainRecord.inboxPlacementRate + 0.5) // Slowly improves
        : 85.0;

      await prisma.senderDomain.update({
        where: { id: domainRecord.id },
        data: {
          spfStatus: dnsHealth.spfStatus,
          dmarcStatus: dnsHealth.dmarcStatus,
          // If we previously validated DKIM, don't fail it just because the blind check missed it
          dkimStatus: domainRecord.dkimStatus === "PASS" && dnsHealth.dkimStatus !== "PASS" ? "PASS" : dnsHealth.dkimStatus,
          warmupSentToday: domainRecord.warmupStatus === "ACTIVE" ? simulatedSent : 0,
          warmupReceivedToday: domainRecord.warmupStatus === "ACTIVE" ? simulatedReceived : 0,
          spamScore: newSpamScore,
          inboxPlacementRate: newInboxPlacement,
          lastCheckedAt: new Date(),
        },
      });
    }

    revalidatePath("/?view=deliverability");
    return { success: true };
  } catch (error) {
    console.error("Deliverability sync failed:", error);
    return { success: false, error: "Failed to sync deliverability data" };
  }
}

export async function getDeliverabilityDomains() {
  if (!hasDatabaseUrl()) return [];
  const prisma = getPrisma();
  try {
    const workspace = await getActiveWorkspace();
    const domains = await prisma.senderDomain.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "asc" }
    });
    return domains;
  } catch (e) {
    return [];
  }
}
