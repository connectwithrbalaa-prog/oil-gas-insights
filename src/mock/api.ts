import { MOCK_SIGNALS_SUMMARY } from "./signals";
import { MOCK_BAD_ACTORS_RESPONSE } from "./badactors";
import { MOCK_RCA_OUTCOMES_SUMMARY } from "./rcaoutcomes";
import { MOCK_PM_PROPOSALS } from "./pmproposals";
import type { SignalsSummary, BadActorsResponse, RcaOutcomesSummary, PmProposal } from "@/types/api";

export type { SignalsSummary, BadActorsResponse, RcaOutcomesSummary, PmProposal };

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockApi = {
  getSignalsByAsset: async (assetId: string): Promise<SignalsSummary> => {
    await delay();
    return MOCK_SIGNALS_SUMMARY[assetId] ?? MOCK_SIGNALS_SUMMARY["COMP-220"];
  },

  getBadActors: async (): Promise<BadActorsResponse> => {
    await delay();
    return MOCK_BAD_ACTORS_RESPONSE;
  },

  getRcaOutcomesSummary: async (windowDays = 30): Promise<RcaOutcomesSummary> => {
    await delay();
    return { ...MOCK_RCA_OUTCOMES_SUMMARY, window_days: windowDays };
  },

  getPmProposals: async (): Promise<PmProposal[]> => {
    await delay();
    return MOCK_PM_PROPOSALS;
  },

  getPmProposalsByAsset: async (assetId: string): Promise<PmProposal[]> => {
    await delay();
    return MOCK_PM_PROPOSALS.filter((p) => p.asset_id === assetId);
  },

  getPmProposalsByRunId: async (runId: string): Promise<PmProposal[]> => {
    await delay();
    return MOCK_PM_PROPOSALS.filter((p) => p.run_id === runId);
  },
};
