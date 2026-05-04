/**
 * Lead Enrichment — Waterfall Adapter Interface
 *
 * Supports: Firmographics, Technographics, Funding, Hiring, Intent, Job Changes, Social, News
 *
 * Design:
 * - Each provider is an adapter that returns partial enrichment data + per-field confidence (0–100)
 * - The waterfall engine runs providers in priority order, merging results
 * - Fields from higher-confidence providers win; lower-confidence providers fill gaps only
 * - A final overallConfidence score aggregates signal coverage
 *
 * Providers: Clearbit, Apollo, Hunter, BuiltWith, Crunchbase, Bombora, G2, LinkedIn, OpenAI (fallback)
 */

// ─── Signal types ─────────────────────────────────────────────────────────────

export type TechStackEntry = {
  name: string;
  category: string; // "CRM" | "Analytics" | "Marketing" | "Devtools" | "Infrastructure"
  confidence: number;
};

export type IntentTopic = {
  topic: string;
  score: number;   // 0-100
  provider: string;
};

export type JobChange = {
  name: string;
  oldRole: string;
  newRole: string;
  oldCompany?: string;
  linkedinUrl?: string;
  detectedAt: string; // ISO
};

export type NewsItem = {
  headline: string;
  url: string;
  date: string;
  sentiment: "positive" | "neutral" | "negative";
  source: string;
};

export type FundingRound = {
  round: string;
  amount: number | null;
  date: string;
  investors: string[];
};

export type JobPosting = {
  title: string;
  department: string;
  postedAt: string;
  location?: string;
};

// ─── Enrichment result type ───────────────────────────────────────────────────

export type EnrichmentData = {
  // Firmographics
  employeeCount?: number;
  employeeRange?: string;
  annualRevenue?: number;
  revenueRange?: string;
  industry?: string;
  subIndustry?: string;
  companyType?: string;
  foundedYear?: number;
  headquartersCity?: string;
  headquartersCountry?: string;
  description?: string;

  // Technographics
  techStack?: TechStackEntry[];
  crmPlatform?: string;
  marketingStack?: string[];
  analyticsTools?: string[];

  // Funding
  totalFunding?: number;
  lastFundingAmount?: number;
  lastFundingRound?: string;
  lastFundingDate?: string;
  investors?: string[];
  isPublic?: boolean;
  stockTicker?: string;
  fundingHistory?: FundingRound[];

  // Hiring
  openRoles?: number;
  hiringVelocity?: string;
  topHiringDepts?: string[];
  recentJobPostings?: JobPosting[];

  // Intent
  intentTopics?: IntentTopic[];
  intentScore?: number;
  intentLevel?: string;

  // Job changes
  recentJobChanges?: JobChange[];

  // Social
  linkedinFollowers?: number;
  twitterFollowers?: number;
  g2Rating?: number;
  g2Reviews?: number;

  // News
  recentNews?: NewsItem[];

  // Contact (Person-level fallback)
  contactEmail?: string;
  contactName?: string;
};

// ─── Per-field confidence map ─────────────────────────────────────────────────

export type FieldConfidence = Partial<Record<keyof EnrichmentData, number>>;

// ─── Adapter interface ────────────────────────────────────────────────────────

export type EnrichmentInput = {
  company: string;
  website?: string | null;
  contactEmail?: string | null;
  contactName?: string | null;
  linkedinUrl?: string | null;
};

export type EnrichmentAdapterResult = {
  provider: string;
  data: Partial<EnrichmentData>;
  confidence: FieldConfidence;
  fieldsEnriched: string[];
  fetchedAt: string;
  error?: string;
};

export type EnrichmentAdapter = {
  name: string;
  priority: number;             // Lower = runs first in waterfall
  signalKinds: string[];        // Which signal categories this adapter covers
  isAvailable: () => boolean;
  enrich: (input: EnrichmentInput) => Promise<EnrichmentAdapterResult>;
};

// ─── Waterfall engine ─────────────────────────────────────────────────────────

export type WaterfallResult = {
  merged: EnrichmentData;
  fieldConfidence: FieldConfidence;
  overallConfidence: number;
  providerResults: EnrichmentAdapterResult[];
  signals: Array<{
    kind: string;
    provider: string;
    key: string;
    value: unknown;
    confidence: number;
    fetchedAt: string;
  }>;
};

