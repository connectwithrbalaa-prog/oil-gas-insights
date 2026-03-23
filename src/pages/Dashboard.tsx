import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { KpiSkeleton } from "@/components/Skeletons";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Server,
} from "lucide-react";

export default function Dashboard() {
  const runs = useQuery({ queryKey: ["runs"], queryFn: api.getRuns });
  const events = useQuery({ queryKey: ["failure-events"], queryFn: api.getFailureEvents });
  const hierarchy = useQuery({ queryKey: ["hierarchy"], queryFn: api.getHierarchy });

  const isLoading = runs.isLoading || events.isLoading || hierarchy.isLoading;

  const totalEquipment = hierarchy.data
    ? countNodes(hierarchy.data)
    : 0;
  const activeEvents = events.data?.length ?? 0;
  const openRuns = runs.data?.filter((r) => r.status !== "completed")?.length ?? runs.data?.length ?? 0;
  const systemHealthy = !runs.isError && !events.isError;

  const kpis = [
    {
      label: "Total Equipment",
      value: totalEquipment,
      icon: Server,
      accent: "text-info",
    },
    {
      label: "Failure Events",
      value: activeEvents,
      icon: AlertTriangle,
      accent: "text-warning",
    },
    {
      label: "RCA Runs",
      value: openRuns,
      icon: Activity,
      accent: "text-primary",
    },
    {
      label: "System Health",
      value: systemHealthy ? "Online" : "Degraded",
      icon: CheckCircle,
      accent: systemHealthy ? "text-success" : "text-destructive",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Real-time maintenance intelligence overview
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg border border-border bg-card p-6 kpi-glow transition-all hover:border-primary/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {kpi.label}
                  </span>
                  <kpi.icon className={`w-4 h-4 ${kpi.accent}`} />
                </div>
                <p className="text-3xl font-bold text-foreground font-mono">
                  {kpi.value}
                </p>
              </div>
            ))}
      </div>

      {/* Recent activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent RCA Runs</h2>
        {runs.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : runs.data && runs.data.length > 0 ? (
          <div className="space-y-2">
            {runs.data.slice(0, 5).map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{run.asset_id}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {run.summary}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {new Date(run.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent runs</p>
        )}
      </div>
    </div>
  );
}

function countNodes(nodes: any[]): number {
  let count = 0;
  for (const node of nodes) {
    count++;
    if (node.children) count += countNodes(node.children);
  }
  return count;
}
