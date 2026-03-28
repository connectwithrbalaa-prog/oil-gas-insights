import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ChartSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { Activity, AlertTriangle, ChevronDown } from "lucide-react";

const KNOWN_ASSETS = [
  "COMP-220", "COMP-340", "GT-401", "PS-105B",
  "PL-6200", "GEN-501", "HX-310A", "MOT-150",
];

export default function Signals() {
  const [assetId, setAssetId] = useState(KNOWN_ASSETS[0]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["signals", assetId],
    queryFn: () => api.getSignalsSummary(assetId),
    enabled: !!assetId,
  });

  const signalNames = data ? Object.keys(data.signals) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Signals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live sensor readings and rollups per asset
          </p>
        </div>
        {/* Asset selector */}
        <div className="relative">
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="appearance-none bg-card border border-border rounded-lg pl-3 pr-8 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {KNOWN_ASSETS.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <ChartSkeleton key={i} />)}
        </div>
      ) : isError || !data ? (
        <EmptyState title="No signal data" description="Unable to load signals for this asset." />
      ) : signalNames.length === 0 ? (
        <EmptyState title="No signals recorded" description="No sensor readings found for this asset." />
      ) : (
        <div className="space-y-4">
          {/* Rollup summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {signalNames.flatMap((name) =>
              (data.rollups[name] ?? []).map((rollup) => (
                <div key={`${name}-${rollup.window}`} className="panel p-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                      {name} · {rollup.window}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "mean", val: rollup.mean },
                      { label: "min", val: rollup.min },
                      { label: "max", val: rollup.max },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="text-lg font-mono font-bold text-foreground">{s.val.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sparkline per signal */}
          {signalNames.map((name) => {
            const readings = data.signals[name] ?? [];
            if (readings.length === 0) return null;
            const vals = readings.map((r) => r.value);
            const minV = Math.min(...vals);
            const maxV = Math.max(...vals);
            const range = maxV - minV || 1;
            const H = 80;
            const W = 600;
            const step = W / (readings.length - 1 || 1);
            const points = readings
              .map((r, i) => `${i * step},${H - ((r.value - minV) / range) * H}`)
              .join(" ");
            const anomalies = readings.filter((r) => r.anomaly);

            return (
              <div key={name} className="panel p-5 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                      {name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {readings[0]?.unit ?? ""} · {readings.length} readings
                    </p>
                  </div>
                  {anomalies.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-chart-amber">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {anomalies.length} anomal{anomalies.length === 1 ? "y" : "ies"}
                    </div>
                  )}
                </div>

                {/* SVG sparkline */}
                <div className="overflow-x-auto">
                  <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-24">
                    {/* Anomaly markers */}
                    {readings.map((r, i) =>
                      r.anomaly ? (
                        <circle
                          key={i}
                          cx={i * step}
                          cy={H - ((r.value - minV) / range) * H}
                          r="4"
                          fill="#EF9F27"
                          opacity="0.8"
                        />
                      ) : null
                    )}
                    {/* Line */}
                    <polyline
                      points={points}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Dots */}
                    {readings.map((r, i) => (
                      <circle
                        key={i}
                        cx={i * step}
                        cy={H - ((r.value - minV) / range) * H}
                        r="2"
                        fill="hsl(var(--primary))"
                        opacity={r.anomaly ? 0 : 0.6}
                      />
                    ))}
                    {/* Y labels */}
                    <text x="2" y="10" fontSize="9" fill="currentColor" opacity="0.4">{maxV.toFixed(1)}</text>
                    <text x="2" y={H} fontSize="9" fill="currentColor" opacity="0.4">{minV.toFixed(1)}</text>
                  </svg>
                </div>

                {/* Latest readings list */}
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {readings.slice(-6).map((r, i) => (
                    <div
                      key={i}
                      className={`rounded-md p-2 text-center border ${
                        r.anomaly
                          ? "border-chart-amber/40 bg-chart-amber/10"
                          : "border-border bg-secondary/30"
                      }`}
                    >
                      <p className={`text-xs font-mono font-bold ${r.anomaly ? "text-chart-amber" : "text-foreground"}`}>
                        {r.value.toFixed(1)}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {new Date(r.ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
