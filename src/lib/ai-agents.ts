type AgentResult<T> = {
  data: T;
  mode: "openai" | "fallback";
  model: string;
  latencyMs: number;
  tokenCount: number | null;
};

export type LeadResearchOutput = {
  summary: string;
  confidence: number;
  fitScore: number;
  citations: string[];
  signals: {
    segment: string;
    painPoint: string;
    recommendedAngle: string;
  };
  nextAction: string;
};

export type WebsiteAuditOutput = {
  overallScore: number;
  clarityScore: number;
  conversionScore: number;
  trustScore: number;
  seoScore: number;
  speedScore: number;
  findings: string[];
  nextAction: string;
};

export type OutreachOutput = {
  channel: "EMAIL";
  subject: string;
  body: string;
  approvalNotes: string;
  nextAction: string;
};

export type ClientOpsOutput = {
  loomScript: string;
  crmNote: string;
  airtableFields: {
    company: string;
    stage: string;
    fitScore: number;
    nextAction: string;
  };
  followUpReminder: string;
  nextAction: string;
};

export type WebsiteRoastOutput = {
  companyName: string;
  overallScore: number;
  designScore: number;
  trustScore: number;
  speedScore: number;
  seoScore: number;
  conversionScore: number;
  headlineRewrite: string;
  subheadlineRewrite: string;
  ctaRewrite: string;
  summary: string;
  topFindings: string[];
  quickWins: string[];
  revenueOpportunity: {
    estimatedMonthlyVisitors: number;
    currentConversionRate: number;
    improvedConversionRate: number;
    estimatedAdditionalMonthlyLeads: number;
    estimatedMonthlyRevenueLiftUsd: number;
  };
};

export type CompetitorSpyOutput = {
  competitorName: string;
  summary: string;
  offerPositioning: string;
  ctaStyle: string;
  funnelObservation: string;
  keywordAngles: string[];
  strengths: string[];
  weaknesses: string[];
  differentiationMoves: string[];
  quickAttackPlan: {
    homepageAngle: string;
    proofStrategy: string;
    ctaStrategy: string;
  };
};

export type GrowthModeOutput = {
  businessName: string;
  targetOutcome: string;
  summary: string;
  icp: {
    primaryBuyer: string;
    painPoints: string[];
    industries: string[];
  };
  offer: {
    coreOffer: string;
    pricingAngle: string;
    proofHooks: string[];
  };
  leadSources: Array<{
    channel: string;
    whyItWorks: string;
    firstMove: string;
  }>;
  outreachPlan: {
    openingAngle: string;
    channels: string[];
    cadence: string[];
  };
  websiteFixes: string[];
  contentPlan: string[];
  dailyExecutionPlan: string[];
  kpis: Array<{
    label: string;
    target: string;
  }>;
  ninetyDayPlan: {
    days0to30: string[];
    days31to60: string[];
    days61to90: string[];
  };
};

type LeadAgentInput = {
  company: string;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  segment: string | null;
  source: string;
  playbook?: {
    product: string;
    idealCustomer: string;
    industries: string[];
    pains: string[];
    proofPoints: string[];
    tone: string;
    positioning: string | null;
  } | null;
};

const researchSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "confidence", "fitScore", "citations", "signals", "nextAction"],
  properties: {
    summary: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    fitScore: { type: "integer", minimum: 0, maximum: 100 },
    citations: { type: "array", items: { type: "string" } },
    signals: {
      type: "object",
      additionalProperties: false,
      required: ["segment", "painPoint", "recommendedAngle"],
      properties: {
        segment: { type: "string" },
        painPoint: { type: "string" },
        recommendedAngle: { type: "string" },
      },
    },
    nextAction: { type: "string" },
  },
};

const auditSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "overallScore",
    "clarityScore",
    "conversionScore",
    "trustScore",
    "seoScore",
    "speedScore",
    "findings",
    "nextAction",
  ],
  properties: {
    overallScore: { type: "integer", minimum: 0, maximum: 100 },
    clarityScore: { type: "integer", minimum: 0, maximum: 100 },
    conversionScore: { type: "integer", minimum: 0, maximum: 100 },
    trustScore: { type: "integer", minimum: 0, maximum: 100 },
    seoScore: { type: "integer", minimum: 0, maximum: 100 },
    speedScore: { type: "integer", minimum: 0, maximum: 100 },
    findings: { type: "array", items: { type: "string" } },
    nextAction: { type: "string" },
  },
};