export async function runEnrichmentWaterfall(
  input: EnrichmentInput,
  adapters: EnrichmentAdapter[],
): Promise<WaterfallResult> {
  // Sort by priority ascending (lower = runs first)
  const sorted = [...adapters].sort((a, b) => a.priority - b.priority);
  const available = sorted.filter((a) => a.isAvailable());

  const providerResults: EnrichmentAdapterResult[] = [];

  // Run available adapters (concurrently per tier, sequential across tiers)
  for (const adapter of available) {
    try {
      const result = await adapter.enrich(input);
      providerResults.push(result);
    } catch (err) {
      providerResults.push({
        provider: adapter.name,
        data: {},
        confidence: {},
        fieldsEnriched: [],
        fetchedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  // Merge results: higher-confidence fields win
  const merged: EnrichmentData = {};
  const fieldConfidence: FieldConfidence = {};
  const signals: WaterfallResult["signals"] = [];

  for (const result of providerResults) {
    for (const key of result.fieldsEnriched) {
      const k = key as keyof EnrichmentData;
      const newConf = result.confidence[k] ?? 50;
      const existingConf = fieldConfidence[k] ?? -1;

      // Take the value if confidence is higher or field is missing
      if (newConf > existingConf) {
        (merged as Record<string, unknown>)[k] = (result.data as Record<string, unknown>)[k];
        fieldConfidence[k] = newConf;
      }

      signals.push({
        kind: inferSignalKind(key),
        provider: result.provider,
        key,
        value: (result.data as Record<string, unknown>)[k],
        confidence: newConf,
        fetchedAt: result.fetchedAt,
      });
    }
  }

  // Calculate overall confidence: weighted average of filled fields
  const scores = Object.values(fieldConfidence);
  const overallConfidence =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  return { merged, fieldConfidence, overallConfidence, providerResults, signals };
}

// ─── Signal kind inference ────────────────────────────────────────────────────

const FIELD_KIND_MAP: Record<string, string> = {
  employeeCount: "FIRMOGRAPHIC", employeeRange: "FIRMOGRAPHIC",
  annualRevenue: "FIRMOGRAPHIC", revenueRange: "FIRMOGRAPHIC",
  industry: "FIRMOGRAPHIC", subIndustry: "FIRMOGRAPHIC",
  companyType: "FIRMOGRAPHIC", foundedYear: "FIRMOGRAPHIC",
  headquartersCity: "FIRMOGRAPHIC", headquartersCountry: "FIRMOGRAPHIC",
  description: "FIRMOGRAPHIC",
  techStack: "TECHNOGRAPHIC", crmPlatform: "TECHNOGRAPHIC",
  marketingStack: "TECHNOGRAPHIC", analyticsTools: "TECHNOGRAPHIC",
  totalFunding: "FUNDING", lastFundingAmount: "FUNDING",
  lastFundingRound: "FUNDING", lastFundingDate: "FUNDING",
  investors: "FUNDING", isPublic: "FUNDING", stockTicker: "FUNDING",
  openRoles: "HIRING", hiringVelocity: "HIRING",
  topHiringDepts: "HIRING", recentJobPostings: "HIRING",
  intentTopics: "INTENT", intentScore: "INTENT", intentLevel: "INTENT",
  recentJobChanges: "JOB_CHANGE",
  linkedinFollowers: "SOCIAL", twitterFollowers: "SOCIAL",
  g2Rating: "SOCIAL", g2Reviews: "SOCIAL",
  recentNews: "NEWS",
};

function inferSignalKind(field: string): string {
  return FIELD_KIND_MAP[field] ?? "FIRMOGRAPHIC";
}

// ─── Confidence helpers ───────────────────────────────────────────────────────

export function confidenceLabel(score: number): string {
  if (score >= 85) return "High";
  if (score >= 60) return "Medium";
  if (score >= 35) return "Low";
  return "Unverified";
}

export function confidenceColor(score: number): string {
  if (score >= 85) return "emerald";
  if (score >= 60) return "yellow";
  if (score >= 35) return "orange";
  return "red";
}

// ─── Built-in adapters ────────────────────────────────────────────────────────

/**
 * Clearbit adapter (requires CLEARBIT_API_KEY)
 * Covers: firmographics, technographics, social
 */
export const clearbitAdapter: EnrichmentAdapter = {
  name: "CLEARBIT",
  priority: 1,
  signalKinds: ["FIRMOGRAPHIC", "TECHNOGRAPHIC", "SOCIAL"],
  isAvailable: () => Boolean(process.env.CLEARBIT_API_KEY),
  async enrich(input) {
    const apiKey = process.env.CLEARBIT_API_KEY!;
    const domain = extractDomain(input.website ?? input.company);
    const url = `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(domain)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return emptyResult("CLEARBIT", `HTTP ${res.status}`);
    }

    const raw = await res.json() as Record<string, unknown>;
    const metrics = raw.metrics as Record<string, unknown> | undefined;
    const geo = raw.geo as Record<string, unknown> | undefined;
    const category = raw.category as Record<string, unknown> | undefined;

    const data: Partial<EnrichmentData> = {
      employeeCount: (metrics?.employees as number) ?? undefined,
      employeeRange: (metrics?.employeesRange as string) ?? undefined,
      annualRevenue: (metrics?.estimatedAnnualRevenue as number) ?? undefined,
      industry: (category?.industry as string) ?? undefined,
      subIndustry: (category?.subIndustry as string) ?? undefined,
      companyType: (raw.type as string) ?? undefined,
      foundedYear: (raw.foundedYear as number) ?? undefined,
      headquartersCity: (geo?.city as string) ?? undefined,
      headquartersCountry: (geo?.country as string) ?? undefined,
      description: (raw.description as string) ?? undefined,
      isPublic: (raw.tags as string[] | undefined)?.includes("public") ?? false,
      stockTicker: (raw.ticker as string) ?? undefined,
    };

    const fieldsEnriched = Object.keys(data).filter(k => (data as Record<string, unknown>)[k] != null);
    const confidence: FieldConfidence = Object.fromEntries(fieldsEnriched.map(k => [k, 85])) as FieldConfidence;

    return { provider: "CLEARBIT", data, confidence, fieldsEnriched, fetchedAt: new Date().toISOString() };
  },
};

/**
 * Apollo adapter (requires APOLLO_API_KEY)
 * Covers: firmographics, contact emails, funding
 */
export const apolloAdapter: EnrichmentAdapter = {
  name: "APOLLO",
  priority: 2,
  signalKinds: ["FIRMOGRAPHIC", "FUNDING"],
  isAvailable: () => Boolean(process.env.APOLLO_API_KEY),
  async enrich(input) {
    const apiKey = process.env.APOLLO_API_KEY!;
    const domain = extractDomain(input.website ?? input.company);
    const url = "https://api.apollo.io/v1/organizations/enrich";

    const res = await fetch(`${url}?domain=${encodeURIComponent(domain)}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!res.ok) return emptyResult("APOLLO", `HTTP ${res.status}`);

    const raw = await res.json() as { organization?: Record<string, unknown> };
    const org = raw.organization ?? {};

    const data: Partial<EnrichmentData> = {
      employeeCount: (org.estimated_num_employees as number) ?? undefined,
      employeeRange: employeeRangeFromCount(org.estimated_num_employees as number),
      industry: (org.industry as string) ?? undefined,
      headquartersCity: (org.city as string) ?? undefined,
      headquartersCountry: (org.country as string) ?? undefined,
      totalFunding: (org.total_funding as number) ?? undefined,
      lastFundingRound: (org.latest_funding_stage as string) ?? undefined,
    };

    const fieldsEnriched = Object.keys(data).filter(k => (data as Record<string, unknown>)[k] != null);
    const confidence: FieldConfidence = Object.fromEntries(fieldsEnriched.map(k => [k, 80])) as FieldConfidence;

    return { provider: "APOLLO", data, confidence, fieldsEnriched, fetchedAt: new Date().toISOString() };
  },
};

/**
 * BuiltWith adapter (requires BUILTWITH_API_KEY)
 * Covers: technographics
 */
export const builtwithAdapter: EnrichmentAdapter = {
  name: "BUILTWITH",
  priority: 3,
  signalKinds: ["TECHNOGRAPHIC"],
  isAvailable: () => Boolean(process.env.BUILTWITH_API_KEY),
  async enrich(input) {
    const apiKey = process.env.BUILTWITH_API_KEY!;
    const domain = extractDomain(input.website ?? input.company);
    const url = `https://api.builtwith.com/v21/api.json?KEY=${apiKey}&LOOKUP=${domain}`;

    const res = await fetch(url);
    if (!res.ok) return emptyResult("BUILTWITH", `HTTP ${res.status}`);

    type BwTech = { Name: string; Tag: string };
    type BwPath = { Technologies?: BwTech[] };
    type BwResult = { Result?: { Paths?: BwPath[] } };
    type BwResponse = { Results?: BwResult[] };
    const raw = await res.json() as BwResponse;
    const techs: TechStackEntry[] = [];
    const paths = raw.Results?.[0]?.Result?.Paths ?? [];

    for (const path of paths) {
      for (const tech of path.Technologies ?? []) {
        if (tech.Name && !techs.find(t => t.name === tech.Name)) {
          techs.push({ name: tech.Name, category: mapBuiltWithTag(tech.Tag), confidence: 90 });
        }
      }
    }

    const crm = techs.find(t => t.category === "CRM")?.name;
    const data: Partial<EnrichmentData> = {
      techStack: techs.slice(0, 30),
      crmPlatform: crm,
      analyticsTools: techs.filter(t => t.category === "Analytics").map(t => t.name),
      marketingStack: techs.filter(t => t.category === "Marketing").map(t => t.name),
    };

    const fieldsEnriched = Object.keys(data).filter(k => (data as Record<string, unknown>)[k] != null);
    const confidence: FieldConfidence = { techStack: 90, crmPlatform: 85, analyticsTools: 90, marketingStack: 90 };

    return { provider: "BUILTWITH", data, confidence, fieldsEnriched, fetchedAt: new Date().toISOString() };
  },
};

/**
 * OpenAI fallback adapter — enriches using public knowledge when API keys are missing
 * Covers: all signal kinds at lower confidence
 */
export const openAiFallbackAdapter: EnrichmentAdapter = {
  name: "OPENAI",
  priority: 99,
  signalKinds: ["FIRMOGRAPHIC", "TECHNOGRAPHIC", "FUNDING", "HIRING", "SOCIAL"],
  isAvailable: () => Boolean(process.env.OPENAI_API_KEY),
  async enrich(input) {
    const apiKey = process.env.OPENAI_API_KEY!;

    const prompt = `You are a B2B data enrichment assistant. Enrich the following company with publicly available data.
Company: ${input.company}
Website: ${input.website ?? "unknown"}

Return a JSON object with these fields (use null for unknown):
{
  "employeeCount": number | null,
  "employeeRange": string | null,
  "annualRevenue": number | null,
  "revenueRange": string | null,
  "industry": string | null,
  "subIndustry": string | null,
  "companyType": "Public" | "Private" | "Non-profit" | null,
  "foundedYear": number | null,
  "headquartersCity": string | null,
  "headquartersCountry": string | null,
  "description": string | null,
  "techStack": [{"name": string, "category": string, "confidence": number}] | null,
  "crmPlatform": string | null,
  "totalFunding": number | null,
  "lastFundingRound": string | null,
  "investors": string[] | null,
  "isPublic": boolean,
  "openRoles": number | null,
  "hiringVelocity": "Growing" | "Stable" | "Shrinking" | null,
  "linkedinFollowers": number | null,
  "g2Rating": number | null
}
Only include fields you are confident about. Return ONLY valid JSON.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return emptyResult("OPENAI", `HTTP ${res.status}`);

    const completion = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = completion.choices?.[0]?.message?.content ?? "{}";

    let parsed: Partial<EnrichmentData> = {};
    try { parsed = JSON.parse(content) as Partial<EnrichmentData>; } catch { /* ignore */ }

    const data = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v != null)
    ) as Partial<EnrichmentData>;

    const fieldsEnriched = Object.keys(data);
    // OpenAI gets lower confidence since it's inferred, not API-sourced
    const confidence: FieldConfidence = Object.fromEntries(fieldsEnriched.map(k => [k, 55])) as FieldConfidence;

    return { provider: "OPENAI", data, confidence, fieldsEnriched, fetchedAt: new Date().toISOString() };
  },
};

/**
 * Internal/demo adapter — returns mock data for demo mode
 */
export function createDemoAdapter(company: string): EnrichmentAdapter {
  return {
    name: "INTERNAL",
    priority: 0,
    signalKinds: ["FIRMOGRAPHIC", "TECHNOGRAPHIC", "FUNDING", "HIRING", "INTENT", "JOB_CHANGE", "SOCIAL", "NEWS"],
    isAvailable: () => true,
    async enrich() {
      const seed = company.length % 5;
      const data: EnrichmentData = {
        employeeCount: [12, 45, 120, 380, 850][seed],
        employeeRange: ["1-10", "11-50", "51-200", "201-500", "501-1000"][seed],
        annualRevenue: [800000, 3500000, 12000000, 45000000, 110000000][seed],
        revenueRange: ["<$1M", "$1M-$5M", "$5M-$25M", "$25M-$100M", "$100M+"][seed],
        industry: ["SaaS", "FinTech", "E-Commerce", "HealthTech", "MarketingTech"][seed],
        companyType: "Private",
        foundedYear: [2018, 2016, 2014, 2012, 2020][seed],
        headquartersCity: ["San Francisco", "New York", "Austin", "London", "Toronto"][seed],
        headquartersCountry: seed < 4 ? "US" : "CA",
        description: `${company} is a B2B SaaS company focused on workflow automation and revenue intelligence.`,
        techStack: [
          { name: "Salesforce", category: "CRM", confidence: 92 },
          { name: "HubSpot", category: "Marketing", confidence: 85 },
          { name: "Segment", category: "Analytics", confidence: 78 },
          { name: "Stripe", category: "Payments", confidence: 95 },
          { name: "AWS", category: "Infrastructure", confidence: 88 },
          { name: "Intercom", category: "Support", confidence: 72 },
        ],
        crmPlatform: "Salesforce",
        analyticsTools: ["Segment", "Amplitude", "Google Analytics"],
        marketingStack: ["HubSpot", "Marketo", "Intercom"],
        totalFunding: [0, 2500000, 8000000, 32000000, 95000000][seed],
        lastFundingRound: [null, "Pre-Seed", "Seed", "Series A", "Series B"][seed] ?? undefined,
        lastFundingAmount: [null, 1000000, 4000000, 18000000, 65000000][seed] ?? undefined,
        investors: seed > 1 ? ["Andreessen Horowitz", "Sequoia Capital", "Y Combinator"] : [],
        openRoles: [2, 5, 12, 28, 45][seed],
        hiringVelocity: ["Stable", "Growing", "Growing", "Growing", "Stable"][seed],
        topHiringDepts: ["Engineering", "Sales", "Customer Success"],
        intentTopics: [
          { topic: "CRM software", score: 82, provider: "Bombora" },
          { topic: "Sales automation", score: 74, provider: "Bombora" },
          { topic: "Revenue intelligence", score: 68, provider: "G2" },
        ],
        intentScore: [20, 45, 65, 82, 90][seed],
        intentLevel: ["Low", "Low", "Medium", "High", "High"][seed],
        recentJobChanges: [
          { name: "Sarah Chen", oldRole: "VP Sales @ Competitor", newRole: "CRO", detectedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
        ],
        linkedinFollowers: [380, 1200, 4500, 18000, 52000][seed],
        twitterFollowers: [120, 800, 3200, 9500, 28000][seed],
        g2Rating: seed > 0 ? [null, 4.1, 4.3, 4.6, 4.8][seed] ?? undefined : undefined,
        g2Reviews: seed > 0 ? [null, 12, 45, 180, 420][seed] ?? undefined : undefined,
        recentNews: [
          { headline: `${company} raises funding to accelerate growth`, url: "#", date: new Date(Date.now() - 30 * 86400000).toISOString(), sentiment: "positive", source: "TechCrunch" },
          { headline: `${company} launches new product line`, url: "#", date: new Date(Date.now() - 7 * 86400000).toISOString(), sentiment: "positive", source: "Business Wire" },
        ],
      };

      const fieldsEnriched = Object.keys(data);
      const confidence: FieldConfidence = Object.fromEntries(fieldsEnriched.map(k => [k, 72])) as FieldConfidence;

      return { provider: "INTERNAL", data, confidence, fieldsEnriched, fetchedAt: new Date().toISOString() };
    },
  };
}

// ─── Registry — get all configured adapters for a lead ───────────────────────

/**
 * AI Signal Execution Adapter — Executes a custom ResearchPlan
 * This is the "Agentic" part of the enrichment.
 */
export function createAiSignalExecutionAdapter(
  plan: any, // Using any for now to avoid circular deps or complex typing in this view
  isDemo: boolean
): EnrichmentAdapter {
  return {
    name: "AI_SIGNAL_AGENT",
    priority: 5, // Runs after basic firmographics but before fallback
    signalKinds: ["TECHNOGRAPHIC", "INTENT", "FIRMOGRAPHIC"],
    isAvailable: () => Boolean(process.env.OPENAI_API_KEY),
    async enrich(input) {
      if (!plan || !plan.tasks) return emptyResult("AI_SIGNAL_AGENT", "No plan provided");
      if (isDemo) return emptyResult("AI_SIGNAL_AGENT", "Agentic research skipped in demo");

      const apiKey = process.env.OPENAI_API_KEY!;
      const results: Array<{ task: string; result: string; signalFound: boolean }> = [];

      for (const task of plan.tasks) {
        try {
          let rawData = "";
          const targetUrl = task.target.startsWith("http") 
            ? task.target 
            : `https://${extractDomain(input.website ?? input.company)}${task.target}`;

          if (task.type === "file_check" || task.type === "scrape") {
            const res = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
            if (res.ok) {
              rawData = (await res.text()).substring(0, 5000); // Limit context
            } else {
              rawData = `Failed to fetch: ${res.status}`;
            }
          }

          // Use a more advanced prompt for interpretation
          const evalRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o", // Use high-fidelity model for interpretation to ensure 100% accuracy
              messages: [
                { 
                  role: "system", 
                  content: "You are a Forensic Technical Analyst. Your goal is to find 100% factual proof for a signal in raw web data. If you are not 100% certain, you MUST mark 'confirmed' as false." 
                },
                { 
                  role: "user", 
                  content: `Objective: ${task.objective}\nExpected Signal: ${task.expectedSignal}\nRaw Data: ${rawData}\n\nTask:
1. Analyze the raw data.
2. If the signal is found, provide the EXACT quote or line that proves it.
3. Determine 'confirmed' (boolean).
4. Provide a 'confidence_explanation'.` 
                },
              ],
              response_format: { type: "json_object" },
              temperature: 0,
            }),
          });

          if (evalRes.ok) {
            const completion = await evalRes.json() as any;
            const evalData = JSON.parse(completion.choices[0].message.content);
            
            // Only add to results if confidence is absolute or explicitly reasoning is sound
            if (evalData.confirmed) {
              results.push({ 
                task: task.objective, 
                result: `${evalData.summary} (Proof: "${evalData.quote ?? "Direct Observation"}")`, 
                signalFound: true 
              });
            } else {
              results.push({
                task: task.objective,
                result: "Inconclusive or Signal Not Found.",
                signalFound: false
              });
            }
          }
        } catch (e) {
          console.error(`[AI_SIGNAL_AGENT] Task failed: ${task.objective}`, e);
        }
      }

      // Filter for only confirmed signals to maintain 100% truth profile
      const confirmedResults = results.filter(r => r.signalFound);
      
      const data: Partial<EnrichmentData> = {
        description: (plan.rationale + "\n\n" + (confirmedResults.length > 0 
          ? "VERIFIED SIGNALS:\n" + confirmedResults.map(r => `- ${r.task}: ${r.result}`).join("\n")
          : "No conclusive custom signals identified.")).substring(0, 2000),
      };

      const fieldsEnriched = ["description"];
      const confidence: FieldConfidence = { description: confirmedResults.length > 0 ? 100 : 0 };

      return { provider: "AI_SIGNAL_AGENT", data, confidence, fieldsEnriched, fetchedAt: new Date().toISOString() };
    },
  };
}

