"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  PartyPopper,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OtpInput } from "@/components/business/otp-input";
import { COUNTRY_CODES } from "@/lib/countries";
import {
  invalidNumberMessage,
  isValidMobileNumber,
  normalizeLocalNumber,
  parseStoredNumber,
} from "@/lib/phone";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ERROR_MESSAGES, type WhatsAppApiResult } from "@/lib/whatsapp/errors";
import type {
  MetaPhoneNumberResponse,
  OtpMethod,
  WhatsAppOnboardingState,
} from "@/lib/whatsapp/types";

const OTP_TTL_MS = 10 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_ATTEMPTS = 3;

type RegisterPhase = "registering" | "configuring" | "done";

async function callApi<T extends object>(url: string, init?: RequestInit): Promise<WhatsAppApiResult<T>> {
  try {
    const res = await fetch(url, init);
    const body = await res.json().catch(() => null);
    return body ?? { success: false, error: "generic", message: ERROR_MESSAGES.generic };
  } catch {
    return { success: false, error: "network_error", message: ERROR_MESSAGES.network_error };
  }
}

function post<T extends object = object>(url: string, body: Record<string, unknown>) {
  return callApi<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatCountdown(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export function PulseDot({ active = true }: { active?: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
      )}
      <span
        className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", active ? "bg-success" : "bg-error")}
      />
    </span>
  );
}

