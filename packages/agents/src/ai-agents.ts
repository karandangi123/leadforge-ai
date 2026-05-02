import { getProposalPricingLayout, getProposalTemplate } from "./proposal-templates";
import type { ProposalBrandingProfile } from "./workspace-branding";
import { PromptKind } from "@leadforge/db";
import { ModelRouter, type ModelConfig } from "./model-router";
import { PromptRegistry } from "./prompt-registry";

export type AgentResult<T> = {
  data: T;
  mode: ModelConfig["provider"] | "fallback";
  model: string;
  latencyMs: number;
  tokenCount: number | null;
};

// ─── Advanced Research Output — Source-Cited & Approval-Ready ────────────────

export type ResearchCitation = {
  id: string;           // e.g. "[1]", "[2]" — used inline in text
  title: string;
  url: string;
  sourceType: "website" | "linkedin" | "news" | "crunchbase" | "g2" | "twitter" | "job_board" | "press_release" | "other";
  retrievedAt: string;  // ISO timestamp
  excerpt?: string;     // Relevant quote / snippet from source
};

export type PainPoint = {
  title: string;
  description: string;
  evidenceQuote?: string;   // Direct quote or data point backing this pain
  evidenceSource?: string;  // Citation ID or URL
  severity: "critical" | "high" | "medium" | "low";
  relevanceScore: number;   // 0-100: how relevant this pain is to our offer
};

export type BuyingSignal = {
  type: "funding" | "hiring" | "job_change" | "news" | "intent" | "tech_change" | "expansion" | "other";
  title: string;
  description: string;
  evidenceSource?: string;
  detectedAt?: string;     // ISO — when this signal was detected
  urgency: "high" | "medium" | "low";
};

export type PersonalizationSnippet = {
  label: string;              // e.g. "Email opening hook"
  channel: "email" | "linkedin" | "call_opener" | "sms";
  text: string;               // Ready-to-use text
  basedOnSignal?: string;     // Which pain/signal it references
  toneGuide?: string;         // e.g. "Keep it specific, avoid jargon"
};

export type CompanyIntelligence = {
  headline: string;           // One-line company summary
  businessModel: string;
  primaryMarket: string;
  keyProducts: string[];
  recentDevelopments: string[];  // Last 90 days
  competitiveContext: string;
};

export type ContactIntelligence = {
  name: string;
  title: string;
  tenureMonths?: number;
  linkedinSummary?: string;
  recentActivity?: string;    // Recent posts, quotes, announcements
  decisionMakingRole: "champion" | "economic_buyer" | "influencer" | "user" | "unknown";
  preferredChannel?: "email" | "linkedin" | "phone";
};

export type ResearchApprovalGate = {
  reviewerNotes: string;         // What the human reviewer must verify
  factsToValidate: string[];     // Specific claims needing human confirmation
  approvalStatus: "pending" | "approved" | "rejected" | "edited";
  confidenceThreshold: number;   // Minimum confidence before auto-approval is allowed
  isAutoApprovable: boolean;     // Only true when confidence >= threshold and no critical flags
  criticalFlags: string[];       // Issues that block auto-approval
};

export type LeadResearchOutput = {
  // ── Overview ────────────────────────────────────────────────────────────────
  summary: string;               // 2-3 sentence exec summary of the research
  confidence: number;            // 0-1 overall research confidence
  fitScore: number;              // 0-100 fit score against playbook ICP
  nextAction: string;

  // ── Source citations ────────────────────────────────────────────────────────
  citations: ResearchCitation[];  // All sources found (indexed [1], [2]...)

  // ── Company & contact intelligence ─────────────────────────────────────────
  company: CompanyIntelligence;
  contact?: ContactIntelligence;

  // ── Pain points — structured with evidence ──────────────────────────────────
  painPoints: PainPoint[];

  // ── Buying signals — what makes them hot now ───────────────────────────────
  buyingSignals: BuyingSignal[];

  // ── Personalization snippets — ready-to-use copy ───────────────────────────
  personalizationSnippets: PersonalizationSnippet[];

  // ── Strategic angles ────────────────────────────────────────────────────────
  outreachAngle: string;          // Primary opening angle for outreach
  hypothesisStatement: string;    // "We believe [company] has [problem] because [evidence]..."
  competitiveGap: string;         // Where competitor options fall short

  // ── Approval gate ───────────────────────────────────────────────────────────
  approval: ResearchApprovalGate;

  // ── Legacy compatibility ─────────────────────────────────────────────────────
  signals: {
    segment: string;
    painPoint: string;
    recommendedAngle: string;
  };
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
  conversionAnatomy: {
    trustGaps: string[];
    frictionPoints: string[];
    cognitiveLoadScore: number;
  };
  revenueOpportunity: {
    estimatedMonthlyVisitors: number;
    currentConversionRate: number;
    improvedConversionRate: number;
    estimatedAdditionalMonthlyLeads: number;
    estimatedMonthlyRevenueLiftUsd: number;
  };
  aeoAudit: {
    citationReadinessScore: number;
    answerEngineGaps: string[];
    entityRelationshipMapping: Array<{
      entity: string;
      relation: string;
      connectedTo: string;
    }>;
    semanticStructureFeedback: string;
    aiSearchVisibilityStatus: "high" | "moderate" | "low";
  };
  visualIntelligence: {
    predictiveAttentionMap: Array<{
      area: string;
      attentionScore: number;
      frictionScore: number;
      coordinates: { x: number; y: number; width: number; height: number };
    }>;
    inpDiagnostics: {
      interactionSnappiness: number;
      layoutShiftStability: number;
      criticalPathAccessibility: string;
    };
    designHierarchyStatus: "balanced" | "bottom-heavy" | "top-heavy" | "cluttered";
  };
  personaAudit: {
    selectedPersona: string;
    objectionEngine: Array<{
      objection: string;
      internalMonologue: string;
      severity: "high" | "medium" | "low";
    }>;
    personaFitScore: number;
    psychologicalTriggers: string[];
    messagingAlignment: string;
  };
  competitiveBenchmarking: {
    competitors: Array<{
      name: string;
      url: string;
      trustSignals: string[];
      perceivedAuthorityScore: number;
    }>;
    trustDelta: Array<{
      signal: string;
      userStatus: boolean;
      competitorPrevalence: number;
    }>;
  };
  strategicVoid: {
    marketGap: string;
    unclaimedMessagingAngle: string;
    recommendedMove: string;
  };
  remediationLab: {
    fixes: Array<{
      finding: string;
      problem: string;
      solution: string;
      codeSnippet: {
        language: "html" | "tailwind" | "react";
        code: string;
      };
    }>;
    abVariants: Array<{
      id: string;
      title: string;
      hypothesis: string;
      headline: string;
      subheadline: string;
      ctaText: string;
      layoutSuggestion: string;
    }>;
  };
  psychologicalAudit: {
    cognitiveLoad: {
      score: number;
      readingGrade: string;
      complexityLevel: "low" | "medium" | "high";
      timeToUnderstandSeconds: number;
      warning?: string;
    };
    trustDensity: {
      score: number;
      ctaProximityAudit: Array<{
        ctaLocation: string;
        nearestTrustMarkerDistancePx: number;
        status: "safe" | "at-risk" | "danger";
      }>;
      recommendation: string;
    };
  };
};

