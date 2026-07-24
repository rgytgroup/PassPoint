// Iconos de línea inline (sin dependencias externas, offline/CSP-safe).
export const ic = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  bell: 'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0',
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  book: 'M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z',
  exam: 'M9 4h6a1 1 0 011 1a1 1 0 01-1 1H9a1 1 0 01-1-1a1 1 0 011-1zM6 6h1v14h10V6h1M9 12l2 2 4-4',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  coach: 'M12 3v2M8 7h8a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2zM9 12h.01M15 12h.01M4 12h2M18 12h2',
  chevR: 'M9 6l6 6-6 6',
  chevD: 'M6 9l6 6 6-6',
  pin: 'M12 22c4-5 6-8 6-11a6 6 0 10-12 0c0 3 2 6 6 11zM12 9a2 2 0 100 4 2 2 0 000-4',
  flame: 'M12 2s5 4 5 9a5 5 0 01-10 0c0-1.5 1-3 1-3s1 1.5 2 1.5S12 2 12 2z',
  check: 'M5 12l4 4 8-8',
  clock: 'M12 8v4l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  target: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8z',
  checkC: 'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12l3 3 5-5',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  cal: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
  sign: 'M8 3h8l5 5v8l-5 5H8l-5-5V8z',
  globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z',
  logout: 'M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h11',
};

export function Line({ d, cls = 'h-6 w-6' }: { d: string; cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden>
      <path d={d} />
    </svg>
  );
}

// Señal de STOP compacta (para "Continuar aprendiendo" / señales).
export function StopSign({ cls = 'h-11 w-11' }: { cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cls} aria-hidden>
      <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z" fill="#EF4444" />
      <text x="12" y="14.5" textAnchor="middle" fill="#fff" style={{ fontSize: 5.2, fontWeight: 800 }}>
        STOP
      </text>
    </svg>
  );
}
