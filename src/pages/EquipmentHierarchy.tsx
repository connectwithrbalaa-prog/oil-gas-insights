import { useQuery } from "@tanstack/react-query";
import { api, HierarchyNode } from "@/lib/api";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { ChevronRight, Network } from "lucide-react";
import { useState } from "react";

export default function EquipmentHierarchy() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hierarchy"],
    queryFn: api.getHierarchy,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">
        Equipment Hierarchy
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Site → Facility → System → Equipment breakdown
      </p>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isError || !data ? (
        <EmptyState
          title="Unable to load hierarchy"
          description="There was an error fetching equipment hierarchy data."
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description="No equipment hierarchy data has been configured."
          icon={<Network className="w-6 h-6 text-muted-foreground" />}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {data.map((node) => (
            <TreeNode key={node.id} node={node} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeNode({ node, depth }: { node: HierarchyNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  const typeColors: Record<string, string> = {
    site: "text-info",
    facility: "text-primary",
    system: "text-success",
    equipment: "text-muted-foreground",
  };

  return (
    <div>
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
        style={{ paddingLeft: `${depth * 24 + 16}px` }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          <ChevronRight
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
        ) : (
          <span className="w-4" />
        )}

        <span
          className={`text-xs uppercase tracking-wider font-medium ${
            typeColors[node.type?.toLowerCase()] || "text-muted-foreground"
          }`}
        >
          {node.type}
        </span>

        <span className="text-sm text-foreground font-medium">{node.name}</span>
        <span className="text-xs text-muted-foreground font-mono ml-auto">
          {node.id}
        </span>
      </div>

      {open &&
        hasChildren &&
        node.children!.map((child) => (
          <TreeNode key={child.id} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}
