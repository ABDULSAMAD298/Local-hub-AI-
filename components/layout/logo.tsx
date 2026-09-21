import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-1">
      <span className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-gradient text-white">
        <MessageCircle className="h-5 w-5" />
      </span>
      <span className="text-base font-semibold text-text-primary">LocalHub AI</span>
    </Link>
  );
}
