// Shared by the /api/whatsapp routes and the onboarding UI so both sides agree
// on error codes and the copy shown for them.
export const ERROR_MESSAGES = {
  invalid_number: "The phone number format is invalid. Please check and try again.",
  rate_limit: "Too many attempts. Please wait 10 minutes before trying again.",
  wrong_code: "Incorrect verification code.",
  code_expired: "The verification code has expired. Please request a new one.",
  already_registered: "This number is already registered with WhatsApp API.",
  network_error: "Connection error. Please check your internet and try again.",
  generic: "Something went wrong. Please try again or contact support.",
} as const;

export type WhatsAppErrorCode = keyof typeof ERROR_MESSAGES;

export type WhatsAppApiFailure = {
  success: false;
  error: WhatsAppErrorCode;
  message: string;
  retry_after?: number;
};

export type WhatsAppApiResult<T extends object = object> = ({ success: true } & T) | WhatsAppApiFailure;
