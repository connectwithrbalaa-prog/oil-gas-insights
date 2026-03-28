import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Wrench, Play, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { PmProposal } from "@/types/api";

export default function PmProposals() {
  const runs = useQuery({ queryKey: ["runs"], queryFn: api.getRuns });
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [proposal, setProposal] = useState<PmProposal | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: () => api.analyzeRunSummary({ run_id: selectedRunId }),
    onSuccess: (data) => {
      setProposal(data.proposal);
      toast({ title: "Proposal generated", description: `ID: ${data.proposal.id}` });
    },
    onError: () => toast({ title: "Analysis failed", variant: "destructive" }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveProposal(id),
    onSuccess: (data) => {
      setProposal(data.proposal);
      toast({
        title: "Proposal approved",
        description: data.work_order_id ? `Work order: ${data.work_order_id}` : "Handed off to CMMS",
      });
    },
    onError: () => toast({ title: "Approval failed", variant: "destructive" }),
  });

  const selectedRun = runs.data?.find((r) => r.id === selectedRunId);

  const statusIcon = (status: string) => {
    if (status === "approved" || status === "handed_off") return <CheckCircle2 className="w-4 h-4 text-chart-teal" />;
    if (status === "failed") return <AlertCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-chart-amber" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          PM Proposals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate preventive maintenance proposals from RCA runs and approve them to CMMS
        </p>
      </div>

      {/* Step 1: Select a run */}
      <div className="panel p-5 animate-fade-in">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
          Step 1 — select an RCA run
        </h2>
        {runs.isLoading ? (
          <div className="h-10 rounded-lg bg-secondary animate-pulse" />
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <select
                value={selectedRunId}
                onChange={(e) => { setSelectedRunId(e.target.value); setProposal(null); }}
                className="w-full appearance-none bg-card border border-border rounded-lg pl-3 pr-8 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">Select a run…</option>
                {(runs.data ?? []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.asset_id}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            <button
              disabled={!selectedRunId || analyzeMutation.isPending}
              onClick={() => analyzeMutation.mutate()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5" />
              {analyzeMutation.isPending ? "Analysing…" : "Analyse run"}
            </button>
          </div>
        )}
        {selectedRun && (
          <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-medium text-primary">{selectedRun.asset_id}</span>
              <SeverityBadge severity={selectedRun.severity} />
            </div>
            <p className="text-muted-foreground text-xs line-clamp-2">{selectedRun.summary}</p>
          </div>
        )}
      </div>

      {/* Step 2: Proposal */}
      {proposal && (
        <div className="panel p-5 animate-fade-in space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
                Step 2 — review proposal
              </h2>
              <p className="text-sm font-medium text-foreground">{proposal.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {statusIcon(proposal.status)}
                <span className="text-xs font-mono text-muted-foreground capitalize">{proposal.status}</span>
                {proposal.confidence != null && (
                  <span className="text-xs font-mono text-primary">
                    {Math.round(proposal.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            </div>
            {(proposal.status === "pending") && (
              <button
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate(proposal.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-chart-teal text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {approveMutation.isPending ? "Approving…" : "Approve & hand off"}
              </button>
            )}
          </div>

          {proposal.work_order_id && (
            <div className="flex items-center gap-2 rounded-lg border border-chart-teal/30 bg-chart-teal/10 px-3 py-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-chart-teal" />
              <span className="text-chart-teal font-medium">Work order created:</span>
              <span className="font-mono text-chart-teal">{proposal.work_order_id}</span>
            </div>
          )}

          {/* Immediate actions */}
          {proposal.immediate_actions && proposal.immediate_actions.length > 0 && (
            <div>
              <button
                className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2"
                onClick={() => setExpanded(expanded === "actions" ? null : "actions")}
              >
                {expanded === "actions" ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Immediate actions
              </button>
              {expanded === "actions" && (
                <ul className="space-y-1.5">
                  {proposal.immediate_actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* PM suggestions */}
          {proposal.pm_suggestions && proposal.pm_suggestions.length > 0 && (
            <div>
              <button
                className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2"
                onClick={() => setExpanded(expanded === "pm" ? null : "pm")}
              >
                {expanded === "pm" ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                PM suggestions
              </button>
              {expanded === "pm" && (
                <ul className="space-y-1.5">
                  {proposal.pm_suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-chart-teal font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {!proposal && !analyzeMutation.isPending && !selectedRunId && (
        <EmptyState
          title="No proposal yet"
          description="Select an RCA run above and click Analyse to generate a PM proposal."
          icon={<Wrench className="w-6 h-6 text-muted-foreground" />}
        />
      )}
    </div>
  );
}
