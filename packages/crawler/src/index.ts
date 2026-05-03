import { chromium, devices } from "playwright-core";
import { isIP } from "net";

export type ViewportType = "desktop" | "mobile";

export type CrawlResult = {
  url: string;
  title: string;
  metaDescription: string;
  content: string;
  screenshotUrl?: string;
  viewport: ViewportType;
  latencyMs: number;
  error?: string;
};

export class WebCrawler {
  /**
   * Dual-Viewport Capture for Phase 8.1
   */
  static async crawl(url: string, options: { screenshot?: boolean; viewport?: ViewportType } = {}): Promise<CrawlResult> {
    const startTime = Date.now();
    const viewportType = options.viewport || "desktop";

    // SSRF Protection
    try {
      const hostname = new URL(url).hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1" || isIP(hostname) !== 0) {
        throw new Error("Access Restricted: Private IP detected.");
      }
    } catch (e: any) {
      return { url, title: "", metaDescription: "", content: "", viewport: viewportType, latencyMs: 0, error: e.message };
    }

    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    // Mobile Emulation Config (iPhone 14 Pro)
    const deviceConfig = viewportType === "mobile" 
      ? devices['iPhone 14 Pro'] 
      : { viewport: { width: 1280, height: 800 }, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36" };

    const context = await browser.newContext({
      ...deviceConfig,
      deviceScaleFactor: 1, // Standardizing scale for coordinate consistency
    });

    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 40000 });

      // Handle Popups
      const popupSelectors = ['button:has-text("Accept")', 'button:has-text("Allow")', '.cookie-banner button'];
      for (const selector of popupSelectors) {
        if (await page.isVisible(selector)) {
          await page.click(selector).catch(() => {});
        }
      }

      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      
      const title = await page.title();
      const metaDescription = await page.$eval('meta[name="description"]', el => (el as HTMLMetaElement).content).catch(() => "");
      const content = await page.$eval("body", el => el.innerText);

      let screenshotUrl: string | undefined;
      if (options.screenshot) {
        const buffer = await page.screenshot({ type: "jpeg", quality: 80 });
        screenshotUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      }

      return {
        url,
        title,
        metaDescription,
        content: content.substring(0, 10000),
        screenshotUrl,
        viewport: viewportType,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return { url, title: "", metaDescription: "", content: "", viewport: viewportType, latencyMs: Date.now() - startTime, error: error.message };
    } finally {
      await browser.close();
    }
  }

  /**
   * Captures both Desktop and Mobile views for forensic comparison
   */
  static async captureForensicPair(url: string): Promise<{ desktop: CrawlResult, mobile: CrawlResult }> {
    const [desktop, mobile] = await Promise.all([
      this.crawl(url, { screenshot: true, viewport: "desktop" }),
      this.crawl(url, { screenshot: true, viewport: "mobile" })
    ]);

    return { desktop, mobile };
  }
}
