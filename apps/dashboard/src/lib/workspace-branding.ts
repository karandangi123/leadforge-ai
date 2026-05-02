import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ProposalBrandingProfile = {
  brandName: string;
  tagLine: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  defaultServiceLine: string;
  defaultNiche: string;
  contactEmail: string;
  websiteUrl: string;
  signoffName: string;
  legalFooter: string;
  proposalVoice: string;
  pricingFootnote: string;
};

type BrandingStore = Record<string, ProposalBrandingProfile>;

const BRANDING_FILE = path.join(process.cwd(), "data", "workspace-branding.json");

export const defaultProposalBranding: ProposalBrandingProfile = {
  brandName: "LeadForge AI",
  tagLine: "Founder-grade lead generation, positioning, and approval-safe execution.",
  primaryColor: "#176b5d",
  secondaryColor: "#203d37",
  accentColor: "#d7eee6",
  defaultServiceLine: "outbound-acceleration",
  defaultNiche: "B2B SaaS",
  contactEmail: "hello@leadforge.ai",
  websiteUrl: "https://leadforge.ai",
  signoffName: "LeadForge AI",
  legalFooter: "This proposal is confidential and intended only for the recipient team.",
  proposalVoice: "Specific, strategic, premium, and operator-trustworthy.",
  pricingFootnote: "Pricing is positioned around execution clarity, operator lift, and commercial leverage rather than hours alone.",
};

export async function readWorkspaceBranding(workspaceSlug: string) {
  try {
    const raw = await readFile(BRANDING_FILE, "utf-8");
    const parsed = JSON.parse(raw) as BrandingStore;
    return { ...defaultProposalBranding, ...(parsed[workspaceSlug] ?? {}) };
  } catch {
    return defaultProposalBranding;
  }
}

export async function saveWorkspaceBranding(workspaceSlug: string, profile: ProposalBrandingProfile) {
  await mkdir(path.dirname(BRANDING_FILE), { recursive: true });
  let current: BrandingStore = {};

  try {
    const raw = await readFile(BRANDING_FILE, "utf-8");
    current = JSON.parse(raw) as BrandingStore;
  } catch {
    current = {};
  }

  current[workspaceSlug] = profile;
  await writeFile(BRANDING_FILE, JSON.stringify(current, null, 2), "utf-8");
}
