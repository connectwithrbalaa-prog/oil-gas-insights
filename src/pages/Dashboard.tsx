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
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

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

  // Severity distribution for pie chart
  const severityCounts = (runs.data ?? []).reduce<Record<string, number>>(
    (acc, r) => {
      const s = r.severity?.toLowerCase() || "unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {}
  );

  const severityData = Object.entries(severityCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const severityColors: Record<string, string> = {
    Critical: "hsl(0, 72%, 55%)",
    High: "hsl(25, 90%, 55%)",
    Medium: "hsl(45, 90%, 55%)",
    Low: "hsl(152, 70%, 42%)",
    Unknown: "hsl(215, 15%, 50%)",
  };

  // Downtime data from failure events
  const downtimeData = (events.data ?? [])
    .slice(0, 8)
    .map((e) => ({
      asset: e.asset_id?.replace(/^[A-Z]+-/, "") || e.id,
      hours: e.downtime_hours ?? 0,
    }));

  // Trend data (mock from runs by date)
  const trendData = (runs.data ?? [])
    .map((r) => ({
      date: new Date(r.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      confidence: Math.round((r.confidence_score ?? 0) * 100),
    }))
    .reverse();

  const kpis = [
    {
      label: "Total Equipment",
      value: totalEquipment,
      icon: Server,
      color: "text-info",
      bgColor: "bg-info/10 border-info/20",
    },
    {
      label: "Failure Events",
      value: activeEvents,
      icon: AlertTriangle,
      color: "text-chart-amber",
      bgColor: "bg-primary/10 border-primary/20",
    },
    {
      label: "RCA Runs",
      value: totalRuns,
      icon: Activity,
      color: "text-chart-teal",
      bgColor: "bg-chart-teal/10 border-chart-teal/20",
    },
    {
      label: "Avg Confidence",
      value: `${avgConfidence}%`,
      icon: TrendingUp,
      color: "text-chart-blue",
      bgColor: "bg-chart-blue/10 border-chart-blue/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Control Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time maintenance intelligence overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="panel kpi-glow p-5 animate-fade-in"
              >
                <div className="flex items-center justify-between mb-4">
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
              </div>
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Severity Distribution */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="panel p-5 animate-fade-in">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
              Severity Distribution
            </h2>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {severityData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          severityColors[entry.name] || severityColors.Unknown
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 18%, 11%)",
                      border: "1px solid hsl(220, 16%, 18%)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(210, 20%, 90%)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No data
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-2">
              {severityData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        severityColors[s.name] || severityColors.Unknown,
                    }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {s.name} ({s.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Trend */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="panel p-5 animate-fade-in">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
              Confidence Trend
            </h2>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient
                      id="confGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(38, 95%, 54%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(38, 95%, 54%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 16%, 18%)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(215, 15%, 50%)" }}
                    axisLine={{ stroke: "hsl(220, 16%, 18%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "hsl(215, 15%, 50%)" }}
                    axisLine={{ stroke: "hsl(220, 16%, 18%)" }}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 18%, 11%)",
                      border: "1px solid hsl(220, 16%, 18%)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(210, 20%, 90%)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stroke="hsl(38, 95%, 54%)"
                    strokeWidth={2}
                    fill="url(#confGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No data
              </div>
            )}
          </div>
        )}

        {/* Downtime by Asset */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="panel p-5 animate-fade-in">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
              Downtime by Asset (hrs)
            </h2>
            {downtimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={downtimeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 16%, 18%)"
                  />
                  <XAxis
                    dataKey="asset"
                    tick={{ fontSize: 9, fill: "hsl(215, 15%, 50%)" }}
                    axisLine={{ stroke: "hsl(220, 16%, 18%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(215, 15%, 50%)" }}
                    axisLine={{ stroke: "hsl(220, 16%, 18%)" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 18%, 11%)",
                      border: "1px solid hsl(220, 16%, 18%)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(210, 20%, 90%)",
                    }}
                  />
                  <Bar
                    dataKey="hours"
                    fill="hsl(172, 66%, 50%)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No data
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent RCA Runs */}
      <div className="panel p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Recent RCA Runs
          </h2>
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
                className="h-14 rounded-lg bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : runs.data && runs.data.length > 0 ? (
          <div className="space-y-2">
            {runs.data.slice(0, 5).map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3.5 hover:bg-secondary/50 hover:border-primary/20 transition-all cursor-pointer group"
                onClick={() => navigate(`/rca-runs/${run.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-primary status-indicator" />
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-medium text-foreground">
                      {run.asset_id}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {run.summary}
                    </p>
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
            No recent runs
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
