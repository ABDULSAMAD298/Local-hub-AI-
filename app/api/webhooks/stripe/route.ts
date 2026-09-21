import { NextResponse } from "next/server";

// Stripe webhook handling (checkout.session.completed, subscription.updated/deleted)
// lands in the Billing phase, once real Stripe keys are supplied.
export async function POST() {
  return NextResponse.json(
    { error: "Billing is not configured yet." },
    { status: 501 }
  );
}