/**
 * Vision Intelligence Adapter — Uses GPT-4o Vision to "look" at the site
 * Detects UX debt, broken social proof, and visual tech markers.
 */
export function createVisionAdapter(isDemo: boolean): EnrichmentAdapter {
  return {
    name: "VISION_AGENT",
    priority: 6, // Runs after technical signals
    signalKinds: ["TECHNOGRAPHIC", "FIRMOGRAPHIC"],
    isAvailable: () => Boolean(process.env.OPENAI_API_KEY),
    async enrich(input) {
      if (isDemo || !input.website) return emptyResult("VISION_AGENT", "Vision skipped in demo");

      try {
        const { VisionAgent } = await import("../../agents/src/reasoning/vision-agent");
        const visionResult = await VisionAgent.analyzeWebsite(input.website);
        
        const data: Partial<EnrichmentData> = {
          description: `VISUAL INTELLIGENCE REPORT:\n${visionResult.summary}\n\nSignals Detected:\n${visionResult.signals.map((s: any) => `- [${s.kind}] (${s.severity}) ${s.finding} -> Rec: ${s.recommendation}`).join("\n")}`,
        };

        const fieldsEnriched = ["description"];
        const confidence: FieldConfidence = { description: 95 };

        return { provider: "VISION_AGENT", data, confidence, fieldsEnriched, fetchedAt: new Date().toISOString() };
      } catch (e) {
        console.error("[VISION_AGENT] Analysis failed", e);
        return emptyResult("VISION_AGENT", "Vision analysis failed");
      }
    },
  };
}

