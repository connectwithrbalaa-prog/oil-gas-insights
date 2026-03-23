import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function RunDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: run, isLoading, isError } = useQuery({
    queryKey: ["run", id],
    queryFn: () => api.getRunDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-40 w-full bg-muted rounded-lg" />
        <Skeleton className="h-40 w-full bg-muted rounded-lg" />
      </div>
    );
  }

  if (isError || !run) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Failed to load run details.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/rca-runs")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Runs
        </Button>
      </div>
    );
  }

  const sections = [
    { title: "Findings", items: run.findings },
    { title: "Recommendations", items: run.recommendations },
    { title: "PM Suggestions", items: run.pm_suggestions },
  ];

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/rca-runs")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Runs
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{run.asset_id}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Run ID: <span className="font-mono">{run.id}</span>
          </p>
        </div>
        <SeverityBadge severity={run.severity} />
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-card p-5 mb-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Summary
        </h2>
        <p className="text-foreground">{run.summary}</p>
        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
          {run.confidence_score != null && (
            <span>
              Confidence:{" "}
              <span className="font-mono text-primary">
                {Math.round(run.confidence_score * 100)}%
              </span>
            </span>
          )}
          <span>Date: {new Date(run.created_at).toLocaleString()}</span>
          {run.status && <span>Status: {run.status}</span>}
        </div>
      </div>

      {/* Findings, Recommendations, PM Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-lg border border-border bg-card p-5"
          >
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-3">
              {section.title}
            </h2>
            {section.items && section.items.length > 0 ? (
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No data available</p>
            )}
          </div>
        ))}
      </div>

      {/* Model info & Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(run.model_info || run.model) && (
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-3">
              Model Info
            </h2>
            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap overflow-auto max-h-60">
              {JSON.stringify(run.model_info || run.model, null, 2)}
            </pre>
          </div>
        )}
        {(run.context_metadata || run.context_meta) && (
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-3">
              Context Metadata
            </h2>
            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap overflow-auto max-h-60">
              {JSON.stringify(run.context_metadata || run.context_meta, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
