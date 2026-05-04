import { getPrisma } from "@leadforge/db";

export type PerformanceFinding = {
  metric: string;
  value: string | number;
  status: "poor" | "needs-improvement" | "good";
  businessImpact: string;
  hook: string;
};

export class PerformanceAgent {
  static async audit(url: string): Promise<PerformanceFinding[]> {
    // In production, this would use Lighthouse or PageSpeed Insights API.
    // For now, we simulate a deep speed audit.
    
    return [
      {
        metric: "Largest Contentful Paint (LCP)",
        value: "3.2s",
        status: "poor",
        businessImpact: "Slow loading of main content causes high bounce rates on mobile, especially from paid ads.",
        hook: "Noticed your mobile page takes over 3 seconds to reveal the main value proposition — this usually leads to an immediate 20% drop in conversion."
      },
      {
        metric: "Cumulative Layout Shift (CLS)",
        value: 0.15,
        status: "poor",
        businessImpact: "Unexpected layout shifts during page load frustrate users and lower Google's experience score.",
        hook: "Your homepage has some noticeable layout shifts during load, which can make it hard for users to click the right button on mobile."
      }
    ];
  }
}
