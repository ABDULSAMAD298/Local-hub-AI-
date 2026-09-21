"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subMonths, startOfMonth } from "date-fns";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatsCard } from "@/components/dashboard/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { PlanName, Profile } from "@/lib/types";

const PLAN_COLORS: Record<string, string> = {
  starter: "#8899BB",
  growth: "#00C6FF",
  pro: "#00E87A",
};

export default function RevenuePage() {
  const supabase = useSupabase();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("*").eq("role", "client");
      setProfiles((data as Profile[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const activeProfiles = profiles.filter((p) => p.plan_status === "active");
  const mrr = activeProfiles.reduce((sum, p) => {
    const limits = PLAN_LIMITS[p.plan as keyof typeof PLAN_LIMITS];
    return sum + (limits?.price ?? 0);
  }, 0);
  const arr = mrr * 12;
  const churn =
    profiles.length > 0
      ? Math.round((profiles.filter((p) => p.plan_status === "canceled").length / profiles.length) * 100)
      : 0;

  const revenueByPlan = useMemo(() => {
    const totals: Record<string, number> = { starter: 0, growth: 0, pro: 0 };
    for (const profile of activeProfiles) {
      const limits = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS];
      if (limits) totals[profile.plan] = (totals[profile.plan] ?? 0) + limits.price;
    }
    return (Object.keys(totals) as PlanName[])
      .filter((plan) => totals[plan] > 0)
      .map((plan) => ({ name: plan, value: totals[plan] }));
  }, [activeProfiles]);

  const newClientsByMonth = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = startOfMonth(subMonths(new Date(), 5 - i));
      return { key: format(date, "yyyy-MM"), label: format(date, "MMM"), count: 0 };
    });
    const byMonth = new Map(months.map((m) => [m.key, m]));
    for (const profile of profiles) {
      const key = profile.created_at?.slice(0, 7);
      const bucket = key ? byMonth.get(key) : undefined;
      if (bucket) bucket.count += 1;
    }
    return months;
  }, [profiles]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard label="MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSign} accent="success" />
        <StatsCard label="ARR" value={`$${arr.toLocaleString()}`} icon={TrendingUp} />
        <StatsCard label="Churn Rate" value={`${churn}%`} icon={TrendingDown} accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-bg-secondary p-5">
          <h2 className="mb-3 text-sm font-semibold text-text-secondary">Revenue by Plan</h2>
          {revenueByPlan.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-text-muted">
              No active subscriptions yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip
                  contentStyle={{ background: "#111E35", border: "1px solid #1A2F52", borderRadius: 8 }}
                  labelStyle={{ color: "#F0F4FF" }}
                />
                <Pie data={revenueByPlan} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {revenueByPlan.map((entry) => (
                    <Cell key={entry.name} fill={PLAN_COLORS[entry.name]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-card border border-border bg-bg-secondary p-5">
          <h2 className="mb-3 text-sm font-semibold text-text-secondary">New Clients by Month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={newClientsByMonth}>
              <CartesianGrid stroke="#1A2F52" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#8899BB", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8899BB", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#111E35", border: "1px solid #1A2F52", borderRadius: 8 }}
                labelStyle={{ color: "#F0F4FF" }}
              />
              <Bar dataKey="count" name="New Clients" fill="#00C6FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Transactions</h2>
        <div className="overflow-hidden rounded-card border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-text-muted">
                  No transactions recorded yet — connect Stripe to see live transaction history here.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
