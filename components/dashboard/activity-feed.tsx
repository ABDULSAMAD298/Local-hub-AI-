import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { maskPhone } from "@/lib/format";
import type { Conversation } from "@/lib/types";

const STATUS_VARIANT = {
  active: "success",
  follow_up: "warning",
  closed: "secondary",
} as const;

export function ActivityFeed({ conversations }: { conversations: Conversation[] }) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border py-12 text-center">
        <MessageSquare className="h-6 w-6 text-text-muted" />
        <p className="text-sm text-text-secondary">No conversations yet.</p>
        <p className="text-xs text-text-muted">
          New customer inquiries will show up here as they come in.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-card border border-border bg-bg-secondary">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm text-text-primary">
              {maskPhone(conversation.customer_phone)}
            </p>
            <p className="mt-0.5 truncate text-sm text-text-secondary">
              {conversation.last_message ?? "No messages yet"}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant={STATUS_VARIANT[conversation.status]} className="capitalize">
              {conversation.status.replace("_", " ")}
            </Badge>
            {conversation.last_message_time && (
              <span className="text-xs text-text-muted">
                {formatDistanceToNow(new Date(conversation.last_message_time), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