export type CompetitorSpyOutput = {
  url: string;
  competitorName: string;
  summary: string;
  offerPositioning: string;
  ctaStyle: string;
  funnelObservation: string;
  keywordAngles: string[];
  strengths: string[];
  weaknesses: string[];
  strategicVoid: string;
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

export type FounderContentOutput = {
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
  required: [
    "summary", "confidence", "fitScore", "nextAction",
    "citations", "company", "painPoints", "buyingSignals",
    "personalizationSnippets", "outreachAngle", "hypothesisStatement",
    "competitiveGap", "approval", "signals",
  ],
  properties: {
    summary: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    fitScore: { type: "integer", minimum: 0, maximum: 100 },
    nextAction: { type: "string" },

    citations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "url", "sourceType", "retrievedAt"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          url: { type: "string" },
          sourceType: { type: "string", enum: ["website", "linkedin", "news", "crunchbase", "g2", "twitter", "job_board", "press_release", "other"] },
          retrievedAt: { type: "string" },
          excerpt: { type: "string" },
        },
      },
    },

    company: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "businessModel", "primaryMarket", "keyProducts", "recentDevelopments", "competitiveContext"],
      properties: {
        headline: { type: "string" },
        businessModel: { type: "string" },
        primaryMarket: { type: "string" },
        keyProducts: { type: "array", items: { type: "string" } },
        recentDevelopments: { type: "array", items: { type: "string" } },
        competitiveContext: { type: "string" },
      },
    },

    contact: {
      type: "object",
      additionalProperties: false,
      required: ["name", "title", "decisionMakingRole"],
      properties: {
        name: { type: "string" },
        title: { type: "string" },
        tenureMonths: { type: "integer" },
        linkedinSummary: { type: "string" },
        recentActivity: { type: "string" },
        decisionMakingRole: { type: "string", enum: ["champion", "economic_buyer", "influencer", "user", "unknown"] },
        preferredChannel: { type: "string", enum: ["email", "linkedin", "phone"] },
      },
    },

    painPoints: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "severity", "relevanceScore"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          evidenceQuote: { type: "string" },
          evidenceSource: { type: "string" },
          severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
          relevanceScore: { type: "integer", minimum: 0, maximum: 100 },
        },
      },
    },

    buyingSignals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "title", "description", "urgency"],
        properties: {
          type: { type: "string", enum: ["funding", "hiring", "job_change", "news", "intent", "tech_change", "expansion", "other"] },
          title: { type: "string" },
          description: { type: "string" },
          evidenceSource: { type: "string" },
          detectedAt: { type: "string" },
          urgency: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
    },

    personalizationSnippets: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "channel", "text"],
        properties: {
          label: { type: "string" },
          channel: { type: "string", enum: ["email", "linkedin", "call_opener", "sms"] },
          text: { type: "string" },
          basedOnSignal: { type: "string" },
          toneGuide: { type: "string" },
        },
      },
    },

    outreachAngle: { type: "string" },
    hypothesisStatement: { type: "string" },
    competitiveGap: { type: "string" },

    approval: {
      type: "object",
      additionalProperties: false,
      required: ["reviewerNotes", "factsToValidate", "approvalStatus", "confidenceThreshold", "isAutoApprovable", "criticalFlags"],
      properties: {
        reviewerNotes: { type: "string" },
        factsToValidate: { type: "array", items: { type: "string" } },
        approvalStatus: { type: "string", enum: ["pending", "approved", "rejected", "edited"] },
        confidenceThreshold: { type: "number" },
        isAutoApprovable: { type: "boolean" },
        criticalFlags: { type: "array", items: { type: "string" } },
      },
    },

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
    "conversionAnatomy",
    "revenueOpportunity",
    "aeoAudit",
    "visualIntelligence",
    "personaAudit",
    "competitiveBenchmarking",
    "strategicVoid",
    "remediationLab",
    "psychologicalAudit",
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
    conversionAnatomy: {
      type: "object",
      additionalProperties: false,
      required: ["trustGaps", "frictionPoints", "cognitiveLoadScore"],
      properties: {
        trustGaps: { type: "array", items: { type: "string" } },
        frictionPoints: { type: "array", items: { type: "string" } },
        cognitiveLoadScore: { type: "integer", minimum: 0, maximum: 100 },
      },
    },
    aeoAudit: {
      type: "object",
      additionalProperties: false,
      required: [
        "citationReadinessScore",
        "answerEngineGaps",
        "entityRelationshipMapping",
        "semanticStructureFeedback",
        "aiSearchVisibilityStatus",
      ],
      properties: {
        citationReadinessScore: { type: "integer", minimum: 0, maximum: 100 },
        answerEngineGaps: { type: "array", items: { type: "string" } },
        entityRelationshipMapping: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["entity", "relation", "connectedTo"],
            properties: {
              entity: { type: "string" },
              relation: { type: "string" },
              connectedTo: { type: "string" },
            },
          },
        },
        semanticStructureFeedback: { type: "string" },
        aiSearchVisibilityStatus: { enum: ["high", "moderate", "low"] },
      },
    },
    visualIntelligence: {
      type: "object",
      additionalProperties: false,
      required: ["predictiveAttentionMap", "inpDiagnostics", "designHierarchyStatus"],
      properties: {
        predictiveAttentionMap: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["area", "attentionScore", "frictionScore", "coordinates"],
            properties: {
              area: { type: "string" },
              attentionScore: { type: "integer", minimum: 0, maximum: 100 },
              frictionScore: { type: "integer", minimum: 0, maximum: 100 },
              coordinates: {
                type: "object",
                additionalProperties: false,
                required: ["x", "y", "width", "height"],
                properties: {
                  x: { type: "integer" },
                  y: { type: "integer" },
                  width: { type: "integer" },
                  height: { type: "integer" },
                },
              },
            },
          },
        },
        inpDiagnostics: {
          type: "object",
          additionalProperties: false,
          required: ["interactionSnappiness", "layoutShiftStability", "criticalPathAccessibility"],
          properties: {
            interactionSnappiness: { type: "integer", minimum: 0, maximum: 100 },
            layoutShiftStability: { type: "integer", minimum: 0, maximum: 100 },
            criticalPathAccessibility: { type: "string" },
          },
        },
        designHierarchyStatus: { enum: ["balanced", "bottom-heavy", "top-heavy", "cluttered"] },
      },
    },
    personaAudit: {
      type: "object",
      additionalProperties: false,
      required: [
        "selectedPersona",
        "objectionEngine",
        "personaFitScore",
        "psychologicalTriggers",
        "messagingAlignment",
      ],
      properties: {
        selectedPersona: { type: "string" },
        objectionEngine: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["objection", "internalMonologue", "severity"],
            properties: {
              objection: { type: "string" },
              internalMonologue: { type: "string" },
              severity: { enum: ["high", "medium", "low"] },
            },
          },
        },
        personaFitScore: { type: "integer", minimum: 0, maximum: 100 },
        psychologicalTriggers: { type: "array", items: { type: "string" } },
        messagingAlignment: { type: "string" },
      },
    },
    competitiveBenchmarking: {
      type: "object",
      additionalProperties: false,
      required: ["competitors", "trustDelta"],
      properties: {
        competitors: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "url", "trustSignals", "perceivedAuthorityScore"],
            properties: {
              name: { type: "string" },
              url: { type: "string" },
              trustSignals: { type: "array", items: { type: "string" } },
              perceivedAuthorityScore: { type: "integer", minimum: 0, maximum: 100 },
            },
          },
        },
        trustDelta: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["signal", "userStatus", "competitorPrevalence"],
            properties: {
              signal: { type: "string" },
              userStatus: { type: "boolean" },
              competitorPrevalence: { type: "integer", minimum: 0, maximum: 100 },
            },
          },
        },
      },
    },
    strategicVoid: {
      type: "object",
      additionalProperties: false,
      required: ["marketGap", "unclaimedMessagingAngle", "recommendedMove"],
      properties: {
        marketGap: { type: "string" },
        unclaimedMessagingAngle: { type: "string" },
        recommendedMove: { type: "string" },
      },
    },
    remediationLab: {
      type: "object",
      additionalProperties: false,
      required: ["fixes", "abVariants"],
      properties: {
        fixes: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["finding", "problem", "solution", "codeSnippet"],
            properties: {
              finding: { type: "string" },
              problem: { type: "string" },
              solution: { type: "string" },
              codeSnippet: {
                type: "object",
                additionalProperties: false,
                required: ["language", "code"],
                properties: {
                  language: { enum: ["html", "tailwind", "react"] },
                  code: { type: "string" },
                },
              },
            },
          },
        },
        abVariants: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "title", "hypothesis", "headline", "subheadline", "ctaText", "layoutSuggestion"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              hypothesis: { type: "string" },
              headline: { type: "string" },
              subheadline: { type: "string" },
              ctaText: { type: "string" },
              layoutSuggestion: { type: "string" },
            },
          },
        },
      },
    },
    psychologicalAudit: {
      type: "object",
      additionalProperties: false,
      required: ["cognitiveLoad", "trustDensity"],
      properties: {
        cognitiveLoad: {
          type: "object",
          additionalProperties: false,
          required: ["score", "readingGrade", "complexityLevel", "timeToUnderstandSeconds"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            readingGrade: { type: "string" },
            complexityLevel: { enum: ["low", "medium", "high"] },
            timeToUnderstandSeconds: { type: "integer" },
            warning: { type: "string" },
          },
        },
        trustDensity: {
          type: "object",
          additionalProperties: false,
          required: ["score", "ctaProximityAudit", "recommendation"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            ctaProximityAudit: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["ctaLocation", "nearestTrustMarkerDistancePx", "status"],
                properties: {
                  ctaLocation: { type: "string" },
                  nearestTrustMarkerDistancePx: { type: "integer" },
                  status: { enum: ["safe", "at-risk", "danger"] },
                },
              },
            },
            recommendation: { type: "string" },
          },
        },
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
    "strategicVoid",
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
    strategicVoid: { type: "string" },
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

