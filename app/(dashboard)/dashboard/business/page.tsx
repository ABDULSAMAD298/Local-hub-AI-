"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditBusinessModal } from "@/components/dashboard/edit-business-modal";
import { PulseDot, WhatsappConnectCard } from "@/components/business/whatsapp-connect-card";
import { useBusiness } from "@/components/providers/business-provider";
import { BUSINESS_TYPE_LABELS } from "@/lib/types";

const STATUS_VARIANT = {
  active: "success",
  inactive: "secondary",
  suspended: "error",
} as const;

export default function MyBusinessPage() {
  const { business, loading, refetch } = useBusiness();
  const [editOpen, setEditOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // OnboardingGate shows the setup form until a business exists.
  if (!business) return null;

  const connected = Boolean(business.phone_number_id && business.display_phone);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-card border border-border bg-bg-secondary p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-text-primary">{business.name}</h1>
            <Badge variant={STATUS_VARIANT[business.status]} className="capitalize">
              {business.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {BUSINESS_TYPE_LABELS[business.business_type]}
          </p>
          {connected ? (
            <div className="mt-2 flex items-center gap-2">
              <PulseDot active={business.status === "active"} />
              <span className="font-mono text-sm text-text-primary">{business.display_phone}</span>
              <Badge variant="success">Connected</Badge>
            </div>
          ) : (
            <p className="mt-2 font-mono text-sm text-text-muted">No number connected yet</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <WhatsappConnectCard business={business} onConnected={refetch} />

      <EditBusinessModal business={business} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
