"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { PlanName, PlanStatus } from "@/lib/types";

const PLANS: PlanName[] = ["starter", "growth", "pro"];
const STATUSES: PlanStatus[] = ["trialing", "active", "past_due", "canceled"];

export function ChangePlanDialog({
  profileId,
  currentPlan,
  currentStatus,
  open,
  onOpenChange,
  onChanged,
}: {
  profileId: string;
  currentPlan: PlanName;
  currentStatus: PlanStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const supabase = useSupabase();
  const [plan, setPlan] = useState<PlanName>(currentPlan);
  const [status, setStatus] = useState<PlanStatus>(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ plan, plan_status: status })
      .eq("id", profileId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Plan updated");
    onChanged();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Override Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={plan} onValueChange={(v) => setPlan(v as PlanName)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLANS.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as PlanStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
