import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function RcaRuns() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["runs"],
    queryFn: api.getRuns,
  });
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">RCA Runs</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Root cause analysis runs across all monitored assets
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError || !data ? (
        <EmptyState
          title="Unable to load RCA runs"
          description="There was an error fetching data from the server. Please try again later."
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="No RCA runs found"
          description="No root cause analysis runs have been recorded yet."
          icon={<Search className="w-6 h-6 text-muted-foreground" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((run) => (
            <div
              key={run.id}
              className="rounded-lg border border-border bg-card p-5 hover:border-primary/40 transition-all cursor-pointer group"
              onClick={() => navigate(`/rca-runs/${run.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-mono font-medium text-foreground">
                  {run.asset_id}
                </span>
                <SeverityBadge severity={run.severity} />
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {run.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {run.confidence_score != null && (
                    <span className="text-xs font-mono text-primary">
                      {Math.round(run.confidence_score * 100)}% confidence
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(run.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-xs text-primary font-medium group-hover:underline">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
