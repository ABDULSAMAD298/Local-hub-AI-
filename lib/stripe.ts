import "server-only";
import Stripe from "stripe";

// STRIPE_SECRET_KEY is not set until the user provides real Stripe keys.
// Falls back to a placeholder so the module can load; billing routes must
// check for a real key before calling the API.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
});

export { PLAN_PRICE_IDS, PLAN_LIMITS } from "@/lib/plans";