const outreachSchema = {
  type: "object",
  additionalProperties: false,
  required: ["channel", "subject", "body", "approvalNotes", "nextAction"],
  properties: {
    channel: { type: "string", enum: ["EMAIL"] },
    subject: { type: "string" },
    body: { type: "string" },
    approvalNotes: { type: "string" },
    nextAction: { type: "string" },
  },
};

const clientOpsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["loomScript", "crmNote", "airtableFields", "followUpReminder", "nextAction"],
  properties: {
    loomScript: { type: "string" },
    crmNote: { type: "string" },
    airtableFields: {
      type: "object",
      additionalProperties: false,
      required: ["company", "stage", "fitScore", "nextAction"],
      properties: {
        company: { type: "string" },
        stage: { type: "string" },
        fitScore: { type: "integer", minimum: 0, maximum: 100 },
        nextAction: { type: "string" },
      },
    },
    followUpReminder: { type: "string" },
    nextAction: { type: "string" },
  },
};

const roastSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "companyName",
    "overallScore",
    "designScore",
    "trustScore",
    "speedScore",
    "seoScore",
    "conversionScore",
    "headlineRewrite",
    "subheadlineRewrite",
    "ctaRewrite",
    "summary",
    "topFindings",
    "quickWins",
    "revenueOpportunity",
  ],
  properties: {
    companyName: { type: "string" },
    overallScore: { type: "integer", minimum: 0, maximum: 100 },
    designScore: { type: "integer", minimum: 0, maximum: 100 },
    trustScore: { type: "integer", minimum: 0, maximum: 100 },
    speedScore: { type: "integer", minimum: 0, maximum: 100 },
    seoScore: { type: "integer", minimum: 0, maximum: 100 },
    conversionScore: { type: "integer", minimum: 0, maximum: 100 },
    headlineRewrite: { type: "string" },
    subheadlineRewrite: { type: "string" },
    ctaRewrite: { type: "string" },
    summary: { type: "string" },
    topFindings: { type: "array", items: { type: "string" } },
    quickWins: { type: "array", items: { type: "string" } },
    revenueOpportunity: {
      type: "object",
      additionalProperties: false,
      required: [
        "estimatedMonthlyVisitors",
        "currentConversionRate",
        "improvedConversionRate",
        "estimatedAdditionalMonthlyLeads",
        "estimatedMonthlyRevenueLiftUsd",
      ],
      properties: {
        estimatedMonthlyVisitors: { type: "integer", minimum: 0 },
        currentConversionRate: { type: "number", minimum: 0, maximum: 100 },
        improvedConversionRate: { type: "number", minimum: 0, maximum: 100 },
        estimatedAdditionalMonthlyLeads: { type: "integer", minimum: 0 },
        estimatedMonthlyRevenueLiftUsd: { type: "integer", minimum: 0 },
      },
    },
  },
};

const competitorSpySchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "competitorName",
    "summary",
    "offerPositioning",
    "ctaStyle",
    "funnelObservation",
    "keywordAngles",
    "strengths",
    "weaknesses",
    "differentiationMoves",
    "quickAttackPlan",
  ],
  properties: {
    competitorName: { type: "string" },
    summary: { type: "string" },
    offerPositioning: { type: "string" },
    ctaStyle: { type: "string" },
    funnelObservation: { type: "string" },
    keywordAngles: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    differentiationMoves: { type: "array", items: { type: "string" } },
    quickAttackPlan: {
      type: "object",
      additionalProperties: false,
      required: ["homepageAngle", "proofStrategy", "ctaStrategy"],
      properties: {
        homepageAngle: { type: "string" },
        proofStrategy: { type: "string" },
        ctaStrategy: { type: "string" },
      },
    },
  },
};

const growthModeSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "businessName",
    "targetOutcome",
    "summary",
    "icp",
    "offer",
    "leadSources",
    "outreachPlan",
    "websiteFixes",
    "contentPlan",
    "dailyExecutionPlan",
    "kpis",
    "ninetyDayPlan",
  ],
  properties: {
    businessName: { type: "string" },
    targetOutcome: { type: "string" },
    summary: { type: "string" },
    icp: {
      type: "object",
      additionalProperties: false,
      required: ["primaryBuyer", "painPoints", "industries"],
      properties: {
        primaryBuyer: { type: "string" },
        painPoints: { type: "array", items: { type: "string" } },
        industries: { type: "array", items: { type: "string" } },
      },
    },
    offer: {
      type: "object",
      additionalProperties: false,
      required: ["coreOffer", "pricingAngle", "proofHooks"],
      properties: {
        coreOffer: { type: "string" },
        pricingAngle: { type: "string" },
        proofHooks: { type: "array", items: { type: "string" } },
      },
    },
    leadSources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["channel", "whyItWorks", "firstMove"],
        properties: {
          channel: { type: "string" },
          whyItWorks: { type: "string" },
          firstMove: { type: "string" },
        },
      },
    },
    outreachPlan: {
      type: "object",
      additionalProperties: false,
      required: ["openingAngle", "channels", "cadence"],
      properties: {
        openingAngle: { type: "string" },
        channels: { type: "array", items: { type: "string" } },
        cadence: { type: "array", items: { type: "string" } },
      },
    },
    websiteFixes: { type: "array", items: { type: "string" } },
    contentPlan: { type: "array", items: { type: "string" } },
    dailyExecutionPlan: { type: "array", items: { type: "string" } },
    kpis: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "target"],
        properties: {
          label: { type: "string" },
          target: { type: "string" },
        },
      },
    },
    ninetyDayPlan: {
      type: "object",
      additionalProperties: false,
      required: ["days0to30", "days31to60", "days61to90"],
      properties: {
        days0to30: { type: "array", items: { type: "string" } },
        days31to60: { type: "array", items: { type: "string" } },
        days61to90: { type: "array", items: { type: "string" } },
      },
    },
  },
};

export async function researchLead(input: LeadAgentInput): Promise<AgentResult<LeadResearchOutput>> {
  return callAgent({
    schemaName: "lead_research",
    instructions: prompts.research,
    schema: researchSchema,
    input,
    fallback: () => ({
      summary: `${input.company} is a plausible fit for targeted RevOps outreach. The strongest opening is a specific observation about conversion clarity, trust proof, and follow-up discipline.`,
      confidence: 0.82,
      fitScore: input.playbook?.industries.some((industry) => industry.toLowerCase() === (input.segment ?? "").toLowerCase())
        ? 90
        : input.website ? 84 : 72,
      citations: [input.website ?? "Manual lead intake", "Lead profile fields"],
      signals: {
        segment: input.segment ?? "Unsegmented",
        painPoint: input.playbook?.pains[0] ?? "Visitors need a clearer path from interest to qualified next step.",
        recommendedAngle: input.playbook?.positioning ?? "Offer a concise website conversion and follow-up audit.",
      },
      nextAction: "Run website audit",
    }),
  });
}

export async function auditWebsite(input: LeadAgentInput): Promise<AgentResult<WebsiteAuditOutput>> {
  return callAgent({
    schemaName: "website_audit",
    instructions: prompts.audit,
    schema: auditSchema,
    input,
    fallback: () => {
      const baseScore = input.website ? 78 : 61;
      return {
        overallScore: baseScore,
        clarityScore: Math.min(baseScore + 4, 100),
        conversionScore: Math.max(baseScore - 7, 0),
        trustScore: Math.min(baseScore + 6, 100),
        seoScore: Math.max(baseScore - 2, 0),
        speedScore: baseScore,
        findings: [
          "Clarify the primary CTA above the fold.",
          "Move proof points closer to the conversion path.",
          "Use the outreach angle to offer one specific improvement, not a generic audit.",
        ],
        nextAction: "Generate outreach draft",
      };
    },
  });
}

