import type { ReactNode } from "react";

export function TopBar({
  title,
  breadcrumb,
  children,
}: {
  title: string;
  breadcrumb?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-bg-primary px-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        {breadcrumb && <p className="text-xs text-text-muted">{breadcrumb}</p>}
      </div>
      <div className="flex items-center gap-4">{children}</div>
    </header>
  );
}
