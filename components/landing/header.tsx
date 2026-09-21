"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-[60px] items-center border-b border-transparent transition-all duration-150 sm:h-[72px]",
        scrolled
          ? "border-border bg-bg-primary/80 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="gradient" asChild>
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>

        <button
          className="rounded-control p-2 text-text-primary md:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="top" className="h-screen">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center justify-between">
              <Logo />
            </div>
            <nav className="mt-8 flex flex-1 flex-col items-center justify-center gap-8">
              {NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <a href={link.href} className="text-xl font-medium text-text-primary">
                    {link.label}
                  </a>
                </SheetClose>
              ))}
              <div className="mt-8 flex w-full max-w-xs flex-col gap-3 px-6">
                <SheetClose asChild>
                  <Button variant="outline" asChild size="lg">
                    <Link href="/login">Login</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="gradient" asChild size="lg">
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                </SheetClose>
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
