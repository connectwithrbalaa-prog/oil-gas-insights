import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { KpiSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Download, BarChart3, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";

const WINDOWS = [7, 30, 90] as const;

export default function RcaOutcomes() {
  const [window, setWindow] = useState<number>(30);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["rca-outcomes", window],
    queryFn: () => api.getRcaOutcomes(window),
  });

  const handleCsvDownload = () => api.downloadRcaOutcomesCsv(window);

  const kpis = data
    ? [
        {
          label: "Total RCA runs",
          value: data.total_rca_runs,
          icon: BarChart3,
          color: "text-info",
          bg: "bg-info/10 border-info/20",
          sub: `last ${data.window_days} days`,
        },
        {
          label: "Acceptance rate",
          value: `${Math.round(data.acceptance_rate * 100)}%`,
          icon: CheckCircle2,
          color: "text-chart-teal",
          bg: "bg-chart-teal/10 border-chart-teal/20",
          sub: `${data.accepted} accepted`,
        },
        {
          label: "Avg duration",
          value: `${data.avg_duration_seconds.toFixed(1)}s`,
          icon: Clock,
          color: "text-chart-blue",
          bg: "bg-chart-blue/10 border-chart-blue/20",
          sub: "per RCA run",
        },
        {
          label: "CMMS backlog",
          value: data.cmms_summary?.pending_backlog ?? "—",
          icon: AlertCircle,
          color: "text-chart-amber",
          bg: "bg-primary/10 border-primary/20",
          sub: `${data.cmms_summary?.failure_backlog ?? 0} failures`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            RCA Outcomes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acceptance rates, CMMS handoff performance, and operator feedback
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Window selector */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-mono">
            {WINDOWS.map((w) => (
              <button
                key={w}
                onClick={() => setWindow(w)}
                className={`px-3 py-1.5 transition-colors ${
                  window === w
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                {w}d
              </button>
            ))}
          </div>
          <button
            onClick={handleCsvDownload}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors bg-card"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors bg-card"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi) => (
              <div key={kpi.label} className="panel kpi-glow p-5 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    {kpi.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${kpi.bg}`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground font-mono tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
              </div>
            ))}
      </div>

      {isError && (
        <EmptyState title="Unable to load outcomes" description="Failed to fetch RCA outcome data." />
      )}

      {!isLoading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CMMS Summary */}
          {data.cmms_summary && (
            <div className="panel p-5 animate-fade-in">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
                CMMS handoff summary
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Successful handoffs", value: data.cmms_summary.success, positive: true },
                  { label: "Pending backlog", value: data.cmms_summary.pending_backlog, positive: false },
                  { label: "Failure backlog", value: data.cmms_summary.failure_backlog, positive: false },
                  { label: "Admin retry required", value: data.cmms_summary.admin_retry_required, positive: false },
                  { label: "Retry limit reached", value: data.cmms_summary.retry_limit_reached, positive: false },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className={`text-sm font-mono font-bold ${row.positive ? "text-chart-teal" : row.value > 0 ? "text-chart-amber" : "text-muted-foreground"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
                {data.cmms_summary.avg_approval_to_handoff_hours != null && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Avg approval → handoff</span>
                    <span className="text-sm font-mono font-bold text-info">
                      {data.cmms_summary.avg_approval_to_handoff_hours.toFixed(1)}h
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Per-asset acceptance */}
          <div className="panel p-5 animate-fade-in">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
              Acceptance by asset
            </h2>
            {data.asset_metrics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No asset data available.</p>
            ) : (
              <div className="space-y-3">
                {data.asset_metrics.map((a) => (
                  <div key={a.asset_id} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-primary w-20 shrink-0">{a.asset_id}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-chart-teal transition-all"
                        style={{ width: `${a.acceptance_rate * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-10 text-right shrink-0">
                      {Math.round(a.acceptance_rate * 100)}%
                    </span>
                    <span className="text-[11px] text-muted-foreground w-12 shrink-0">
                      {a.rca_count} runs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
