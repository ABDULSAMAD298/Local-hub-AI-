"use client";

import { motion } from "framer-motion";

const BUSINESS_TYPES = [
  {
    emoji: "🏠",
    name: "Real Estate",
    description:
      "Sends property videos & images matching customer budget and location. Schedules site visits.",
  },
  {
    emoji: "🍽️",
    name: "Restaurants",
    description:
      "Shares menu by meal time (breakfast/lunch/dinner), takes orders, alerts owner when order is placed.",
  },
  {
    emoji: "👕",
    name: "Fashion & Clothing",
    description:
      "Showcases products with sizes & prices, calculates order totals, handles bulk inquiries.",
  },
  {
    emoji: "✂️",
    name: "Salons & Barbers",
    description: "Books appointments, shows service menu with prices & duration, reduces no-shows.",
  },
  {
    emoji: "💅",
    name: "Beauty & Spa",
    description:
      "Describes services, handles booking inquiries, sends promotional offers automatically.",
  },
  {
    emoji: "🏢",
    name: "Any Business",
    description: "Custom knowledge base — train AI on your services, prices and FAQs in minutes.",
  },
];

export function BusinessTypes() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Works for every type of business
        </h2>
        <p className="mt-4 text-text-secondary">
          Whether you sell properties, food, fashion or services — LocalHub AI adapts to your
          business automatically.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BUSINESS_TYPES.map((type, index) => (
          <motion.div
            key={type.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
            className="group rounded-card border border-border bg-bg-secondary p-6 transition-all duration-150 hover:-translate-y-1 hover:border-accent/50 hover:shadow-accent-glow"
          >
            <span className="text-3xl">{type.emoji}</span>
            <h3 className="mt-4 text-base font-semibold text-text-primary">{type.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{type.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
