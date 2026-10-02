"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

const LENGTH = 6;

export function OtpInput({
  value,
  onChange,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function focus(index: number) {
    refs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();
  }

  function setDigits(start: number, digits: string) {
    const chars = value.padEnd(LENGTH, " ").split("");
    digits.split("").forEach((digit, offset) => {
      if (start + offset < LENGTH) chars[start + offset] = digit;
    });
    onChange(chars.join("").trimEnd());
    focus(start + digits.length);
  }

  return (
    <div className="flex justify-center gap-2" onPaste={(e) => {
      const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
      if (!digits) return;
      e.preventDefault();
      setDigits(0, digits);
    }}>
      {Array.from({ length: LENGTH }, (_, index) => {
        const char = value[index]?.trim() ?? "";
        return (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            value={char}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`Digit ${index + 1}`}
            className={cn(
              "h-12 w-11 rounded-control border bg-bg-tertiary text-center font-mono text-lg text-text-primary transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              invalid ? "border-error" : "border-border"
            )}
            onChange={(e) => {
              const digit = e.target.value.replace(/\D/g, "").slice(-1);
              if (digit) setDigits(index, digit);
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                const chars = value.padEnd(LENGTH, " ").split("");
                const target = char ? index : index - 1;
                if (target < 0) return;
                chars[target] = " ";
                onChange(chars.join("").trimEnd());
                focus(target);
              } else if (e.key === "ArrowLeft") {
                focus(index - 1);
              } else if (e.key === "ArrowRight") {
                focus(index + 1);
              }
            }}
          />
        );
      })}
    </div>
  );
}
