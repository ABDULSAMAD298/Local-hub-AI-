import { Logo } from "@/components/layout/logo";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <Logo />
      <SignupForm />
    </main>
  );
}
