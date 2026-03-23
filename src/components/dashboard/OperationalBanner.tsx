import { Shield, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

interface OperationalBannerProps {
  criticalCount: number;
  activeAlerts: number;
  resolvedCount: number;
  avgConfidence: number;
}

export function OperationalBanner({
  criticalCount,
  activeAlerts,
  resolvedCount,
  avgConfidence,
}: OperationalBannerProps) {
  const isHealthy = criticalCount === 0;

  return (
    <div
      className={`rounded-lg border p-4 animate-fade-in ${
        isHealthy
          ? "bg-success/5 border-success/20"
          : "bg-destructive/5 border-destructive/20"
      }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {isHealthy ? (
            <Shield className="w-5 h-5 text-success" />
          ) : (
            <AlertCircle className="w-5 h-5 text-destructive animate-pulse" />
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isHealthy
                ? "All Systems Operational"
                : `${criticalCount} Critical Alert${criticalCount > 1 ? "s" : ""} — Action Required`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isHealthy
                ? `${resolvedCount} analyses completed · ${avgConfidence}% avg AI confidence`
                : `${activeAlerts} active alerts across plant · ${resolvedCount} analyses awaiting review`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>{resolvedCount} resolved</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-chart-blue" />
            <span>{avgConfidence}% confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
