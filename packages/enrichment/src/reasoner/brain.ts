import { SignalDiscoveryAgent } from "../../../agents/src/reasoning/signal-discovery";
import { SelfHealingAgent } from "../../../agents/src/reasoning/self-healing";

/**
 * The Reasoner (The "Brain")
 * Decides what to research based on ICP and heals data on the fly.
 */
export class Brain {
  static async discover(workspaceId: string, leadId: string) {
    return SignalDiscoveryAgent.generatePlan(workspaceId, leadId);
  }

  static async heal(leadId: string) {
    return SelfHealingAgent.repairLead(leadId);
  }
}
