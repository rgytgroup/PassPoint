interface PlaceholderProps {
  title: string;
  spec?: string;
}

/** Página aún no implementada. Referencia el punto del SPEC que la cubre. */
export function Placeholder({ title, spec }: PlaceholderProps) {
  return (
    <section>
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="mt-2 text-text-secondary">
        Pendiente de implementar{spec ? ` — ${spec}` : ''}.
      </p>
    </section>
  );
}
