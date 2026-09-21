export const COUNTRY_CODES = [
  { code: "+971", label: "UAE (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+92", label: "Pakistan (+92)" },
  { code: "+91", label: "India (+91)" },
  { code: "+974", label: "Qatar (+974)" },
  { code: "+965", label: "Kuwait (+965)" },
  { code: "+973", label: "Bahrain (+973)" },
  { code: "+968", label: "Oman (+968)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+1", label: "United States (+1)" },
] as const;

export const KNOWLEDGE_BASE_EXAMPLES: Record<string, string> = {
  real_estate:
    "We manage furnished apartments and rooms near Al Falah Street, Abu Dhabi. Rent includes WiFi, AC, and parking. Viewings available daily 10am-6pm. Minimum stay 1 month.",
  restaurant:
    "We serve Middle Eastern and continental cuisine. Open 8am-midnight daily. Free delivery within 5km for orders over AED 50. Dine-in and takeaway available.",
  apparel:
    "We sell premium streetwear and custom hoodies, sizes S-XXL. Free shipping on orders over AED 200. Returns accepted within 7 days.",
  salon:
    "Unisex salon offering haircuts, coloring, and grooming services. Open 10am-10pm. Walk-ins welcome, appointments recommended on weekends.",
  beauty:
    "Full-service spa offering facials, massages, and nail care. Open 9am-9pm. Bridal packages available on request.",
  other:
    "Describe your services, pricing, location, and working hours so the AI can answer customer questions accurately.",
};
