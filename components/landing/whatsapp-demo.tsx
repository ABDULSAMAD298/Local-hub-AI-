"use client";

import { useEffect, useState } from "react";
import { CheckCheck, Home } from "lucide-react";

import { cn } from "@/lib/utils";

type ChatMessage =
  | { type: "customer"; text: string }
  | { type: "ai-text"; text: string }
  | { type: "ai-card" };

const MESSAGES: ChatMessage[] = [
  { type: "customer", text: "Hi, do you have 2BHK available near airport road?" },
  {
    type: "ai-text",
    text: "Hello! Yes we do \u{1F60A} Let me show you our available options matching your requirements...",
  },
  { type: "ai-card" },
  { type: "ai-text", text: "Would you like to schedule a viewing? \u{1F4C5}" },
];

const STEP_DELAY_MS = 350;
const TYPING_DELAY_MS = 900;
const LOOP_PAUSE_MS = 4000;

export function WhatsappDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timeouts.push(id);
      return id;
    }

    function runCycle() {
      let elapsed = 0;
      setVisibleCount(0);
      setTyping(false);

      MESSAGES.forEach((message, index) => {
        const isCustomer = message.type === "customer";
        if (!isCustomer) {
          schedule(() => setTyping(true), elapsed);
          elapsed += TYPING_DELAY_MS;
        }
        schedule(() => {
          setTyping(false);
          setVisibleCount(index + 1);
        }, elapsed + STEP_DELAY_MS);
        elapsed += STEP_DELAY_MS;
      });

      schedule(runCycle, elapsed + LOOP_PAUSE_MS);
    }

    runCycle();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 bg-bg-tertiary px-4 py-3 pt-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
          AI
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">LocalHub AI Agent</p>
          <p className="text-[11px] text-success">online</p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden bg-[#0a0f1a] px-3 py-4">
        {MESSAGES.slice(0, visibleCount).map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}
        {typing && (
          <div className="flex justify-end">
            <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-accent/20 px-3 py-2">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.type === "customer") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-bg-tertiary px-3 py-2 text-[13px] leading-snug text-text-primary">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.type === "ai-card") {
    return (
      <div className="flex justify-end">
        <div className="w-[75%] overflow-hidden rounded-2xl rounded-tr-sm bg-accent/15 text-[13px]">
          <div className="flex h-20 items-center justify-center bg-bg-tertiary text-text-muted">
            <Home className="h-6 w-6" />
          </div>
          <div className="space-y-0.5 px-2.5 py-2">
            <p className="font-medium text-text-primary">2BHK — Airport Road Residences</p>
            <p className="text-accent">AED 85,000 / yr</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div
        className={cn(
          "max-w-[80%] rounded-2xl rounded-tr-sm bg-accent/20 px-3 py-2 text-[13px] leading-snug text-text-primary"
        )}
      >
        {message.text}
        <span className="ml-1 inline-flex translate-y-0.5 items-center text-accent">
          <CheckCheck className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
