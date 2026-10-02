import { NextResponse } from "next/server";

import {
  failure,
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

  const code = String(body?.otp_code ?? "");
  if (!/^\d{6}$/.test(code)) return failure("wrong_code", 400, "Please enter the 6-digit code.");

  const params = new URLSearchParams({ code });
  const result = await graphRequest(`${business.phone_number_id}/verify_code?${params}`, {
    method: "POST",
  });
  if (!result.ok) return metaFailure(result.error);

  return NextResponse.json({ success: true });
}
