"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon: Icon,
  exact = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-r-md border-l-[3px] border-transparent px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-tertiary hover:text-text-primary",
        isActive && "border-accent bg-accent/10 text-text-primary"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-accent")} />
      <span className="truncate">{label}</span>
    </Link>
  );
}
