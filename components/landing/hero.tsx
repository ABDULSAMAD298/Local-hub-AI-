"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/landing/phone-frame";
import { WhatsappDemo } from "@/components/landing/whatsapp-demo";

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 30%, black 20%, transparent 75%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #00C6FF, transparent)" }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent shadow-accent-glow">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by GPT-4o
          </div>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-[56px]">
            Your WhatsApp.
            <br />
            Handled by{" "}
            <span className="relative inline-block">
              <span className="gradient-text">AI</span>
              <svg
                viewBox="0 0 120 12"
                className="absolute -bottom-1 left-0 h-3 w-full text-accent"
                fill="none"
              >
                <path
                  d="M2 8c10-8 20-8 30 0s20 8 30 0 20-8 30 0 20 8 26 0"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="mt-6 max-w-lg text-lg text-text-secondary">
            LocalHub AI automatically responds to customers, sends your products & properties,
            follows up 6 times, and never misses a lead — in Arabic, Urdu, or English.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="gradient" asChild className="group">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#dashboard-preview">
                <Play className="h-4 w-4" />
                Watch Demo
              </a>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
            <span>✓ No credit card required</span>
            <span>✓ 14-day free trial</span>
            <span>✓ Cancel anytime</span>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-text-muted">
            <span>Used by businesses in</span>
            <span className="text-base" aria-label="United Arab Emirates">
              🇦🇪
            </span>
            <span className="text-base" aria-label="Saudi Arabia">
              🇸🇦
            </span>
            <span className="text-base" aria-label="Pakistan">
              🇵🇰
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative flex justify-center"
        >
          <PhoneFrame>
            <WhatsappDemo />
          </PhoneFrame>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{ opacity: { delay: 0.8 }, y: { duration: 3, repeat: Infinity } }}
            className="absolute -left-2 top-10 hidden rounded-card border border-border bg-bg-secondary px-3 py-2 text-xs font-medium text-text-primary shadow-card sm:block"
          >
            🌍 Reply in Arabic detected
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, 6, 0] }}
            transition={{ opacity: { delay: 1 }, y: { duration: 3.4, repeat: Infinity } }}
            className="absolute -right-2 bottom-16 hidden rounded-card border border-border bg-bg-secondary px-3 py-2 text-xs font-medium text-text-primary shadow-card sm:block"
          >
            ✓ 6 follow-ups sent automatically
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
