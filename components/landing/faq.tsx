import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Do I need to be technical to set this up?",
    answer:
      "No. If you can send a WhatsApp message, you can use LocalHub AI. We guide you through the entire setup in under 10 minutes.",
  },
  {
    question: "Will Meta/WhatsApp block my number?",
    answer:
      "No. We use the official Meta WhatsApp Business API — the same system large companies use. Your number is 100% safe.",
  },
  {
    question: "How does the AI know about my business?",
    answer:
      "You provide a knowledge base — a description of your services, prices, and location. The AI uses this to answer customer questions.",
  },
  {
    question: "Can I use it for multiple businesses or phone numbers?",
    answer:
      "Yes! The Growth plan supports 3 businesses and Pro supports 10, all managed from one dashboard.",
  },
  {
    question: "What languages does it support?",
    answer:
      "Arabic, English, Urdu, Hindi, and more. It auto-detects the customer's language and replies in the same one.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, cancel anytime from your dashboard. No contracts, no cancellation fees.",
  },
  {
    question: "What happens after the free trial?",
    answer:
      "You'll be prompted to choose a plan. If you don't upgrade, your account pauses — no charges ever without your permission.",
  },
  {
    question: "Do I need a WhatsApp Business API account?",
    answer:
      "Yes, but we walk you through getting one step by step. It's free from Meta and takes about 30 minutes.",
  },
];

function FaqColumn({ faqs, idPrefix }: { faqs: typeof FAQS; idPrefix: string }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={faq.question} value={`${idPrefix}-${index}`}>
          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function Faq() {
  const half = Math.ceil(FAQS.length / 2);
  const left = FAQS.slice(0, half);
  const right = FAQS.slice(half);

  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Frequently asked questions
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-10 md:grid-cols-2">
        <FaqColumn faqs={left} idPrefix="l" />
        <FaqColumn faqs={right} idPrefix="r" />
      </div>
    </section>
  );
}
