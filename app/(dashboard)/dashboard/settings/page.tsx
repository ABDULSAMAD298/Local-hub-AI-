"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/auth/password-input";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { useBusiness } from "@/components/providers/business-provider";
import { useSupabase } from "@/components/providers/supabase-provider";

const NOTIFICATION_KEYS = [
  { key: "newConversation", label: "New conversation alerts" },
  { key: "followUpCompletion", label: "Follow-up completion" },
  { key: "weeklyReport", label: "Weekly report email" },
] as const;

type NotificationPrefs = Record<(typeof NOTIFICATION_KEYS)[number]["key"], boolean>;

const DEFAULT_PREFS: NotificationPrefs = {
  newConversation: true,
  followUpCompletion: true,
  weeklyReport: false,
};

export default function SettingsPage() {
  const supabase = useSupabase();
  const { user, profile } = useAuth();
  const { business, refetch: refetchBusiness } = useBusiness();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [pausing, setPausing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`notif-prefs-${user.id}`);
      if (stored) setPrefs(JSON.parse(stored));
    } catch {
      // ignore malformed/blocked storage
    }
  }, [user]);

  function updatePref(key: keyof NotificationPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    if (user) {
      try {
        localStorage.setItem(`notif-prefs-${user.id}`, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  }

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

  async function handleChangeEmail() {
    if (!newEmail) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSavingEmail(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your inbox to confirm the new email address.");
    setNewEmail("");
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

  async function handlePauseService() {
    if (!business) return;
    setPausing(true);
    const nextStatus = business.status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("businesses")
      .update({ status: nextStatus })
      .eq("id", business.id);
    setPausing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(nextStatus === "active" ? "Service resumed" : "Service paused");
    refetchBusiness();
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

        <Separator className="my-5" />

        <div className="space-y-1.5">
          <Label htmlFor="newEmail">Email</Label>
          <p className="text-xs text-text-muted">Current: {profile?.email}</p>
          <div className="flex gap-2">
            <Input
              id="newEmail"
              type="email"
              placeholder="new@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Button variant="outline" onClick={handleChangeEmail} disabled={savingEmail || !newEmail}>
              {savingEmail ? "Saving…" : "Change"}
            </Button>
          </div>
        </div>

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
        <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
        <div className="mt-4 space-y-4">
          {NOTIFICATION_KEYS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="font-normal text-text-primary">
                {label}
              </Label>
              <Switch
                id={key}
                checked={prefs[key]}
                onCheckedChange={(checked) => updatePref(key, checked)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-error/30 bg-bg-secondary p-5">
        <h2 className="text-sm font-semibold text-error">Danger Zone</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-bg-tertiary p-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Pause Service</p>
            <p className="text-xs text-text-muted">Temporarily stop the AI from responding to customers.</p>
          </div>
          <Button variant="outline" onClick={handlePauseService} disabled={pausing || !business}>
            {business?.status === "active" ? "Pause" : "Resume"}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-control border border-error/30 bg-bg-tertiary p-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Delete Account</p>
            <p className="text-xs text-text-muted">Permanently delete your account and all data.</p>
          </div>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </div>
      </section>

      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
