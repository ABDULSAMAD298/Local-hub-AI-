"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { PLAN_LIMITS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const YEARLY_DISCOUNT = 0.2;

const PLAN_COPY = {
  starter: {
    name: "Starter",
    cta: "Start Trial",
    features: ["Basic analytics", "Email support", "6 follow-ups"],
  },
  growth: {
    name: "Growth",
    cta: "Start Trial",
    features: [
      "Advanced analytics",
      "Priority support",
      "6 follow-ups",
      "Multilingual AI",
      "Media catalog",
    ],
    popular: true,
  },
  pro: {
    name: "Pro",
    cta: "Contact Us",
    features: ["Full analytics", "Dedicated manager", "Custom flows", "API access", "White-label"],
  },
} as const;

const PLAN_ORDER = ["starter", "growth", "pro"] as const;

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-text-secondary">
          Start free for 14 days. No credit card required.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <span className={cn("text-sm", !yearly ? "text-text-primary" : "text-text-secondary")}>
          Monthly
        </span>
        <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Toggle yearly pricing" />
        <span className={cn("text-sm", yearly ? "text-text-primary" : "text-text-secondary")}>
          Yearly
        </span>
        <Badge variant="success">Save 20%</Badge>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {PLAN_ORDER.map((planKey) => {
          const plan = PLAN_LIMITS[planKey];
          const copy = PLAN_COPY[planKey];
          const monthlyPrice = plan.price;
          const displayPrice = yearly ? Math.round(monthlyPrice * (1 - YEARLY_DISCOUNT)) : monthlyPrice;
          const popular = "popular" in copy && copy.popular;

          return (
            <motion.div
              key={planKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4 }}
              className={cn(
                "relative rounded-card border bg-bg-secondary p-6",
                popular
                  ? "border-transparent bg-gradient-to-b from-accent/10 to-bg-secondary shadow-accent-glow lg:-my-4 lg:py-10 lg:shadow-[0_0_0_1px_var(--accent),0_0_30px_var(--accent-glow)]"
                  : "border-border"
              )}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                {copy.name}
              </h3>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-text-primary">${displayPrice}</span>
                <span className="text-sm text-text-muted">/mo</span>
              </p>
              {yearly && (
                <p className="text-xs text-text-muted">billed annually</p>
              )}

              <ul className="mt-6 space-y-2.5 text-sm">
                <li className="flex items-start gap-2 text-text-primary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {plan.businesses} {plan.businesses === 1 ? "Business" : "Businesses"}
                </li>
                <li className="flex items-start gap-2 text-text-primary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {plan.conversations === Infinity
                    ? "Unlimited conversations"
                    : `${plan.conversations.toLocaleString()} conv/mo`}
                </li>
                {copy.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-text-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={popular ? "gradient" : "outline"}
                size="lg"
                className="mt-8 w-full"
              >
                <Link href={`/signup?plan=${planKey}`}>{copy.cta}</Link>
              </Button>
            </motion.div>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-text-muted">
        All plans include 14-day free trial • Cancel anytime • No setup fees • Secure payments via
        Stripe 🔒
      </p>
    </section>
  );
}