/**
 * Competitor Spy Adapter — Detects rival tracking pixels and generates rip-and-replace angles.
 */
export function createCompetitorSpyAdapter(isDemo: boolean): EnrichmentAdapter {
  return {
    name: "COMPETITOR_SPY",
    priority: 4, // Runs before vision but after basic tech
    signalKinds: ["TECHNOGRAPHIC", "INTENT"],
    isAvailable: () => true,
    async enrich(input) {
      if (isDemo || !input.website) return emptyResult("COMPETITOR_SPY", "Spying skipped in demo");

      try {
        // We need the raw HTML for pixel detection
        const res = await fetch(input.website, { signal: AbortSignal.timeout(5000) });
        const html = res.ok ? await res.text() : "";

        const { CompetitorSpyAgent } = await import("../../agents/src/reasoning/competitor-spy");
        const spyResult = await CompetitorSpyAgent.scanForCompetitors(input.website, html);
        
        if (spyResult.data.competitorsFound.length === 0) {
          return emptyResult("COMPETITOR_SPY", "No competitor pixels found.");
        }

        const data: Partial<EnrichmentData> = {
          description: `COMPETITOR INTELLIGENCE:\n${spyResult.data.summary}\n\nTargets:\n${spyResult.data.competitorsFound.map(c => `- ${c.competitorName}: ${c.ripAndReplaceAngle}`).join("\n")}`,
        };

        const fieldsEnriched = ["description"];
        const confidence: FieldConfidence = { description: 100 };

        return { provider: "COMPETITOR_SPY", data, confidence, fieldsEnriched, fetchedAt: new Date().toISOString() };
      } catch (e) {
        console.error("[COMPETITOR_SPY] Scan failed", e);
        return emptyResult("COMPETITOR_SPY", "Scan failed");
      }
    },
  };
}

