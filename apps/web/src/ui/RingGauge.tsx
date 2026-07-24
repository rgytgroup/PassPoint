// Anillo de "Ready Score" (SPEC §11.2). El valor ya viene redondeado a
// múltiplos de 5 desde el backend; aquí solo se dibuja.
export function RingGauge({
  value,
  size = 148,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c * (1 - pct / 100);
  // Color semántico: verde cuando ya está listo, primary mientras avanza.
  const color = pct >= 80 ? 'var(--color-success)' : 'var(--color-primary)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="50%" y="49%" textAnchor="middle" dominantBaseline="middle" className="fill-text-primary" style={{ fontSize: size * 0.26, fontWeight: 800 }}>
        {pct}%
      </text>
      {label && (
        <text x="50%" y="67%" textAnchor="middle" className="fill-text-secondary" style={{ fontSize: size * 0.085, fontWeight: 500 }}>
          {label}
        </text>
      )}
    </svg>
  );
}
