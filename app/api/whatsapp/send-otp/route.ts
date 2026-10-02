import { NextResponse } from "next/server";

import {
  getOwnedBusiness,
  graphRequest,
  metaFailure,
  requireMetaConfig,
  requirePendingNumber,
} from "@/lib/whatsapp/meta";

export async function POST(request: Request) {
  const configError = requireMetaConfig();
  if (configError) return configError;

  const body = await request.json().catch(() => null);
  const owned = await getOwnedBusiness(body?.business_id);
  if ("response" in owned) return owned.response;
  const { business } = owned;

  const pendingError = requirePendingNumber(business);
  if (pendingError) return pendingError;

  const method = body?.method === "VOICE" ? "VOICE" : "SMS";
  const params = new URLSearchParams({ code_method: method, language: "en_US" });

  const result = await graphRequest(`${business.phone_number_id}/request_code?${params}`, {
    method: "POST",
  });
  if (!result.ok) return metaFailure(result.error);

  return NextResponse.json({ success: true, message: "Verification code sent" });
}
