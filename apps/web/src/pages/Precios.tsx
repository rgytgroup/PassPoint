import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { PRICING } from '../data/pricing';

interface PlanProps {
  title: string;
  price: string;
  features: string[];
  cta: string;
  onBuy: () => void;
  highlight?: boolean;
}

function Plan({ title, price, features, cta, onBuy, highlight }: PlanProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-6 ${
        highlight ? 'border-slate-900 shadow-sm' : 'border-slate-200'
      }`}
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-3xl font-bold text-slate-900">{price}</p>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-green-600">✓</span> {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onBuy}
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {cta}
      </button>
    </div>
  );
}

export function Precios() {
  const { lang } = useLang();
  const [params] = useSearchParams();
  const state = params.get('state')?.toUpperCase();
  const es = lang === 'ES';
  const [note, setNote] = useState<string | null>(null);

  // El checkout real de Stripe se conecta en el siguiente paso.
  const buy = () =>
    setNote(
      es
        ? 'El pago se activará al conectar Stripe (siguiente paso). ¡Ya casi!'
        : 'Payment will be enabled once Stripe is connected (next step). Almost there!',
    );

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-900">
        {es ? 'Precios' : 'Pricing'}
      </h1>
      <p className="mt-2 text-slate-500">
        {es
          ? 'Compra única de por vida. Sin suscripciones, sin anuncios.'
          : 'One-time lifetime purchase. No subscriptions, no ads.'}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Plan
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
                  'Uso sin conexión',
                ]
              : [
                  'All questions for the state',
                  'Unlimited practice, mocks and review',
                  'Offline use',
                ]
          }
          cta={es ? 'Comprar' : 'Buy'}
          onBuy={buy}
        />
        <Plan
          highlight
          title={es ? 'Acceso total (all-access)' : 'All-access'}
          price={PRICING.all.price}
          features={
            es
              ? [
                  'Todos los estados disponibles',
                  'Todo lo del plan por estado',
                  'Futuros estados incluidos',
                ]
              : [
                  'Every available state',
                  'Everything in the per-state plan',
                  'Future states included',
                ]
          }
          cta={es ? 'Comprar all-access' : 'Buy all-access'}
          onBuy={buy}
        />
      </div>

      {note && (
        <p className="mt-6 rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {note}
        </p>
      )}

      <p className="mt-6 text-xs text-slate-400">
        {es
          ? 'PassPoint es una app independiente, no afiliada a ningún DMV.'
          : 'PassPoint is an independent app, not affiliated with any DMV.'}
      </p>
    </section>
  );
}
