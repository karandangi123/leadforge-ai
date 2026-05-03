export interface IntegrationAdapter {
  provider: string;
  createDraft?(leadId: string, content: string): Promise<{ externalId: string; url?: string }>;
  syncLead?(leadId: string, data: any): Promise<{ externalId: string }>;
  sendNotification?(message: string, channel?: string): Promise<void>;
}

export * from "./gmail";
export * from "./slack";
export * from "./crm";
export * from "./linkedin";
export * from "./sms";
export * from "./enrichment";
export * from "./storage";
export * from "./heygen";
