"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow, subDays, format } from "date-fns";
import { Users, Building2, DollarSign, MessageSquare } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceToggle } from "@/components/super-admin/service-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSupabase } from "@/components/providers/supabase-provider";
import { PLAN_LIMITS } from "@/lib/plans";
import type { Business, Profile } from "@/lib/types";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function SuperAdminOverviewPage() {
  const supabase = useSupabase();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [messagesToday, setMessagesToday] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [{ data: profileData }, { data: businessData }, { data: analyticsData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "client").order("created_at", { ascending: false }),
      supabase.from("businesses").select("*"),
      supabase.from("analytics").select("messages_received").eq("date", todayDateString()),
    ]);
    setProfiles((profileData as Profile[]) ?? []);
    setBusinesses((businessData as Business[]) ?? []);
    setMessagesToday(
      ((analyticsData as { messages_received: number }[]) ?? []).reduce(
        (sum, row) => sum + row.messages_received,
        0
      )
    );
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const businessesByUser = useMemo(() => {
    const map = new Map<string, Business[]>();
    for (const business of businesses) {
      const list = map.get(business.user_id) ?? [];
      list.push(business);
      map.set(business.user_id, list);
    }
    return map;
  }, [businesses]);

  const activeBusinesses = businesses.filter((b) => b.status === "active").length;
  const monthlyRevenue = profiles.reduce((sum, profile) => {
    if (profile.plan_status !== "active") return sum;
    const limits = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS];
    return sum + (limits?.price ?? 0);
  }, 0);

  const signupTrend = useMemo(() => {
    const days = Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(new Date(), 29 - i);
      return { key: format(date, "yyyy-MM-dd"), label: format(date, "MMM d"), count: 0 };
    });
    const byDay = new Map(days.map((d) => [d.key, d]));
    for (const profile of profiles) {
      const key = profile.created_at?.slice(0, 10);
      const bucket = key ? byDay.get(key) : undefined;
      if (bucket) bucket.count += 1;
    }
    return days;
  }, [profiles]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Total Clients" value={profiles.length} icon={Users} />
          <StatsCard label="Active Businesses" value={activeBusinesses} icon={Building2} accent="success" />
          <StatsCard label="Monthly Revenue" value={`$${monthlyRevenue.toLocaleString()}`} icon={DollarSign} />
          <StatsCard label="Messages Today" value={messagesToday} icon={MessageSquare} accent="warning" />
        </div>
      )}

      <div className="rounded-card border border-border bg-bg-secondary p-5">
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">New Clients (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={signupTrend}>
            <CartesianGrid stroke="#1A2F52" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#8899BB", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fill: "#8899BB", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#111E35", border: "1px solid #1A2F52", borderRadius: 8 }}
              labelStyle={{ color: "#F0F4FF" }}
            />
            <Line type="monotone" dataKey="count" name="New Clients" stroke="#00C6FF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Clients</h2>
        <div className="overflow-hidden rounded-card border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="hidden md:table-cell">Businesses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.slice(0, 10).map((profile) => {
                const clientBusinesses = businessesByUser.get(profile.id) ?? [];
                const allActive =
                  clientBusinesses.length > 0 && clientBusinesses.every((b) => b.status === "active");
                return (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.full_name ?? "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell">{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {profile.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{clientBusinesses.length}</TableCell>
                    <TableCell>
                      <ServiceToggle
                        businessIds={clientBusinesses.map((b) => b.id)}
                        active={allActive}
                        onToggled={loadData}
                      />
                    </TableCell>
                    <TableCell className="hidden text-xs text-text-muted lg:table-cell">
                      {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