export async function draftOutreach(input: LeadAgentInput): Promise<AgentResult<OutreachOutput>> {
  return callAgent({
    schemaName: "outreach_draft",
    instructions: prompts.outreach,
    schema: outreachSchema,
    input,
    fallback: () => ({
      channel: "EMAIL",
      subject: `Quick idea for ${input.company}`,
      body: `Hi ${input.contactName ?? "there"},\n\nI noticed ${input.company}${input.website ? " has a clear website presence" : ""}, and there may be a practical opportunity to improve how high-intent visitors move from interest to next step.\n\nI put together a short angle around conversion clarity, trust proof, and follow-up quality. Worth sending over?`,
      approvalNotes: `Reviewer should confirm all facts before any Gmail draft or CRM sync. Tone target: ${input.playbook?.tone ?? "specific and low-pressure"}.`,
      nextAction: "Review and approve outreach",
    }),
  });
}

export async function prepareClientOps(input: LeadAgentInput): Promise<AgentResult<ClientOpsOutput>> {
  return callAgent({
    schemaName: "client_ops_plan",
    instructions: prompts.clientOps,
    schema: clientOpsSchema,
    input,
    fallback: () => ({
      loomScript: `Hi ${input.contactName ?? "there"}, this is a quick walkthrough for ${input.company}.\n\n1. Start with the strongest conversion opportunity on the website.\n2. Show where trust proof or CTA clarity could improve the visitor path.\n3. Close with one low-pressure next step: offer to send the short audit notes.`,
      crmNote: `${input.company} is ready for human-reviewed outreach. Angle: ${input.playbook?.positioning ?? "conversion clarity, trust proof, and disciplined follow-up"}. Confirm facts before syncing external systems.`,
      airtableFields: {
        company: input.company,
        stage: "Ready",
        fitScore: input.website ? 84 : 72,
        nextAction: "Approve Gmail draft and sync CRM",
      },
      followUpReminder: "Follow up in 3 business days if the approved Gmail draft is not sent.",
      nextAction: "Approve Gmail draft and sync CRM",
    }),
  });
}

export async function roastWebsite(input: {
  url: string;
  notes?: string;
}): Promise<AgentResult<WebsiteRoastOutput>> {
  const hostname = safeHostname(input.url);
  return callAgent({
    schemaName: "website_roast",
    instructions: prompts.roast,
    schema: roastSchema,
    input,
    fallback: () => {
      const brand = hostnameToBrand(hostname);
      const seed = hashString(hostname);
      const overallScore = scoreFromSeed(seed, 58, 86);
      const designScore = clampScore(overallScore + ((seed % 11) - 5));
      const trustScore = clampScore(overallScore + (((seed >> 3) % 13) - 6));
      const speedScore = clampScore(overallScore + (((seed >> 5) % 15) - 7));
      const seoScore = clampScore(overallScore + (((seed >> 7) % 9) - 4));
      const conversionScore = clampScore(overallScore + (((seed >> 11) % 17) - 8));
      const estimatedMonthlyVisitors = 4200 + (seed % 6800);
      const currentConversionRate = toPercent(0.9 + ((seed % 15) / 10));
      const improvedConversionRate = toPercent(currentConversionRate + 0.8 + (((seed >> 2) % 11) / 10));
      const estimatedAdditionalMonthlyLeads = Math.max(
        6,
        Math.round((estimatedMonthlyVisitors * (improvedConversionRate - currentConversionRate)) / 100),
      );
      const estimatedMonthlyRevenueLiftUsd = estimatedAdditionalMonthlyLeads * (900 + ((seed >> 4) % 1200));

      return {
        companyName: brand,
        overallScore,
        designScore,
        trustScore,
        speedScore,
        seoScore,
        conversionScore,
        headlineRewrite: `${brand} turns interest into qualified pipeline faster.`,
        subheadlineRewrite:
          "Clarify the offer, surface proof earlier, and make the next step feel obvious for serious buyers.",
        ctaRewrite: "Get the conversion teardown",
        summary:
          `${brand} already looks credible, but the site is leaving intent on the table. The biggest lift comes from making the offer clearer above the fold, tightening proof placement, and reducing friction around the main CTA.`,
        topFindings: [
          "The page likely asks visitors to think too much before taking the next step.",
          "Trust proof needs to sit closer to the first serious conversion moment.",
          "Homepage copy should make the buyer, problem, and promised outcome legible in seconds.",
        ],
        quickWins: [
          "Rewrite the hero to name the buyer and primary outcome in one line.",
          "Move one strong proof point or client logo cluster above the fold.",
          "Reduce the CTA choice to one primary action for high-intent visitors.",
        ],
        revenueOpportunity: {
          estimatedMonthlyVisitors,
          currentConversionRate,
          improvedConversionRate,
          estimatedAdditionalMonthlyLeads,
          estimatedMonthlyRevenueLiftUsd,
        },
      };
    },
  });
}

