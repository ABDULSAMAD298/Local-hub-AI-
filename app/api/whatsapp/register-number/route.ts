import { NextResponse } from "next/server";

import {
  failure,
  getOwnedBusiness,
  graphRequest,
  metaFailure,
  requireMetaConfig,
  requirePendingNumber,
} from "@/lib/whatsapp/meta";
import type { MetaPhoneNumberResponse } from "@/lib/whatsapp/types";

// Two-step verification PIN Meta sets on the number at registration. Keep it
// in env so it isn't a well-known value baked into the codebase.
const REGISTRATION_PIN = process.env.META_REGISTRATION_PIN ?? "000000";

export async function POST(request: Request) {
  const configError = requireMetaConfig();
  if (configError) return configError;

  const body = await request.json().catch(() => null);
  const owned = await getOwnedBusiness(body?.business_id);
  if ("response" in owned) return owned.response;
  const { supabase, business } = owned;

  const pendingError = requirePendingNumber(business);
  if (pendingError) return pendingError;
  const phoneNumberId = business.phone_number_id!;

  const registered = await graphRequest(`${phoneNumberId}/register`, {
    method: "POST",
    body: JSON.stringify({ messaging_product: "whatsapp", pin: REGISTRATION_PIN }),
  });
  if (!registered.ok) return metaFailure(registered.error);

  // Subscribe the WABA to our app's webhook so n8n receives inbound messages.
  // Idempotent — safe to repeat for every number on the shared WABA.
  const subscribed = await graphRequest(`${process.env.META_WABA_ID}/subscribed_apps`, {
    method: "POST",
  });
  if (!subscribed.ok) return metaFailure(subscribed.error);

  const details = await graphRequest<MetaPhoneNumberResponse>(
    `${phoneNumberId}?fields=display_phone_number,verified_name`
  );

  // status is deliberately untouched: 'inactive' is how super-admin pauses a
  // business, and connecting a number must not silently un-pause it.
  const { error } = await supabase
    .from("businesses")
    .update({
      phone_number_id: phoneNumberId,
      waba_id: process.env.META_WABA_ID,
      display_phone: details.ok ? details.data.display_phone_number : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", business.id);
  if (error) return failure("generic", 500, error.message);

  return NextResponse.json({ success: true, message: "Your WhatsApp number is now live!" });
}
