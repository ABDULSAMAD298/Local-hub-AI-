import { cn } from "@/lib/utils";

export function AiStatusBadge({ active = true }: { active?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-badge border border-border bg-bg-tertiary px-3 py-1.5 text-xs font-medium text-text-secondary">
      <span className="relative flex h-2 w-2">
        {active && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              "bg-success"
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            active ? "bg-success" : "bg-error"
          )}
        />
      </span>
      {active ? "AI Active" : "Service Paused"}
    </div>
  );
}
