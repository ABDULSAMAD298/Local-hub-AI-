"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { StepProgress } from "@/components/auth/step-progress";
import { useSupabase } from "@/components/providers/supabase-provider";
import { PLAN_LIMITS } from "@/lib/plans";
import { COUNTRY_CODES, KNOWLEDGE_BASE_EXAMPLES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import type { BusinessTypeConfig, PlanName } from "@/lib/types";

const STEPS = ["Account", "Business", "Plan"];

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
    businessName: z.string().min(2, "Enter your business name"),
    businessType: z.string().min(1, "Select a business type"),
    countryCode: z.string(),
    phoneNumber: z.string().min(5, "Enter a valid phone number"),
    knowledgeBase: z.string().max(2000, "Keep it under 2000 characters").optional(),
    responseThreshold: z.number().min(5).max(60),
    plan: z.enum(["starter", "growth", "pro"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

const STEP_FIELDS: (keyof SignupValues)[][] = [
  ["fullName", "email", "password", "confirmPassword"],
  ["businessName", "businessType", "countryCode", "phoneNumber", "knowledgeBase", "responseThreshold"],
  ["plan"],
];

export function SignupWizard({ businessTypes }: { businessTypes: BusinessTypeConfig[] }) {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const initialPlan = searchParams.get("plan");
  const plan: PlanName =
    initialPlan === "starter" || initialPlan === "growth" || initialPlan === "pro"
      ? initialPlan
      : "growth";

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      countryCode: "+971",
      responseThreshold: 15,
      knowledgeBase: "",
      businessType: "",
      plan,
    },
  });

  const password = watch("password");
  const businessType = watch("businessType");
  const knowledgeBase = watch("knowledgeBase") ?? "";
  const responseThreshold = watch("responseThreshold");
  const selectedPlan = watch("plan");

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: SignupValues) {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    });

    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "Could not create your account.");
      return;
    }

    if (!data.session) {
      setLoading(false);
      toast.success("Check your email to confirm your account, then log in to finish setup.");
      router.push("/login");
      return;
    }

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: values.email,
        full_name: values.fullName,
        role: "admin",
        plan: values.plan,
        plan_status: "active",
        trial_ends_at: trialEndsAt,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      setLoading(false);
      toast.error(profileError.message);
      return;
    }

    const { error: businessError } = await supabase.from("businesses").insert({
      user_id: data.user.id,
      name: values.businessName,
      business_type: values.businessType,
      owner_phone: `${values.countryCode}${values.phoneNumber}`,
      knowledge_base: values.knowledgeBase || null,
      response_threshold_min: values.responseThreshold,
      status: "active",
    });

    if (businessError) {
      setLoading(false);
      toast.error(businessError.message);
      return;
    }

    toast.success("You're all set! Your 14-day trial has started.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-2xl rounded-card border border-border bg-bg-secondary p-8 shadow-card">
      <StepProgress steps={STEPS} current={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Create your account</h2>

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Jane Doe" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-error">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@business.com" {...register("email")} />
              {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" {...register("password")} />
                <PasswordStrength password={password ?? ""} />
                {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput id="confirmPassword" {...register("confirmPassword")} />
                {errors.confirmPassword && (
                  <p className="text-xs text-error">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-text-primary">Set up your business</h2>

            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" placeholder="Sunrise Properties" {...register("businessName")} />
              {errors.businessName && (
                <p className="text-xs text-error">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Business Type</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {businessTypes.map((type) => (
                  <button
                    key={type.type_key}
                    type="button"
                    onClick={() => setValue("businessType", type.type_key, { shouldValidate: true })}
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
              {errors.businessType && (
                <p className="text-xs text-error">{errors.businessType.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Owner WhatsApp</Label>
              <div className="flex gap-2">
                <Select
                  defaultValue="+971"
                  onValueChange={(value) => setValue("countryCode", value)}
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
                <Input placeholder="50 123 4567" {...register("phoneNumber")} />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-error">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="knowledgeBase">Knowledge Base</Label>
                <span className="text-xs text-text-muted">{knowledgeBase.length}/2000</span>
              </div>
              <Textarea
                id="knowledgeBase"
                rows={4}
                placeholder={
                  businessType
                    ? KNOWLEDGE_BASE_EXAMPLES[businessType]
                    : "Describe your services, prices, hours and location…"
                }
                {...register("knowledgeBase")}
              />
              {errors.knowledgeBase && (
                <p className="text-xs text-error">{errors.knowledgeBase.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <Label>Response Time</Label>
                <span className="text-xs text-text-muted">{responseThreshold} minutes</span>
              </div>
              <Slider
                min={5}
                max={60}
                step={5}
                value={[responseThreshold ?? 15]}
                onValueChange={([value]) => setValue("responseThreshold", value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-text-primary">Choose your plan</h2>
            <p className="text-sm text-text-secondary">14-day free trial included on every plan.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {(Object.keys(PLAN_LIMITS) as (keyof typeof PLAN_LIMITS)[]).map((planKey) => {
                const planInfo = PLAN_LIMITS[planKey];
                const isSelected = selectedPlan === planKey;
                return (
                  <button
                    key={planKey}
                    type="button"
                    onClick={() => setValue("plan", planKey, { shouldValidate: true })}
                    className={cn(
                      "relative rounded-card border border-border bg-bg-tertiary p-4 text-left transition-colors",
                      isSelected && "border-accent bg-accent/10 shadow-accent-glow"
                    )}
                  >
                    {isSelected && (
                      <Check className="absolute right-3 top-3 h-4 w-4 text-accent" />
                    )}
                    <p className="text-sm font-semibold capitalize text-text-primary">{planKey}</p>
                    <p className="mt-1 text-2xl font-semibold text-text-primary">
                      ${planInfo.price}
                      <span className="text-sm text-text-muted">/mo</span>
                    </p>
                    <p className="mt-2 text-xs text-text-secondary">
                      {planInfo.businesses} {planInfo.businesses === 1 ? "business" : "businesses"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {planInfo.conversations === Infinity
                        ? "Unlimited conversations"
                        : `${planInfo.conversations.toLocaleString()} conv/mo`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <Button type="button" variant="gradient" onClick={goNext}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading ? "Setting up…" : "Complete Setup"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
