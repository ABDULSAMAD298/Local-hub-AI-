"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/components/providers/auth-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import { PLAN_LIMITS } from "@/lib/plans";

export default function SuperAdminSettingsPage() {
  const supabase = useSupabase();
  const { user, profile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  async function handleSaveName() {
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setSavingName(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Name updated");
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-card border border-border bg-bg-secondary p-5">
        <h2 className="text-sm font-semibold text-text-primary">Profile</h2>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="flex gap-2">
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Button variant="outline" onClick={handleSaveName} disabled={savingName}>
              {savingName ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <p className="mt-3 text-xs text-text-muted">Email: {profile?.email}</p>

        <Separator className="my-5" />

        <div className="space-y-3">
          <Label>Change Password</Label>
          <PasswordInput
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordInput
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button variant="outline" onClick={handleChangePassword} disabled={savingPassword}>
            {savingPassword ? "Saving…" : "Update Password"}
          </Button>
        </div>
      </section>

      <section className="rounded-card border border-border bg-bg-secondary p-5">
        <h2 className="text-sm font-semibold text-text-primary">Platform Plans</h2>
        <p className="mt-1 text-xs text-text-muted">
          Reference pricing used across signup, billing and plan overrides.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(Object.keys(PLAN_LIMITS) as (keyof typeof PLAN_LIMITS)[]).map((plan) => {
            const limits = PLAN_LIMITS[plan];
            return (
              <div key={plan} className="rounded-control border border-border bg-bg-tertiary p-3">
                <p className="text-sm font-semibold capitalize text-text-primary">{plan}</p>
                <p className="text-lg font-semibold text-text-primary">${limits.price}/mo</p>
                <p className="text-xs text-text-secondary">{limits.businesses} businesses</p>
                <p className="text-xs text-text-secondary">
                  {limits.conversations === Infinity ? "Unlimited" : limits.conversations.toLocaleString()} conv/mo
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
