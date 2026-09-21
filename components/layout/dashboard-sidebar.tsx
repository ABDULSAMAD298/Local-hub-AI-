"use client";

import {
  Home,
  Building2,
  FolderOpen,
  MessageSquare,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { NavLink } from "@/components/layout/nav-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";

export const DASHBOARD_NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true },
  { href: "/dashboard/business", label: "My Business", icon: Building2 },
  { href: "/dashboard/media", label: "Media Library", icon: FolderOpen },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
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
        <Logo href="/dashboard" />
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {DASHBOARD_NAV_ITEMS.map((item) => (
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
            <Badge variant="secondary" className="mt-0.5 capitalize">
              {profile?.plan ?? "trial"} plan
            </Badge>
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
