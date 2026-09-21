"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { CopyButton } from "@/components/ui/copy-button";
import { PasswordInput } from "@/components/auth/password-input";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useBusiness } from "@/components/providers/business-provider";
import type { Business } from "@/lib/types";

const editBusinessSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  knowledgeBase: z.string().max(5000, "Keep it under 5000 characters").optional(),
  upsellMessage: z.string().max(500).optional(),
  ownerPhone: z.string().optional(),
  responseThresholdMin: z.number().min(5).max(60),
  waToken: z.string().optional(),
  phoneNumberId: z.string().optional(),
});

type EditBusinessValues = z.infer<typeof editBusinessSchema>;

export function EditBusinessModal({
  business,
  open,
  onOpenChange,
}: {
  business: Business;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const supabase = useSupabase();
  const { refetch } = useBusiness();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditBusinessValues>({
    resolver: zodResolver(editBusinessSchema),
    defaultValues: {
      name: business.name,
      knowledgeBase: business.knowledge_base ?? "",
      upsellMessage: business.upsell_message ?? "",
      ownerPhone: business.owner_phone ?? "",
      responseThresholdMin: business.response_threshold_min,
      waToken: business.wa_token ?? "",
      phoneNumberId: business.phone_number_id ?? "",
    },
  });

  const knowledgeBase = watch("knowledgeBase") ?? "";
  const responseThresholdMin = watch("responseThresholdMin");
  const waToken = watch("waToken") ?? "";

  async function onSubmit(values: EditBusinessValues) {
    setLoading(true);
    const { error } = await supabase
      .from("businesses")
      .update({
        name: values.name,
        knowledge_base: values.knowledgeBase || null,
        upsell_message: values.upsellMessage || null,
        owner_phone: values.ownerPhone || null,
        response_threshold_min: values.responseThresholdMin,
        wa_token: values.waToken || null,
        phone_number_id: values.phoneNumberId || null,
      })
      .eq("id", business.id);

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Business updated");
    await refetch();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Business</DialogTitle>
          <DialogDescription>Update your business details and WhatsApp connection.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Business Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="knowledgeBase">Knowledge Base</Label>
              <span className="text-xs text-text-muted">{knowledgeBase.length}/5000</span>
            </div>
            <Textarea id="knowledgeBase" rows={6} {...register("knowledgeBase")} />
            <p className="text-xs text-text-muted">
              Tip: Be detailed about your services, prices, and location for better AI responses.
            </p>
            {errors.knowledgeBase && (
              <p className="text-xs text-error">{errors.knowledgeBase.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upsellMessage">Upsell Message</Label>
            <Textarea id="upsellMessage" rows={2} {...register("upsellMessage")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ownerPhone">Owner Phone</Label>
            <Input id="ownerPhone" {...register("ownerPhone")} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label>Response Threshold</Label>
              <span className="text-xs text-text-muted">{responseThresholdMin} minutes</span>
            </div>
            <Slider
              min={5}
              max={60}
              step={5}
              value={[responseThresholdMin]}
              onValueChange={([value]) => setValue("responseThresholdMin", value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phoneNumberId">Phone Number ID</Label>
            <Input id="phoneNumberId" {...register("phoneNumberId")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="waToken">WA Token</Label>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <PasswordInput id="waToken" {...register("waToken")} />
              </div>
              <CopyButton value={waToken} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