export async function spyCompetitor(input: {
  url: string;
  notes?: string;
}): Promise<AgentResult<CompetitorSpyOutput>> {
  const hostname = safeHostname(input.url);
  return callAgent({
    schemaName: "competitor_spy",
    instructions: prompts.competitor,
    schema: competitorSpySchema,
    input,
    fallback: () => {
      const brand = hostnameToBrand(hostname);
      const category = inferCategoryFromNotes(input.notes);
      return {
        competitorName: brand,
        summary: `${brand} likely presents itself as a polished ${category} option with enough clarity to win attention quickly, but there is room to out-position it with sharper specificity and better proof sequencing.`,
        offerPositioning: `${brand} appears to lean on broad category authority rather than a narrow, high-conviction promise.`,
        ctaStyle: "The CTA style is probably demo- or contact-oriented, with a premium but somewhat generic conversion path.",
        funnelObservation: "The likely funnel pushes visitors from homepage credibility into a standard product or contact flow without a sharply differentiated first conversion moment.",
        keywordAngles: [
          `${category} conversion`,
          `${category} audit`,
          `${category} revenue lift`,
        ],
        strengths: [
          "Polished category presence that can build initial confidence fast.",
          "Likely strong visual presentation and clean above-the-fold composition.",
          "Enough clarity to make the offer legible for first-time visitors.",
        ],
        weaknesses: [
          "Messaging probably stays broad where a more specific claim could stand out.",
          "Proof may feel present but not strategically sequenced near the first CTA.",
          "The conversion path is likely conventional enough to be outplayed by clearer next-step framing.",
        ],
        differentiationMoves: [
          "Lead with a sharper buyer-and-outcome headline instead of category language.",
          "Show proof earlier and tie it directly to the promised business result.",
          "Offer a more concrete first conversion step than a generic demo CTA.",
        ],
        quickAttackPlan: {
          homepageAngle: `Position against ${brand} by naming the exact buyer pain and promised revenue outcome in the hero.`,
          proofStrategy: "Bring one hard proof point, case-study stat, or trust marker above the fold and another just before the main CTA.",
          ctaStrategy: "Replace a generic demo ask with a narrower action like a teardown, benchmark, or conversion audit.",
        },
      };
    },
  });
}

