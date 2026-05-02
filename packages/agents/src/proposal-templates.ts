export type ProposalTemplateCaseStudy = {
  title: string;
  outcome: string;
  detail: string;
};

export type ProposalTemplatePricingLayout = {
  niche: string;
  label: string;
  description: string;
  priceAnchors: string[];
};

export type ProposalServiceLineTemplate = {
  id: string;
  name: string;
  description: string;
  guaranteeLanguage: string;
  pricingLayoutName: string;
  reusableSections: string[];
  caseStudyBlocks: ProposalTemplateCaseStudy[];
  nichePricingLayouts: ProposalTemplatePricingLayout[];
};

export const proposalServiceLineTemplates: ProposalServiceLineTemplate[] = [
  {
    id: "positioning-sprint",
    name: "Positioning Sprint",
    description: "Best for messaging clarity, offer sharpening, homepage rewrite direction, and proof-led positioning.",
    guaranteeLanguage:
      "If the messaging direction is not materially clearer by the end of the sprint, we keep iterating on the core narrative until the positioning feels commercially usable.",
    pricingLayoutName: "Narrative transformation pricing",
    reusableSections: ["Homepage messaging diagnosis", "Positioning reset", "Proof architecture", "CTA rewrite plan"],
    caseStudyBlocks: [
      {
        title: "B2B SaaS homepage reposition",
        outcome: "Clarified buyer narrative and reduced generic messaging drift.",
        detail: "A founder-led SaaS team used the sprint to move from feature-heavy copy to an outcome-led homepage and a sharper outbound opener.",
      },
      {
        title: "Agency offer simplification",
        outcome: "Packaged services into a cleaner, easier-to-sell commercial story.",
        detail: "The engagement reframed scattered services into a more premium offer with stronger proof sequencing and clearer entry points.",
      },
    ],
    nichePricingLayouts: [
      {
        niche: "B2B SaaS",
        label: "Founder-led SaaS pricing",
        description: "Anchors around pipeline clarity, homepage lift, and differentiated positioning.",
        priceAnchors: ["Starter $2k-$3k", "Core sprint $4k-$6k", "Partner tier $7k+"],
      },
      {
        niche: "Agencies",
        label: "Agency reposition pricing",
        description: "Anchors around sharper service packaging and close-rate support.",
        priceAnchors: ["Starter $1.5k-$2.5k", "Core sprint $3k-$5k", "Partner tier $6k+"],
      },
    ],
  },
  {
    id: "outbound-acceleration",
    name: "Outbound Acceleration",
    description: "Best for lead research, outreach asset creation, reply quality, and approval-safe execution setup.",
    guaranteeLanguage:
      "If the engagement does not produce a usable outbound system with specific research angles, drafts, and follow-up structure, we refine the execution package before closeout.",
    pricingLayoutName: "Pipeline activation pricing",
    reusableSections: ["ICP-fit research", "Audit-led outreach", "Reply-safe follow-up system", "Approval and CRM payload setup"],
    caseStudyBlocks: [
      {
        title: "Healthcare ops outbound reset",
        outcome: "Turned generic cold outreach into proof-led, conversion-specific messaging.",
        detail: "The system connected website findings, research signals, and CRM payloads so the founder could ship with more confidence.",
      },
      {
        title: "Devtools pipeline activation",
        outcome: "Built a cleaner research-to-draft workflow for a lean GTM team.",
        detail: "The operator gained a reusable review queue, sharper buyer context, and clearer follow-up execution rhythm.",
      },
    ],
    nichePricingLayouts: [
      {
        niche: "Healthcare",
        label: "Healthcare ops pricing",
        description: "Anchors around research quality, trust-sensitive messaging, and reviewer oversight.",
        priceAnchors: ["Starter $2.5k-$4k", "Core sprint $5k-$7k", "Partner tier $8k+"],
      },
      {
        niche: "Developer tools",
        label: "Devtools outbound pricing",
        description: "Anchors around technical proof, ICP precision, and follow-up quality.",
        priceAnchors: ["Starter $2k-$3.5k", "Core sprint $4.5k-$6.5k", "Partner tier $7.5k+"],
      },
    ],
  },
  {
    id: "revops-rebuild",
    name: "RevOps Rebuild",
    description: "Best for pipeline process redesign, approval governance, handoff quality, and operating cadence cleanup.",
    guaranteeLanguage:
      "If the handoff, approval, and next-action system is still unclear by the end of the engagement, we extend the operating design pass until the workflow is usable by the team.",
    pricingLayoutName: "Systems rebuild pricing",
    reusableSections: ["Pipeline redesign", "Stage governance", "Approval operating model", "Outcome tracking and reporting loop"],
    caseStudyBlocks: [
      {
        title: "Agency delivery ops cleanup",
        outcome: "Reworked a fragile process into clearer ownership and approval steps.",
        detail: "The rebuild reduced ambiguity between research, draft review, CRM payload readiness, and operator handoff.",
      },
      {
        title: "Founder-led GTM operating system",
        outcome: "Created more reliable movement from discovery to approved execution.",
        detail: "The system introduced stage rules, outcome logging, and more readable traceability across the workflow.",
      },
    ],
    nichePricingLayouts: [
      {
        niche: "RevOps consulting",
        label: "Consulting systems pricing",
        description: "Anchors around operator time saved, approval clarity, and reporting structure.",
        priceAnchors: ["Starter $3k-$5k", "Core rebuild $6k-$9k", "Partner tier $10k+"],
      },
      {
        niche: "Agencies",
        label: "Agency ops rebuild pricing",
        description: "Anchors around delivery consistency and client-facing system polish.",
        priceAnchors: ["Starter $2.5k-$4k", "Core rebuild $5k-$8k", "Partner tier $9k+"],
      },
    ],
  },
];

export function getProposalTemplate(templateId: string) {
  return proposalServiceLineTemplates.find((template) => template.id === templateId) ?? proposalServiceLineTemplates[0];
}

export function getProposalPricingLayout(templateId: string, niche: string) {
  const template = getProposalTemplate(templateId);
  const normalized = niche.trim().toLowerCase();
  return (
    template.nichePricingLayouts.find((layout) => layout.niche.toLowerCase() === normalized) ??
    template.nichePricingLayouts[0]
  );
}
