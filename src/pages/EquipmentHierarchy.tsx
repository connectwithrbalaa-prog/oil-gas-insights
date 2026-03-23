import { useQuery } from "@tanstack/react-query";
import { api, HierarchyNode } from "@/lib/api";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { ChevronRight, Network, Server, Layers, Cog, Building2 } from "lucide-react";
import { useState } from "react";

const typeConfig: Record<string, { icon: typeof Server; color: string; bgColor: string }> = {
  site: { icon: Building2, color: "text-info", bgColor: "bg-info/10" },
  facility: { icon: Layers, color: "text-primary", bgColor: "bg-primary/10" },
  system: { icon: Network, color: "text-chart-teal", bgColor: "bg-chart-teal/10" },
  equipment: { icon: Cog, color: "text-muted-foreground", bgColor: "bg-secondary" },
};

export default function EquipmentHierarchy() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hierarchy"],
    queryFn: api.getHierarchy,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Equipment Hierarchy
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Site → Facility → System → Equipment breakdown
        </p>
      </div>

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
        <div className="panel overflow-hidden">
          {data.map((node, i) => (
            <TreeNode key={node.id} node={node} depth={0} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeNode({
  node,
  depth,
  index,
}: {
  node: HierarchyNode;
  depth: number;
  index: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const config = typeConfig[node.type?.toLowerCase()] || typeConfig.equipment;
  const Icon = config.icon;

  return (
    <div>
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/40 transition-all cursor-pointer animate-fade-in"
        style={{
          paddingLeft: `${depth * 24 + 16}px`,
          animationDelay: `${index * 30}ms`,
        }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          <ChevronRight
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
          />
        ) : (
          <span className="w-4" />
        )}

        <div
          className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${config.bgColor}`}
        >
          <Icon className={`w-3 h-3 ${config.color}`} />
        </div>

        <span
          className={`text-[10px] uppercase tracking-[0.15em] font-medium ${config.color}`}
        >
          {node.type}
        </span>

        <span className="text-sm text-foreground font-medium">{node.name}</span>

        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
          {node.id}
        </span>

        {hasChildren && (
          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
            {node.children!.length}
          </span>
        )}
      </div>

      {open &&
        hasChildren &&
        node.children!.map((child, i) => (
          <TreeNode key={child.id} node={child} depth={depth + 1} index={i} />
        ))}
    </div>
  );
}
