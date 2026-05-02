"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPrisma, hasDatabaseUrl } from "@leadforge/db";
import { auth } from "@/auth";
import {
  runEnrichmentWaterfall,
  getEnrichmentAdapters,
  type EnrichmentData,
  type FieldConfidence,
} from "@leadforge/integrations";

const enrichLeadSchema = z.object({
  leadId: z.string().trim().min(2),
  forceRefresh: z.enum(["1", "0"]).optional(),
});

// ─── Enrichment types for the UI ──────────────────────────────────────────────

export type EnrichmentProfileSnapshot = {
  // Firmographics
  employeeCount?: number | null;
  employeeRange?: string | null;
  annualRevenue?: number | null;
  revenueRange?: string | null;
  industry?: string | null;
  subIndustry?: string | null;
  companyType?: string | null;
  foundedYear?: number | null;
  headquartersCity?: string | null;
  headquartersCountry?: string | null;
  description?: string | null;

  // Technographics
  techStack: Array<{ name: string; category: string; confidence: number }>;
  crmPlatform?: string | null;
  analyticsTools: string[];
  marketingStack: string[];

  // Funding
  totalFunding?: number | null;
  lastFundingAmount?: number | null;
  lastFundingRound?: string | null;
  lastFundingDate?: string | null;
  investors: string[];
  isPublic?: boolean;
  stockTicker?: string | null;

  // Hiring
  openRoles?: number | null;
  hiringVelocity?: string | null;
  topHiringDepts: string[];

  // Intent
  intentTopics: Array<{ topic: string; score: number; provider: string }>;
  intentScore?: number | null;
  intentLevel?: string | null;

  // Job changes
  recentJobChanges: Array<{ name: string; oldRole: string; newRole: string; detectedAt?: string }>;

  // Social
  linkedinFollowers?: number | null;
  twitterFollowers?: number | null;
  g2Rating?: number | null;
  g2Reviews?: number | null;

  // News
  recentNews: Array<{ headline: string; url: string; date: string; sentiment: string; source: string }>;

  // Waterfall metadata
  overallConfidence: number;
  providers: Array<{ provider: string; fetchedAt: string; fieldsEnriched: string[] }>;
  lastEnrichedAt?: string | null;
  enrichmentVersion: number;
};

// ─── Main enrichment action ───────────────────────────────────────────────────

