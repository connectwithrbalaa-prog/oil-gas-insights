const API_BASE = "http://72.62.231.202:8001";

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
  getRuns: () => apiFetch<RcaRun[]>("/api/v1/portal/runs"),
  getRunDetail: (id: string) => apiFetch<RcaRun>(`/api/v1/portal/runs/${id}`),
  getHierarchy: () => apiFetch<HierarchyNode[]>("/api/v1/hierarchy"),
  getFailureEvents: () => apiFetch<FailureEvent[]>("/api/v1/failure-events"),
};
