// ---------------------------------------------------------------------------
// Shared types — mirrors the Maintenance-Intelligence backend response shapes.
// ---------------------------------------------------------------------------

// ── Health ──────────────────────────────────────────────────────────────────

export type HealthStatus = "ok" | "degraded" | "error";

export interface HealthResponse {
  status: HealthStatus;
  postgres?: HealthStatus;
  kafka?: HealthStatus;
  kafka_lag?: Record<string, number>;
  uptime_seconds?: number;
}

// ── Signals ─────────────────────────────────────────────────────────────────

export interface SignalReading {
  ts: string; // ISO timestamp
  value: number;
  unit?: string;
  anomaly?: boolean;
}

export interface SignalRollup {
  window: "1h" | "6h" | "24h";
  mean: number;
  min: number;
  max: number;
}

export interface SignalsSummary {
  asset_id: string;
  signals: Record<string, SignalReading[]>; // key = signal name e.g. "vibration"
  rollups: Record<string, SignalRollup[]>;
}

// ── Bad Actors ───────────────────────────────────────────────────────────────

export interface BadActor {
  asset_id: string;
  score: number; // events_90d + 2*workorders_90d
  events_90d: number;
  workorders_90d: number;
  latest_severity?: "low" | "medium" | "high" | "critical";
  last_event_at?: string;
}

export interface BadActorsResponse {
  items: BadActor[];
  total: number;
}

// ── RCA Outcomes ─────────────────────────────────────────────────────────────

export interface RcaOutcomesSummary {
  window_days: number;
  total_rca_runs: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptance_rate: number;
  avg_duration_seconds: number;
  asset_metrics: AssetMetric[];
  user_metrics: UserMetric[];
  org_metrics: OrgMetric[];
  cmms_summary?: CmmsSummary;
}

export interface AssetMetric {
  asset_id: string;
  rca_count: number;
  accepted: number;
  acceptance_rate: number;
}

export interface UserMetric {
  user_id: string;
  feedback_total: number;
  acceptance_rate: number;
}

export interface OrgMetric {
  org_id: string;
  feedback_total: number;
  acceptance_rate: number;
}

export interface CmmsSummary {
  success: number;
  pending_backlog: number;
  failure_backlog: number;
  admin_retry_required: number;
  retry_limit_reached: number;
  avg_approval_to_handoff_hours?: number;
}

// ── PM Proposals ─────────────────────────────────────────────────────────────

export type ProposalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "handed_off"
  | "failed";

export interface PmProposal {
  id: string;
  asset_id: string;
  run_id: string;
  status: ProposalStatus;
  title: string;
  hypothesis?: string;
  immediate_actions?: string[];
  pm_suggestions?: string[];
  confidence?: number;
  created_at: string;
  approved_at?: string;
  work_order_id?: string;
}

export interface AnalyzeRequest {
  run_id: string;
  asset_id?: string;
}

export interface AnalyzeResponse {
  proposal: PmProposal;
}

export interface ApproveResponse {
  proposal: PmProposal;
  work_order_id?: string;
}

// ── Portal (run summaries) ────────────────────────────────────────────────────

export interface RunSummary {
  run_id: string;
  event_id: string;
  asset_id?: string;
  created_at: string;
  title?: string;
  hypothesis?: string;
  immediate_actions?: string[];
  pm_suggestions?: string[];
  confidence?: number;
  model_version?: string;
  tokens?: number;
  latency_ms?: number;
}

// ── Legacy types (used by existing pages / lib/api.ts) ────────────────────────

export interface RcaRun {
  id: string;
  asset_id: string;
  severity: string;
  summary: string;
  confidence_score: number;
  created_at: string;
  status: string;
  findings?: string[];
  recommendations?: string[];
  pm_suggestions?: string[];
  model_info?: Record<string, unknown>;
  context_metadata?: Record<string, unknown>;
  title?: string;
  [key: string]: unknown;
}

export interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  children?: HierarchyNode[];
  [key: string]: unknown;
}

export interface FailureEvent {
  id: string;
  asset_id: string;
  failure_mode: string;
  severity: string;
  downtime_hours: number;
  date: string;
  [key: string]: unknown;
}
