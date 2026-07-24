import { useParams, Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { Card } from '../ui/Card';
import { signs, categoryLabels, type SignCategory } from '../data/signs';

const ORDER: SignCategory[] = ['reglamentaria', 'preventiva', 'informativa'];

export function Signs() {
  const { state: code = '' } = useParams();
  const { t, lang, pick } = useLang();
  const es = lang === 'ES';

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('signals')}</h1>
        <Link to={`/${code}`} className="text-sm text-text-secondary hover:text-primary">
          ← {code.toUpperCase()}
        </Link>
      </div>
      <p className="mt-2 text-text-secondary">
        {es
          ? 'Estudia las señales por categoría. Toca el botón EN/ES para cambiar de idioma.'
          : 'Study signs by category. Tap EN/ES to switch language.'}
      </p>

      {ORDER.map((category) => {
        const items = signs.filter((s) => s.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="mt-8">
            <h2 className="text-lg font-bold text-text-primary">
              {es ? categoryLabels[category].es : categoryLabels[category].en}
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((sign) => (
                <li key={sign.id}>
                  <Card className="flex gap-4 p-4">
                    <div className="h-20 w-20 shrink-0">{sign.svg}</div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{pick(sign, 'name')}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{pick(sign, 'meaning')}</p>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
