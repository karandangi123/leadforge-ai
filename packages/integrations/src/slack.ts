import { IntegrationAdapter } from "./index";

export class SlackAdapter implements IntegrationAdapter {
  provider = "SLACK";

  constructor(private webhookUrl: string) {}

  async sendNotification(message: string, channel?: string): Promise<void> {
    if (!this.webhookUrl) {
      console.warn("Slack webhook URL not configured.");
      return;
    }

    const payload = {
      text: message,
      channel: channel,
    };

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Slack notification failed: ${error}`);
    }
  }

  async notifyApproval(leadName: string, action: string, status: string): Promise<void> {
    const message = `📢 *Approval Update*\n*Lead:* ${leadName}\n*Action:* ${action}\n*Status:* ${status}`;
    await this.sendNotification(message);
  }
}
