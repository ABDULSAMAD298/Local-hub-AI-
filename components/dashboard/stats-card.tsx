import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  icon: Icon,
  accent = "accent",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "accent" | "success" | "warning";
}) {
  return (
    <div className="group rounded-card border border-border bg-bg-secondary p-5 transition-all duration-150 hover:border-accent/40 hover:shadow-accent-glow">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-control",
            accent === "accent" && "bg-accent/10 text-accent",
            accent === "success" && "bg-success/10 text-success",
            accent === "warning" && "bg-warning/10 text-warning"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
