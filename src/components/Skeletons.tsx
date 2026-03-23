import { Skeleton } from "@/components/ui/skeleton";

export function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Skeleton className="h-4 w-24 mb-3 bg-muted" />
      <Skeleton className="h-10 w-20 mb-2 bg-muted" />
      <Skeleton className="h-3 w-32 bg-muted" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-3/4 bg-muted" />
      <Skeleton className="h-3 w-full bg-muted" />
      <Skeleton className="h-3 w-2/3 bg-muted" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full bg-muted" />
        <Skeleton className="h-6 w-20 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-4 w-48 bg-muted" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-border last:border-0">
          <Skeleton className="h-4 w-1/4 bg-muted" />
          <Skeleton className="h-4 w-1/4 bg-muted" />
          <Skeleton className="h-4 w-1/6 bg-muted" />
          <Skeleton className="h-4 w-1/6 bg-muted" />
          <Skeleton className="h-4 w-1/6 bg-muted" />
        </div>
      ))}
    </div>
  );
}
