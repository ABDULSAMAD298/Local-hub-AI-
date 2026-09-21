"use client";

import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ChangePlanDialog } from "@/components/super-admin/change-plan-dialog";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useSupabase } from "@/components/providers/supabase-provider";
import { BUSINESS_TYPE_LABELS } from "@/lib/types";
import { MessageSquare, Users, Video } from "lucide-react";
import type { Analytics, Business, Profile } from "@/lib/types";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = useSupabase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [conversationCount, setConversationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .single();
    setProfile(profileData as Profile | null);

    const { data: businessData } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", params.id);
    const businessList = (businessData as Business[]) ?? [];
    setBusinesses(businessList);

    if (businessList.length > 0) {
      const businessIds = businessList.map((b) => b.id);
      const from = format(subDays(new Date(), 29), "yyyy-MM-dd");

      const [{ data: analyticsData }, { count }] = await Promise.all([
        supabase.from("analytics").select("*").in("business_id", businessIds).gte("date", from),
        supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .in("business_id", businessIds),
      ]);
      setAnalytics((analyticsData as Analytics[]) ?? []);
      setConversationCount(count ?? 0);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function toggleBusiness(business: Business, active: boolean) {
    const { error } = await supabase
      .from("businesses")
      .update({ status: active ? "active" : "inactive" })
      .eq("id", business.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    loadData();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-sm text-text-secondary">Client not found.</p>;
  }

  const totals = analytics.reduce(
    (acc, row) => ({
      messages: acc.messages + row.messages_received,
      videos: acc.videos + row.videos_sent,
    }),
    { messages: 0, videos: 0 }
  );

  const byDate = new Map<string, number>();
  for (const row of analytics) {
    byDate.set(row.date, (byDate.get(row.date) ?? 0) + row.messages_received);
  }
  const chartData = Array.from({ length: 30 }).map((_, i) => {
    const date = subDays(new Date(), 29 - i);
    const key = format(date, "yyyy-MM-dd");
    return { label: format(date, "MMM d"), messages: byDate.get(key) ?? 0 };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-card border border-border bg-bg-secondary p-5">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{profile.full_name ?? profile.email}</h1>
          <p className="text-sm text-text-secondary">{profile.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {profile.plan}
            </Badge>
            <Badge variant={profile.plan_status === "active" ? "success" : "warning"} className="capitalize">
              {profile.plan_status}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={() => setPlanDialogOpen(true)}>
          Override Subscription
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard label="Messages (30d)" value={totals.messages} icon={MessageSquare} />
        <StatsCard label="Videos Sent (30d)" value={totals.videos} icon={Video} accent="success" />
        <StatsCard label="Total Conversations" value={conversationCount} icon={Users} accent="warning" />
      </div>

      <div className="rounded-card border border-border bg-bg-secondary p-5">
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Messages — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#1A2F52" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#8899BB", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fill: "#8899BB", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#111E35", border: "1px solid #1A2F52", borderRadius: 8 }}
              labelStyle={{ color: "#F0F4FF" }}
            />
            <Line type="monotone" dataKey="messages" stroke="#00C6FF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Businesses</h2>
        {businesses.length === 0 ? (
          <p className="text-sm text-text-muted">No businesses set up yet.</p>
        ) : (
          <div className="space-y-2">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="flex items-center justify-between rounded-control border border-border bg-bg-secondary p-4"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{business.name}</p>
                  <p className="text-xs text-text-muted">{BUSINESS_TYPE_LABELS[business.business_type]}</p>
                </div>
                <Switch
                  checked={business.status === "active"}
                  onCheckedChange={(checked) => toggleBusiness(business, checked)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ChangePlanDialog
        profileId={profile.id}
        currentPlan={profile.plan === "trial" ? "starter" : profile.plan}
        currentStatus={profile.plan_status}
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        onChanged={loadData}
      />
    </div>
  );
}
