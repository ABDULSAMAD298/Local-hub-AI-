"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      duration={4000}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-bg-tertiary group-[.toaster]:text-text-primary group-[.toaster]:border-border group-[.toaster]:shadow-card group-[.toaster]:rounded-card",
          description: "group-[.toast]:text-text-secondary",
          actionButton: "group-[.toast]:bg-accent group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-bg-secondary group-[.toast]:text-text-secondary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