export function WhatsappConnectCard({
  business,
  onConnected,
}: {
  business: Business;
  onConnected: () => Promise<void>;
}) {
  const connected = Boolean(business.phone_number_id && business.display_phone);
  // A phone_number_id with no display_phone means onboarding started but
  // never finished registering.
  const pending = Boolean(business.phone_number_id && !business.display_phone);

  // Before a number is connected, display_phone holds the number the client
  // entered at first-time setup — use it to prefill the form.
  const enteredNumber = connected ? null : parseStoredNumber(business.display_phone);

  const [state, setState] = useState<WhatsAppOnboardingState>({
    step: 0,
    numberType: null,
    phoneNumber: enteredNumber?.localNumber ?? "",
    countryCode: enteredNumber?.countryCode ?? "+971",
    displayName: business.name,
    phoneNumberId: null,
    otpMethod: "SMS",
    error: null,
    isLoading: false,
  });
  const update = (patch: Partial<WhatsAppOnboardingState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  // Which number the phoneNumberId above was created for, so a retry after a
  // failed OTP send doesn't try to add the same number to the WABA twice.
  const [addedFor, setAddedFor] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");
  const [otp, setOtp] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [codeSentAt, setCodeSentAt] = useState<number | null>(null);
  const [serverExpired, setServerExpired] = useState(false);
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState<RegisterPhase>("registering");

  if (connected && state.step === 0) {
    return <ConnectedCard business={business} />;
  }

  async function sendCode(method: OtpMethod) {
    update({ isLoading: true, error: null, otpMethod: method });
    const result = await post("/api/whatsapp/send-otp", { business_id: business.id, method });
    if (!result.success) {
      update({ isLoading: false, error: result.message });
      return;
    }
    setOtp("");
    setAttemptsLeft(MAX_ATTEMPTS);
    setServerExpired(false);
    setCodeSentAt(Date.now());
    update({ isLoading: false, step: 2 });
  }

  async function submitNumber() {
    const digits = normalizeLocalNumber(state.phoneNumber);
    if (state.displayName.trim().length < 3) {
      update({ error: "Please enter a display name of at least 3 characters." });
      return;
    }
    if (!isValidMobileNumber(state.countryCode, digits)) {
      update({ error: invalidNumberMessage(state.countryCode) });
      return;
    }

    const numberKey = `${state.countryCode}${digits}`;
    if (addedFor !== numberKey) {
      update({ isLoading: true, error: null });
      const added = await post<{ phone_number_id: string }>("/api/whatsapp/add-number", {
        business_id: business.id,
        phone_number: digits,
        country_code: state.countryCode,
        display_name: state.displayName.trim(),
      });
      if (!added.success) {
        update({ isLoading: false, error: added.message });
        return;
      }
      update({ phoneNumberId: added.phone_number_id });
      setAddedFor(numberKey);
    }

    setSentTo(`${state.countryCode} ${state.phoneNumber.trim()}`);
    await sendCode(state.otpMethod);
  }

  async function resumePending() {
    update({ isLoading: true, error: null });
    const status = await callApi<MetaPhoneNumberResponse>(
      `/api/whatsapp/number-status?business_id=${business.id}`
    );
    if (!status.success) {
      update({ isLoading: false, error: status.message });
      return;
    }
    setSentTo(status.display_phone_number);
    update({ displayName: status.verified_name, phoneNumberId: business.phone_number_id });
    if (status.code_verification_status === "VERIFIED") {
      update({ isLoading: false });
      await register();
      return;
    }
    await sendCode("SMS");
  }

  async function verify() {
    if (!/^\d{6}$/.test(otp)) {
      update({ error: "Please enter the 6-digit code." });
      return;
    }
    update({ isLoading: true, error: null });
    const result = await post("/api/whatsapp/verify-number", {
      business_id: business.id,
      otp_code: otp,
    });

    if (!result.success) {
      if (result.error === "wrong_code") {
        const left = attemptsLeft - 1;
        setAttemptsLeft(left);
        setOtp("");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        update({
          isLoading: false,
          error:
            left > 0
              ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} remaining`
              : "Too many incorrect attempts. Please request a new code.",
        });
        return;
      }
      if (result.error === "code_expired") setServerExpired(true);
      update({ isLoading: false, error: result.message });
      return;
    }

    update({ isLoading: false });
    await register();
  }

  async function register() {
    setPhase("registering");
    update({ step: 3, error: null });
    const result = await post("/api/whatsapp/register-number", { business_id: business.id });
    if (!result.success) {
      update({ error: result.message });
      return;
    }
    setPhase("configuring");
    await wait(900);
    setPhase("done");
    await wait(600);
    update({ step: 4 });
    await onConnected();
  }

  return (
    <div className="rounded-card border border-accent/40 bg-bg-secondary p-5 shadow-accent-glow">
      <div className="flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold text-text-primary">Connect WhatsApp Business Number</h2>
      </div>

      <div key={state.step} className="mt-4 animate-in fade-in duration-300">
        {state.step === 0 && (
          <NumberTypeStep
            numberType={state.numberType}
            pending={pending}
            loading={state.isLoading}
            error={state.error}
            onSelect={(numberType) => update({ numberType, error: null })}
            onContinue={() => update({ step: 1, error: null })}
            onResume={resumePending}
          />
        )}

        {state.step === 1 && (
          <NumberInputStep
            state={state}
            onChange={update}
            onBack={() => update({ step: 0, error: null })}
            onSubmit={submitNumber}
          />
        )}

        {state.step === 2 && (
          <OtpStep
            sentTo={sentTo}
            otp={otp}
            onOtpChange={(value) => {
              setOtp(value);
              if (state.error) update({ error: null });
            }}
            codeSentAt={codeSentAt}
            serverExpired={serverExpired}
            attemptsLeft={attemptsLeft}
            shake={shake}
            loading={state.isLoading}
            error={state.error}
            onVerify={verify}
            onResend={sendCode}
          />
        )}

        {state.step === 3 && (
          <RegisteringStep phase={phase} error={state.error} onRetry={register} />
        )}

        {state.step === 4 && (
          <SuccessStep
            phone={business.display_phone ?? sentTo}
            displayName={state.displayName}
            live={business.status === "active"}
          />
        )}
      </div>
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-error">{children}</p>;
}

function NumberTypeStep({
  numberType,
  pending,
  loading,
  error,
  onSelect,
  onContinue,
  onResume,
}: {
  numberType: WhatsAppOnboardingState["numberType"];
  pending: boolean;
  loading: boolean;
  error: string | null;
  onSelect: (type: "new" | "existing") => void;
  onContinue: () => void;
  onResume: () => void;
}) {
  const options = [
    { value: "new", title: "New Number", body: "Not on WhatsApp yet", icon: Smartphone },
    { value: "existing", title: "Existing WA Business App", body: "Already using WhatsApp Business App", icon: CheckCircle2 },
  ] as const;

  return (
    <div className="space-y-4">
      {pending && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-warning/40 bg-warning/10 p-3">
          <p className="text-sm text-text-secondary">
            You started connecting a number but didn&apos;t finish verifying it.
          </p>
          <Button size="sm" variant="outline" onClick={onResume} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Resume verification
          </Button>
        </div>
      )}

      <p className="text-sm text-text-secondary">What type of number are you connecting?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const selected = numberType === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex items-start gap-3 rounded-control border p-4 text-left transition-colors",
                selected
                  ? "border-accent bg-accent/10"
                  : "border-border bg-bg-tertiary hover:border-accent/50"
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", selected ? "text-accent" : "text-text-muted")} />
              <span>
                <span className="block text-sm font-medium text-text-primary">{option.title}</span>
                <span className="block text-xs text-text-muted">{option.body}</span>
              </span>
            </button>
          );
        })}
      </div>

      {numberType === "existing" && (
        <div className="rounded-control border border-success/40 bg-success/10 p-4 animate-in fade-in">
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" />
            Great news — No deletion required!
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Thanks to Meta Coexistence, your existing WhatsApp Business App will continue working
            normally. Our AI system will also connect to the same number to handle automated replies.
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Your last 6 months of chat history will sync automatically. Zero downtime for your
            business.
          </p>
        </div>
      )}

      {error && <ErrorText>{error}</ErrorText>}

      <div className="flex justify-end">
        <Button variant="gradient" disabled={!numberType} onClick={onContinue}>
          Continue
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function NumberInputStep({
  state,
  onChange,
  onBack,
  onSubmit,
}: {
  state: WhatsAppOnboardingState;
  onChange: (patch: Partial<WhatsAppOnboardingState>) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="waDisplayName">Display Name *</Label>
        <Input
          id="waDisplayName"
          value={state.displayName}
          onChange={(e) => onChange({ displayName: e.target.value, error: null })}
          placeholder="Professional Boss Real Estate"
        />
        <p className="text-xs text-text-muted">This name is shown to customers on WhatsApp</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="waPhoneNumber">Phone Number *</Label>
        <div className="flex gap-2">
          <Select
            value={state.countryCode}
            onValueChange={(countryCode) => onChange({ countryCode, error: null })}
          >
            <SelectTrigger className="w-40 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="waPhoneNumber"
            inputMode="tel"
            value={state.phoneNumber}
            onChange={(e) => onChange({ phoneNumber: e.target.value, error: null })}
            placeholder="50 123 4567"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Delivery Method</Label>
        <div className="flex gap-4">
          {(["SMS", "VOICE"] as const).map((method) => (
            <label key={method} className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
              <input
                type="radio"
                name="otpMethod"
                className="accent-[var(--accent)]"
                checked={state.otpMethod === method}
                onChange={() => onChange({ otpMethod: method })}
              />
              {method === "SMS" ? "SMS" : "Voice Call"}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack} disabled={state.isLoading}>
          Back
        </Button>
        <Button type="submit" variant="gradient" disabled={state.isLoading}>
          {state.isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Sending code...
            </>
          ) : (
            <>
              Send Verification Code
              <ArrowRight />
            </>
          )}
        </Button>
      </div>

      {state.error && <ErrorText>{state.error}</ErrorText>}
    </form>
  );
}

function OtpStep({
  sentTo,
  otp,
  onOtpChange,
  codeSentAt,
  serverExpired,
  attemptsLeft,
  shake,
  loading,
  error,
  onVerify,
  onResend,
}: {
  sentTo: string;
  otp: string;
  onOtpChange: (value: string) => void;
  codeSentAt: number | null;
  serverExpired: boolean;
  attemptsLeft: number;
  shake: boolean;
  loading: boolean;
  error: string | null;
  onVerify: () => void;
  onResend: (method: OtpMethod) => void;
}) {
  const now = useNow(true);
  const sentAt = codeSentAt ?? now;
  const expiresIn = sentAt + OTP_TTL_MS - now;
  const resendIn = sentAt + RESEND_COOLDOWN_MS - now;
  const expired = serverExpired || expiresIn <= 0;
  const needsNewCode = expired || attemptsLeft <= 0;
  const canResend = !loading && (resendIn <= 0 || needsNewCode);

  return (
    <div className="space-y-4 text-center">
      <div>
        <p className="font-semibold text-text-primary">Enter Verification Code</p>
        <p className="mt-1 text-sm text-text-secondary">
          We sent a 6-digit code to <span className="font-mono text-text-primary">{sentTo}</span>
        </p>
        <p className={cn("mt-1 text-xs", expired ? "text-error" : "text-text-muted")}>
          {expired ? "Code expired. Please request a new one" : `Code expires in ${formatCountdown(expiresIn)}`}
        </p>
      </div>

      <div className={cn(shake && "animate-shake")}>
        <OtpInput
          value={otp}
          onChange={onOtpChange}
          disabled={loading || needsNewCode}
          invalid={Boolean(error)}
        />
      </div>

      {error && !expired && <ErrorText>{error}</ErrorText>}

      <Button
        variant="gradient"
        onClick={onVerify}
        disabled={loading || needsNewCode || otp.replace(/\D/g, "").length !== 6}
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        Verify Number
        {!loading && <ArrowRight />}
      </Button>

      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-2 text-sm text-text-muted",
          needsNewCode && "rounded-control border border-accent/40 bg-accent/10 p-2"
        )}
      >
        <span>Didn&apos;t receive it?</span>
        {(["SMS", "VOICE"] as const).map((method, index) => (
          <span key={method} className="flex items-center gap-2">
            {index > 0 && <span>|</span>}
            <button
              type="button"
              disabled={!canResend}
              onClick={() => onResend(method)}
              className="text-accent underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-text-muted disabled:no-underline"
            >
              Resend via {method === "SMS" ? "SMS" : "Voice"}
            </button>
          </span>
        ))}
        {!canResend && !loading && <span>(in {formatCountdown(resendIn)})</span>}
      </div>
    </div>
  );
}

function RegisteringStep({
  phase,
  error,
  onRetry,
}: {
  phase: RegisterPhase;
  error: string | null;
  onRetry: () => void;
}) {
  const progress = phase === "registering" ? 45 : phase === "configuring" ? 80 : 100;
  const items = [
    { label: "Number verified", done: true, active: false },
    { label: "Registering for API access...", done: phase !== "registering", active: phase === "registering" },
    { label: "Configuring your AI system...", done: phase === "done", active: phase === "configuring" },
  ];

  return (
    <div className="mx-auto max-w-sm space-y-5 py-4 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
      <p className="font-semibold text-text-primary">Verifying your number...</p>
      <div className="space-y-1">
        <Progress value={progress} />
        <p className="text-xs text-text-muted">{progress}%</p>
      </div>
      <ul className="space-y-2 text-left text-sm">
        {items.map((item) => (
          <li
            key={item.label}
            className={cn(
              "flex items-center gap-2",
              item.done ? "text-text-primary" : item.active ? "text-text-secondary" : "text-text-muted"
            )}
          >
            {item.done ? (
              <Check className="h-4 w-4 text-success" />
            ) : item.active && !error ? (
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            ) : (
              <span className="mx-1 h-2 w-2 rounded-full border border-text-muted" />
            )}
            {item.label}
          </li>
        ))}
      </ul>
      {error && (
        <div className="space-y-2">
          <ErrorText>{error}</ErrorText>
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

function SuccessStep({ phone, displayName, live }: { phone: string; displayName: string; live: boolean }) {
  return (
    <div className="mx-auto max-w-sm space-y-4 py-4 text-center">
      <PartyPopper className="mx-auto h-10 w-10 text-accent" />
      <p className="text-lg font-semibold text-text-primary">Your WhatsApp is Connected!</p>
      <div className="space-y-1">
        <p className="flex items-center justify-center gap-2 font-mono text-text-primary">
          <PulseDot />
          {phone}
        </p>
        <p className="text-sm text-text-secondary">{displayName}</p>
      </div>
      <p className="flex items-center justify-center gap-2 text-sm font-medium">
        <PulseDot active={live} />
        <span className={live ? "text-success" : "text-text-secondary"}>
          {live ? "Live — AI system is active" : "Connected — AI service is currently paused"}
        </span>
      </p>
      <p className="text-sm text-text-secondary">
        Your AI assistant is now ready to receive and respond to customer messages automatically.
      </p>
      <Button asChild variant="gradient">
        <Link href="/dashboard">
          Go to Dashboard
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}

function ConnectedCard({ business }: { business: Business }) {
  const [details, setDetails] = useState<MetaPhoneNumberResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    callApi<MetaPhoneNumberResponse>(`/api/whatsapp/number-status?business_id=${business.id}`).then(
      (result) => {
        if (!cancelled && result.success) setDetails(result);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [business.id]);

  const qualityVariant = { GREEN: "success", YELLOW: "warning", RED: "error", UNKNOWN: "secondary" } as const;

  return (
    <div className="rounded-card border border-accent/40 bg-bg-secondary p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PulseDot active={business.status === "active"} />
          <div>
            <p className="font-mono text-sm text-text-primary">{business.display_phone}</p>
            <p className="text-xs text-text-muted">
              {details?.verified_name ?? "WhatsApp Business number"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {details?.quality_rating && (
            <Badge variant={qualityVariant[details.quality_rating] ?? "secondary"}>
              Quality: {details.quality_rating.toLowerCase()}
            </Badge>
          )}
          <Badge variant="success">
            <Sparkles className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        </div>
      </div>
    </div>
  );
}