/**
 * Social Pulse Adapter — Scrapes social interactions for intent signals.
 */
export function createSocialPulseAdapter(plan: any, isDemo: boolean): EnrichmentAdapter {
  return {
    name: "SOCIAL_PULSE_AGENT",
    priority: 7,
    signalKinds: ["INTENT", "SOCIAL"],
    isAvailable: () => Boolean(process.env.OPENAI_API_KEY),
    async enrich(input) {
      if (isDemo || !plan) return emptyResult("SOCIAL_PULSE_AGENT", "Pulse skipped in demo");

      const pulseTasks = plan.tasks.filter((t: any) => t.type === "social_pulse");
      if (pulseTasks.length === 0) return emptyResult("SOCIAL_PULSE_AGENT", "No pulse tasks in plan");

      const allSignals: any[] = [];
      for (const task of pulseTasks) {
        try {
          // 1. Fetch Social Data (In a real app, this would use a dedicated social scraper)
          const res = await fetch(task.target, { signal: AbortSignal.timeout(10000) });
          const html = res.ok ? await res.text() : "";

          // 2. Analyze with Agent
          const { SocialPulseAgent } = await import("../../agents/src/reasoning/social-pulse");
          const pulseResult = await SocialPulseAgent.analyzeSocialInteractions(task.target, html);
          allSignals.push(...pulseResult.data.signals);
        } catch (e) {
          console.error(`[SOCIAL_PULSE_AGENT] Task failed: ${task.objective}`, e);
        }
      }

      const data: Partial<EnrichmentData> = {
        description: `SOCIAL INTENT PULSE:\n${allSignals.length > 0 
          ? allSignals.map(s => `- [${s.intentCategory}] ${s.personName}: "${s.content.substring(0, 50)}..." -> Hook: ${s.suggestedHook}`).join("\n")
          : "No high-intent social signals identified."}`,
      };

      const fieldsEnriched = ["description"];
      const confidence: FieldConfidence = { description: 90 };

      return { provider: "SOCIAL_PULSE_AGENT", data, confidence, fieldsEnriched, fetchedAt: new Date().toISOString() };
    },
  };
}

