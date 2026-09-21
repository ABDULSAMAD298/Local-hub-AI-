import Stripe from "stripe";

// STRIPE_SECRET_KEY is not set until the user provides real Stripe keys.
// Billing routes check for this and return a clear error instead of crashing at import time.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
});

export const PLAN_PRICE_IDS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  growth: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH,
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
} as const;

export const PLAN_LIMITS = {
  starter: { businesses: 1, conversations: 1000, price: 49 },
  growth: { businesses: 3, conversations: 5000, price: 99 },
  pro: { businesses: 10, conversations: Infinity, price: 199 },
} as const;
