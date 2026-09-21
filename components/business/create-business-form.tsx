"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabase } from "@/components/providers/supabase-provider";
import { KNOWLEDGE_BASE_EXAMPLES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import type { Business, BusinessTypeConfig } from "@/lib/types";

export function CreateBusinessForm({
  userId,
  onCreated,
  onCancel,
}: {
  userId: string;
  onCreated: (business: Business) => void;
  onCancel?: () => void;
}) {
  const supabase = useSupabase();
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeConfig[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [responseThresholdMin, setResponseThresholdMin] = useState(15);
  const [nameError, setNameError] = useState("");
  const [typeError, setTypeError] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("business_type_config")
      .select("*")
      .order("display_name")
      .then(({ data }) => {
        if (cancelled) return;
        setBusinessTypes((data as BusinessTypeConfig[]) ?? []);
        setLoadingTypes(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleSubmit() {
    let hasError = false;
    if (!name.trim()) {
      setNameError("Business name is required");
      hasError = true;
    }
    if (!businessType) {
      setTypeError("Select a business type");
      hasError = true;
    }
    if (hasError) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        user_id: userId,
        name: name.trim(),
        business_type: businessType,
        owner_phone: ownerPhone || null,
        knowledge_base: knowledgeBase || null,
        response_threshold_min: responseThresholdMin,
        status: "active",
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Business created");
    onCreated(data as Business);
  }

  if (loadingTypes) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="new-business-name">Business Name</Label>
        <Input
          id="new-business-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError("");
          }}
          placeholder="Sunrise Properties"
        />
        {nameError && <p className="text-xs text-error">{nameError}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Business Type</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {businessTypes.map((type) => (
            <button
              key={type.type_key}
              type="button"
              onClick={() => {
                setBusinessType(type.type_key);
                setTypeError("");
              }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-control border border-border bg-bg-tertiary p-3 text-center transition-colors",
                businessType === type.type_key && "border-accent bg-accent/10"
              )}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-[11px] leading-tight text-text-secondary">
                {type.display_name}
              </span>
            </button>
          ))}
        </div>
        {typeError && <p className="text-xs text-error">{typeError}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-owner-phone">Owner WhatsApp</Label>
        <Input
          id="new-owner-phone"
          value={ownerPhone}
          onChange={(e) => setOwnerPhone(e.target.value)}
          placeholder="+971501234567"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="new-knowledge-base">Knowledge Base</Label>
          <span className="text-xs text-text-muted">{knowledgeBase.length}/2000</span>
        </div>
        <Textarea
          id="new-knowledge-base"
          rows={4}
          maxLength={2000}
          value={knowledgeBase}
          onChange={(e) => setKnowledgeBase(e.target.value)}
          placeholder={
            businessType
              ? KNOWLEDGE_BASE_EXAMPLES[businessType]
              : "Describe your services, prices, hours and location…"
          }
        />
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
          onValueChange={([value]) => setResponseThresholdMin(value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" variant="gradient" onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating…" : "Create Business"}
        </Button>
      </div>
    </div>
  );
}
