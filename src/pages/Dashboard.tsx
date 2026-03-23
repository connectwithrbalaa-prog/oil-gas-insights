import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { KpiSkeleton, ChartSkeleton } from "@/components/Skeletons";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Server,
  TrendingUp,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { OperationalBanner } from "@/components/dashboard/OperationalBanner";

export default function Dashboard() {
  const runs = useQuery({ queryKey: ["runs"], queryFn: api.getRuns });
  const events = useQuery({
    queryKey: ["failure-events"],
    queryFn: api.getFailureEvents,
  });
  const hierarchy = useQuery({
    queryKey: ["hierarchy"],
    queryFn: api.getHierarchy,
  });
  const navigate = useNavigate();

  const isLoading = runs.isLoading || events.isLoading || hierarchy.isLoading;

  const totalEquipment = hierarchy.data ? countNodes(hierarchy.data) : 0;
  const activeEvents = events.data?.length ?? 0;
  const totalRuns = runs.data?.length ?? 0;
  const avgConfidence = runs.data?.length
    ? Math.round(
        (runs.data.reduce((sum, r) => sum + (r.confidence_score ?? 0), 0) /
          runs.data.length) *
          100
      )
    : 0;

  const criticalCount = (runs.data ?? []).filter(
    (r) => r.severity?.toLowerCase() === "critical"
  ).length;
  const resolvedCount = (runs.data ?? []).filter(
    (r) => r.status === "completed"
  ).length;

  const kpis = [
    {
      label: "Monitored Assets",
      value: totalEquipment,
      icon: Server,
      color: "text-info",
      bgColor: "bg-info/10 border-info/20",
      subtitle: "across 8 systems",
    },
    {
      label: "Active Alerts",
      value: activeEvents,
      icon: AlertTriangle,
      color: "text-chart-amber",
      bgColor: "bg-primary/10 border-primary/20",
      subtitle: `${criticalCount} critical`,
    },
    {
      label: "RCA Analyses",
      value: totalRuns,
      icon: Activity,
      color: "text-chart-teal",
      bgColor: "bg-chart-teal/10 border-chart-teal/20",
      subtitle: `${resolvedCount} completed`,
    },
    {
      label: "AI Confidence",
      value: `${avgConfidence}%`,
      icon: TrendingUp,
      color: "text-chart-blue",
      bgColor: "bg-chart-blue/10 border-chart-blue/20",
      subtitle: "avg across all runs",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Persona Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-mono uppercase tracking-widest">
            Good {getTimeOfDay()}, Operations Lead
          </p>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Plant Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gulf Coast Processing Plant — Real-time reliability intelligence
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono">
            Last sync:{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Operational Status Banner */}
      {!isLoading && (
        <OperationalBanner
          criticalCount={criticalCount}
          activeAlerts={activeEvents}
          resolvedCount={resolvedCount}
          avgConfidence={avgConfidence}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="panel kpi-glow p-5 animate-fade-in"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    {kpi.label}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center ${kpi.bgColor}`}
                  >
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground font-mono tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {kpi.subtitle}
                </p>
              </div>
            ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        runs={runs.data ?? []}
        events={events.data ?? []}
        isLoading={isLoading}
      />

      {/* Recent RCA Runs — with narrative */}
      <div className="panel p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Recent Root Cause Analyses
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI-generated diagnostics requiring your review
            </p>
          </div>
          <button
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            onClick={() => navigate("/rca-runs")}
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {runs.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : runs.data && runs.data.length > 0 ? (
          <div className="space-y-2">
            {runs.data.slice(0, 5).map((run, idx) => (
              <div
                key={run.id}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3.5 hover:bg-secondary/50 hover:border-primary/20 transition-all cursor-pointer group"
                onClick={() => navigate(`/rca-runs/${run.id}`)}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full status-indicator ${
                    run.severity === "critical" ? "bg-destructive" :
                    run.severity === "high" ? "bg-primary" :
                    "bg-success"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate max-w-lg">
                      {run.title || run.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-primary">
                        {run.asset_id}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        •
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Confidence {Math.round(run.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <SeverityBadge severity={run.severity} />
                  <span className="text-[10px] text-muted-foreground font-mono hidden sm:block">
                    {new Date(run.created_at).toLocaleDateString()}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No recent analyses — all systems nominal
          </p>
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

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
