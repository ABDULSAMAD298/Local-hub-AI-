"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabase } from "@/components/providers/supabase-provider";
import { COUNTRY_CODES } from "@/lib/countries";
import {
  formatStoredNumber,
  invalidNumberMessage,
  isValidMobileNumber,
  normalizeLocalNumber,
} from "@/lib/phone";
import type { BusinessType } from "@/lib/types";

const KNOWLEDGE_BASE_MAX = 5000;

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; icon: string; label: string }[] = [
  { value: "real_estate", icon: "🏠", label: "Real Estate" },
  { value: "restaurant", icon: "🍽️", label: "Restaurant" },
  { value: "apparel", icon: "👕", label: "Clothing / Fashion" },
  { value: "salon", icon: "✂️", label: "Salon / Barber" },
  { value: "beauty", icon: "💅", label: "Beauty / Spa" },
  { value: "other", icon: "🏢", label: "Other" },
];

const setupSchema = z
  .object({
    name: z.string().trim().min(2, "Business name is required"),
    businessType: z.string().min(1, "Select a business type"),
    otherType: z.string().optional(),
    countryCode: z.string(),
    phoneNumber: z.string(),
    knowledgeBase: z.string().max(KNOWLEDGE_BASE_MAX, `Keep it under ${KNOWLEDGE_BASE_MAX} characters`),
  })
  .superRefine((data, ctx) => {
    if (data.businessType === "other" && !data.otherType?.trim()) {
      ctx.addIssue({ code: "custom", path: ["otherType"], message: "Tell us what kind of business you run" });
    }
    if (!isValidMobileNumber(data.countryCode, normalizeLocalNumber(data.phoneNumber))) {
      ctx.addIssue({ code: "custom", path: ["phoneNumber"], message: invalidNumberMessage(data.countryCode) });
    }
  });

type SetupValues = z.infer<typeof setupSchema>;

export function BusinessSetupForm({
  userId,
  onCreated,
}: {
  userId: string;
  onCreated: () => Promise<void>;
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "",
      businessType: "",
      otherType: "",
      countryCode: "+971",
      phoneNumber: "",
      knowledgeBase: "",
    },
  });

  const businessType = watch("businessType");
  const countryCode = watch("countryCode");
  const knowledgeBase = watch("knowledgeBase") ?? "";

  async function onSubmit(values: SetupValues) {
    setSaving(true);

    // There's no column for a free-text business type, so for "Other" it
    // leads the knowledge base, where the AI will see it.
    const knowledgeBaseText = [
      values.businessType === "other" ? `Business type: ${values.otherType!.trim()}` : null,
      values.knowledgeBase.trim() || null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const { error } = await supabase.from("businesses").insert({
      user_id: userId,
      name: values.name.trim(),
      business_type: values.businessType,
      // Not connected yet (no phone_number_id) — this just prefills the
      // WhatsApp connect flow on the business page.
      display_phone: formatStoredNumber(values.countryCode, normalizeLocalNumber(values.phoneNumber)),
      knowledge_base: knowledgeBaseText || null,
      response_threshold_min: 15,
      status: "active",
    });

    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }

    toast.success("Your business is set up!");
    await onCreated();
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="setup-name">Business Name *</Label>
        <Input id="setup-name" placeholder="Sunrise Properties" {...register("name")} />
        {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Business Type *</Label>
        <Select
          value={businessType || undefined}
          onValueChange={(value) => setValue("businessType", value, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your business type" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.businessType && <p className="text-xs text-error">{errors.businessType.message}</p>}
        {businessType === "other" && (
          <div className="pt-1">
            <Input placeholder="e.g. Car rental, Gym, Clinic" {...register("otherType")} />
            {errors.otherType && <p className="mt-1.5 text-xs text-error">{errors.otherType.message}</p>}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="setup-phone">WhatsApp Business Number *</Label>
        <div className="flex gap-2">
          <Select
            value={countryCode}
            onValueChange={(value) => setValue("countryCode", value, { shouldValidate: true })}
          >
            <SelectTrigger className="w-40 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input id="setup-phone" inputMode="tel" placeholder="50 123 4567" {...register("phoneNumber")} />
        </div>
        <p className="text-xs text-text-muted">
          This is the number your customers message you on WhatsApp Business
        </p>
        {errors.phoneNumber && <p className="text-xs text-error">{errors.phoneNumber.message}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="setup-kb">Knowledge Base</Label>
          <span className="text-xs text-text-muted">
            {knowledgeBase.length}/{KNOWLEDGE_BASE_MAX}
          </span>
        </div>
        <Textarea
          id="setup-kb"
          rows={7}
          maxLength={KNOWLEDGE_BASE_MAX}
          placeholder="Describe your business — services, prices, location, working hours. The more detail you provide, the better your AI will respond to customers."
          {...register("knowledgeBase")}
        />
        {errors.knowledgeBase && <p className="text-xs text-error">{errors.knowledgeBase.message}</p>}
      </div>

      <Button type="submit" variant="gradient" className="w-full" disabled={saving}>
        {saving ? "Activating…" : "Activate My AI"}
        {!saving && <ArrowRight />}
      </Button>
    </form>
  );
}
