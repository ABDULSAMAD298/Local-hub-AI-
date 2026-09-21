"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { MessageSquare, Repeat2, TrendingUp, Target } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatsCard } from "@/components/dashboard/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useBusiness } from "@/components/providers/business-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Analytics, ConversationStatus } from "@/lib/types";

type Range = "7" | "14" | "30" | "custom";

const CHART_GRID = "#1A2F52";
const CHART_MUTED = "#8899BB";
const TOOLTIP_STYLE = {
  contentStyle: { background: "#111E35", border: "1px solid #1A2F52", borderRadius: 8 },
  labelStyle: { color: "#F0F4FF" },
};

const STATUS_COLORS: Record<ConversationStatus, string> = {
  active: "#00E87A",
  follow_up: "#FFB800",
  closed: "#4A5F80",
};

export default function AnalyticsPage() {
  const supabase = useSupabase();
  const { business, loading: businessLoading } = useBusiness();
  const [range, setRange] = useState<Range>("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [rows, setRows] = useState<Analytics[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<ConversationStatus, number>>({
    active: 0,
    follow_up: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);

  const { from, to } = useMemo(() => {
    if (range === "custom") {
      return { from: customFrom, to: customTo || format(new Date(), "yyyy-MM-dd") };
    }
    const days = Number(range);
    return {
      from: format(subDays(new Date(), days - 1), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    };
  }, [range, customFrom, customTo]);

  useEffect(() => {
    if (!business || !from) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [{ data: analyticsData }, { data: conversationData }] = await Promise.all([
        supabase
          .from("analytics")
          .select("*")
          .eq("business_id", business!.id)
          .gte("date", from)
          .lte("date", to)
          .order("date", { ascending: true }),
        supabase.from("conversations").select("status").eq("business_id", business!.id),
      ]);
      if (cancelled) return;

      setRows((analyticsData as Analytics[]) ?? []);

      const counts: Record<ConversationStatus, number> = { active: 0, follow_up: 0, closed: 0 };
      for (const row of (conversationData as { status: ConversationStatus }[]) ?? []) {
        counts[row.status] = (counts[row.status] ?? 0) + 1;
      }
      setStatusCounts(counts);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, business, from, to]);

  if (!businessLoading && !business) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-text-primary">No business found</p>
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, row) => ({
      messages: acc.messages + row.messages_received,
      followUps: acc.followUps + row.follow_ups_sent,
      responses: acc.responses + row.responses_received,
      conversions: acc.conversions + row.conversions,
    }),
    { messages: 0, followUps: 0, responses: 0, conversions: 0 }
  );
  const responseRate = totals.messages > 0 ? Math.round((totals.responses / totals.messages) * 100) : 0;

  const chartData = rows.map((row) => ({
    date: format(new Date(row.date), "MMM d"),
    received: row.messages_received,
    sent: row.messages_sent,
    followUps: row.follow_ups_sent,
    responseRate:
      row.messages_received > 0
        ? Math.round((row.responses_received / row.messages_received) * 100)
        : 0,
  }));

  const pieData = (Object.keys(statusCounts) as ConversationStatus[])
    .map((status) => ({ name: status.replace("_", " "), value: statusCounts[status], status }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="7">7d</TabsTrigger>
            <TabsTrigger value="14">14d</TabsTrigger>
            <TabsTrigger value="30">30d</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
        {range === "custom" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-auto"
            />
            <span className="text-text-muted">to</span>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-auto"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Total Messages" value={totals.messages} icon={MessageSquare} />
            <StatsCard label="Follow-ups Sent" value={totals.followUps} icon={Repeat2} accent="warning" />
            <StatsCard label="Response Rate" value={`${responseRate}%`} icon={TrendingUp} accent="success" />
            <StatsCard label="Conversions" value={totals.conversions} icon={Target} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Messages Received vs Sent">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: CHART_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: CHART_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="received" name="Received" stroke="#00C6FF" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sent" name="Sent" stroke="#00E87A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Follow-ups Per Day">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: CHART_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: CHART_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="followUps" name="Follow-ups" fill="#00C6FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Response Rate Trend">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="responseRateFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00C6FF" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00C6FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: CHART_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: CHART_MUTED, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="responseRate"
                    name="Response Rate"
                    stroke="#00C6FF"
                    fill="url(#responseRateFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Conversation Status">
              {pieData.length === 0 ? (
                <div className="flex h-[240px] items-center justify-center text-sm text-text-muted">
                  No conversations yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-bg-secondary p-5">
      <h3 className="mb-3 text-sm font-semibold text-text-secondary">{title}</h3>
      {children}
    </div>
  );
}
