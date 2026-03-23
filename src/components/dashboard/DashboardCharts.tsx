import { ChartSkeleton } from "@/components/Skeletons";
import type { RcaRun, FailureEvent } from "@/lib/api";
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

interface DashboardChartsProps {
  runs: RcaRun[];
  events: FailureEvent[];
  isLoading: boolean;
}

const severityColors: Record<string, string> = {
  Critical: "hsl(0, 72%, 55%)",
  High: "hsl(25, 90%, 55%)",
  Medium: "hsl(45, 90%, 55%)",
  Low: "hsl(152, 70%, 42%)",
  Unknown: "hsl(215, 15%, 50%)",
};

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 11%)",
  border: "1px solid hsl(220, 16%, 18%)",
  borderRadius: "6px",
  fontSize: "12px",
  color: "hsl(210, 20%, 90%)",
};

export function DashboardCharts({ runs, events, isLoading }: DashboardChartsProps) {
  // Severity distribution
  const severityCounts = runs.reduce<Record<string, number>>((acc, r) => {
    const s = r.severity?.toLowerCase() || "unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const severityData = Object.entries(severityCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Confidence trend
  const trendData = [...runs]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((r) => ({
      date: new Date(r.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      confidence: Math.round((r.confidence_score ?? 0) * 100),
      asset: r.asset_id,
    }));

  // Downtime by asset
  const downtimeData = events.slice(0, 10).map((e) => ({
    asset: e.asset_id || e.id,
    hours: e.downtime_hours ?? 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Severity Distribution */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="panel p-5 animate-fade-in">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
            Risk Distribution
          </h2>
          <p className="text-[11px] text-muted-foreground mb-4">
            Severity breakdown of {runs.length} analyses
          </p>
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
                      fill={severityColors[entry.name] || severityColors.Unknown}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
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
                    backgroundColor: severityColors[s.name] || severityColors.Unknown,
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
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
            AI Confidence Trend
          </h2>
          <p className="text-[11px] text-muted-foreground mb-4">
            Diagnostic accuracy over recent analyses
          </p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="confGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(38, 95%, 54%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(38, 95%, 54%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
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
                <Tooltip contentStyle={tooltipStyle} />
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
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
            Estimated Downtime Impact
          </h2>
          <p className="text-[11px] text-muted-foreground mb-4">
            Hours at risk per asset
          </p>
          {downtimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={downtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
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
                <Tooltip contentStyle={tooltipStyle} />
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
  );
}
