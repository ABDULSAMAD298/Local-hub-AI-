"use client";

import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { BusinessSetupForm } from "@/components/onboarding/business-setup-form";
import { useAuth } from "@/components/providers/auth-provider";
import { useBusiness } from "@/components/providers/business-provider";

// Account settings stay reachable so a user can still log out or delete their
// account without being forced through setup first.
const UNGATED_PREFIXES = ["/dashboard/settings"];

// Every dashboard page is replaced by the first-time setup form until the
// user has a business row.
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { business, loading, refetch } = useBusiness();

  if (UNGATED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return <>{children}</>;

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user || business) return <>{children}</>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
          <Sparkles className="h-6 w-6 text-accent" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-text-primary">
          Complete your setup to activate your AI
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Tell us about your business so your AI assistant can start replying to customers.
        </p>
      </div>
      <div className="rounded-card border border-accent/40 bg-bg-secondary p-6 shadow-accent-glow">
        <BusinessSetupForm userId={user.id} onCreated={refetch} />
      </div>
    </div>
  );
}
