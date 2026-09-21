import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3.5 8.75h6.9V21H3.5V8.75Zm7.9 0h6.6v1.68h.09c.92-1.68 3.16-2.02 4.55-2.02 4.87 0 5.76 2.94 5.76 6.77V21h-6.9v-5.03c0-1.2-.02-2.75-1.67-2.75-1.67 0-1.93 1.31-1.93 2.66V21h-6.9V8.75Z" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2h3.308l-7.227 8.26L23 22h-6.657l-5.214-6.817L4.99 22H1.68l7.73-8.835L1 2h6.828l4.713 6.231L18.244 2Zm-1.161 18h1.833L7.001 3.86H5.032L17.083 20Z" />
    </svg>
  );
}
