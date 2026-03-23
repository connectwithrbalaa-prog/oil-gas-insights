import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const level = severity?.toLowerCase() || "unknown";

  const classes: Record<string, string> = {
    critical: "severity-critical",
    high: "severity-high",
    medium: "severity-medium",
    low: "severity-low",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium uppercase tracking-wider",
        classes[level] || "bg-muted text-muted-foreground border border-border",
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full", {
          "bg-destructive": level === "critical",
          "bg-orange-400": level === "high",
          "bg-yellow-400": level === "medium",
          "bg-success": level === "low",
          "bg-muted-foreground": !["critical", "high", "medium", "low"].includes(level),
        })}
      />
      {severity || "Unknown"}
    </span>
  );
}
