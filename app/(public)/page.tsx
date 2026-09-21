import { Logo } from "@/components/layout/logo";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <h1 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
        Your WhatsApp Business,
        <br />
        <span className="gradient-text">Powered by AI</span>
      </h1>
      <p className="max-w-xl text-text-secondary">
        Automate customer conversations, send property videos, follow up automatically — all from
        one dashboard.
      </p>
      <p className="text-xs text-text-muted">Landing page content is being built in the next phase.</p>
    </main>
  );
}
