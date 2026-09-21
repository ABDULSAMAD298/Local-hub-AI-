import { Construction } from "lucide-react";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border text-center">
      <Construction className="h-8 w-8 text-text-muted" />
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="max-w-sm text-sm text-text-secondary">
        This page is being built in an upcoming phase.
      </p>
    </div>
  );
}
