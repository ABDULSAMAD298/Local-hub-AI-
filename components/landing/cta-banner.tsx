"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-card border border-border bg-bg-secondary px-6 py-16 text-center sm:px-16"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #00C6FF, transparent)" }}
        />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Ready to automate your WhatsApp business?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Join hundreds of businesses saving 4+ hours daily with LocalHub AI.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="gradient" asChild>
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#pricing">
                <CalendarClock className="h-4 w-4" />
                Book a Demo
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
