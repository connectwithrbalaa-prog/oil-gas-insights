import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";

type SortKey = "asset_id" | "failure_mode" | "severity" | "downtime_hours" | "date";

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
    { key: "downtime_hours", label: "Downtime (hrs)" },
    { key: "date", label: "Date" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Failure Events</h1>
      <p className="text-muted-foreground text-sm mb-6">
        All recorded failure events across monitored assets
      </p>

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
        <div className="rounded-lg border border-border bg-card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-foreground">
                    {event.asset_id}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {event.failure_mode}
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={event.severity} />
                  </td>
                  <td className="px-4 py-3 font-mono text-foreground">
                    {event.downtime_hours}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
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
