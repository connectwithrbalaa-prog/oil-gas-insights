import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ArrowLeft, ShieldCheck, Wrench, Lightbulb, Cpu, Database } from "lucide-react";
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
        <Skeleton className="h-8 w-48 bg-secondary" />
        <Skeleton className="h-40 w-full bg-secondary rounded-lg" />
        <Skeleton className="h-40 w-full bg-secondary rounded-lg" />
      </div>
    );
  }

  if (isError || !run) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Failed to load run details.</p>
        <Button
          variant="outline"
          className="mt-4 border-border"
          onClick={() => navigate("/rca-runs")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Runs
        </Button>
      </div>
    );
  }

  const sections = [
    {
      title: "Findings",
      items: run.findings,
      icon: ShieldCheck,
      color: "text-chart-blue",
      dotColor: "bg-chart-blue",
    },
    {
      title: "Recommendations",
      items: run.recommendations,
      icon: Wrench,
      color: "text-primary",
      dotColor: "bg-primary",
    },
    {
      title: "PM Suggestions",
      items: run.pm_suggestions,
      icon: Lightbulb,
      color: "text-chart-teal",
      dotColor: "bg-chart-teal",
    },
  ];

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-foreground hover:bg-secondary -ml-2"
        onClick={() => navigate("/rca-runs")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Runs
      </Button>

      {/* Header */}
      <div className="panel panel-glow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground font-mono">
              {run.asset_id}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              ID: {run.id}
            </p>
          </div>
          <SeverityBadge severity={run.severity} />
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed">
          {run.summary}
        </p>

        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
          {run.confidence_score != null && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Confidence
              </span>
              <span className="text-sm font-mono font-semibold text-primary">
                {Math.round(run.confidence_score * 100)}%
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Date
            </span>
            <span className="text-sm font-mono text-foreground">
              {new Date(run.created_at).toLocaleString()}
            </span>
          </div>
          {run.status && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Status
              </span>
              <span className="text-sm font-mono text-foreground capitalize">
                {run.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Findings, Recommendations, PM Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="panel p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <section.icon className={`w-4 h-4 ${section.color}`} />
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                {section.title}
              </h2>
            </div>
            {section.items && section.items.length > 0 ? (
              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-foreground/90 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${section.dotColor} mt-2 shrink-0`}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No data available
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Model info & Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {run.model_info && (
          <div className="panel p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-chart-blue" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                Model Info
              </h2>
            </div>
            <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap overflow-auto max-h-60 bg-secondary/50 rounded-md p-3 border border-border">
              {JSON.stringify(run.model_info, null, 2)}
            </pre>
          </div>
        )}
        {run.context_metadata && (
          <div className="panel p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-chart-teal" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                Context Metadata
              </h2>
            </div>
            <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap overflow-auto max-h-60 bg-secondary/50 rounded-md p-3 border border-border">
              {JSON.stringify(run.context_metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
