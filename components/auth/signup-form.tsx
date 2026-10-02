"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { useAuth } from "@/components/providers/auth-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import { ensureProfile } from "@/lib/auth/ensure-profile";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const supabase = useSupabase();
  const { refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const password = watch("password");

  async function onSubmit(values: SignupValues) {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    });

    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "Could not create your account.");
      return;
    }

    // Email confirmation is on: no session yet, so the profile is created at
    // first login instead (see ensureProfile).
    if (!data.session) {
      setLoading(false);
      toast.success("Check your email to confirm your account, then log in.");
      router.push("/login");
      return;
    }

    const { error: profileError } = await ensureProfile(supabase, data.user);
    if (profileError) {
      setLoading(false);
      toast.error(profileError.message);
      return;
    }
    await refreshProfile();

    toast.success("Account created! Your 14-day free trial has started.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-card border border-border bg-bg-secondary p-8 shadow-card">
      <h1 className="text-lg font-semibold text-text-primary">Create your account</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Start your 14-day free trial. No credit card required.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="Jane Doe" autoComplete="name" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-error">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@business.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
          <PasswordStrength password={password ?? ""} />
          {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
