"use client";

import { usePathname } from "next/navigation";

import { TopBar } from "@/components/layout/top-bar";
import { NotificationBell } from "@/components/super-admin/notification-bell";
import { SUPER_ADMIN_NAV_ITEMS } from "@/components/layout/super-admin-sidebar";

export function SuperAdminTopBar() {
  const pathname = usePathname();
  const current = SUPER_ADMIN_NAV_ITEMS.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  return (
    <TopBar title={current?.label ?? "Super Admin"}>
      <NotificationBell />
    </TopBar>
  );
}
