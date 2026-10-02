import { COUNTRY_CODES } from "@/lib/countries";

export function normalizeLocalNumber(input: string) {
  return input.replace(/\D/g, "").replace(/^0+/, "");
}

export function isValidMobileNumber(countryCode: string, digits: string) {
  // UAE mobiles are 9 digits starting with 5 (after dropping the leading 0).
  if (countryCode === "+971") return /^5\d{8}$/.test(digits);
  return /^\d{6,14}$/.test(digits);
}

export function invalidNumberMessage(countryCode: string) {
  return countryCode === "+971"
    ? "Please enter a valid UAE mobile number"
    : "Please enter a valid mobile number";
}

// Numbers entered at setup are stored as "<country code> <local digits>".
export function formatStoredNumber(countryCode: string, digits: string) {
  return `${countryCode} ${digits}`;
}

export function parseStoredNumber(value: string | null) {
  if (!value) return null;
  const [countryCode, ...rest] = value.split(" ");
  if (!COUNTRY_CODES.some((country) => country.code === countryCode)) return null;
  return { countryCode, localNumber: rest.join(" ") };
}
