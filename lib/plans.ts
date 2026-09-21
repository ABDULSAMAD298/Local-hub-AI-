// Shared plan config — safe to import from client components.
// Keep the Stripe SDK client itself (lib/stripe.ts) server-only.

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
