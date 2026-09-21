"use client";

import { motion } from "framer-motion";
import { Home, ShoppingBag, Shirt } from "lucide-react";

import { cn } from "@/lib/utils";

const FOLLOW_UP_TIMELINE = [
  { time: "1 hour", message: "Hi! Any questions about the property?" },
  { time: "2 hours", message: "We have a special offer this week..." },
  { time: "24 hrs", message: "Just checking in — still interested?" },
  { time: "36 hrs", message: "Our rooms fill up fast this month..." },
  { time: "48 hrs", message: "Last chance — shall I hold this for you?" },
  { time: "72 hrs", message: "Thanks for your time! Here whenever you need us." },
];

const MULTILINGUAL_EXAMPLES = [
  { lang: "Arabic", text: "مرحباً! نعم لدينا شقق متاحة قريبة من المطار 😊" },
  { lang: "Urdu", text: "جی ہاں! ہمارے پاس ائیرپورٹ کے قریب دستیاب یونٹس ہیں۔" },
  { lang: "English", text: "Yes! We have units available near the airport." },
];

const MEDIA_ITEMS = [
  { icon: Home, title: "2BHK Marina View", price: "AED 95,000/yr" },
  { icon: Shirt, title: "Classic Fit Blazer", price: "AED 249" },
  { icon: ShoppingBag, title: "Signature Gift Set", price: "AED 129" },
  { icon: Home, title: "Studio Downtown", price: "AED 62,000/yr" },
];

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-text-secondary">
      <span className="mt-0.5 text-success">✓</span>
      {children}
    </li>
  );
}

function FeatureRow({
  reverse,
  eyebrow,
  headline,
  body,
  bullets,
  visual,
}: {
  reverse?: boolean;
  eyebrow: string;
  headline: string;
  body: string;
  bullets?: string[];
  visual: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <motion.div
        initial={{ opacity: 0, x: reverse ? 24 : -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className={cn(reverse && "lg:order-2")}
      >
        {visual}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: reverse ? -24 : 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className={cn(reverse && "lg:order-1")}
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl">{headline}</h3>
        <p className="mt-4 text-text-secondary">{body}</p>
        {bullets && (
          <ul className="mt-5 space-y-2.5">
            {bullets.map((bullet) => (
              <Bullet key={bullet}>{bullet}</Bullet>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}

function MultilingualVisual() {
  return (
    <div className="space-y-3 rounded-card border border-border bg-bg-secondary p-6">
      {MULTILINGUAL_EXAMPLES.map((example) => (
        <div key={example.lang} className="rounded-xl bg-bg-tertiary p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {example.lang}
          </p>
          <p className="mt-1 text-sm text-text-primary" dir="auto">
            {example.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function FollowUpTimelineVisual() {
  return (
    <div className="rounded-card border border-border bg-bg-secondary p-6">
      <ol className="relative space-y-5 border-l border-border pl-5">
        {FOLLOW_UP_TIMELINE.map((step) => (
          <li key={step.time} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-bg-secondary bg-accent" />
            <p className="text-xs font-semibold text-accent">{step.time}</p>
            <p className="mt-0.5 text-sm text-text-secondary">&ldquo;{step.message}&rdquo;</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MediaCatalogVisual() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MEDIA_ITEMS.map((item) => (
        <div key={item.title} className="rounded-card border border-border bg-bg-secondary p-3">
          <div className="flex h-16 items-center justify-center rounded-md bg-bg-tertiary text-text-muted">
            <item.icon className="h-6 w-6" />
          </div>
          <p className="mt-2 truncate text-xs font-medium text-text-primary">{item.title}</p>
          <p className="text-xs text-accent">{item.price}</p>
        </div>
      ))}
    </div>
  );
}

export function FeaturesDeepDive() {
  return (
    <section id="features" className="mx-auto max-w-7xl space-y-24 px-4 py-20 sm:px-6 lg:px-8">
      <FeatureRow
        eyebrow="Smart AI Conversations"
        headline="Replies in the customer's language, automatically"
        body="LocalHub AI detects whether your customer writes in Arabic, Urdu, English or any other language and replies naturally in the same language — no setup required."
        bullets={[
          "Arabic, Urdu, English, Hindi supported",
          "Context-aware replies using your knowledge base",
          "Handles 100s of conversations simultaneously",
        ]}
        visual={<MultilingualVisual />}
      />

      <FeatureRow
        reverse
        eyebrow="Automated Follow-ups"
        headline="Never lose a lead to silence again"
        body="When a customer goes quiet, LocalHub AI automatically follows up 6 times — at 1hr, 2hr, 24hr, 36hr, 48hr, and 72hr. If they reply, the cycle resets. If they say no, it stops."
        visual={<FollowUpTimelineVisual />}
      />

      <FeatureRow
        eyebrow="Media Catalog"
        headline="Send the right media to the right customer"
        body="Upload your properties, dishes, products or services once. LocalHub AI reads the customer's request and automatically sends the most relevant items — filtered by budget, location and type."
        bullets={[
          "Videos, images, and product details",
          "Filtered by customer's budget and preferences",
          "Stored securely in your private media library",
        ]}
        visual={<MediaCatalogVisual />}
      />
    </section>
  );
}
