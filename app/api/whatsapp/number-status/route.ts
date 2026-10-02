import { NextResponse } from "next/server";

import {
  getOwnedBusiness,
  graphRequest,
  metaFailure,
  requireMetaConfig,
  requirePendingNumber,
} from "@/lib/whatsapp/meta";
import type { MetaPhoneNumberResponse } from "@/lib/whatsapp/types";

const FIELDS = "verified_name,display_phone_number,status,quality_rating,code_verification_status";

export async function GET(request: Request) {
  const configError = requireMetaConfig();
  if (configError) return configError;

  const businessId = new URL(request.url).searchParams.get("business_id");
  const owned = await getOwnedBusiness(businessId);
  if ("response" in owned) return owned.response;
  const { business } = owned;

  const pendingError = requirePendingNumber(business);
  if (pendingError) return pendingError;

  const result = await graphRequest<MetaPhoneNumberResponse>(
    `${business.phone_number_id}?fields=${FIELDS}`
  );
  if (!result.ok) return metaFailure(result.error);

  const { status, display_phone_number, verified_name, quality_rating, code_verification_status } =
    result.data;
  return NextResponse.json({
    success: true,
    status,
    display_phone_number,
    verified_name,
    quality_rating,
    code_verification_status,
  });
}
