import { cn } from "@/lib/utils";

function scorePassword(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["bg-error", "bg-error", "bg-warning", "bg-accent", "bg-success"];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full bg-bg-tertiary transition-colors",
              index < score && COLORS[score]
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-text-muted">{LABELS[score]}</p>
    </div>
  );
}
