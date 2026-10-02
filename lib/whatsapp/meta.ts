import "server-only";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";
import { ERROR_MESSAGES, type WhatsAppErrorCode } from "@/lib/whatsapp/errors";

// Meta retires Graph API versions ~2 years after release; override via env
// instead of editing code when this one sunsets.
const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION ?? "v23.0";

// Codes Meta uses for app/account/throughput throttling.
const RATE_LIMIT_CODES = new Set([4, 17, 32, 613, 80007, 80008, 130429]);

export interface MetaError {
  code?: number;
  error_subcode?: number;
  message: string;
  error_user_msg?: string;
}

export type GraphResult<T> = { ok: true; data: T } | { ok: false; error: MetaError | null };

export async function graphRequest<T>(path: string, init: RequestInit = {}): Promise<GraphResult<T>> {
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${process.env.META_SYSTEM_TOKEN}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.error) {
      return { ok: false, error: body?.error ?? { message: `Meta API returned ${res.status}` } };
    }
    return { ok: true, data: body as T };
  } catch {
    // Server couldn't reach Meta at all.
    return { ok: false, error: null };
  }
}

export function classifyMetaError(error: MetaError): WhatsAppErrorCode {
  const text = `${error.message} ${error.error_user_msg ?? ""}`.toLowerCase();
  if ((error.code && RATE_LIMIT_CODES.has(error.code)) || /too many|rate limit|limit reached|try again later/.test(text)) {
    return "rate_limit";
  }
  if (/expired/.test(text)) return "code_expired";
  if (/(code|otp)\b.*\b(incorrect|invalid|wrong|mismatch|does not match)|(incorrect|invalid|wrong) (verification )?code/.test(text)) {
    return "wrong_code";
  }
  if (/already (registered|exists|in use)/.test(text)) return "already_registered";
  if (error.code === 100 && /phone|number|\bcc\b/.test(text)) return "invalid_number";
  return "generic";
}

export function failure(
  code: WhatsAppErrorCode,
  status: number,
  message?: string,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json(
    { success: false, error: code, message: message ?? ERROR_MESSAGES[code], ...extra },
    { status }
  );
}

export function metaFailure(error: MetaError | null) {
  if (!error) return failure("generic", 502, "Could not reach WhatsApp. Please try again.");
  const code = classifyMetaError(error);
  if (code === "rate_limit") return failure(code, 429, undefined, { retry_after: 600 });
  // For unrecognised errors, surface Meta's own message — it's usually specific.
  return failure(code, 400, code === "generic" ? error.error_user_msg ?? error.message : undefined);
}

export function requireMetaConfig() {
  if (!process.env.META_SYSTEM_TOKEN || !process.env.META_WABA_ID) {
    return failure("generic", 501, "WhatsApp onboarding is not configured yet.");
  }
  return null;
}

// Resolves the business only if it belongs to the signed-in user (RLS-scoped
// client), so callers can't act on another client's number.
export async function getOwnedBusiness(
  businessId: unknown
): Promise<
  | { response: NextResponse }
  | { supabase: ReturnType<typeof createClient>; business: Business }
> {
  if (typeof businessId !== "string" || !businessId) {
    return { response: failure("generic", 400, "Missing business_id.") };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { response: failure("generic", 401, "Not authenticated.") };

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!business) return { response: failure("generic", 404, "Business not found.") };
  if (business.status === "suspended") {
    return { response: failure("generic", 403, "This business is suspended. Please contact support.") };
  }
  return { supabase, business: business as Business };
}

export function requirePendingNumber(business: Business) {
  if (!business.phone_number_id) {
    return failure("generic", 400, "Add your phone number first.");
  }
  return null;
}
