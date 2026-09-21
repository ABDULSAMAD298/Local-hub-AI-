"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Business } from "@/lib/types";

export function ServiceStatusCard({ business }: { business: Business }) {
  const supabase = useSupabase();
  const [status, setStatus] = useState(business.status);
  const [loading, setLoading] = useState(false);
  const active = status === "active";

  async function toggleStatus() {
    setLoading(true);
    const nextStatus = active ? "inactive" : "active";
    const { error } = await supabase
      .from("businesses")
      .update({ status: nextStatus })
      .eq("id", business.id);

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStatus(nextStatus);
    toast.success(nextStatus === "active" ? "Service resumed" : "Service paused");
  }

  return (
    <div className="rounded-card border border-border bg-bg-secondary p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="relative mt-1 flex h-2.5 w-2.5 shrink-0">
            {active && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                active ? "bg-success" : "bg-error"
              }`}
            />
          </span>
          <div>
            <p className="font-semibold text-text-primary">{business.name}</p>
            <p className="text-sm text-text-muted">{business.display_phone ?? "No number connected"}</p>
            <p className="mt-1 text-sm text-text-secondary">
              {active ? "AI is actively handling conversations" : "Service paused"}
            </p>
          </div>
        </div>
        <Button
          variant={active ? "outline" : "gradient"}
          size="sm"
          onClick={toggleStatus}
          disabled={loading}
        >
          {active ? "Pause" : "Resume"}
        </Button>
      </div>
    </div>
  );
}
