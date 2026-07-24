import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { LEGAL } from '../data/legal';

/** Contenedor de documento legal (SPEC §4.9): prosa legible con tokens §12.1. */
function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  const { lang } = useLang();
  const es = lang === 'ES';
  const updated = new Date(`${LEGAL.lastUpdated}T00:00:00Z`).toLocaleDateString(
    es ? 'es' : 'en',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">{title}</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {es ? 'Última actualización:' : 'Last updated:'} {updated}
      </p>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-text-secondary">{children}</div>
      <p className="mt-8 rounded-xl bg-primary/5 px-4 py-3 text-xs text-text-secondary">
        {es
          ? 'PassPoint es una app independiente, no afiliada a ningún DMV ni entidad gubernamental.'
          : 'PassPoint is an independent app, not affiliated with any DMV or government entity.'}
      </p>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary">
        ← {es ? 'Volver al inicio' : 'Back home'}
      </Link>
    </section>
  );
}

function H({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-bold text-text-primary">{children}</h2>;
}

// ─────────────────────────── Términos ───────────────────────────

export function Terminos() {
  const { lang } = useLang();
  const es = lang === 'ES';
  return (
    <LegalLayout title={es ? 'Términos de servicio' : 'Terms of Service'}>
      <div>
        <H>{es ? '1. Qué es PassPoint' : '1. What PassPoint is'}</H>
        <p className="mt-1">
          {es
            ? `${LEGAL.brand} es una aplicación de práctica para el examen teórico de manejo del DMV en Estados Unidos, operada por ${LEGAL.company}. Ofrece preguntas al estilo del examen real basadas en el manual oficial de cada estado. No es el DMV ni está afiliada a ninguna entidad gubernamental, y no garantiza que apruebes.`
            : `${LEGAL.brand} is a practice app for the U.S. DMV written driving test, operated by ${LEGAL.company}. It offers exam-style questions based on each state's official driver handbook. It is not the DMV and is not affiliated with any government entity, and it does not guarantee that you will pass.`}
        </p>
      </div>
      <div>
        <H>{es ? '2. Tu cuenta' : '2. Your account'}</H>
        <p className="mt-1">
          {es
            ? 'El acceso usa un enlace mágico enviado a tu correo, sin contraseñas. Eres responsable de mantener el acceso a ese correo. Debes tener al menos 16 años o el consentimiento de un tutor.'
            : 'Access uses a magic link sent to your email, with no passwords. You are responsible for keeping access to that inbox. You must be at least 16 or have a guardian’s consent.'}
        </p>
      </div>
      <div>
        <H>{es ? '3. Compra única de por vida' : '3. One-time lifetime purchase'}</H>
        <p className="mt-1">
          {es
            ? 'El acceso al banco completo de un estado es una compra única de por vida; no hay suscripciones ni cobros recurrentes. El acceso queda ligado a tu cuenta. Los precios pueden cambiar para compras futuras, pero nunca se te cobrará de nuevo por lo que ya compraste.'
            : 'Access to a state’s full question bank is a one-time lifetime purchase; there are no subscriptions or recurring charges. Access is tied to your account. Prices may change for future purchases, but you will never be charged again for what you already bought.'}
        </p>
      </div>
      <div>
        <H>{es ? '4. Uso aceptable' : '4. Acceptable use'}</H>
        <p className="mt-1">
          {es
            ? 'El contenido es para tu estudio personal. No puedes copiar, revender ni redistribuir las preguntas ni extraer el banco de forma automatizada.'
            : 'The content is for your personal study. You may not copy, resell or redistribute the questions, or scrape the bank in an automated way.'}
        </p>
      </div>
      <div>
        <H>{es ? '5. Sin garantías' : '5. No warranties'}</H>
        <p className="mt-1">
          {es
            ? 'El contenido se basa en manuales oficiales pero puede contener errores o quedar desactualizado. Se ofrece “tal cual”, sin garantía de resultado en tu examen. Verifica siempre las reglas vigentes con tu DMV.'
            : 'Content is based on official handbooks but may contain errors or become outdated. It is provided “as is”, with no guarantee of your exam result. Always verify current rules with your DMV.'}
        </p>
      </div>
      <div>
        <H>{es ? '6. Contacto' : '6. Contact'}</H>
        <p className="mt-1">
          {es ? 'Escríbenos a ' : 'Reach us at '}
          <a href={`mailto:${LEGAL.supportEmail}`} className="font-semibold text-primary">
            {LEGAL.supportEmail}
          </a>
          .
        </p>
      </div>
    </LegalLayout>
  );
}

// ─────────────────────────── Privacidad ───────────────────────────

export function Privacidad() {
  const { lang } = useLang();
  const es = lang === 'ES';
  return (
    <LegalLayout title={es ? 'Política de privacidad' : 'Privacy Policy'}>
      <div>
        <H>{es ? 'Qué datos guardamos' : 'What we store'}</H>
        <p className="mt-1">
          {es
            ? 'Guardamos tu correo (para el inicio de sesión), tu idioma preferido, tus compras y tu progreso de estudio (intentos, respuestas y estadísticas por pregunta) para calcular tu preparación y el repaso. No pedimos ni almacenamos contraseñas.'
            : 'We store your email (for sign-in), your preferred language, your purchases, and your study progress (attempts, answers and per-question stats) to compute your readiness and review. We do not ask for or store passwords.'}
        </p>
      </div>
      <div>
        <H>{es ? 'Proveedores' : 'Providers'}</H>
        <p className="mt-1">
          {es
            ? 'Usamos Supabase (autenticación y base de datos), Stripe (pagos — nosotros no vemos ni guardamos los datos de tu tarjeta) y Resend (correos transaccionales como el enlace de acceso). Cada uno procesa solo lo necesario para su función.'
            : 'We use Supabase (auth and database), Stripe (payments — we never see or store your card details) and Resend (transactional emails such as the sign-in link). Each processes only what its function requires.'}
        </p>
      </div>
      <div>
        <H>{es ? 'Sin publicidad ni venta de datos' : 'No ads or data sales'}</H>
        <p className="mt-1">
          {es
            ? 'No mostramos anuncios ni vendemos tus datos. No usamos rastreadores publicitarios de terceros.'
            : 'We show no ads and we do not sell your data. We use no third-party advertising trackers.'}
        </p>
      </div>
      <div>
        <H>{es ? 'Tus derechos' : 'Your rights'}</H>
        <p className="mt-1">
          {es
            ? 'Puedes pedir una copia o la eliminación de tus datos escribiendo a '
            : 'You can request a copy or deletion of your data by writing to '}
          <a href={`mailto:${LEGAL.supportEmail}`} className="font-semibold text-primary">
            {LEGAL.supportEmail}
          </a>
          {es
            ? '. Al eliminar tu cuenta se borran tu progreso y tus datos personales; las compras pueden conservarse de forma anonimizada por obligaciones contables.'
            : '. Deleting your account removes your progress and personal data; purchases may be retained in anonymized form for accounting obligations.'}
        </p>
      </div>
    </LegalLayout>
  );
}

// ─────────────────────────── Reembolsos ───────────────────────────

export function Reembolsos() {
  const { lang } = useLang();
  const es = lang === 'ES';
  return (
    <LegalLayout title={es ? 'Política de reembolsos' : 'Refund Policy'}>
      <div>
        <H>{es ? 'Garantía de satisfacción' : 'Satisfaction guarantee'}</H>
        <p className="mt-1">
          {es
            ? `Si no quedas satisfecho con tu compra, puedes pedir un reembolso completo dentro de los ${LEGAL.refundDays} días siguientes a la compra, sin necesidad de explicar por qué.`
            : `If you are not satisfied with your purchase, you can request a full refund within ${LEGAL.refundDays} days of purchase, no explanation needed.`}
        </p>
      </div>
      <div>
        <H>{es ? 'Cómo pedirlo' : 'How to request it'}</H>
        <p className="mt-1">
          {es ? 'Escríbenos desde el correo de tu cuenta a ' : 'Email us from your account address at '}
          <a href={`mailto:${LEGAL.supportEmail}`} className="font-semibold text-primary">
            {LEGAL.supportEmail}
          </a>
          {es
            ? ' indicando el estado que compraste. Procesamos el reembolso al método de pago original, normalmente en pocos días hábiles.'
            : ' telling us which state you bought. We refund to your original payment method, usually within a few business days.'}
        </p>
      </div>
      <div>
        <H>{es ? 'Después de la ventana' : 'After the window'}</H>
        <p className="mt-1">
          {es
            ? `Pasados los ${LEGAL.refundDays} días, al tratarse de un producto digital de acceso inmediato y de por vida, las compras no son reembolsables salvo que la ley de tu jurisdicción disponga lo contrario.`
            : `After ${LEGAL.refundDays} days, because this is an instantly delivered lifetime digital product, purchases are non-refundable unless your local law provides otherwise.`}
        </p>
      </div>
    </LegalLayout>
  );
}
