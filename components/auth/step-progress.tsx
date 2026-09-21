"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function StepProgress({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="w-full">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
        <motion.div
          className="h-full rounded-full bg-brand-gradient"
          initial={false}
          animate={{ width: `${(current / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        {steps.map((step, index) => (
          <span
            key={step}
            className={cn(
              "text-xs font-medium",
              index <= current ? "text-accent" : "text-text-muted"
            )}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
