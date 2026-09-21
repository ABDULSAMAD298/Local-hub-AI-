import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const STEPS = [
  {
    title: "Step 1: Go to Meta Developer Dashboard",
    body: "Visit developers.facebook.com and log in with the Facebook account that manages your business.",
  },
  {
    title: "Step 2: Create/Open your App → Add WhatsApp product",
    body: "Create a new app (or open an existing one) and add the WhatsApp product from the app dashboard.",
  },
  {
    title: "Step 3: Get Phone Number ID from API Setup page",
    body: "Under WhatsApp → API Setup, copy the Phone Number ID for the number you want to connect.",
  },
  {
    title: "Step 4: Generate System User Token",
    body: "In Business Settings → System Users, generate a token with whatsapp_business_messaging and whatsapp_business_management permissions.",
  },
  {
    title: "Step 5: Paste both above and click Save",
    body: "Enter the Phone Number ID and token into the fields on this page, then click Save to connect your number.",
  },
];

export function WhatsappSetupGuide() {
  return (
    <div className="rounded-card border border-border bg-bg-secondary p-5">
      <h2 className="text-sm font-semibold text-text-primary">WhatsApp Setup Guide</h2>
      <Accordion type="single" collapsible className="mt-2">
        {STEPS.map((step) => (
          <AccordionItem key={step.title} value={step.title}>
            <AccordionTrigger>{step.title}</AccordionTrigger>
            <AccordionContent>{step.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
