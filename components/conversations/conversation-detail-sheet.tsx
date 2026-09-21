"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabase } from "@/components/providers/supabase-provider";
import { maskPhone } from "@/lib/format";
import type { Conversation, ConversationHistory, FollowupLog, FollowupSchedule } from "@/lib/types";

const STATUS_VARIANT = {
  active: "success",
  follow_up: "warning",
  closed: "secondary",
} as const;

export function ConversationDetailSheet({
  conversation,
  open,
  onOpenChange,
  onUpdated,
}: {
  conversation: Conversation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  const supabase = useSupabase();
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [schedule, setSchedule] = useState<FollowupSchedule | null>(null);
  const [log, setLog] = useState<FollowupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!open || !conversation) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [{ data: historyData }, { data: scheduleData }, { data: logData }] = await Promise.all([
        supabase
          .from("conversation_history")
          .select("*")
          .eq("business_id", conversation!.business_id)
          .eq("customer_phone", conversation!.customer_phone)
          .order("created_at", { ascending: true }),
        supabase
          .from("followup_schedule")
          .select("*")
          .eq("business_id", conversation!.business_id)
          .eq("customer_phone", conversation!.customer_phone)
          .maybeSingle(),
        supabase
          .from("followup_log")
          .select("*")
          .eq("business_id", conversation!.business_id)
          .eq("customer_phone", conversation!.customer_phone),
      ]);
      if (cancelled) return;
      setHistory((historyData as ConversationHistory[]) ?? []);
      setSchedule(scheduleData as FollowupSchedule | null);
      setLog((logData as FollowupLog[]) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, open, conversation]);

  if (!conversation) return null;

  async function handleClose() {
    setActionLoading(true);
    const { error } = await supabase
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", conversation!.id);
    setActionLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Conversation closed");
    onUpdated();
  }

  async function handleResetFollowup() {
    setActionLoading(true);
    const [{ error: scheduleError }, { error: convError }] = await Promise.all([
      supabase
        .from("followup_schedule")
        .update({ last_sent: 0, active: true })
        .eq("business_id", conversation!.business_id)
        .eq("customer_phone", conversation!.customer_phone),
      supabase
        .from("conversations")
        .update({ follow_up_count: 0 })
        .eq("id", conversation!.id),
    ]);
    setActionLoading(false);
    if (scheduleError || convError) {
      toast.error(scheduleError?.message ?? convError?.message ?? "Could not reset follow-ups");
      return;
    }
    toast.success("Follow-up cycle reset");
    onUpdated();
  }

  const followups = schedule
    ? ([1, 2, 3, 4, 5, 6] as const).map((n) => ({
        number: n,
        message: schedule[`fu_msg_${n}` as const],
        time: schedule[`fu_${n}_time` as const],
        sent: log.some((l) => l.followup_number === n),
      }))
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="font-mono">{maskPhone(conversation.customer_phone)}</SheetTitle>
          <p className="text-sm text-text-secondary">
            {conversation.contact_name ?? "Unknown contact"}
          </p>
        </SheetHeader>

        <div className="mt-4 flex items-center justify-between">
          <Badge variant={STATUS_VARIANT[conversation.status]} className="capitalize">
            {conversation.status.replace("_", " ")}
          </Badge>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleResetFollowup} disabled={actionLoading}>
              Reset Follow-up
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleClose}
              disabled={actionLoading || conversation.status === "closed"}
            >
              Close
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 max-h-[38vh] space-y-2 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-sm text-text-muted">No messages yet.</p>
              ) : (
                history.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "rounded-tl-sm bg-bg-tertiary text-text-primary"
                          : "rounded-tr-sm bg-accent/20 text-text-primary"
                      }`}
                    >
                      {message.content}
                      <p className="mt-1 text-[10px] text-text-muted">
                        {format(new Date(message.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-text-secondary">Follow-up Schedule</h3>
              {followups.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">No follow-up schedule for this customer.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {followups.map((fu) => (
                    <div
                      key={fu.number}
                      className="flex items-center justify-between rounded-control border border-border bg-bg-tertiary px-3 py-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-primary">Follow-up {fu.number}</p>
                        <p className="truncate text-text-muted">{fu.message ?? "—"}</p>
                      </div>
                      <span
                        className={
                          fu.sent
                            ? "text-success"
                            : schedule?.active === false
                              ? "text-text-muted"
                              : "text-warning"
                        }
                      >
                        {fu.sent ? "Sent ✓" : schedule?.active === false ? "Skipped" : "Pending ⏰"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
