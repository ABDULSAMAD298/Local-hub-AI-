import { Bell } from "lucide-react";

export function NotificationBell() {
  return (
    <button
      className="relative rounded-control p-2 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
    </button>
  );
}
