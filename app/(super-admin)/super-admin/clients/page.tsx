"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Settings2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceToggle } from "@/components/super-admin/service-toggle";
import { ChangePlanDialog } from "@/components/super-admin/change-plan-dialog";
import { useSupabase } from "@/components/providers/supabase-provider";
import { isTrialing } from "@/lib/format";
import type { Business, Profile } from "@/lib/types";

// "Trial" is derived from trial_ends_at, not a plan_status value — the DB
// only allows active | inactive | past_due | canceled.
type StatusFilter = "all" | "trial" | "active" | "past_due" | "canceled";
type SortKey = "date" | "plan" | "businesses";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  trial: "Trial",
  active: "Active",
  past_due: "Inactive",
  canceled: "Suspended",
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function AllClientsPage() {
  const supabase = useSupabase();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [messagesByUser, setMessagesByUser] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [planDialogFor, setPlanDialogFor] = useState<Profile | null>(null);

  async function loadData() {
    setLoading(true);
    const [{ data: profileData }, { data: businessData }, { data: analyticsData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "client"),
      supabase.from("businesses").select("*"),
      supabase.from("analytics").select("business_id, messages_received").eq("date", todayDateString()),
    ]);

    const businessList = (businessData as Business[]) ?? [];
    setProfiles((profileData as Profile[]) ?? []);
    setBusinesses(businessList);

    const businessToUser = new Map(businessList.map((b) => [b.id, b.user_id]));
    const totals: Record<string, number> = {};
    for (const row of (analyticsData as { business_id: string; messages_received: number }[]) ?? []) {
      const userId = businessToUser.get(row.business_id);
      if (!userId) continue;
      totals[userId] = (totals[userId] ?? 0) + row.messages_received;
    }
    setMessagesByUser(totals);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const businessesByUser = useMemo(() => {
    const map = new Map<string, Business[]>();
    for (const business of businesses) {
      const list = map.get(business.user_id) ?? [];
      list.push(business);
      map.set(business.user_id, list);
    }
    return map;
  }, [businesses]);

  const filtered = useMemo(() => {
    let result = profiles.filter((p) => {
      if (status === "trial" && !isTrialing(p.trial_ends_at)) return false;
      if (status !== "all" && status !== "trial" && p.plan_status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        return (p.full_name ?? "").toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === "plan") return a.plan.localeCompare(b.plan);
      if (sort === "businesses") {
        return (businessesByUser.get(b.id)?.length ?? 0) - (businessesByUser.get(a.id)?.length ?? 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [profiles, status, search, sort, businessesByUser]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search name or email…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {STATUS_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort: Date</SelectItem>
              <SelectItem value="plan">Sort: Plan</SelectItem>
              <SelectItem value="businesses">Sort: Businesses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="hidden md:table-cell">Businesses</TableHead>
                <TableHead className="hidden lg:table-cell">Messages Today</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((profile) => {
                const clientBusinesses = businessesByUser.get(profile.id) ?? [];
                const allActive =
                  clientBusinesses.length > 0 && clientBusinesses.every((b) => b.status === "active");
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {(profile.full_name ?? profile.email).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{profile.full_name ?? "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell">{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {profile.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{clientBusinesses.length}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {messagesByUser[profile.id] ?? 0}
                    </TableCell>
                    <TableCell>
                      <ServiceToggle
                        businessIds={clientBusinesses.map((b) => b.id)}
                        active={allActive}
                        onToggled={loadData}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/super-admin/clients/${profile.id}`}>View</Link>
                        </Button>
                        <button
                          onClick={() => setPlanDialogFor(profile)}
                          className="rounded-control p-1.5 text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
                          aria-label="Change plan"
                        >
                          <Settings2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {planDialogFor && (
        <ChangePlanDialog
          profileId={planDialogFor.id}
          currentPlan={planDialogFor.plan === "trial" ? "starter" : planDialogFor.plan}
          currentStatus={planDialogFor.plan_status}
          open={Boolean(planDialogFor)}
          onOpenChange={(open) => !open && setPlanDialogFor(null)}
          onChanged={loadData}
        />
      )}
    </div>
  );
}
