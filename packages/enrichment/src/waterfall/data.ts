import { runEnrichmentWaterfall, getEnrichmentAdapters } from "../../../integrations/src/enrichment";

/**
 * The Waterfall (The "Data")
 * Standard data providers (Apollo, Hunter, etc.) managed via a priority waterfall.
 */
export class Data {
  static async enrich(input: any, isDemo: boolean, plan?: any) {
    const adapters = getEnrichmentAdapters(input.company, isDemo, plan);
    return runEnrichmentWaterfall(input, adapters);
  }
}
