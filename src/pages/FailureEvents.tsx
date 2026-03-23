import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useState, useMemo } from "react";
import { ArrowUpDown, AlertTriangle, Clock } from "lucide-react";

type SortKey =
  | "asset_id"
  | "failure_mode"
  | "severity"
  | "downtime_hours"
  | "date";

export default function FailureEvents() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["failure-events"],
    queryFn: api.getFailureEvents,
  });

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "asset_id", label: "Asset" },
    { key: "failure_mode", label: "Failure Mode" },
    { key: "severity", label: "Severity" },
    { key: "downtime_hours", label: "Downtime" },
    { key: "date", label: "Date" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Failure Events
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All recorded failure events across monitored assets
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isError || !data ? (
        <EmptyState
          title="Unable to load failure events"
          description="There was an error fetching failure event data."
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="No failure events"
          description="No failure events have been recorded yet."
        />
      ) : (
        <div className="panel overflow-auto animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.label}
                      <ArrowUpDown
                        className={`w-3 h-3 transition-colors ${
                          sortKey === col.key
                            ? "text-primary"
                            : "text-muted-foreground/50"
                        }`}
                      />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((event, i) => (
                <tr
                  key={event.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-4 py-3.5 font-mono text-foreground text-sm">
                    {event.asset_id}
                  </td>
                  <td className="px-4 py-3.5 text-foreground/90">
                    {event.failure_mode}
                  </td>
                  <td className="px-4 py-3.5">
                    <SeverityBadge severity={event.severity} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 font-mono text-foreground">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {event.downtime_hours}h
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
