import { Skeleton } from "@/components/ui/skeleton";

export function KpiSkeleton() {
  return (
    <div className="panel p-5 space-y-3">
      <Skeleton className="h-3 w-20 bg-secondary" />
      <Skeleton className="h-9 w-16 bg-secondary" />
      <Skeleton className="h-2 w-28 bg-secondary" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="panel p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24 bg-secondary" />
        <Skeleton className="h-5 w-16 rounded bg-secondary" />
      </div>
      <Skeleton className="h-3 w-full bg-secondary" />
      <Skeleton className="h-3 w-2/3 bg-secondary" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-5 w-20 rounded bg-secondary" />
        <Skeleton className="h-5 w-24 rounded bg-secondary" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="panel overflow-hidden">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-4 w-48 bg-secondary" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-border last:border-0">
          <Skeleton className="h-4 w-1/4 bg-secondary" />
          <Skeleton className="h-4 w-1/4 bg-secondary" />
          <Skeleton className="h-4 w-1/6 bg-secondary" />
          <Skeleton className="h-4 w-1/6 bg-secondary" />
          <Skeleton className="h-4 w-1/6 bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="panel p-5 space-y-3">
      <Skeleton className="h-3 w-32 bg-secondary" />
      <Skeleton className="h-48 w-full bg-secondary rounded" />
    </div>
  );
}
