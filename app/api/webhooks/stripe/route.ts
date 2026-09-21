import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { PLAN_PRICE_IDS } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";

function planFromPriceId(priceId: string | undefined) {
  return (Object.keys(PLAN_PRICE_IDS) as (keyof typeof PLAN_PRICE_IDS)[]).find(
    (plan) => PLAN_PRICE_IDS[plan] === priceId
  );
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 501 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    console.error("Stripe webhook received but SUPABASE_SERVICE_ROLE_KEY is not configured.");
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const plan = planFromPriceId(subscription.items.data[0]?.price.id);
        await supabase
          .from("profiles")
          .update({
            plan: plan ?? undefined,
            plan_status: "active",
            stripe_customer_id: session.customer as string,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const plan = planFromPriceId(subscription.items.data[0]?.price.id);
      const status = subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "canceled";
      await supabase
        .from("profiles")
        .update({ plan: plan ?? undefined, plan_status: status })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("profiles")
        .update({ plan_status: "canceled" })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
