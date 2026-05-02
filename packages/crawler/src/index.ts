import { chromium } from "playwright-core";

export type CrawlResult = {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  content: string;
  links: string[];
  screenshotUrl?: string;
  latencyMs: number;
};

export class WebCrawler {
  static async crawl(url: string, options: { screenshot?: boolean } = {}): Promise<CrawlResult> {
    const startTime = Date.now();
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      
      const title = await page.title();
      const metaDescription = await page.$eval('meta[name="description"]', el => (el as HTMLMetaElement).content).catch(() => "");
      const h1 = await page.$$eval("h1", els => els.map(el => el.textContent?.trim() || ""));
      const content = await page.$eval("body", el => el.innerText);
      const links = await page.$$eval("a", els => els.map(el => (el as HTMLAnchorElement).href).filter(h => h.startsWith("http")));

      let screenshotUrl: string | undefined;
      if (options.screenshot) {
        // In a real app, you'd upload this to S3
        const buffer = await page.screenshot();
        screenshotUrl = `data:image/png;base64,${buffer.toString("base64")}`;
      }

      return {
        url,
        title,
        metaDescription,
        h1,
        content: content.substring(0, 10000), // Cap content for LLM
        links,
        screenshotUrl,
        latencyMs: Date.now() - startTime,
      };
    } finally {
      await browser.close();
    }
  }

  /**
   * Advanced: Crawl multiple pages for deeper audit
   */
  static async deepCrawl(rootUrl: string, maxPages = 3): Promise<CrawlResult[]> {
    const main = await this.crawl(rootUrl);
    const results: CrawlResult[] = [main];
    
    // Simple BFS for more pages
    const toCrawl = main.links
      .filter(l => l.startsWith(rootUrl))
      .slice(0, maxPages - 1);

    for (const url of toCrawl) {
      results.push(await this.crawl(url));
    }

    return results;
  }
}
