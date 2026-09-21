"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth } from "date-fns";
import { toast } from "sonner";
import { Check, CreditCard, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { useBusiness } from "@/components/providers/business-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import { PLAN_LIMITS } from "@/lib/plans";
import { isTrialing } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PlanName } from "@/lib/types";

const PLAN_ORDER = ["starter", "growth", "pro"] as const;

const PLAN_FEATURES: Record<(typeof PLAN_ORDER)[number], string[]> = {
  starter: ["Basic analytics", "Email support", "6 follow-ups"],
  growth: ["Advanced analytics", "Priority support", "6 follow-ups", "Multilingual AI", "Media catalog"],
  pro: ["Full analytics", "Dedicated manager", "Custom flows", "API access", "White-label"],
};

export default function BillingPage() {
  const supabase = useSupabase();
  const { profile } = useAuth();
  const { business } = useBusiness();
  const [conversationsThisMonth, setConversationsThisMonth] = useState<number | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!business) return;
    let cancelled = false;

    async function loadUsage() {
      const { count } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business!.id)
        .gte("created_at", startOfMonth(new Date()).toISOString());
      if (!cancelled) setConversationsThisMonth(count ?? 0);
    }

    loadUsage();
    return () => {
      cancelled = true;
    };
  }, [supabase, business]);

  async function startCheckout(plan: string) {
    setPendingPlan(plan);
    const res = await fetch("/api/billing/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setPendingPlan(null);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong starting checkout.");
      return;
    }
    window.location.href = data.url;
  }

  async function openBillingPortal() {
    setPortalLoading(true);
    const res = await fetch("/api/billing/create-portal", { method: "POST" });
    const data = await res.json();
    setPortalLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not open billing portal.");
      return;
    }
    window.location.href = data.url;
  }

  if (!profile) {
    return <Skeleton className="h-64 w-full" />;
  }

  const currentPlan = (profile.plan === "trial" ? "starter" : profile.plan) as PlanName;
  const currentLimits =
    currentPlan in PLAN_LIMITS ? PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS] : PLAN_LIMITS.starter;
  const trialing = isTrialing(profile.trial_ends_at);
  const usagePercent =
    conversationsThisMonth !== null && currentLimits.conversations !== Infinity
      ? Math.min(100, Math.round((conversationsThisMonth / currentLimits.conversations) * 100))
      : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-bg-secondary p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold capitalize text-text-primary">{currentPlan} Plan</h2>
              <Badge variant={trialing ? "warning" : "success"} className="capitalize">
                {trialing ? "Trial" : profile.plan_status}
              </Badge>
            </div>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              ${currentLimits.price}
              <span className="text-sm font-normal text-text-muted">/mo</span>
            </p>
            {trialing && profile.trial_ends_at && (
              <p className="mt-1 text-sm text-text-secondary">
                Trial ends {format(new Date(profile.trial_ends_at), "MMM d, yyyy")}
              </p>
            )}
          </div>
          <Button
            variant="gradient"
            onClick={() =>
              document.getElementById("plan-comparison")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Upgrade Plan
          </Button>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Usage this month</span>
            <span className="text-text-primary">
              {conversationsThisMonth ?? "—"} /{" "}
              {currentLimits.conversations === Infinity ? "Unlimited" : currentLimits.conversations}{" "}
              conversations
            </span>
          </div>
          <Progress value={usagePercent} className="mt-2" />
        </div>
      </div>

      <div id="plan-comparison" className="scroll-mt-20">
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Compare Plans</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PLAN_ORDER.map((plan) => {
            const limits = PLAN_LIMITS[plan];
            const isCurrent = plan === currentPlan;
            return (
              <div
                key={plan}
                className={cn(
                  "rounded-card border bg-bg-secondary p-5",
                  isCurrent ? "border-accent shadow-accent-glow" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold capitalize text-text-primary">{plan}</h3>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <p className="mt-2 text-2xl font-semibold text-text-primary">
                  ${limits.price}
                  <span className="text-sm text-text-muted">/mo</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-text-primary">
                    <Check className="h-4 w-4 text-accent" />
                    {limits.businesses} {limits.businesses === 1 ? "business" : "businesses"}
                  </li>
                  <li className="flex items-center gap-2 text-text-primary">
                    <Check className="h-4 w-4 text-accent" />
                    {limits.conversations === Infinity
                      ? "Unlimited conversations"
                      : `${limits.conversations.toLocaleString()} conv/mo`}
                  </li>
                  {PLAN_FEATURES[plan].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-text-secondary">
                      <Check className="h-4 w-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-5 w-full"
                  variant={isCurrent ? "outline" : "gradient"}
                  disabled={isCurrent || pendingPlan === plan}
                  onClick={() => startCheckout(plan)}
                >
                  {isCurrent ? "Current Plan" : pendingPlan === plan ? "Redirecting…" : "Switch to this plan"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-bg-secondary p-5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">Payment Method</h3>
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            {profile.stripe_customer_id
              ? "Manage your card and billing details via the secure Stripe portal."
              : "No payment method on file yet — one is added when you upgrade."}
          </p>
          <Button variant="outline" className="mt-4" onClick={openBillingPortal} disabled={portalLoading}>
            {portalLoading ? "Opening…" : "Update Payment Method"}
          </Button>
        </div>

        <div className="rounded-card border border-border bg-bg-secondary p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">Billing History</h3>
          </div>
          <div className="mt-4 flex flex-col items-center justify-center gap-1 py-6 text-center">
            <p className="text-sm text-text-secondary">No invoices yet</p>
            <p className="text-xs text-text-muted">
              Invoices will appear here once your first payment is processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
