import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { PLAN_PRICE_IDS } from "@/lib/plans";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 501 });
  }

  const { plan } = (await request.json()) as { plan?: keyof typeof PLAN_PRICE_IDS };
  if (!plan || !PLAN_PRICE_IDS[plan]) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PLAN_PRICE_IDS[plan], quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing`,
    metadata: { userId: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
