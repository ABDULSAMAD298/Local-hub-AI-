"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/components/providers/auth-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const supabase = useSupabase();
  const { refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [shake, setShake] = useState(false);
  const [resetting, setResetting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(values);

    if (error || !data.user) {
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      toast.error(error?.message ?? "Could not sign you in.");
      return;
    }

    // First login after confirming email: signup couldn't create the profile
    // without a session, so do it now. No-op for existing profiles.
    await ensureProfile(supabase, data.user);
    await refreshProfile();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const redirectTo = searchParams.get("redirectTo");
    const destination =
      redirectTo ?? (profile?.role === "admin" ? "/super-admin" : "/dashboard");

    router.push(destination);
    router.refresh();
  }

  async function handleForgotPassword() {
    const email = watch("email");
    if (!email) {
      toast.error("Enter your email above first, then click “Forgot password?”");
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setResetting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent — check your inbox.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <Logo />
      <div
        className={cn(
          "w-full max-w-sm rounded-card border border-border bg-bg-secondary p-8 shadow-card",
          shake && "animate-shake"
        )}
      >
        <h1 className="text-center text-lg font-semibold text-text-primary">Log in</h1>
        <p className="mt-1 text-center text-sm text-text-secondary">
          Welcome back to LocalHub AI
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@business.com" {...register("email")} />
            {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={rememberMe} onCheckedChange={setRememberMe} id="remember-me" />
              <Label htmlFor="remember-me" className="cursor-pointer font-normal">
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetting}
              className="text-sm font-medium text-accent hover:underline disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&rsquo;t have an account?{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Start free trial
          </Link>
        </p>
      </div>
    </main>
  );
}
