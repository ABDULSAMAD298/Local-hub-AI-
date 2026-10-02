// Onboarding/UI types for the WhatsApp number flow. Kept out of lib/types.ts,
// which is reserved for the DB read model.

export type OnboardingStep = 0 | 1 | 2 | 3 | 4;

export type OtpMethod = "SMS" | "VOICE";

export interface WhatsAppOnboardingState {
  step: OnboardingStep;
  numberType: "new" | "existing" | null;
  phoneNumber: string;
  countryCode: string;
  displayName: string;
  phoneNumberId: string | null;
  otpMethod: OtpMethod;
  error: string | null;
  isLoading: boolean;
}

// Meta returns more `status` values than it documents (CONNECTED, PENDING,
// FLAGGED, …), so it is left as a string rather than a closed union.
export interface MetaPhoneNumberResponse {
  id: string;
  display_phone_number: string;
  verified_name: string;
  status: string;
  quality_rating: "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
  code_verification_status?: "VERIFIED" | "NOT_VERIFIED" | "EXPIRED";
}
