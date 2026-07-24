import { useMemo } from 'react';

// Colores de la paleta §12.1 permitidos para celebración (primary/secondary/
// success/warning — nunca error). Feedback positivo = uso semántico correcto.
const COLORS = ['#5b5ef7', '#7c3aed', '#16c784', '#f5b82e'];

/**
 * Confeti celebratorio (SPEC §11.4) — solo CSS, sin librerías (offline/CSP-safe).
 * Respeta prefers-reduced-motion (ver index.css). Puramente decorativo.
 */
export function Confetti({ pieces = 80 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        key: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.6,
        color: COLORS[i % COLORS.length],
        scale: 0.7 + Math.random() * 0.8,
      })),
    [pieces],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {bits.map((b) => (
        <span
          key={b.key}
          className="pp-confetti-piece"
          style={{
            left: `${b.left}%`,
            backgroundColor: b.color,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            transform: `scale(${b.scale})`,
          }}
        />
      ))}
    </div>
  );
}
