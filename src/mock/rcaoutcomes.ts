import type { RcaOutcomesSummary } from "@/types/api";

export const MOCK_RCA_OUTCOMES_SUMMARY: RcaOutcomesSummary = {
  window_days: 30,
  total_rca_runs: 10,
  accepted: 6,
  rejected: 1,
  pending: 3,
  acceptance_rate: 0.6,
  avg_duration_seconds: 42,
  asset_metrics: [
    { asset_id: "COMP-220", rca_count: 2, accepted: 2, acceptance_rate: 1.0 },
    { asset_id: "COMP-340", rca_count: 1, accepted: 1, acceptance_rate: 1.0 },
    { asset_id: "PS-105B",  rca_count: 1, accepted: 1, acceptance_rate: 1.0 },
    { asset_id: "GT-401",   rca_count: 1, accepted: 0, acceptance_rate: 0.0 },
    { asset_id: "HX-310A",  rca_count: 1, accepted: 1, acceptance_rate: 1.0 },
    { asset_id: "MOT-150",  rca_count: 1, accepted: 0, acceptance_rate: 0.0 },
    { asset_id: "GEN-501",  rca_count: 1, accepted: 1, acceptance_rate: 1.0 },
    { asset_id: "CV-2240",  rca_count: 1, accepted: 1, acceptance_rate: 1.0 },
    { asset_id: "PT-4410",  rca_count: 1, accepted: 0, acceptance_rate: 0.0 },
  ],
  user_metrics: [
    { user_id: "admin", feedback_total: 10, acceptance_rate: 0.6 },
  ],
  org_metrics: [
    { org_id: "PLANT-GULF-01", feedback_total: 10, acceptance_rate: 0.6 },
  ],
  cmms_summary: {
    success: 6,
    pending_backlog: 2,
    failure_backlog: 1,
    admin_retry_required: 1,
    retry_limit_reached: 0,
    avg_approval_to_handoff_hours: 3.4,
  },
};
