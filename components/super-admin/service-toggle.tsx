"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { useSupabase } from "@/components/providers/supabase-provider";

export function ServiceToggle({
  businessIds,
  active,
  onToggled,
}: {
  businessIds: string[];
  active: boolean;
  onToggled: () => void;
}) {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);

  async function handleToggle(checked: boolean) {
    if (businessIds.length === 0) return;
    setLoading(true);
    const { error } = await supabase
      .from("businesses")
      .update({ status: checked ? "active" : "inactive" })
      .in("id", businessIds);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    onToggled();
  }

  return (
    <Switch
      checked={active}
      onCheckedChange={handleToggle}
      disabled={loading || businessIds.length === 0}
    />
  );
}
