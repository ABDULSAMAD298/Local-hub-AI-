"use client";

import { motion } from "framer-motion";
import { ArrowRight, Plug, Sparkles, Upload } from "lucide-react";

const STEPS = [
  {
    icon: Plug,
    title: "Connect Your WhatsApp",
    description:
      "Add your WhatsApp Business number to LocalHub. Takes 5 minutes, no technical knowledge needed.",
  },
  {
    icon: Upload,
    title: "Upload Your Catalog",
    description:
      "Add your properties, products or services with photos, videos, prices and descriptions.",
  },
  {
    icon: Sparkles,
    title: "AI Handles Everything",
    description:
      "Your AI agent replies to customers 24/7, sends matching media, and follows up automatically.",
  },
];

const FLOW_NODES = [
  "Customer Message",
  "LocalHub AI",
  "Intent Detected",
  "Media Sent + Follow-ups Scheduled",
  "Conversion",
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          3 steps to full automation
        </h2>
      </div>

      <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
        <div
          aria-hidden
          className="absolute left-[16.5%] right-[16.5%] top-8 hidden border-t-2 border-dashed border-border sm:block"
        />
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: index * 0.12 }}
            className="relative flex flex-col items-center text-center sm:items-start sm:text-left"
          >
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-bg-secondary shadow-card">
              <step.icon className="h-6 w-6 text-accent" />
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary-foreground">
                {index + 1}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-text-primary">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="mt-16 flex flex-wrap items-center justify-center gap-3 rounded-card border border-border bg-bg-secondary p-6"
      >
        {FLOW_NODES.map((node, index) => (
          <div key={node} className="flex items-center gap-3">
            <span className="rounded-badge border border-border bg-bg-tertiary px-3 py-1.5 text-xs font-medium text-text-primary sm:text-sm">
              {node}
            </span>
            {index < FLOW_NODES.length - 1 && (
              <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
            )}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
