import FirecrawlApp from "@mendable/firecrawl-js";
import Groq from "groq-sdk";
import { z } from "zod";

/**
 * Structured schema for forensic findings
 */
export const ForensicFindingSchema = z.object({
  title: z.string(),
  category: z.enum(["UX_DEBT", "TECHNICAL", "PERFORMANCE", "COPY", "TRUST"]),
  severity: z.enum(["high", "medium", "low"]),
  finding: z.string(),
  recommendation: z.string(),
  business_impact: z.string(),
  outreach_hook: z.string(),
  confidence: z.number().min(0).max(1),
  location: z.string().describe("Where on the page this was found"),
  x: z.number().min(0).max(100).default(50),
  y: z.number().min(0).max(100).default(50),
  detection_confidence: z.number().min(0).max(1).default(0.9),
  evidence_strength: z.number().min(0).max(1).default(0.85),
  business_impact_score: z.number().min(0).max(1).default(0.95),
  outreach_quality_score: z.number().min(0).max(1).default(0.8),
  why_this_finding: z.string(),
  evidence: z.object({
    type: z.enum(["SCREENSHOT", "MARKDOWN", "HEADER"]),
    description: z.string(),
  })
});

export type ForensicFinding = z.infer<typeof ForensicFindingSchema>;

export interface ForensicResult {
  summary: string;
  findings: ForensicFinding[];
  uxScore: number;
  screenshotUrl?: string;
  metadata: any;
}

export class ForensicEngine {
  private firecrawl: FirecrawlApp;
  private groq: Groq;

  constructor() {
    this.firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY || "fc-mock-key",
    });
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async performAudit(url: string): Promise<ForensicResult> {
    console.log(`[ForensicEngine] Starting real crawl for: ${url}`);
    
    // 1. CRAWL & SCRAPE
    // We use Firecrawl to get clean markdown and a screenshot
    const scrapeResult = await this.firecrawl.scrape(url, {
      formats: ["markdown", "screenshot"],
      onlyMainContent: true,
      waitFor: 2000,
    }) as any;

    if (!scrapeResult.success) {
      throw new Error(`Crawl failed: ${scrapeResult.error}`);
    }

    const markdown = scrapeResult.markdown || "";
    const screenshotUrl = scrapeResult.screenshot;

    console.log(`[ForensicEngine] Scrape successful. Markdown length: ${markdown.length}`);

    // 2. ANALYZE WITH GROQ
    const systemPrompt = `You are a Senior SaaS Product Auditor and Forensic Prospecting Expert.
Analyze the following website content (markdown) and identify 3-5 high-impact "forensic findings" that can be used as outreach hooks.
Focus on:
- UX Debt (friction points, bad navigation, mobile issues)
- Performance (slow loading, heavy elements mentioned in text)
- Technical (missing SEO, broken tags, outdated tech)
- Trust (missing social proof, bad copy)

For each finding, provide:
- 'title'
- 'category'
- 'severity'
- 'finding'
- 'recommendation'
- 'business_impact'
- 'outreach_hook'
- 'why_this_finding'
- 'confidence' (0-1)
- 'x' and 'y' (coordinates on the page, 0-100)
- 'detection_confidence' (0-1)
- 'evidence_strength' (0-1)
- 'business_impact_score' (0-1)
- 'outreach_quality_score' (0-1)

Return a JSON object with 'summary' (string), 'findings' (array of findings), and 'uxScore' (0-100).`;

    const userPrompt = `URL: ${url}\n\nCONTENT:\n${markdown.substring(0, 15000)}`;

    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-specdec",
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const response = JSON.parse(completion.choices[0].message.content || "{}");

    // 3. VALIDATE & FORMAT
    const validatedFindings = (response.findings || []).map((f: any) => {
      try {
        return ForensicFindingSchema.parse({
          ...f,
          evidence: f.evidence || { type: "MARKDOWN", description: "Found in page source" }
        });
      } catch (e) {
        console.warn("[ForensicEngine] Finding failed validation:", f);
        return null;
      }
    }).filter(Boolean) as ForensicFinding[];

    return {
      summary: response.summary || "Audit completed.",
      findings: validatedFindings,
      uxScore: response.uxScore || 70,
      screenshotUrl,
      metadata: scrapeResult.metadata
    };
  }
}