export async function runGrowthMode(input: {
  prompt: string;
  context?: string;
}): Promise<AgentResult<GrowthModeOutput>> {
  const brand = inferBusinessName(input.prompt);
  const targetOutcome = inferTargetOutcome(input.prompt);
  return callAgent({
    schemaName: "growth_mode_plan",
    instructions: prompts.growthMode,
    schema: growthModeSchema,
    input,
    fallback: () => ({
      businessName: brand,
      targetOutcome,
      summary: `${brand} needs a tighter ICP, a sharper offer, and a repeatable outbound rhythm. The fastest path is to pick one buyer segment, turn the offer into a concrete outcome, and run a daily loop that compounds lead generation, website clarity, and proof.`,
      icp: {
        primaryBuyer: "Founder-led B2B operator with revenue pressure and no consistent outbound system",
        painPoints: [
          "Lead flow depends on inconsistent manual prospecting",
          "Website visitors do not convert into qualified conversations reliably",
          "There is not enough proof or specificity to justify premium pricing",
        ],
        industries: ["AI agencies", "B2B SaaS", "service businesses with outbound sales"],
      },
      offer: {
        coreOffer: "Conversion-led outbound growth system with website teardown, message strategy, and approved outreach execution",
        pricingAngle: "Package the offer around pipeline outcomes and speed to qualified meetings, not just deliverables",
        proofHooks: [
          "Before / after homepage clarity improvements",
          "Specific audit-led outreach angles",
          "Tracked reply, meeting, and win signals",
        ],
      },
      leadSources: [
        {
          channel: "Manual high-fit account sourcing",
          whyItWorks: "It keeps the first outbound motion specific while the offer is still being sharpened",
          firstMove: "Build a weekly list of 30 handpicked accounts from public sources and score them by fit and website quality",
        },
        {
          channel: "Founder LinkedIn content",
          whyItWorks: "It compounds trust while making the offer legible to warm leads",
          firstMove: "Publish 3 posts per week built from audits, objections, and positioning opinions",
        },
        {
          channel: "Website teardown lead magnet",
          whyItWorks: "It gives prospects a low-friction way to raise their hand",
          firstMove: "Use Roast Lab outputs as teaser material and offer a fuller teardown call",
        },
      ],
      outreachPlan: {
        openingAngle: "Lead with one specific observation about the prospect's homepage, proof sequence, or CTA friction",
        channels: ["Email", "LinkedIn DM", "Short Loom follow-up"],
        cadence: [
          "Day 1: specific email",
          "Day 3: short LinkedIn follow-up",
          "Day 5: value-led bump with one concrete improvement",
          "Day 8: breakup note or teardown offer",
        ],
      },
      websiteFixes: [
        "Rewrite the hero around buyer + pain + promised business outcome",
        "Move proof closer to the first serious CTA",
        "Offer one primary action instead of splitting visitor attention",
        "Add a visible audit, teardown, or benchmark CTA for warm prospects",
      ],
      contentPlan: [
        "Post audit breakdowns that show what bad positioning costs",
        "Write founder opinions on why generic outreach fails",
        "Turn competitor observations into short, teachable contrast posts",
        "Share before / after copy rewrites with one clear lesson each",
      ],
      dailyExecutionPlan: [
        "Source 10 leads",
        "Audit 3 sites deeply",
        "Send 5 specific outbound messages",
        "Publish or draft 1 content asset",
        "Review replies, objections, and next-step blockers",
      ],
      kpis: [
        { label: "Qualified leads sourced weekly", target: "50" },
        { label: "Outbound messages sent daily", target: "5-10" },
        { label: "Reply rate", target: "8-15%" },
        { label: "Meetings booked monthly", target: "8-12" },
      ],
      ninetyDayPlan: {
        days0to30: [
          "Choose one niche and one offer angle",
          "Tighten homepage copy and proof",
          "Run manual sourcing plus specific audit-led outreach daily",
        ],
        days31to60: [
          "Turn winning outreach angles into templates",
          "Increase content consistency around teardown insights",
          "Document objections and strengthen proof assets",
        ],
        days61to90: [
          "Systematize the highest-performing lead source",
          "Raise pricing on the strongest offer package",
          "Use outcome data to narrow into the most profitable segment",
        ],
      },
    }),
  });
}

