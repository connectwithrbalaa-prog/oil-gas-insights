const API_BASES = ["/backend", "http://72.62.231.202:8001"];

const headers: HeadersInit = {
  "x-dev-user": "admin",
  "Content-Type": "application/json",
};

async function apiFetch<T>(path: string): Promise<T> {
  let lastError: unknown;

  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, { headers });
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Non-JSON response received from API");
      }

      return (await res.json()) as T;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to reach API");
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
    asset_id?: string;
    severity?: string;
    site_id?: string;
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

const FALLBACK_RUNS: RawRun[] = [
  {
    run_id: "RUN-OG-COMP-001",
    status: "ok",
    event_id: "EVT-OG-COMP-5201",
    title: "Compressor vibration drift on COMP-220",
    summary:
      "Vibration envelope exceeded baseline by 18% over the last 36 hours. Bearing wear is the most likely contributor and should be inspected during the next maintenance slot.",
    confidence: 0.79,
    hypothesis: [
      "Bearing degradation causing radial vibration increase",
      "Potential imbalance due to coupler wear",
    ],
    immediate_actions: [
      "Increase vibration monitoring frequency to every 2 hours",
      "Prepare standby compressor for controlled switchover",
    ],
    pm_suggestions: [
      "Create work order for bearing inspection",
      "Review lubrication interval and oil quality trend",
    ],
    context_meta: {
      asset_id: "COMP-220",
      site_id: "PLANT-GULF-01",
      severity: "high",
    },
    date: "2026-03-21",
  },
  {
    run_id: "RUN-OG-PUMP-002",
    status: "ok",
    event_id: "EVT-OG-SEAL-7203",
    title: "Seal oil pressure drop on Pump Skid PS-105B",
    summary:
      "Seal oil differential pressure dropped by 22% over 48 hours with process-fluid traces in return stream, indicating early-stage mechanical seal wear.",
    confidence: 0.84,
    hypothesis: [
      "Mechanical seal face wear allowing fluid ingress",
      "Suspended solids accelerating seal wear",
    ],
    immediate_actions: [
      "Increase seal oil monitoring frequency to every 2 hours",
      "Confirm standby pump PS-105C readiness",
    ],
    pm_suggestions: [
      "Plan seal cartridge replacement in next window",
      "Verify spare seal availability in warehouse",
    ],
    context_meta: {
      asset_id: "PS-105B",
      site_id: "PLANT-GULF-01",
      severity: "medium",
    },
    date: "2026-03-21",
  },
];

function mapRun(raw: RawRun): RcaRun {
  return {
    id: raw.run_id,
    asset_id: raw.context_meta?.asset_id ?? raw.run_id,
    severity: raw.context_meta?.severity ?? "unknown",
    summary: raw.summary || raw.title || "No summary available",
    confidence_score: raw.confidence ?? 0,
    created_at: raw.date ?? new Date().toISOString(),
    status: raw.status ?? "unknown",
    findings: raw.hypothesis,
    recommendations: raw.immediate_actions,
    pm_suggestions: raw.pm_suggestions,
    model_info: raw.model,
    context_metadata: raw.context_meta,
  };
}

function buildHierarchyFromRuns(runs: RcaRun[]): HierarchyNode[] {
  const assets = Array.from(new Set(runs.map((run) => run.asset_id).filter(Boolean)));

  return [
    {
      id: "PLANT-GULF-01",
      name: "Plant Gulf 01",
      type: "Site",
      children: [
        {
          id: "FAC-MAIN",
          name: "Main Facility",
          type: "Facility",
          children: [
            {
              id: "SYS-ROTATING",
              name: "Rotating Equipment",
              type: "System",
              children: assets.map((asset) => ({
                id: asset,
                name: asset,
                type: "Equipment",
              })),
            },
          ],
        },
      ],
    },
  ];
}

function buildFailureEventsFromRuns(runs: RcaRun[]): FailureEvent[] {
  return runs.map((run, index) => ({
    id: String(run.id),
    asset_id: String(run.asset_id),
    failure_mode: run.summary || "Potential equipment degradation",
    severity: run.severity || "medium",
    downtime_hours:
      run.severity?.toLowerCase() === "critical"
        ? 16
        : run.severity?.toLowerCase() === "high"
        ? 10
        : run.severity?.toLowerCase() === "medium"
        ? 6
        : 3,
    date: run.created_at || new Date(Date.now() - index * 86400000).toISOString(),
  }));
}

export const api = {
  getRuns: async () => {
    try {
      const raw = await apiFetch<RawRun[]>("/api/v1/portal/runs");
      if (!Array.isArray(raw) || raw.length === 0) {
        return FALLBACK_RUNS.map(mapRun);
      }
      return raw.map(mapRun);
    } catch {
      return FALLBACK_RUNS.map(mapRun);
    }
  },

  getRunDetail: async (id: string) => {
    try {
      const raw = await apiFetch<RawRun>(`/api/v1/portal/runs/${id}`);
      return mapRun(raw);
    } catch {
      const runs = await api.getRuns();
      const match = runs.find((run) => run.id === id);
      if (match) return match;
      throw new Error("Run not found");
    }
  },

  getHierarchy: async () => {
    try {
      const hierarchy = await apiFetch<HierarchyNode[]>("/api/v1/hierarchy");
      if (Array.isArray(hierarchy) && hierarchy.length > 0) {
        return hierarchy;
      }
      throw new Error("Hierarchy endpoint returned no data");
    } catch {
      const runs = await api.getRuns();
      return buildHierarchyFromRuns(runs);
    }
  },

  getFailureEvents: async () => {
    try {
      const events = await apiFetch<FailureEvent[]>("/api/v1/failure-events");
      if (Array.isArray(events) && events.length > 0) {
        return events;
      }
      throw new Error("Failure events endpoint returned no data");
    } catch {
      const runs = await api.getRuns();
      return buildFailureEventsFromRuns(runs);
    }
  },
};
