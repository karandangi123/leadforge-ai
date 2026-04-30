import type { LeadResearchOutput, OutreachOutput, WebsiteAuditOutput } from "@leadforge/agents";

export type AgentEvaluationResult = {
  category: "research" | "website_audit" | "outreach";
  score: number;
  passed: boolean;
  checks: Array<{
    label: string;
    passed: boolean;
    detail: string;
  }>;
};

export function evaluateResearch(output: LeadResearchOutput): AgentEvaluationResult {
  const checks = [
    {
      label: "Has citations",
      passed: output.citations.length > 0,
      detail: "Research should name where claims came from.",
    },
    {
      label: "Confidence calibrated",
      passed: output.confidence >= 0.5 && output.confidence <= 0.95,
      detail: "Confidence should be useful without pretending certainty.",
    },
    {
      label: "Actionable angle",
      passed: output.signals.recommendedAngle.length >= 24,
      detail: "The research should produce a concrete outreach angle.",
    },
    {
      label: "Fit score bounded",
      passed: output.fitScore >= 0 && output.fitScore <= 100,
      detail: "Fit score must stay inside the 0-100 range.",
    },
  ];

  return finishEvaluation("research", checks);
}

export function evaluateWebsiteAudit(output: WebsiteAuditOutput): AgentEvaluationResult {
  const scores = [
    output.overallScore,
    output.clarityScore,
    output.conversionScore,
    output.trustScore,
    output.seoScore,
    output.speedScore,
  ];
  const checks = [
    {
      label: "Scores bounded",
      passed: scores.every((score) => score >= 0 && score <= 100),
      detail: "Every audit score must stay inside the 0-100 range.",
    },
    {
      label: "Has findings",
      passed: output.findings.length >= 3,
      detail: "Audit should include at least three concrete findings.",
    },
    {
      label: "Conversion included",
      passed: output.conversionScore > 0,
      detail: "Website audits must include conversion readiness.",
    },
    {
      label: "Next step present",
      passed: output.nextAction.length >= 8,
      detail: "Audit should point to the next workflow step.",
    },
  ];

  return finishEvaluation("website_audit", checks);
}

export function evaluateOutreach(output: OutreachOutput): AgentEvaluationResult {
  const body = output.body.toLowerCase();
  const riskyWords = ["guarantee", "urgent", "last chance", "act now", "100%"];
  const checks = [
    {
      label: "Has subject",
      passed: output.subject.trim().length >= 8,
      detail: "Email draft needs a usable subject line.",
    },
    {
      label: "Concise body",
      passed: output.body.length >= 80 && output.body.length <= 900,
      detail: "Outreach should be specific but not bloated.",
    },
    {
      label: "Low-pressure tone",
      passed: riskyWords.every((word) => !body.includes(word)),
      detail: "Avoid manipulative urgency or exaggerated claims.",
    },
    {
      label: "Approval reminder",
      passed: output.approvalNotes.length >= 16,
      detail: "External actions must stay human-approved.",
    },
  ];

  return finishEvaluation("outreach", checks);
}

function finishEvaluation(
  category: AgentEvaluationResult["category"],
  checks: AgentEvaluationResult["checks"],
): AgentEvaluationResult {
  const passedCount = checks.filter((check) => check.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return {
    category,
    score,
    passed: score >= 75,
    checks,
  };
}
