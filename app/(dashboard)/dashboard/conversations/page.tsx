"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search, Video, VideoOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConversationDetailSheet } from "@/components/conversations/conversation-detail-sheet";
import { useBusiness } from "@/components/providers/business-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import { maskPhone } from "@/lib/format";
import type { Conversation, ConversationStatus } from "@/lib/types";

type Filter = "all" | ConversationStatus;

const STATUS_VARIANT = {
  active: "success",
  follow_up: "warning",
  closed: "secondary",
} as const;

export default function ConversationsPage() {
  const supabase = useSupabase();
  const { business, loading: businessLoading } = useBusiness();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  async function loadConversations() {
    if (!business) return;
    setLoading(true);
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("business_id", business.id)
      .order("last_message_time", { ascending: false });
    setConversations((data as Conversation[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (!business) {
      setLoading(false);
      return;
    }
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  if (!businessLoading && !business) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-text-primary">No business found</p>
      </div>
    );
  }

  const filtered = conversations.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.customer_phone.toLowerCase().includes(q) ||
        (c.contact_name ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search phone or name…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="follow_up">Follow-up</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-text-primary">No conversations found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Last Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Language</TableHead>
                <TableHead className="hidden sm:table-cell">Follow-ups</TableHead>
                <TableHead className="hidden lg:table-cell">Videos</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((conversation) => (
                <TableRow
                  key={conversation.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelected(conversation);
                    setSheetOpen(true);
                  }}
                >
                  <TableCell className="font-mono text-xs">
                    {maskPhone(conversation.customer_phone)}
                  </TableCell>
                  <TableCell>{conversation.contact_name ?? "—"}</TableCell>
                  <TableCell className="hidden max-w-[220px] truncate md:table-cell">
                    {conversation.last_message ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[conversation.status]} className="capitalize">
                      {conversation.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden uppercase sm:table-cell">
                    {conversation.language ?? "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {conversation.follow_up_count}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {conversation.video_sent ? (
                      <Video className="h-4 w-4 text-success" />
                    ) : (
                      <VideoOff className="h-4 w-4 text-text-muted" />
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {conversation.last_message_time
                      ? formatDistanceToNow(new Date(conversation.last_message_time), {
                          addSuffix: true,
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConversationDetailSheet
        conversation={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={() => {
          loadConversations();
        }}
      />
    </div>
  );
}
