import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { KpiSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowRight, TrendingUp, AlertCircle } from "lucide-react";

export default function BadActors() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bad-actors"],
    queryFn: () => api.getBadActors(20),
  });
  const navigate = useNavigate();

  const items = data?.items ?? [];
  const maxScore = items[0]?.score ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          Asset Risk Ranking
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Top assets by composite risk score — events + work orders over 90 days
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : [
              {
                label: "Total assets ranked",
                value: data?.total ?? 0,
                icon: TrendingUp,
                color: "text-info",
                bg: "bg-info/10 border-info/20",
              },
              {
                label: "Critical assets",
                value: items.filter((a) => a.latest_severity === "critical").length,
                icon: AlertCircle,
                color: "text-destructive",
                bg: "bg-destructive/10 border-destructive/20",
              },
              {
                label: "High severity",
                value: items.filter((a) => a.latest_severity === "high").length,
                icon: ShieldAlert,
                color: "text-chart-amber",
                bg: "bg-primary/10 border-primary/20",
              },
              {
                label: "Highest score",
                value: maxScore,
                icon: TrendingUp,
                color: "text-chart-teal",
                bg: "bg-chart-teal/10 border-chart-teal/20",
              },
            ].map((kpi) => (
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
              </div>
            ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="panel p-5 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : isError || items.length === 0 ? (
        <EmptyState title="No asset data" description="No risk data available." />
      ) : (
        <div className="panel p-5 animate-fade-in">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
            Ranked assets
          </h2>
          <div className="space-y-2">
            {items.map((asset, idx) => (
              <div
                key={asset.asset_id}
                className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-3.5 hover:bg-secondary/50 hover:border-primary/20 transition-all cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
                onClick={() => navigate(`/rca-runs?asset=${asset.asset_id}`)}
              >
                {/* Rank */}
                <span className="text-[11px] font-mono text-muted-foreground w-5 text-right shrink-0">
                  {idx + 1}
                </span>

                {/* Asset ID */}
                <span className="text-sm font-mono font-medium text-foreground w-28 shrink-0">
                  {asset.asset_id}
                </span>

                {/* Score bar */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(asset.score / maxScore) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-primary font-bold w-8 shrink-0">
                    {asset.score}
                  </span>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-[11px] text-muted-foreground shrink-0">
                  <span>{asset.events_90d} events</span>
                  <span>{asset.workorders_90d} WOs</span>
                </div>

                {/* Severity + date */}
                <div className="flex items-center gap-3 shrink-0">
                  {asset.latest_severity && (
                    <SeverityBadge severity={asset.latest_severity} />
                  )}
                  {asset.last_event_at && (
                    <span className="text-[10px] font-mono text-muted-foreground hidden lg:block">
                      {new Date(asset.last_event_at).toLocaleDateString()}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
