import { Logo } from "@/components/layout/logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <Logo />
      <div className="w-full max-w-sm rounded-card border border-border bg-bg-secondary p-8 text-center shadow-card">
        <h1 className="text-lg font-semibold text-text-primary">Log in</h1>
        <p className="mt-2 text-sm text-text-secondary">
          The login form is being built in an upcoming phase.
        </p>
      </div>
    </main>
  );
}