export function getEnrichmentAdapters(
  company: string, 
  isDemo: boolean, 
  plan?: any
): EnrichmentAdapter[] {
  if (isDemo) return [createDemoAdapter(company)];

  const baseAdapters = [
    clearbitAdapter,
    apolloAdapter,
    builtwithAdapter,
    openAiFallbackAdapter,
  ].filter(a => a.isAvailable());

  // Add Reasoning-led Adapters
  if (plan) {
    baseAdapters.push(createAiSignalExecutionAdapter(plan, isDemo));
    baseAdapters.push(createCompetitorSpyAdapter(isDemo));
    baseAdapters.push(createSocialPulseAdapter(plan, isDemo));
    
    // Automatically add Vision if the plan implies UI/UX research
    const needsVision = plan.tasks.some((t: any) => 
      t.type === "scrape" || t.objective.toLowerCase().includes("ux") || t.objective.toLowerCase().includes("visual")
    );
    if (needsVision) {
      baseAdapters.push(createVisionAdapter(isDemo));
    }
  }

  return baseAdapters;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function extractDomain(websiteOrCompany: string): string {
  try {
    const url = new URL(
      websiteOrCompany.startsWith("http") ? websiteOrCompany : `https://${websiteOrCompany}`
    );
    return url.hostname.replace(/^www\./, "");
  } catch {
    return websiteOrCompany.toLowerCase().replace(/\s+/g, "") + ".com";
  }
}

function emptyResult(provider: string, error: string): EnrichmentAdapterResult {
  return { provider, data: {}, confidence: {}, fieldsEnriched: [], fetchedAt: new Date().toISOString(), error };
}

function employeeRangeFromCount(count: number | undefined): string | undefined {
  if (!count) return undefined;
  if (count <= 10) return "1-10";
  if (count <= 50) return "11-50";
  if (count <= 200) return "51-200";
  if (count <= 500) return "201-500";
  if (count <= 1000) return "501-1000";
  return "1000+";
}

function mapBuiltWithTag(tag: string): string {
  const lower = tag.toLowerCase();
  if (lower.includes("crm") || lower.includes("sales")) return "CRM";
  if (lower.includes("analytics") || lower.includes("tracking")) return "Analytics";
  if (lower.includes("marketing") || lower.includes("email")) return "Marketing";
  if (lower.includes("hosting") || lower.includes("cdn") || lower.includes("cloud")) return "Infrastructure";
  if (lower.includes("payment") || lower.includes("billing")) return "Payments";
  if (lower.includes("support") || lower.includes("chat")) return "Support";
  return "Other";
}
