"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditBusinessModal } from "@/components/dashboard/edit-business-modal";
import { WhatsappSetupGuide } from "@/components/dashboard/whatsapp-setup-guide";
import { useBusiness } from "@/components/providers/business-provider";
import { BUSINESS_TYPE_LABELS } from "@/lib/types";

const STATUS_VARIANT = {
  active: "success",
  inactive: "secondary",
  suspended: "error",
} as const;

export default function MyBusinessPage() {
  const { business, loading } = useBusiness();
  const [editOpen, setEditOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-text-primary">No business found</p>
        <p className="max-w-sm text-sm text-text-secondary">
          Something went wrong during setup — contact support to get your business connected.
        </p>
      </div>
    );
  }

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
          <p className="mt-2 font-mono text-sm text-text-muted">
            {business.display_phone ?? "No number connected yet"}
          </p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <WhatsappSetupGuide />

      <EditBusinessModal business={business} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
