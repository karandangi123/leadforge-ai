import { IntegrationAdapter } from "./index";

export class LinkedInAdapter implements IntegrationAdapter {
  provider = "LINKEDIN";

  async createDraft(leadId: string, content: string): Promise<{ externalId: string; url?: string }> {
    console.log(`MOCK: Creating LinkedIn message draft for lead ${leadId}`);
    return {
      externalId: `li_${Math.random().toString(36).substring(7)}`,
      url: "https://www.linkedin.com/messaging/",
    };
  }

  async syncLead(leadId: string, data: any): Promise<{ externalId: string }> {
    console.log(`MOCK: Syncing lead ${leadId} to LinkedIn Sales Navigator`);
    return {
      externalId: `li_acc_${Math.random().toString(36).substring(7)}`,
    };
  }
}

export class HubSpotAdapter implements IntegrationAdapter {
  provider = "HUBSPOT";

  async syncLead(leadId: string, data: any): Promise<{ externalId: string }> {
    console.log(`MOCK: Syncing lead ${leadId} to HubSpot CRM`);
    return {
      externalId: `hs_${Math.random().toString(36).substring(7)}`,
    };
  }
}
