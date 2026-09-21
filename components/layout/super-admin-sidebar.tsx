"use client";

import { LayoutDashboard, Users, DollarSign, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { NavLink } from "@/components/layout/nav-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useSupabase } from "@/components/providers/supabase-provider";

export const SUPER_ADMIN_NAV_ITEMS = [
  { href: "/super-admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/super-admin/clients", label: "All Clients", icon: Users },
  { href: "/super-admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/super-admin/settings", label: "Settings", icon: Settings },
];

export function SuperAdminSidebar() {
  const { profile } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = (profile?.full_name ?? profile?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-bg-secondary">
      <div className="flex h-16 items-center px-4">
        <Logo href="/super-admin" />
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {SUPER_ADMIN_NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {profile?.full_name ?? profile?.email ?? "Loading…"}
            </p>
            <Badge className="mt-0.5">Super Admin</Badge>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-control p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-error"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
