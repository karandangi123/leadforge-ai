import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

/**
 * Handles uploading screenshots to a persistent storage layer (CDN Simulation)
 */
export class StorageProvider {
  /**
   * Uploads a base64 image and returns a public URL
   */
  static async uploadScreenshot(leadId: string, base64Data: string, pageType: string = "home"): Promise<string> {
    // In production, this would upload to S3 or Supabase Storage
    // For now, we simulate a CDN by saving to the public directory of the dashboard
    
    const fileName = `audit_${leadId}_${pageType}_${Date.now()}.png`;
    const publicPath = join(process.cwd(), "apps/dashboard/public/audits");
    
    try {
      if (!existsSync(publicPath)) {
        mkdirSync(publicPath, { recursive: true });
      }

      const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      const filePath = join(publicPath, fileName);
      
      writeFileSync(filePath, buffer);
      
      // Return the public URL that can be used in emails and UI
      return `/audits/${fileName}`;
    } catch (error) {
      console.error("[StorageProvider] Failed to save screenshot:", error);
      return base64Data; // Fallback to base64 if storage fails
    }
  }
}