export async function enrichLead(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");

  const parsed = enrichLeadSchema.safeParse({
    leadId: formData.get("leadId"),
    forceRefresh: formData.get("forceRefresh"),
  });

  if (!parsed.success) {
    redirect(`/leads/${leadId}?run=enrich-invalid`);
  }

  const { leadId: lid, forceRefresh } = parsed.data;

  const session = await auth();
  const isDemo = session?.user?.id === "demo-user";

  if (!hasDatabaseUrl() && !isDemo) {
    redirect(`/leads/${lid}?run=db-not-configured`);
  }

  try {
    if (!hasDatabaseUrl()) {
      // Demo: just revalidate and signal success
      revalidatePath(`/leads/${lid}`);
      redirect(`/leads/${lid}?run=enrich-demo`);
    }

    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({
      where: { id: lid },
      include: { enrichmentProfile: true },
    });

    if (!lead) redirect(`/leads/${lid}?run=missing`);

    // Skip if enriched recently (< 24h) unless forced
    if (
      lead.enrichmentProfile?.lastEnrichedAt &&
      forceRefresh !== "1" &&
      Date.now() - lead.enrichmentProfile.lastEnrichedAt.getTime() < 24 * 60 * 60 * 1000
    ) {
      redirect(`/leads/${lid}?run=enrich-cached`);
    }

    // Run waterfall
    const adapters = getEnrichmentAdapters(lead.company, isDemo);
    const { merged, fieldConfidence, overallConfidence, providerResults, signals } =
      await runEnrichmentWaterfall(
        {
          company: lead.company,
          website: lead.website,
          contactEmail: lead.contactEmail,
          contactName: lead.contactName,
          linkedinUrl: lead.linkedinUrl,
        },
        adapters,
      );

    // Upsert enrichment profile
    const profileData = {
      employeeCount: merged.employeeCount ?? null,
      employeeRange: merged.employeeRange ?? null,
      annualRevenue: merged.annualRevenue ? BigInt(Math.round(merged.annualRevenue)) : null,
      revenueRange: merged.revenueRange ?? null,
      industry: merged.industry ?? null,
      subIndustry: merged.subIndustry ?? null,
      companyType: merged.companyType ?? null,
      foundedYear: merged.foundedYear ?? null,
      headquartersCity: merged.headquartersCity ?? null,
      headquartersCountry: merged.headquartersCountry ?? null,
      description: merged.description ?? null,
      techStack: (merged.techStack ?? []) as object,
      crmPlatform: merged.crmPlatform ?? null,
      marketingStack: (merged.marketingStack ?? []) as object,
      analyticsTools: (merged.analyticsTools ?? []) as object,
      totalFunding: merged.totalFunding ? BigInt(Math.round(merged.totalFunding)) : null,
      lastFundingAmount: merged.lastFundingAmount ? BigInt(Math.round(merged.lastFundingAmount)) : null,
      lastFundingRound: merged.lastFundingRound ?? null,
      lastFundingDate: merged.lastFundingDate ? new Date(merged.lastFundingDate) : null,
      investors: (merged.investors ?? []) as object,
      isPublic: merged.isPublic ?? false,
      stockTicker: merged.stockTicker ?? null,
      openRoles: merged.openRoles ?? null,
      hiringVelocity: merged.hiringVelocity ?? null,
      topHiringDepts: (merged.topHiringDepts ?? []) as object,
      recentJobPostings: (merged.recentJobPostings ?? []) as object,
      intentTopics: (merged.intentTopics ?? []) as object,
      intentScore: merged.intentScore ?? null,
      intentLevel: merged.intentLevel ?? null,
      lastIntentAt: merged.intentScore ? new Date() : null,
      recentJobChanges: (merged.recentJobChanges ?? []) as object,
      linkedinFollowers: merged.linkedinFollowers ?? null,
      twitterFollowers: merged.twitterFollowers ?? null,
      g2Rating: merged.g2Rating ?? null,
      g2Reviews: merged.g2Reviews ?? null,
      recentNews: (merged.recentNews ?? []) as object,
      overallConfidence,
      providers: providerResults.map(r => ({
        provider: r.provider,
        fetchedAt: r.fetchedAt,
        fieldsEnriched: r.fieldsEnriched,
        error: r.error,
      })) as object,
      lastEnrichedAt: new Date(),
      enrichmentVersion: (lead.enrichmentProfile?.enrichmentVersion ?? 0) + 1,
    };

    await prisma.enrichmentProfile.upsert({
      where: { leadId: lid },
      update: profileData,
      create: { leadId: lid, ...profileData },
    });

    // Store per-field signals
    if (signals.length > 0 && lead.enrichmentProfile) {
      // Clear old signals for this profile and re-insert
      await prisma.enrichmentSignal.deleteMany({
        where: { enrichmentProfileId: lead.enrichmentProfile.id },
      });
    }

    const profile = await prisma.enrichmentProfile.findUnique({ where: { leadId: lid } });
    if (profile && signals.length > 0) {
      await prisma.enrichmentSignal.createMany({
        data: signals.map(s => ({
          enrichmentProfileId: profile.id,
          kind: s.kind as "FIRMOGRAPHIC" | "TECHNOGRAPHIC" | "FUNDING" | "HIRING" | "INTENT" | "JOB_CHANGE" | "SOCIAL" | "NEWS",
          provider: s.provider as "CLEARBIT" | "APOLLO" | "HUNTER" | "LINKEDIN_SCRAPE" | "CRUNCHBASE" | "BUILTWITH" | "G2" | "BOMBORA" | "INTERNAL" | "OPENAI",
          key: s.key,
          value: s.value as object,
          confidence: s.confidence,
          fetchedAt: new Date(s.fetchedAt),
        })),
        skipDuplicates: true,
      });
    }

    // Log trace
    await prisma.agentTrace.create({
      data: {
        leadId: lid,
        agentName: "Enrichment Engine",
        status: "SUCCEEDED",
        input: { company: lead.company, adapters: adapters.map(a => a.name) },
        output: {
          overallConfidence,
          fieldsEnriched: Object.keys(merged).length,
          providers: providerResults.map(r => r.provider),
        },
      },
    });

  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?run=enrich-error`);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  redirect(`/leads/${leadId}?run=enriched`);
}

// ─── Read enrichment profile for UI ──────────────────────────────────────────

export async function getLeadEnrichmentProfile(
  leadId: string,
  isDemo: boolean,
  company: string,
): Promise<EnrichmentProfileSnapshot | null> {
  if (isDemo) {
    // Return seeded demo data
    const adapters = getEnrichmentAdapters(company, true);
    const { merged, overallConfidence, providerResults } = await runEnrichmentWaterfall(
      { company, website: `https://${company.toLowerCase().replace(/\s+/g, "")}.com` },
      adapters,
    );

    return toSnapshot(merged, overallConfidence, providerResults);
  }

  if (!hasDatabaseUrl()) return null;

  try {
    const prisma = getPrisma();
    const profile = await prisma.enrichmentProfile.findUnique({ where: { leadId } });
    if (!profile) return null;

    return {
      employeeCount: profile.employeeCount,
      employeeRange: profile.employeeRange,
      annualRevenue: profile.annualRevenue ? Number(profile.annualRevenue) : null,
      revenueRange: profile.revenueRange,
      industry: profile.industry,
      subIndustry: profile.subIndustry,
      companyType: profile.companyType,
      foundedYear: profile.foundedYear,
      headquartersCity: profile.headquartersCity,
      headquartersCountry: profile.headquartersCountry,
      description: profile.description,
      techStack: (profile.techStack as Array<{ name: string; category: string; confidence: number }>) ?? [],
      crmPlatform: profile.crmPlatform,
      analyticsTools: (profile.analyticsTools as string[]) ?? [],
      marketingStack: (profile.marketingStack as string[]) ?? [],
      totalFunding: profile.totalFunding ? Number(profile.totalFunding) : null,
      lastFundingAmount: profile.lastFundingAmount ? Number(profile.lastFundingAmount) : null,
      lastFundingRound: profile.lastFundingRound,
      lastFundingDate: profile.lastFundingDate?.toISOString() ?? null,
      investors: (profile.investors as string[]) ?? [],
      isPublic: profile.isPublic,
      stockTicker: profile.stockTicker,
      openRoles: profile.openRoles,
      hiringVelocity: profile.hiringVelocity,
      topHiringDepts: (profile.topHiringDepts as string[]) ?? [],
      intentTopics: (profile.intentTopics as Array<{ topic: string; score: number; provider: string }>) ?? [],
      intentScore: profile.intentScore,
      intentLevel: profile.intentLevel,
      recentJobChanges: (profile.recentJobChanges as Array<{ name: string; oldRole: string; newRole: string; detectedAt?: string }>) ?? [],
      linkedinFollowers: profile.linkedinFollowers,
      twitterFollowers: profile.twitterFollowers,
      g2Rating: profile.g2Rating,
      g2Reviews: profile.g2Reviews,
      recentNews: (profile.recentNews as Array<{ headline: string; url: string; date: string; sentiment: string; source: string }>) ?? [],
      overallConfidence: profile.overallConfidence,
      providers: (profile.providers as Array<{ provider: string; fetchedAt: string; fieldsEnriched: string[] }>) ?? [],
      lastEnrichedAt: profile.lastEnrichedAt?.toISOString() ?? null,
      enrichmentVersion: profile.enrichmentVersion,
    };
  } catch {
    return null;
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function toSnapshot(
  merged: EnrichmentData,
  overallConfidence: number,
  providerResults: Array<{ provider: string; fetchedAt: string; fieldsEnriched: string[]; error?: string }>,
): EnrichmentProfileSnapshot {
  return {
    employeeCount: merged.employeeCount ?? null,
    employeeRange: merged.employeeRange ?? null,
    annualRevenue: merged.annualRevenue ?? null,
    revenueRange: merged.revenueRange ?? null,
    industry: merged.industry ?? null,
    subIndustry: merged.subIndustry ?? null,
    companyType: merged.companyType ?? null,
    foundedYear: merged.foundedYear ?? null,
    headquartersCity: merged.headquartersCity ?? null,
    headquartersCountry: merged.headquartersCountry ?? null,
    description: merged.description ?? null,
    techStack: merged.techStack ?? [],
    crmPlatform: merged.crmPlatform ?? null,
    analyticsTools: merged.analyticsTools ?? [],
    marketingStack: merged.marketingStack ?? [],
    totalFunding: merged.totalFunding ?? null,
    lastFundingAmount: merged.lastFundingAmount ?? null,
    lastFundingRound: merged.lastFundingRound ?? null,
    lastFundingDate: merged.lastFundingDate ?? null,
    investors: merged.investors ?? [],
    isPublic: merged.isPublic ?? false,
    stockTicker: merged.stockTicker ?? null,
    openRoles: merged.openRoles ?? null,
    hiringVelocity: merged.hiringVelocity ?? null,
    topHiringDepts: merged.topHiringDepts ?? [],
    intentTopics: merged.intentTopics ?? [],
    intentScore: merged.intentScore ?? null,
    intentLevel: merged.intentLevel ?? null,
    recentJobChanges: (merged.recentJobChanges ?? []).map(j => ({
      name: j.name,
      oldRole: j.oldRole,
      newRole: j.newRole,
      detectedAt: j.detectedAt,
    })),
    linkedinFollowers: merged.linkedinFollowers ?? null,
    twitterFollowers: merged.twitterFollowers ?? null,
    g2Rating: merged.g2Rating ?? null,
    g2Reviews: merged.g2Reviews ?? null,
    recentNews: (merged.recentNews ?? []).map(n => ({
      headline: n.headline,
      url: n.url,
      date: n.date,
      sentiment: n.sentiment,
      source: n.source,
    })),
    overallConfidence,
    providers: providerResults.map(r => ({
      provider: r.provider,
      fetchedAt: r.fetchedAt,
      fieldsEnriched: r.fieldsEnriched,
    })),
    lastEnrichedAt: new Date().toISOString(),
    enrichmentVersion: 1,
  };
}
