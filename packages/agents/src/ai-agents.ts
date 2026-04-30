import { getProposalPricingLayout, getProposalTemplate } from "./proposal-templates";
import type { ProposalBrandingProfile } from "./workspace-branding";

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
  url: string;
  companyName: string;
  mode?: "openai" | "fallback";
  model?: string;
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
  url: string;
  competitorName: string;
  mode?: "openai" | "fallback";
  model?: string;
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
  mode?: "openai" | "fallback";
  model?: string;
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

export type FounderContentOutput = {
  mode?: "openai" | "fallback";
  model?: string;
  brandName: string;
  contentMission: string;
  primaryAudience: string;
  positioningNarrative: string;
  offerTheme: string;
  proofAngles: string[];
  contentPillars: Array<{
    title: string;
    angle: string;
    whyItWorks: string;
  }>;
  linkedinPosts: Array<{
    title: string;
    hook: string;
    body: string;
    cta: string;
  }>;
  xPosts: Array<{
    hook: string;
    post: string;
  }>;
  carouselOutline: {
    title: string;
    slides: string[];
  };
  teardownScript: {
    title: string;
    sections: string[];
  };
  weeklyCalendar: Array<{
    day: string;
    assetType: string;
    topic: string;
    distribution: string;
  }>;
  ctaLibrary: string[];
  repurposingWorkflow: string[];
};

export type ProposalGeneratorOutput = {
  mode?: "openai" | "fallback";
  model?: string;
  proposalTitle: string;
  clientName: string;
  clientType: string;
  branding: Partial<ProposalBrandingProfile>;
  serviceLine: string;
  niche: string;
  templateName: string;
  executiveSummary: string;
  clientSituation: string;
  goals: string[];
  scope: string[];
  deliverables: string[];
  timeline: Array<{
    phase: string;
    duration: string;
    outcome: string;
  }>;
  pricingOptions: Array<{
    name: string;
    price: string;
    bestFor: string;
    includes: string[];
  }>;
  assumptions: string[];
  risksAndMitigations: Array<{
    risk: string;
    mitigation: string;
  }>;
  proofPoints: string[];
  guaranteeBlock: string;
  caseStudyBlocks: Array<{
    title: string;
    outcome: string;
    detail: string;
  }>;
  pricingLayout: {
    title: string;
    description: string;
    priceAnchors: string[];
  };
  cta: string;
  coverEmail: {
    subject: string;
    body: string;
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
    "url",
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
    url: { type: "string" },
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
    "url",
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
    url: { type: "string" },
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

const founderContentSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "brandName",
    "contentMission",
    "primaryAudience",
    "positioningNarrative",
    "offerTheme",
    "proofAngles",
    "contentPillars",
    "linkedinPosts",
    "xPosts",
    "carouselOutline",
    "teardownScript",
    "weeklyCalendar",
    "ctaLibrary",
    "repurposingWorkflow",
  ],
  properties: {
    brandName: { type: "string" },
    contentMission: { type: "string" },
    primaryAudience: { type: "string" },
    positioningNarrative: { type: "string" },
    offerTheme: { type: "string" },
    proofAngles: { type: "array", items: { type: "string" } },
    contentPillars: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "angle", "whyItWorks"],
        properties: {
          title: { type: "string" },
          angle: { type: "string" },
          whyItWorks: { type: "string" },
        },
      },
    },
    linkedinPosts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "hook", "body", "cta"],
        properties: {
          title: { type: "string" },
          hook: { type: "string" },
          body: { type: "string" },
          cta: { type: "string" },
        },
      },
    },
    xPosts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["hook", "post"],
        properties: {
          hook: { type: "string" },
          post: { type: "string" },
        },
      },
    },
    carouselOutline: {
      type: "object",
      additionalProperties: false,
      required: ["title", "slides"],
      properties: {
        title: { type: "string" },
        slides: { type: "array", items: { type: "string" } },
      },
    },
    teardownScript: {
      type: "object",
      additionalProperties: false,
      required: ["title", "sections"],
      properties: {
        title: { type: "string" },
        sections: { type: "array", items: { type: "string" } },
      },
    },
    weeklyCalendar: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "assetType", "topic", "distribution"],
        properties: {
          day: { type: "string" },
          assetType: { type: "string" },
          topic: { type: "string" },
          distribution: { type: "string" },
        },
      },
    },
    ctaLibrary: { type: "array", items: { type: "string" } },
    repurposingWorkflow: { type: "array", items: { type: "string" } },
  },
};

const proposalGeneratorSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "proposalTitle",
    "clientName",
    "clientType",
    "branding",
    "serviceLine",
    "niche",
    "templateName",
    "executiveSummary",
    "clientSituation",
    "goals",
    "scope",
    "deliverables",
    "timeline",
    "pricingOptions",
    "assumptions",
    "risksAndMitigations",
    "proofPoints",
    "guaranteeBlock",
    "caseStudyBlocks",
    "pricingLayout",
    "cta",
    "coverEmail",
  ],
  properties: {
    proposalTitle: { type: "string" },
    clientName: { type: "string" },
    clientType: { type: "string" },
    branding: {
      type: "object",
      additionalProperties: false,
      required: ["primaryColor", "secondaryColor"],
      properties: {
        primaryColor: { type: "string" },
        secondaryColor: { type: "string" },
        logoUrl: { type: "string" },
      },
    },
    serviceLine: { type: "string" },
    niche: { type: "string" },
    templateName: { type: "string" },
    executiveSummary: { type: "string" },
    clientSituation: { type: "string" },
    goals: { type: "array", items: { type: "string" } },
    scope: { type: "array", items: { type: "string" } },
    deliverables: { type: "array", items: { type: "string" } },
    timeline: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["phase", "duration", "outcome"],
        properties: {
          phase: { type: "string" },
          duration: { type: "string" },
          outcome: { type: "string" },
        },
      },
    },
    pricingOptions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "price", "bestFor", "includes"],
        properties: {
          name: { type: "string" },
          price: { type: "string" },
          bestFor: { type: "string" },
          includes: { type: "array", items: { type: "string" } },
        },
      },
    },
    assumptions: { type: "array", items: { type: "string" } },
    risksAndMitigations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["risk", "mitigation"],
        properties: {
          risk: { type: "string" },
          mitigation: { type: "string" },
        },
      },
    },
    proofPoints: { type: "array", items: { type: "string" } },
    guaranteeBlock: { type: "string" },
    caseStudyBlocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "outcome", "detail"],
        properties: {
          title: { type: "string" },
          outcome: { type: "string" },
          detail: { type: "string" },
        },
      },
    },
    pricingLayout: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "priceAnchors"],
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        priceAnchors: { type: "array", items: { type: "string" } },
      },
    },
    cta: { type: "string" },
    coverEmail: {
      type: "object",
      additionalProperties: false,
      required: ["subject", "body"],
      properties: {
        subject: { type: "string" },
        body: { type: "string" },
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
        url: input.url,
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
        url: input.url,
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
      mode: "fallback",
      model: "demo-fallback-v1",
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

export async function generateFounderContent(input: {
  business: string;
  audience: string;
  offer: string;
  contentGoal: string;
  platforms?: string;
  tone?: string;
  proofAssets?: string;
}): Promise<AgentResult<FounderContentOutput>> {
  const brand = inferBusinessName(input.business);
  const audience = input.audience.trim() || "Founder-led B2B buyers";
  const offer = input.offer.trim() || "Outcome-focused growth service";
  const goal = input.contentGoal.trim() || "Build trust and generate inbound conversations";
  const tone = input.tone?.trim() || "sharp, specific, founder-grade";
  const platforms = input.platforms?.trim() || "LinkedIn, X, founder-led website";
  const proofAssets = input.proofAssets?.trim() || "audits, proof points, before/after positioning insights";

  return callAgent({
    schemaName: "founder_content_engine",
    instructions: prompts.founderContent,
    schema: founderContentSchema,
    input,
    fallback: () => ({
      mode: "fallback",
      model: "demo-fallback-v1",
      brandName: brand,
      contentMission: `Turn ${brand} into a trusted authority for ${audience} by publishing useful content that converts expertise into qualified conversations and directly supports the goal: ${goal}.`,
      primaryAudience: audience,
      positioningNarrative: `${brand} should sound ${tone} and like the operator who sees broken positioning, weak proof, and missed revenue moments faster than the market does, then explains the fix in plain language.`,
      offerTheme: `${offer} framed around clear business outcomes, stronger proof, and faster movement from attention to qualified pipeline.`,
      proofAngles: [
        `Before / after messaging shifts that made the offer clearer using ${proofAssets}`,
        "Website teardown lessons tied to conversion outcomes",
        "Outbound lessons tied to reply quality and meeting quality",
      ],
      contentPillars: [
        {
          title: "Website teardown insights",
          angle: "Show what weak messaging and CTA structure cost a serious business.",
          whyItWorks: "This turns expertise into visible proof and makes the offer easy to understand.",
        },
        {
          title: "Positioning opinions",
          angle: "Take strong stances on why generic growth advice fails.",
          whyItWorks: "Opinionated content helps the founder stand out instead of sounding like a template.",
        },
        {
          title: "Outbound lessons",
          angle: "Break down what actually makes outreach specific and worth replying to.",
          whyItWorks: "This attracts buyers who already feel the pain of low-signal outbound.",
        },
      ],
      linkedinPosts: [
        {
          title: "Why most founder content never creates pipeline",
          hook: "Most founder content fails for the same reason most outbound fails: it sounds informed, but not useful.",
          body: `If your content could be posted by any ${offer.toLowerCase()} brand in your category, it will not create demand.\n\nThe content that moves buyers is specific.\nIt names the buyer.\nIt shows the mistake.\nIt explains the business cost.\nIt offers a sharper way forward.\n\nThat is what turns content into pipeline instead of empty reach.\n\n${brand} should build content around clear teardown lessons, strong positioning opinions, and proof-backed growth observations.`,
          cta: "If you want, I can turn your offer into 3 specific content angles this week.",
        },
        {
          title: "The homepage mistake that makes good offers look average",
          hook: "A weak homepage usually does not mean the offer is weak. It means the promise is buried.",
          body: `Most websites ask the visitor to do too much work.\n\nThey hide the buyer.\nThey blur the outcome.\nThey spread proof too far from the CTA.\n\nThat is why a strong operator should treat homepage clarity like a revenue lever, not a design task.\n\nThe fastest lift often comes from one sharper headline, one better proof block, and one cleaner next step.`,
          cta: "Comment `teardown` if you want a page-angle breakdown.",
        },
        {
          title: "What better outbound actually sounds like",
          hook: "Better outbound is not louder. It is narrower, truer, and easier to trust.",
          body: `The best outbound does not pretend to know everything about the prospect.\n\nIt uses one verified observation.\nIt ties that observation to one business problem.\nIt offers one useful next step.\n\nThat is enough.\n\nSpecificity beats cleverness.\nClarity beats volume.\nUseful beats impressive.`,
          cta: `If ${platforms} are part of your demand mix, publish content that teaches this before you send the message.`,
        },
      ],
      xPosts: [
        {
          hook: "Most founder content dies because it is generic on purpose.",
          post: "Most founder content dies because it is generic on purpose.\n\nSafe takes do not create demand.\n\nSay what is broken.\nShow the business cost.\nOffer the sharper move.\n\nUseful beats polished every time.",
        },
        {
          hook: "A homepage is a sales system, not a branding wallpaper.",
          post: "A homepage is a sales system, not a branding wallpaper.\n\nName the buyer.\nName the pain.\nName the outcome.\nShow proof.\nMake the next step obvious.\n\nThat is the whole game.",
        },
        {
          hook: "Good outbound starts before the first email.",
          post: "Good outbound starts before the first email.\n\nIt starts with:\n- a clearer offer\n- stronger proof\n- sharper positioning\n- better content\n\nWeak message in public = weak message in inbox.",
        },
      ],
      carouselOutline: {
        title: "Why your content is not turning into pipeline",
        slides: [
          "Slide 1: Strong reach can still create weak demand.",
          "Slide 2: Generic content sounds informed but creates no urgency.",
          "Slide 3: Buyers respond to specific mistakes and visible business cost.",
          "Slide 4: Build 3 pillars: teardown insights, positioning opinions, outbound lessons.",
          "Slide 5: End every asset with one low-friction CTA.",
        ],
      },
      teardownScript: {
        title: "Founder teardown post format",
        sections: [
          "Open with one sharp observation about the page or positioning.",
          "Explain why that mistake suppresses conversion or trust.",
          "Show the stronger rewrite or structural fix.",
          "Close with one practical takeaway and one simple CTA.",
        ],
      },
      weeklyCalendar: [
        {
          day: "Monday",
          assetType: "LinkedIn opinion post",
          topic: "Why generic growth positioning fails",
          distribution: "LinkedIn post plus short X version",
        },
        {
          day: "Tuesday",
          assetType: "Website teardown",
          topic: "Homepage clarity and CTA friction",
          distribution: "LinkedIn post plus screenshot thread",
        },
        {
          day: "Wednesday",
          assetType: "Outbound lesson",
          topic: "Specificity in cold outreach",
          distribution: "LinkedIn text post plus X post",
        },
        {
          day: "Thursday",
          assetType: "Proof-led carousel",
          topic: "Before / after messaging changes",
          distribution: "LinkedIn carousel plus teaser post",
        },
        {
          day: "Friday",
          assetType: "Founder reflection",
          topic: "What the market is getting wrong this week",
          distribution: "LinkedIn thought post plus X summary",
        },
      ],
      ctaLibrary: [
        "Comment `teardown` and I will send the angle.",
        "If this sounds like your homepage, I can show the fix.",
        "Want the short version? I can break it down in one page.",
      ],
      repurposingWorkflow: [
        "Turn one teardown into a LinkedIn post, an X thread, and a short carousel.",
        "Convert one strong founder opinion into three narrower niche-specific hooks.",
        "Recycle winning post hooks into outreach openers and proof-led CTA lines.",
      ],
    }),
  });
}

export async function generateProposal(input: {
  clientName: string;
  clientType: string;
  projectType: string;
  desiredOutcome: string;
  scopeNotes?: string;
  timelinePreference?: string;
  pricingContext?: string;
  proofAssets?: string;
  serviceLine?: string;
  niche?: string;
  branding?: {
    brandName: string;
    tagLine: string;
    defaultServiceLine?: string;
    defaultNiche?: string;
    contactEmail: string;
    websiteUrl: string;
    signoffName: string;
    legalFooter: string;
    proposalVoice: string;
    pricingFootnote: string;
  };
}): Promise<AgentResult<ProposalGeneratorOutput>> {
  const clientName = input.clientName.trim() || "Client";
  const projectType = input.projectType.trim() || "Growth engagement";
  const outcome = input.desiredOutcome.trim() || "Create qualified pipeline and stronger conversion systems";
  const clientType = input.clientType.trim() || "Founder-led B2B company";
  const scopeNotes = input.scopeNotes?.trim() || "Audit, positioning, outreach, and approval-driven execution";
  const timelinePreference = input.timelinePreference?.trim() || "4 to 6 weeks";
  const pricingContext = input.pricingContext?.trim() || "Founder-friendly but outcome-oriented";
  const proofAssets = input.proofAssets?.trim() || "teardown insights, positioning strategy, approval-safe execution";
  const branding = input.branding;
  const serviceLine = input.serviceLine?.trim() || branding?.defaultServiceLine?.trim() || "outbound-acceleration";
  const niche = input.niche?.trim() || branding?.defaultNiche?.trim() || "B2B SaaS";
  const brandName = branding?.brandName?.trim() || "LeadForge AI";
  const tagLine = branding?.tagLine?.trim() || "Founder-grade growth systems";
  const signoffName = branding?.signoffName?.trim() || brandName;
  const websiteUrl = branding?.websiteUrl?.trim() || "https://leadforge.ai";
  const contactEmail = branding?.contactEmail?.trim() || "hello@leadforge.ai";
  const legalFooter = branding?.legalFooter?.trim() || "This proposal is confidential and intended only for the recipient team.";
  const proposalVoice = branding?.proposalVoice?.trim() || "Specific, premium, and operator-trustworthy";
  const pricingFootnote =
    branding?.pricingFootnote?.trim() || "Pricing is framed around leverage, execution quality, and commercial clarity.";
  const template = getProposalTemplate(serviceLine);
  const pricingLayout = getProposalPricingLayout(serviceLine, niche);

  return callAgent({
    schemaName: "proposal_generator",
    instructions: prompts.proposal,
    schema: proposalGeneratorSchema,
    input: {
      ...input,
      serviceLine,
      niche,
      selectedTemplate: template,
      selectedPricingLayout: pricingLayout,
      branding: {
        brandName,
        tagLine,
        signoffName,
        websiteUrl,
        contactEmail,
        legalFooter,
        proposalVoice,
        pricingFootnote,
      },
    },
    fallback: () => ({
      mode: "fallback",
      model: "demo-fallback-v1",
      proposalTitle: `${projectType} proposal for ${clientName}`,
      clientName,
      clientType,
      branding: {
        primaryColor: "#176b5d",
        secondaryColor: "#1e2521",
      },
      serviceLine,
      niche,
      templateName: template.name,
      executiveSummary: `${clientName} needs a sharper growth system built around clearer positioning, stronger conversion points, and specific outbound execution. This ${brandName} proposal focuses on shipping practical assets that move the business toward ${outcome} in a ${proposalVoice.toLowerCase()} tone.`,
      clientSituation: `${clientName} appears to be a ${clientType} that needs a more repeatable way to turn attention into qualified pipeline. The immediate opportunity is to tighten messaging, improve proof placement, and structure an approval-safe execution flow backed by ${tagLine.toLowerCase()}.`,
      goals: [
        `Move the business closer to ${outcome}`,
        "Clarify the homepage and offer narrative for serious buyers",
        "Generate usable outbound and client-ops assets without losing human review",
      ],
      scope: [
        `Core scope: ${scopeNotes}`,
        `Service line: ${template.name}`,
        "Lead research and website audit layer",
        "Positioning and outreach asset creation",
        "Review boundary and follow-up planning",
      ],
      deliverables: [
        "Website teardown and messaging recommendations",
        "Positioning and offer refinement notes",
        "Outreach drafts and follow-up angle set",
        "Client ops assets: Loom script, CRM note, sync-ready payload suggestions",
        ...template.reusableSections.map((item) => `Reusable section: ${item}`),
      ],
      timeline: [
        {
          phase: "Discovery and audit",
          duration: "Week 1",
          outcome: "Clarify the buyer, offer, website issues, and top leverage points.",
        },
        {
          phase: "Messaging and asset build",
          duration: "Week 2-3",
          outcome: "Create revised positioning, outreach assets, and proof-led conversion improvements.",
        },
        {
          phase: "Review and launch support",
          duration: "Week 4",
          outcome: "Finalize the assets, review execution readiness, and define the next operating loop.",
        },
      ],
      pricingOptions: [
        {
          name: "Starter",
          price: "$1,500",
          bestFor: "Founders who need a sharper message and a first outbound system.",
          includes: ["Website teardown", "Offer refinement", "1 outreach sequence"],
        },
        {
          name: "Growth Sprint",
          price: "$3,000",
          bestFor: "Teams that want positioning, audit, outreach, and client ops assets together.",
          includes: ["Everything in Starter", "Client ops payloads", "Approval-ready execution assets"],
        },
        {
          name: "Operator Partner",
          price: "$5,000+",
          bestFor: "Operators who want tighter iteration and deeper support over multiple cycles.",
          includes: ["Everything in Growth Sprint", "Weekly strategy review", "Expanded testing and iteration"],
        },
      ],
      assumptions: [
        `Preferred engagement window: ${timelinePreference}.`,
        `Pricing should feel ${pricingContext}.`,
        pricingFootnote,
        "Client feedback and approvals will be available with reasonable speed.",
      ],
      risksAndMitigations: [
        {
          risk: "Weak input clarity can slow the first strategy pass.",
          mitigation: "Use kickoff questions and teardown findings to lock the buyer and offer fast.",
        },
        {
          risk: "Execution can stall if approvals are vague.",
          mitigation: "Keep decisions tied to concrete drafts, proof points, and next actions.",
        },
      ],
      proofPoints: [
        `The proposal is grounded in ${proofAssets}.`,
        `${brandName} positioning: ${tagLine}.`,
        "The engagement stays practical and asset-oriented rather than vague strategy-only advice.",
        "Human review remains built into the execution boundary.",
      ],
      guaranteeBlock: template.guaranteeLanguage,
      caseStudyBlocks: template.caseStudyBlocks,
      pricingLayout: {
        title: pricingLayout.label,
        description: pricingLayout.description,
        priceAnchors: pricingLayout.priceAnchors,
      },
      cta: "If this direction fits, the next step is a short alignment call to confirm scope, timeline, and the first operating milestone.",
      coverEmail: {
        subject: `Proposal for ${clientName}`,
        body: `Hi ${clientName},\n\nI put together a proposal focused on ${outcome}. The goal is to give you a practical engagement structure with clear deliverables, timeline, and pricing options.\n\nIf the direction feels right, we can use a short call to lock scope and kickoff details.\n\n${tagLine}\n${websiteUrl}\n${contactEmail}\n\nBest,\n${signoffName}\n\n${legalFooter}`,
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
  founderContent:
    "You are a founder content strategist for B2B operators, agencies, and consultants. Given business context, target audience, offer, content goal, platforms, tone, and proof assets, generate a practical founder content engine. Focus on high-signal positioning, sharp hooks, proof-led posts, weekly publishing rhythm, reusable CTAs, and repurposing workflow. Avoid vague motivation, generic platitudes, and fake virality promises.",
  proposal:
    "You are a proposal strategist for founders, agencies, and B2B operators. Given client context, project type, desired outcome, scope notes, timeline preference, pricing context, proof assets, a selected service-line template, target niche, and a workspace branding profile, generate a sharp proposal package. Keep it practical, commercial, outcome-led, and consistent with the brand voice and positioning. Reuse the template's case-study block style, guarantee language, and niche-specific pricing layout. Include executive summary, client situation, goals, scope, deliverables, phased timeline, pricing options, assumptions, risks with mitigations, proof points, guarantee block, case-study blocks, pricing layout, CTA, and a short cover email.",
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

export type DiscoveryCandidate = {
  company: string;
  website: string | null;
  segment: string;
  sourceType: string;
  sourceUrl: string;
  evidence: string[];
  fitScore: number;
  auditHintScore: number | null;
  confidence: number;
  reason: string;
};

export type DiscoveryOutput = {
  summary: string;
  queryPlan: string[];
  sourcePolicy: {
    allowed: string[];
    blocked: string[];
    linkedin: string;
  };
  candidates: DiscoveryCandidate[];
};

export async function runLeadDiscovery(input: {
  targetMarket: string;
  playbook?: {
    product: string;
    idealCustomer: string;
    industries: string[];
    pains: string[];
    proofPoints: string[];
    tone: string;
    positioning: string | null;
  } | null;
}): Promise<AgentResult<DiscoveryOutput>> {
  const startedAt = Date.now();
  const discovery = buildDiscoveryPlan(input.targetMarket, input.playbook ?? null);

  return {
    data: discovery,
    mode: "fallback",
    model: "local-deterministic",
    latencyMs: Date.now() - startedAt,
    tokenCount: 0,
  };
}

function buildDiscoveryPlan(targetMarket: string, playbook: {
  industries?: string[];
  pains?: string[];
  proofPoints?: string[];
  tone?: string;
  product?: string;
  idealCustomer?: string;
  positioning?: string | null;
} | null) {
  const normalizedTarget = targetMarket.trim();
  const targetWords = normalizedTarget
    .split(/[,\s]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9-]/g, ""))
    .filter((word) => word.length > 2)
    .slice(0, 4);
  const slug = targetWords.join("-").toLowerCase() || "target-market";
  const targetTitle = toTitleCase(normalizedTarget);
  const industries = playbook?.industries?.length ? playbook.industries : [normalizedTarget];
  const primaryPain = playbook?.pains?.[0] ?? "manual qualification and inconsistent follow-up";
  const proof = playbook?.proofPoints?.[0] ?? "traceable research, scoring, and approval controls";
  const tone = playbook?.tone ?? "specific, useful, and concise";

  const sourcePolicy = {
    allowed: [
      "Company websites",
      "Search result snippets",
      "Public directories",
      "GitHub organisations",
      "Job posts",
      "News pages",
      "Public tech hints",
    ],
    blocked: [
      "Undetectable scraping",
      "Login-gated scraping",
      "CAPTCHA bypass",
      "LinkedIn automation without explicit user import",
    ],
    linkedin: "Manual CSV/import only. Do not automate LinkedIn browsing or messaging.",
  };

  const queryPlan = [
    `${normalizedTarget} companies ${industries[0]} case studies`,
    `${normalizedTarget} software platforms hiring revops operations`,
    `site:github.com/orgs ${normalizedTarget} company engineering`,
    `${normalizedTarget} startup funding news customer operations`,
    `${normalizedTarget} public directory ${playbook?.idealCustomer ?? "B2B teams"}`,
    `${normalizedTarget} careers ${primaryPain}`,
  ];

  const candidateSeeds = [
    {
      company: `${targetTitle} Operations Group`,
      sourceType: "company_website",
      sourceUrl: `https://${slug}-ops.example`,
      evidence: [
        `Website copy matches ${normalizedTarget}.`,
        `Likely pain: ${primaryPain}.`,
        `Outreach can reference ${proof}.`,
      ],
      scoreBump: 8,
    },
    {
      company: `${targetTitle} Systems Lab`,
      sourceType: "github_org",
      sourceUrl: `https://github.com/${slug}-systems`,
      evidence: [
        "Public GitHub organisation suggests an active technical team.",
        `Repository language indicates fit for ${playbook?.product ?? "AI-assisted RevOps workflows"}.`,
        "Use GitHub as context only, not as a personal-data source.",
      ],
      scoreBump: 3,
    },
    {
      company: `${targetTitle} Growth Partners`,
      sourceType: "public_directory",
      sourceUrl: `https://directory.example/${slug}`,
      evidence: [
        "Public directory listing indicates service or SaaS category fit.",
        `ICP overlap: ${playbook?.idealCustomer ?? "B2B teams with outbound motion"}.`,
        `Recommended tone: ${tone}.`,
      ],
      scoreBump: 0,
    },
    {
      company: `${targetTitle} Hiring Signal Co`,
      sourceType: "job_post",
      sourceUrl: `https://jobs.example/${slug}-operations`,
      evidence: [
        "Job post implies active investment in operations or growth roles.",
        "Hiring pages can create timely outreach triggers.",
        `Pain to validate: ${primaryPain}.`,
      ],
      scoreBump: -4,
    },
    {
      company: `${targetTitle} Market Notes`,
      sourceType: "news_page",
      sourceUrl: `https://news.example/${slug}-expansion`,
      evidence: [
        "News page creates a public trigger for timely outreach.",
        "Use the article as a citation candidate after human review.",
        `Potential angle: ${playbook?.positioning ?? "improve lead research and approved outreach quality"}.`,
      ],
      scoreBump: -8,
    },
  ];

  return {
    queryPlan,
    sourcePolicy,
    summary:
      "Discovery generated a professional query plan, compliant source boundaries, and scored candidate leads. LinkedIn remains manual-import only.",
    candidates: candidateSeeds.map((candidate, index) => {
      const fitScore = clampScore(82 + candidate.scoreBump + Math.min(playbook?.industries?.length ?? 0, 5));

      return {
        company: candidate.company,
        website: candidate.sourceType === "company_website" ? candidate.sourceUrl : null,
        segment: industries[index % industries.length] ?? normalizedTarget,
        sourceType: candidate.sourceType,
        sourceUrl: candidate.sourceUrl,
        evidence: candidate.evidence,
        fitScore,
        auditHintScore: candidate.sourceType === "company_website" ? clampScore(fitScore - 12) : null,
        confidence: Number((0.68 + index * 0.04).toFixed(2)),
        reason: `${candidate.company} appears relevant to ${normalizedTarget} because ${candidate.evidence[0]} Save only after reviewing the source.`,
      };
    }),
  };
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}
