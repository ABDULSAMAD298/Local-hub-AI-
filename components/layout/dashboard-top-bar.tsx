"use client";

import { usePathname } from "next/navigation";

import { TopBar } from "@/components/layout/top-bar";
import { AiStatusBadge } from "@/components/dashboard/ai-status-badge";
import { DASHBOARD_NAV_ITEMS } from "@/components/layout/dashboard-sidebar";

export function DashboardTopBar() {
  const pathname = usePathname();
  const current = DASHBOARD_NAV_ITEMS.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  return (
    <TopBar title={current?.label ?? "Dashboard"}>
      <AiStatusBadge />
    </TopBar>
  );
}
