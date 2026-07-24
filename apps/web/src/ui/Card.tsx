import type { HTMLAttributes } from 'react';

// Card del design system v2: superficie blanca, borde y radio del token.
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 shadow-sm ${className}`}
      {...props}
    />
  );
}
