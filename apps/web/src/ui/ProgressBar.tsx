// Barra de progreso v2. El color de feedback es semántico (SPEC §12.1):
// success solo para dominio alto; el resto usa primary (no decorativo).
export function ProgressBar({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 80 ? 'bg-success' : 'bg-primary';
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-border ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
