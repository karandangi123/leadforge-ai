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
  input: LeadAgentInput;
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
};