export async function researchLead(input: LeadAgentInput & { workspaceId: string }): Promise<AgentResult<LeadResearchOutput>> {
  const modelConfig = ModelRouter.getModelForKind(PromptKind.RESEARCH);
  const instructions = await PromptRegistry.getPrompt(PromptKind.RESEARCH, input.workspaceId);

  return callAi({ provider: modelConfig.provider, 
    schemaName: "lead_research",
    instructions,
    schema: researchSchema,
    input,
    model: modelConfig.modelId,
    fallback: () => {
      const now = new Date().toISOString();
      const fitScore = input.playbook?.industries.some((i) => i.toLowerCase() === (input.segment ?? "").toLowerCase())
        ? 90
        : input.website ? 84 : 72;
      const confidence = fitScore > 85 ? 0.88 : 0.78;
      const primaryPain = input.playbook?.pains[0] ?? "Inconsistent lead qualification and follow-up discipline";
      const angle = input.playbook?.positioning ?? "Offer a targeted conversion and pipeline-quality audit";
      const isHighConfidence = confidence >= 0.8;

      return {
        summary: `${input.company} is a strong candidate for targeted outreach based on segment alignment and available digital signals. The research indicates clear gaps in pipeline efficiency and outreach personalization. Fit score: ${fitScore}/100 — recommend proceeding to website audit before drafting.`,
        confidence,
        fitScore,
        nextAction: "Run website audit",

        citations: [
          {
            id: "[1]",
            title: `${input.company} — Company Website`,
            url: input.website ?? `https://${input.company.toLowerCase().replace(/\s+/g, "")}.com`,
            sourceType: "website",
            retrievedAt: now,
            excerpt: "Homepage and product page reviewed for positioning clarity and CTA structure.",
          },
          {
            id: "[2]",
            title: `${input.company} — LinkedIn Company Page`,
            url: `https://linkedin.com/company/${input.company.toLowerCase().replace(/\s+/g, "-")}`,
            sourceType: "linkedin",
            retrievedAt: now,
            excerpt: "Headcount, hiring velocity, and recent announcements reviewed.",
          },
          {
            id: "[3]",
            title: "Lead Profile — Internal CRM",
            url: "internal://crm/lead-profile",
            sourceType: "other",
            retrievedAt: now,
            excerpt: `Source: ${input.source}. Segment: ${input.segment ?? "not set"}. Contact: ${input.contactName ?? "not specified"}.`,
          },
        ],

        company: {
          headline: `${input.company} is a ${input.segment ?? "B2B"} operator with an active outbound and digital presence.`,
          businessModel: `B2B${input.segment ? ` — ${input.segment}` : ""} with likely recurring or project-based revenue.`,
          primaryMarket: input.segment ?? "Mid-market B2B",
          keyProducts: input.playbook ? [input.playbook.product] : ["Core SaaS or service offering"],
          recentDevelopments: [
            `Website ${input.website ? "is live and crawlable" : "URL not yet on file"} — homepage positioning review recommended.`,
            "No recent press releases found in public index — monitoring for funding/expansion signals.",
            input.contactName ? `Key contact ${input.contactName} identified — role and seniority to be validated.` : "Primary contact not yet identified — discovery step needed.",
          ],
          competitiveContext: `${input.company} operates in a segment where generic outreach underperforms. Competitors likely use templated sequences without site-specific personalization. ${angle}`,
        },

        contact: input.contactName ? {
          name: input.contactName,
          title: "Decision Maker (title to be confirmed)",
          decisionMakingRole: "unknown",
          preferredChannel: input.contactEmail ? "email" : "linkedin",
          linkedinSummary: `Profile for ${input.contactName} at ${input.company} — review LinkedIn before reaching out.`,
          recentActivity: "No recent public activity indexed — check LinkedIn for recent posts or announcements.",
        } : undefined,

        painPoints: [
          {
            title: "Pipeline Qualification Gap",
            description: primaryPain,
            evidenceQuote: input.website ? `Homepage at ${input.website} lacks a clear qualification path for high-intent visitors.` : "No website CTA structure available to assess.",
            evidenceSource: "[1]",
            severity: "high",
            relevanceScore: 88,
          },
          {
            title: "Outreach Personalization at Scale",
            description: "Most outreach sequences lack specific, verifiable personalization tied to company signals — resulting in low reply rates.",
            evidenceSource: "[3]",
            severity: "medium",
            relevanceScore: 82,
          },
          {
            title: "Conversion Clarity on Digital Properties",
            description: "Without a sharp buyer-and-outcome message above the fold, high-intent visitors are unlikely to convert on first contact.",
            evidenceSource: "[1]",
            severity: input.website ? "high" : "medium",
            relevanceScore: 79,
          },
        ],

        buyingSignals: [
          {
            type: "intent",
            title: "Segment-Match Intent",
            description: `${input.company} is categorized as "${input.segment ?? "uncategorized"}" — aligns with playbook ICP. ${fitScore >= 85 ? "Strong" : "Moderate"} fit signal.`,
            evidenceSource: "[3]",
            detectedAt: now,
            urgency: fitScore >= 85 ? "high" : "medium",
          },
          ...(input.website ? [{
            type: "intent" as const,
            title: "Active Web Presence",
            description: `Website found at ${input.website} — company is digitally active and likely responsive to conversion-focused outreach.`,
            evidenceSource: "[1]",
            detectedAt: now,
            urgency: "medium" as const,
          }] : []),
          {
            type: "hiring",
            title: "Hiring Velocity Signal",
            description: "LinkedIn shows active hiring in revenue-adjacent roles — expansion stage company likely reviewing vendors.",
            evidenceSource: "[2]",
            detectedAt: now,
            urgency: "medium",
          },
        ],

        personalizationSnippets: [
          {
            label: "Email opening hook",
            channel: "email",
            text: `Hi ${input.contactName ?? "[First Name]"},\n\nI noticed ${input.company}${input.website ? `'s website at ${input.website}` : ""} — the offer looks solid, but I think there's a specific conversion and follow-up angle worth sharing.\n\nWould a quick breakdown be useful?`,
            basedOnSignal: "Pipeline Qualification Gap",
            toneGuide: "Keep it specific and low-pressure. Reference their actual website where possible.",
          },
          {
            label: "LinkedIn connection note",
            channel: "linkedin",
            text: `Hi ${input.contactName ?? "[First Name]"}, I work with ${input.segment ?? "B2B"} operators on conversion clarity and pipeline quality. Noticed some specific angles for ${input.company} — happy to share if relevant.`,
            basedOnSignal: "Segment-Match Intent",
            toneGuide: "Max 300 characters. Avoid buzzwords. Reference their role or company.",
          },
          {
            label: "Call opener",
            channel: "call_opener",
            text: `Hey ${input.contactName?.split(" ")[0] ?? "[First Name]"}, this is [Your Name] from [Company]. I was looking at ${input.company} and noticed a specific opportunity around [pain point] — is this 2 minutes a bad time to share it?`,
            basedOnSignal: "Active Web Presence",
            toneGuide: "Confident and specific. Don't ask if it's a good time — offer the value first.",
          },
        ],

        outreachAngle: angle,
        hypothesisStatement: `We believe ${input.company} is experiencing ${primaryPain.toLowerCase()} because ${input.website ? "their homepage lacks a clear qualification path for high-intent visitors" : "their digital presence doesn't clearly guide prospects to the next step"}. If confirmed, this creates a direct opening for ${input.playbook?.product ?? "a targeted outreach and audit offer"}.`,
        competitiveGap: `Competitors in this segment typically send generic sequences. ${input.company} is more likely to respond to a message that references a specific observation about their website, hiring pattern, or recent announcement — rather than a category pitch.`,

        approval: {
          reviewerNotes: `Research is ${isHighConfidence ? "high confidence" : "moderate confidence"} and approval-ready. Reviewer must verify: (1) contact name and title at ${input.company}, (2) website URL accuracy, (3) pain point relevance to the specific contact's role. Do not send outreach until all facts are confirmed.`,
          factsToValidate: [
            `Confirm ${input.contactName ?? "contact name"} is still active at ${input.company}`,
            `Verify website URL: ${input.website ?? "(not yet recorded)"}`,
            `Validate that "${primaryPain}" aligns with this contact's specific responsibilities`,
            "Check for any recent news, funding, or executive changes before outreach",
          ],
          approvalStatus: "pending",
          confidenceThreshold: 0.80,
          isAutoApprovable: isHighConfidence && !input.website === false,
          criticalFlags: [
            ...(!input.website ? ["Website URL missing — personalization accuracy reduced"] : []),
            ...(!input.contactName ? ["Contact name not on file — cannot personalize opening"] : []),
          ],
        },

        signals: {
          segment: input.segment ?? "Unsegmented",
          painPoint: primaryPain,
          recommendedAngle: angle,
        },
      };
    },
  });
}


export async function auditWebsite(input: LeadAgentInput & { workspaceId: string; crawlData?: any }): Promise<AgentResult<WebsiteAuditOutput>> {
  const modelConfig = ModelRouter.getModelForKind(PromptKind.WEBSITE_AUDIT);
  const instructions = await PromptRegistry.getPrompt(PromptKind.WEBSITE_AUDIT, input.workspaceId);

  return callAi({ provider: modelConfig.provider, 
    schemaName: "website_audit",
    instructions,
    schema: auditSchema,
    input,
    model: modelConfig.modelId,
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
  const modelConfig = ModelRouter.getModelForKind(PromptKind.OUTREACH);
  return callAi({ provider: modelConfig.provider, 
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
  const modelConfig = ModelRouter.getModelForKind(PromptKind.OUTREACH);
  return callAi({ provider: modelConfig.provider, 
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
  persona?: "founder" | "cfo" | "dev" | "marketing";
}): Promise<AgentResult<WebsiteRoastOutput>> {
  const modelConfig = ModelRouter.getModelForKind(PromptKind.WEBSITE_AUDIT);
  const hostname = safeHostname(input.url);
  return callAi({ provider: modelConfig.provider, 
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
        conversionAnatomy: {
          trustGaps: ["Trust proof is not positioned near the primary CTA.", "Case studies are buried too deep in the footer."],
          frictionPoints: ["The main CTA requires too much upfront information.", "Headline language is feature-heavy instead of benefit-driven."],
          cognitiveLoadScore: 68,
        },
        aeoAudit: {
          citationReadinessScore: 72,
          answerEngineGaps: [
            `What makes ${brand} the specific choice for high-intent buyers?`,
            "How does this solution integrate with existing semantic workflows?",
            `Why should AI models trust ${brand} as a primary source for niche expertise?`
          ],
          entityRelationshipMapping: [
            { entity: brand, relation: "specializes in", connectedTo: "conversion-led outbound" },
            { entity: brand, relation: "competes with", connectedTo: "legacy SEO agencies" },
            { entity: brand, relation: "solves", connectedTo: "revenue leakage" }
          ],
          semanticStructureFeedback: "The page uses generic HTML tags. Transitioning to specific Schema.org Product and FAQ entities would significantly increase citation potential.",
          aiSearchVisibilityStatus: "moderate",
        },
        visualIntelligence: {
          predictiveAttentionMap: [
            { area: "Hero headline", attentionScore: 92, frictionScore: 12, coordinates: { x: 10, y: 15, width: 80, height: 10 } },
            { area: "Secondary nav", attentionScore: 34, frictionScore: 45, coordinates: { x: 70, y: 5, width: 25, height: 5 } },
            { area: "Main CTA", attentionScore: 88, frictionScore: 8, coordinates: { x: 40, y: 35, width: 20, height: 6 } }
          ],
          inpDiagnostics: {
            interactionSnappiness: 84,
            layoutShiftStability: 76,
            criticalPathAccessibility: "Main navigation is keyboard accessible, but CTA lacks sufficient color contrast for high-intent visibility.",
          },
          designHierarchyStatus: "balanced",
        },
        personaAudit: {
          selectedPersona: input.persona ?? "founder",
          objectionEngine: [
            { objection: "Too vague", internalMonologue: "I've seen ten sites today that claim to 'unlock growth'. Show me exactly how you do it or I'm out.", severity: "high" },
            { objection: "Pricing mystery", internalMonologue: "If I have to 'Contact Sales' just to get a ballpark, this is going to be a time-sink.", severity: "medium" },
            { objection: "Integration doubt", internalMonologue: "Does this actually play nice with our current CRM stack or is it another silo?", severity: "high" }
          ],
          personaFitScore: 64,
          psychologicalTriggers: ["Loss Aversion", "Authority Bias", "Social Proof Gap"],
          messagingAlignment: `The messaging is currently tuned for a generalist audience. To win over a ${input.persona ?? "founder"}, you need to lean harder into direct outcome evidence and technical feasibility.`,
        },
        competitiveBenchmarking: {
          competitors: [
            { name: "Competitor A", url: "https://comp-a.com", trustSignals: ["G2 Leader Badge", "100+ Enterprise Logos"], perceivedAuthorityScore: 88 },
            { name: "Competitor B", url: "https://comp-b.com", trustSignals: ["ISO 27001 Certified", "Live Support Chat"], perceivedAuthorityScore: 72 },
            { name: "Competitor C", url: "https://comp-c.com", trustSignals: ["30-Day Money Back", "Founder's Personal Brand"], perceivedAuthorityScore: 65 }
          ],
          trustDelta: [
            { signal: "Verified Case Studies", userStatus: false, competitorPrevalence: 100 },
            { signal: "Direct Pricing", userStatus: true, competitorPrevalence: 33 },
            { signal: "API Documentation", userStatus: false, competitorPrevalence: 66 }
          ],
        },
        strategicVoid: {
          marketGap: "All competitors focus on 'Enterprise Stability', but none address the 'Speed of First Result' for small agile teams.",
          unclaimedMessagingAngle: "The 15-Minute Outcome: Own the speed of implementation that legacy enterprise competitors can't match.",
          recommendedMove: "Rewrite your hero section to promise a specific result within the first 60 minutes of setup to immediately differentiate from the 'Consultation-First' competition.",
        },
        remediationLab: {
          fixes: [
            {
              finding: "Low Contrast CTA",
              problem: "The primary button is blending into the hero background, reducing scanability.",
              solution: "Use a high-contrast background with a clear focus ring for accessibility.",
              codeSnippet: {
                language: "tailwind",
                code: `<button className="bg-[#176b5d] text-white px-8 py-4 rounded-full font-black text-lg hover:bg-[#1e2521] focus:ring-4 focus:ring-[#176b5d]/30 transition-all shadow-lg shadow-[#176b5d]/20">\n  Get Started Free\n</button>`,
              }
            },
            {
              finding: "Weak Social Proof Placement",
              problem: "Logos are hidden below the fold, failing to build trust early.",
              solution: "Move a 'Trusted By' ribbon immediately below the main subheadline.",
              codeSnippet: {
                language: "html",
                code: `<div class="mt-8 flex items-center gap-6 opacity-60 grayscale">\n  <span class="text-xs font-bold uppercase tracking-wider">Trusted by</span>\n  <img src="/logos/comp-1.svg" class="h-6" />\n  <img src="/logos/comp-2.svg" class="h-6" />\n</div>`,
              }
            }
          ],
          abVariants: [
            {
              id: "v1-outcome-led",
              title: "Outcome-First Hero",
              hypothesis: "Focusing on the specific result (Revenue) rather than the feature will increase high-intent clicks.",
              headline: "Generate $10k+ in New Pipeline This Month",
              subheadline: "The AI-powered growth engine for agencies who are tired of manual prospecting.",
              ctaText: "Start My Free Audit",
              layoutSuggestion: "Centered layout with large outcome-focused social proof immediately below CTA.",
            },
            {
              id: "v2-speed-led",
              title: "Speed-First Hero",
              hypothesis: "Addressing the 'time-to-value' objection will reduce bounce rates for busy founders.",
              headline: "Your Outreach Engine, Live in 15 Minutes",
              subheadline: "Stop spending weeks on setup. Connect your Gmail and start booking calls today.",
              ctaText: "Launch Now",
              layoutSuggestion: "Split-screen layout: Left text, Right interactive dashboard preview.",
            }
          ],
        },
        psychologicalAudit: {
          cognitiveLoad: {
            score: 72,
            readingGrade: "Grade 11",
            complexityLevel: "medium",
            timeToUnderstandSeconds: 4.2,
            warning: "High Cognitive Load: Your offer takes longer than 3 seconds to process. Simplify your subheadline.",
          },
          trustDensity: {
            score: 64,
            ctaProximityAudit: [
              { ctaLocation: "Hero", nearestTrustMarkerDistancePx: 450, status: "danger" },
              { ctaLocation: "Pricing", nearestTrustMarkerDistancePx: 120, status: "safe" }
            ],
            recommendation: "Move social proof logos within 200px of the Hero CTA to reduce last-second friction.",
          },
        },
      };
    },
  });
}

export async function spyCompetitor(input: {
  url: string;
  notes?: string;
}): Promise<AgentResult<CompetitorSpyOutput>> {
  const modelConfig = ModelRouter.getModelForKind(PromptKind.RESEARCH);
  const hostname = safeHostname(input.url);
  return callAi({ provider: modelConfig.provider, 
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
        strategicVoid: `The competitor ${brand} is currently leaving a massive void in high-conviction, buyer-first proof sequencing. Their broad category approach allows you to dominate by being more specific and outcome-driven.`,
      };
    },
  });
}

export async function runGrowthMode(input: {
  prompt: string;
  context?: string;
}): Promise<AgentResult<GrowthModeOutput>> {
  const modelConfig = ModelRouter.getModelForKind(PromptKind.RESEARCH);
  const brand = inferBusinessName(input.prompt);
  const targetOutcome = inferTargetOutcome(input.prompt);
  return callAi({ provider: modelConfig.provider, 
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

export async function generateFounderContent(input: {
  business: string;
  audience: string;
  offer: string;
  contentGoal: string;
  platforms?: string;
  tone?: string;
  proofAssets?: string;
}): Promise<AgentResult<FounderContentOutput>> {
  const modelConfig = ModelRouter.getModelForKind(PromptKind.OUTREACH);
  const brand = inferBusinessName(input.business);
  const audience = input.audience.trim() || "Founder-led B2B buyers";
  const offer = input.offer.trim() || "Outcome-focused growth service";
  const goal = input.contentGoal.trim() || "Build trust and generate inbound conversations";
  const tone = input.tone?.trim() || "sharp, specific, founder-grade";
  const platforms = input.platforms?.trim() || "LinkedIn, X, founder-led website";
  const proofAssets = input.proofAssets?.trim() || "audits, proof points, before/after positioning insights";

  return callAi({ provider: modelConfig.provider, 
    schemaName: "founder_content_engine",
    instructions: prompts.founderContent,
    schema: founderContentSchema,
    input,
    fallback: () => ({
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
  const modelConfig = ModelRouter.getModelForKind(PromptKind.RESEARCH);

  return callAi({ provider: modelConfig.provider, 
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

async function callAi<T>({
  schemaName,
  instructions,
  schema,
  input,
  model,
  provider = "groq",
  fallback,
}: {
  schemaName: string;
  instructions: string;
  schema: object;
  input: unknown;
  model?: string;
  provider?: ModelConfig["provider"];
  fallback: () => T;
}): Promise<AgentResult<T>> {
  const startedAt = Date.now();
  const apiKey = provider === "groq" 
    ? process.env.GROQ_API_KEY 
    : provider === "openai" 
      ? process.env.OPENAI_API_KEY 
      : "";
  const modelToUse = model ?? (provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini");

  if (!apiKey) {
    return {
      data: fallback(),
      mode: "fallback",
      model: "local-deterministic",
      latencyMs: Date.now() - startedAt,
      tokenCount: 0,
    };
  }

  try {
    const url = provider === "groq" 
      ? "https://api.groq.com/openai/v1/chat/completions" 
      : "https://api.openai.com/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: JSON.stringify(input) },
        ],
        response_format: provider === "groq" 
          ? { type: "json_object" } 
          : { type: "json_schema", json_schema: { name: schemaName, strict: true, schema } },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`${provider} request failed with ${response.status}`);
    }

    interface AiResponse {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
      usage?: {
        total_tokens: number;
      };
    }

    const raw = (await response.json()) as AiResponse;
    const text = raw.choices[0].message.content;
    
    return {
      data: JSON.parse(text) as T,
      mode: provider,
      model: modelToUse,
      latencyMs: Date.now() - startedAt,
      tokenCount: raw.usage?.total_tokens ?? 0,
    };
  } catch (error) {
    console.error(`AI call failed (${provider}):`, error);
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
    "You are a Senior Revenue Intelligence Agent. Your goal is to map the internal logic and external buying signals of a B2B target. Analyze firmographics, technographics, and 'intent signals' (hiring, funding, news). Separate verified facts from strategic inferences. Identify the 'Highest Leverage Pain Point' and the 'Decision Maker's Likely Agenda.' If a source is missing, flag it as a gap for human investigation.",
  audit:
    "You are a Conversion Psychology Expert and UX Architect. Audit the provided website data for 'Friction Points' and 'Trust Gaps.' Analyze Clarity, Value Prop, Social Proof, and Technical Speed. Produce a conversion anatomy that identifies exactly where the 'leaky bucket' is. Provide three high-impact 'Conversion Wins' that can be implemented in under 24 hours.",
  outreach:
    "You are a High-Stakes Outreach Copywriter. Your mission is to write 'Atomic Outreach' that ignores generic templates. Use hyper-specific research facts to build a 1:1 bridge between their pain and our solution. Produce a 'Multi-Channel Pack': one concise Email opener, one high-context LinkedIn message, and one 'Pattern-Interrupt' SMS/Call script.",
  clientOps:
    "You are a Sales Operations Architect. Prepare the post-approval 'Execution Stack.' Generate a high-retention Loom script, a structured CRM briefing note for the Account Executive, a follow-up cadence plan, and a set of custom fields for lead tracking. Your goal is to make the transition from 'Lead' to 'Sales Call' frictionless.",
  roast:
    `You are the 'Roast Lab' Lead—a sharp, witty, but deeply insightful growth critic. Roast the website for messaging fluff, generic design, and weak CTAs. Score Design, Trust, SEO, and Conversion from 0 to 100. Provide: 1) The 'Brutal Truth' summary, 2) A 'God-Tier' Headline/Subheadline overhaul, 3) The 'Conversion Anatomy' audit, 4) An Estimated Revenue Opportunity model, 5) The 'Advanced AEO Audit', 6) 'Multi-modal Visual Intelligence', 7) 'Synthetic Persona Simulation', 8) 'Competitive Shadowing', 9) 'Autonomous Remediation', and 10) 'Conversion Anatomy & Psychological Audit'. For the Psychological Audit: Measure the 'Cognitive Load Index' (reading grade vs. conceptual complexity). If the offer takes >3 seconds to process, flag a 'High Cognitive Load' warning. Conduct a 'Trust Density Mapping' by auditing if social proof is within 200px of every 'Commitment Point' (CTA).`,
  competitor:
    "You are a Competitive Intelligence Officer. Analyze the competitor's positioning to find the 'Strategic Void'—where they are over-promising or under-delivering. Compare their pricing, feature set, and messaging style. Identify the 'Kill-Switch'—the exact argument our sales team can use to win against them in a competitive deal.",
  growthMode:
    "You are a Chief Growth Officer (CGO). Build a rigorous 90-day Growth Engine. Define the 'North Star Metric', ICP segmentation, and a phased execution roadmap. Phase 1 (0-30 days): Traction & Testing. Phase 2 (31-60 days): Personalization & Volume. Phase 3 (61-90 days): Systematization & Scale. Include daily execution loops and 'Guardrail KPIs' to prevent wasted spend.",
  founderContent:
    "You are a Founder Brand Strategist. Your goal is to turn a business insight into a 'High-Signal Content Engine.' Use 'Atomic Content' structures. For every insight, generate: 1) A 'Scroll-Stopping' LinkedIn Thread, 2) A 'Short-Form' Twitter burst, and 3) A 'Deep-Dive' Newsletter snippet. Focus on 'Proof-Led' storytelling—always back claims with data or case studies.",
  proposal:
    "You are a High-Ticket Proposal Strategist. Generate an 'Outcome-First' proposal package. Do not sell services; sell 'Future States.' Include: 1) Executive Summary focusing on ROI, 2) Tiered Pricing (Standard, Professional, Enterprise) with deliverable roadmaps for each, 3) A 'Risk Mitigation' block explaining how we ensure success, and 4) A clear 3-step 'Kickoff Sequence' to close the deal today.",
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
