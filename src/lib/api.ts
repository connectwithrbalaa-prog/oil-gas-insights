const API_BASE = "/backend";

const headers: HeadersInit = {
  "x-dev-user": "admin",
  "Content-Type": "application/json",
};

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Raw API response shape
interface RawRun {
  run_id: string;
  status: string;
  event_id?: string;
  title: string;
  summary: string;
  confidence: number;
  hypothesis?: string[];
  immediate_actions?: string[];
  pm_suggestions?: string[];
  model?: Record<string, unknown>;
  context_meta?: {
    asset_id: string;
    severity: string;
    [key: string]: unknown;
  };
  date?: string;
  [key: string]: unknown;
}

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
  [key: string]: unknown;
}

function mapRun(raw: RawRun): RcaRun {
  return {
    id: raw.run_id,
    asset_id: raw.context_meta?.asset_id ?? raw.run_id,
    severity: raw.context_meta?.severity ?? "unknown",
    summary: raw.summary || raw.title,
    confidence_score: raw.confidence,
    created_at: raw.date ?? new Date().toISOString(),
    status: raw.status,
    findings: raw.hypothesis,
    recommendations: raw.immediate_actions,
    pm_suggestions: raw.pm_suggestions,
    model_info: raw.model,
    context_metadata: raw.context_meta,
  };
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

export const api = {
  getRuns: async () => {
    const raw = await apiFetch<RawRun[]>("/api/v1/portal/runs");
    return raw.map(mapRun);
  },
  getRunDetail: async (id: string) => {
    const raw = await apiFetch<RawRun>(`/api/v1/portal/runs/${id}`);
    return mapRun(raw);
  },
  getHierarchy: () => apiFetch<HierarchyNode[]>("/api/v1/hierarchy"),
  getFailureEvents: () => apiFetch<FailureEvent[]>("/api/v1/failure-events"),
};