async function callAgent<T>({
  schemaName,
  instructions,
  schema,
  input,
  fallback,
}: {
  schemaName: string;
  instructions: string;
  schema: object;
  input: unknown;
  fallback: () => T;
}): Promise<AgentResult<T>> {
  const model = process.env.OPENAI_MODEL ?? "gpt-5.2";
  const startedAt = Date.now();

  if (!process.env.OPENAI_API_KEY) {
    return {
      data: fallback(),
      mode: "fallback",
      model: "local-deterministic",
      latencyMs: Date.now() - startedAt,
      tokenCount: 0,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(input, null, 2),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: schemaName,
            strict: true,
            schema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}`);
    }

    const raw = await response.json();
    const text = extractResponseText(raw);
    return {
      data: JSON.parse(text) as T,
      mode: "openai",
      model,
      latencyMs: Date.now() - startedAt,
      tokenCount: readTokenCount(raw),
    };
  } catch {
    return {
      data: fallback(),
      mode: "fallback",
      model: "local-deterministic",
      latencyMs: Date.now() - startedAt,
      tokenCount: 0,
    };
  }
}

function extractResponseText(raw: unknown): string {
  if (typeof raw === "object" && raw !== null && "output_text" in raw) {
    const outputText = (raw as { output_text?: unknown }).output_text;
    if (typeof outputText === "string") {
      return outputText;
    }
  }

  const output = (raw as { output?: Array<{ content?: Array<{ text?: unknown }> }> }).output ?? [];
  for (const item of output) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") {
        return content.text;
      }
    }
  }

  throw new Error("No text output found in OpenAI response.");
}

function readTokenCount(raw: unknown) {
  const usage = (raw as { usage?: { total_tokens?: unknown; input_tokens?: unknown; output_tokens?: unknown } }).usage;
  if (typeof usage?.total_tokens === "number") {
    return usage.total_tokens;
  }

  const input = typeof usage?.input_tokens === "number" ? usage.input_tokens : 0;
  const output = typeof usage?.output_tokens === "number" ? usage.output_tokens : 0;
  return input + output || null;
}

const prompts = {
  research:
    "You research companies and contacts for B2B outreach. Return concise, sourced findings. Separate verified facts from inferences. Do not invent news, customers, funding, employee counts, or technologies. If a source is missing, mark the claim as unverified.",
  audit:
    "You audit B2B websites for clarity, conversion readiness, trust, speed signals, SEO basics, and outreach relevance. Score each category from 0 to 100 and explain the top three improvement opportunities in plain language.",
  outreach:
    "You write respectful, specific, low-pressure outreach. Use only verified research facts. Avoid hype, fake familiarity, and manipulative urgency. Produce one short email draft suitable for human approval.",
  clientOps:
    "You prepare post-approval sales operations assets for a B2B lead. Produce a short Loom script, a CRM note, Airtable-ready fields, a concise follow-up reminder, and the next human approval action. Do not claim that any external system was updated.",
  roast:
    "You are a sharp but useful website growth critic. Given a company URL and optional notes, produce a concise website roast for a founder or growth operator. Score design, trust, speed, SEO, and conversion from 0 to 100. Focus on what is visible and likely from the URL and context. Do not claim you verified analytics or private business data. Provide a better homepage headline, subheadline, CTA, top findings, quick wins, and a clearly labeled estimated revenue opportunity model.",
  competitor:
    "You analyze a competitor website like a product marketer and conversion strategist. Given a competitor URL and optional notes, summarize how the competitor likely positions the offer, how the CTA and funnel feel, what strengths and weaknesses stand out, what keyword or category angles they may be leaning on, and how to beat them with sharper positioning. Do not invent hidden analytics, private metrics, or proprietary internal information.",
  growthMode:
    "You are a pragmatic AI growth strategist for founders and agencies. Given one user prompt describing a business or revenue goal, produce a concrete growth plan with ICP, offer, lead sources, outreach plan, website fixes, content plan, daily execution loop, KPIs, and a 0-30 / 31-60 / 61-90 day roadmap. Keep it actionable, specific, and optimized for getting traction fast rather than sounding inspirational.",
};

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "website";
  }
}

function hostnameToBrand(hostname: string) {
  return hostname
    .split(".")[0]
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ") || "This site";
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function scoreFromSeed(seed: number, min: number, max: number) {
  return min + (seed % (max - min + 1));
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toPercent(value: number) {
  return Number(value.toFixed(1));
}

function inferCategoryFromNotes(notes?: string) {
  const trimmed = notes?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "B2B growth";
}

function inferBusinessName(prompt: string) {
  const trimmed = prompt.trim();
  const firstWords = trimmed.split(/\s+/).slice(0, 4).join(" ");
  if (!firstWords) {
    return "This business";
  }
  return firstWords.charAt(0).toUpperCase() + firstWords.slice(1);
}

function inferTargetOutcome(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return "Build a repeatable growth engine";
  }
  return trimmed;
}
