import { Logo } from "@/components/layout/logo";

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <h1 className="text-2xl font-semibold text-text-primary">Pricing</h1>
      <p className="max-w-md text-sm text-text-secondary">
        Plan comparison cards are being built in an upcoming phase.
      </p>
    </main>
  );
}
