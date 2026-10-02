import { NextResponse } from "next/server";

import {
  failure,
  getOwnedBusiness,
  graphRequest,
  metaFailure,
  requireMetaConfig,
} from "@/lib/whatsapp/meta";

export async function POST(request: Request) {
  const configError = requireMetaConfig();
  if (configError) return configError;

  const body = await request.json().catch(() => null);
  const owned = await getOwnedBusiness(body?.business_id);
  if ("response" in owned) return owned.response;
  const { supabase, business } = owned;

  if (business.phone_number_id && business.display_phone) {
    return failure("already_registered", 409, "This business already has a connected WhatsApp number.");
  }

  const cc = String(body?.country_code ?? "").replace(/\D/g, "");
  const phoneNumber = String(body?.phone_number ?? "").replace(/\D/g, "").replace(/^0+/, "");
  const displayName = String(body?.display_name ?? "").trim();

  if (!cc || phoneNumber.length < 6 || phoneNumber.length > 14) {
    return failure("invalid_number", 400);
  }
  if (displayName.length < 3) {
    return failure("generic", 400, "Please enter a display name of at least 3 characters.");
  }

  const result = await graphRequest<{ id: string }>(`${process.env.META_WABA_ID}/phone_numbers`, {
    method: "POST",
    body: JSON.stringify({ cc, phone_number: phoneNumber, verified_name: displayName }),
  });

  if (!result.ok) {
    if (result.error?.code === 33) return failure("already_registered", 409);
    return metaFailure(result.error);
  }

  // No 'pending' status exists in the DB — a phone_number_id without a
  // display_phone is what marks a number as mid-onboarding.
  const { error } = await supabase
    .from("businesses")
    .update({ phone_number_id: result.data.id, display_phone: null })
    .eq("id", business.id);
  if (error) return failure("generic", 500, error.message);

  return NextResponse.json({ success: true, phone_number_id: result.data.id });
}
