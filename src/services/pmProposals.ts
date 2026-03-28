import { api } from "@/lib/api";
import type { AnalyzeRequest } from "@/types/api";
export const analyzeRunSummary = (payload: AnalyzeRequest) => api.analyzeRunSummary(payload);
export const approveProposal   = (proposalId: string)      => api.approveProposal(proposalId);
export const getProposal       = (proposalId: string)      => api.getProposal(proposalId);
