import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { PRICING } from '../data/pricing';
import { Button } from '../ui/Button';

interface PlanProps {
  title: string;
  price: string;
  features: string[];
  cta: string;
  onBuy: () => void;
  busy?: boolean;
  highlight?: boolean;
  badge?: string;
}

function Tier({ title, price, features, cta, onBuy, busy, highlight, badge }: PlanProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        highlight ? 'border-primary bg-surface shadow-md' : 'border-border bg-surface shadow-sm'
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-3xl font-extrabold text-text-primary">{price}</p>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-text-secondary">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-success">✓</span> {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={onBuy}
        disabled={busy}
        variant={highlight ? 'primary' : 'outline'}
        className="mt-6 w-full"
      >
        {cta}
      </Button>
    </div>
  );
}

export function Precios() {
  const { lang } = useLang();
  const { email } = useAuth();
  const [params] = useSearchParams();
  const state = params.get('state')?.toUpperCase();
  const es = lang === 'ES';
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function buy(scope: 'STATE' | 'ALL') {
    if (!email) {
      setNote(es ? 'Inicia sesión para comprar.' : 'Sign in to purchase.');
      return;
    }
    if (scope === 'STATE' && !state) {
      setNote(
        es
          ? 'Abre un estado y pulsa "Ver precios" para comprarlo.'
          : 'Open a state and tap "See pricing" to buy it.',
      );
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const { url } = await api.startCheckout(scope, state?.toLowerCase());
      if (url) window.location.href = url;
      else throw new Error('sin url');
    } catch {
      setNote(
        es
          ? 'El pago aún no está disponible. Inténtalo más tarde.'
          : 'Payment is not available yet. Please try later.',
      );
      setBusy(false);
    }
  }

  return (
    <section>
      {/* Hero de pago con el mensaje canónico (SPEC §11.5) */}
      <div className="rounded-3xl bg-background-dark px-6 py-10 text-center text-text-on-dark">
        <h1 className="text-3xl font-extrabold">
          {es ? 'Un solo pago. Tuyo para siempre.' : 'One payment. Yours forever.'}
        </h1>
        <p className="mt-3 text-sm text-text-on-dark/70">
          {es
            ? 'Sin cobros recurrentes, sin anuncios. Compra una vez y estudia hasta aprobar.'
            : 'No recurring charges, no ads. Buy once and study until you pass.'}
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Tier
          title={
            state
              ? es
                ? `Acceso a ${state}`
                : `${state} access`
              : es
                ? 'Acceso a un estado'
                : 'One-state access'
          }
          price={PRICING.state.price}
          features={
            es
              ? [
                  'Todas las preguntas del estado',
                  'Práctica, simulacros y repaso sin límite',
                  'Smart Study y uso sin conexión',
                ]
              : [
                  'All questions for the state',
                  'Unlimited practice, mocks and review',
                  'Smart Study and offline use',
                ]
          }
          cta={es ? 'Comprar' : 'Buy'}
          onBuy={() => buy('STATE')}
          busy={busy}
        />
        <Tier
          highlight
          badge={es ? 'Mejor valor' : 'Best value'}
          title={es ? 'Acceso total' : 'All-access'}
          price={PRICING.all.price}
          features={
            es
              ? [
                  'Todos los estados disponibles',
                  'Todo lo del acceso por estado',
                  'Estados futuros incluidos',
                ]
              : [
                  'Every available state',
                  'Everything in one-state access',
                  'Future states included',
                ]
          }
          cta={es ? 'Comprar acceso total' : 'Buy all-access'}
          onBuy={() => buy('ALL')}
          busy={busy}
        />
      </div>

      {note && (
        <p className="mt-6 rounded-xl bg-primary/5 px-4 py-3 text-sm text-text-primary">{note}</p>
      )}

      <p className="mt-6 text-xs text-text-secondary">
        {es
          ? 'PassPoint es una app independiente, no afiliada a ningún DMV.'
          : 'PassPoint is an independent app, not affiliated with any DMV.'}
      </p>
    </section>
  );
}
