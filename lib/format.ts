export function maskPhone(phone: string) {
  const digits = phone.replace(/\s+/g, "");
  const match = digits.match(/^(\+\d{1,4})(\d+)(\d{4})$/);
  if (!match) return phone;
  const [, countryCode, middle, last4] = match;
  const maskedMiddle = "*".repeat(Math.min(middle.length, 5));
  return `${countryCode} ${maskedMiddle} ${last4}`;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
