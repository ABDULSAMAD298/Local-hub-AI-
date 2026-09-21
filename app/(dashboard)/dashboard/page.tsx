"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Repeat2, Video, Users } from "lucide-react";
import { toast } from "sonner";

import { StatsCard } from "@/components/dashboard/stats-card";
import { ServiceStatusCard } from "@/components/dashboard/service-status-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { useBusiness } from "@/components/providers/business-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import { getGreeting, maskPhone } from "@/lib/format";
import type { Analytics, Conversation } from "@/lib/types";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardOverviewPage() {
  const supabase = useSupabase();
  const { profile } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);

      const [{ data: analyticsRow }, { count }, { data: recent }] = await Promise.all([
        supabase
          .from("analytics")
          .select("*")
          .eq("business_id", business!.id)
          .eq("date", todayDateString())
          .maybeSingle(),
        supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("business_id", business!.id)
          .eq("status", "active"),
        supabase
          .from("conversations")
          .select("*")
          .eq("business_id", business!.id)
          .order("last_message_time", { ascending: false })
          .limit(10),
      ]);

      if (cancelled) return;
      setAnalytics(analyticsRow as Analytics | null);
      setActiveCount(count ?? 0);
      setConversations((recent as Conversation[]) ?? []);
      setLoading(false);
    }

    loadData();

    const channel = supabase
      .channel(`dashboard-conversations-${business.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          const newConversation = payload.new as Conversation;
          setConversations((prev) => [newConversation, ...prev].slice(0, 10));
          toast(`New inquiry from ${maskPhone(newConversation.customer_phone)} 👋`);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          const updated = payload.new as Conversation;
          setConversations((prev) => {
            const next = prev.filter((c) => c.id !== updated.id);
            return [updated, ...next].slice(0, 10);
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase, business]);

  if (!businessLoading && !business) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-text-primary">No business set up yet</p>
        <p className="max-w-sm text-sm text-text-secondary">
          Finish setting up your business from the My Business page to start seeing data here.
        </p>
      </div>
    );
  }

  const messagesToday = analytics?.messages_received ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-gradient-to-r from-accent/10 to-transparent p-5">
        <h1 className="text-lg font-semibold text-text-primary">
          {getGreeting()}, {profile?.full_name?.split(" ")[0] ?? "there"}! Your AI handled{" "}
          {messagesToday} conversation{messagesToday === 1 ? "" : "s"} today 🤖
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Messages Today" value={messagesToday} icon={MessageSquare} />
        <StatsCard
          label="Follow-ups Sent"
          value={analytics?.follow_ups_sent ?? 0}
          icon={Repeat2}
          accent="warning"
        />
        <StatsCard
          label="Videos Sent"
          value={analytics?.videos_sent ?? 0}
          icon={Video}
          accent="success"
        />
        <StatsCard label="Active Conversations" value={activeCount} icon={Users} />
      </div>

      {business && <ServiceStatusCard business={business} />}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Recent Activity</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <ActivityFeed conversations={conversations} />
        )}
      </div>
    </div>
  );
}
