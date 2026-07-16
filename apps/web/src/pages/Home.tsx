import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';

// Estados v1 en orden (SPEC §8). El selector real se llenará desde la API.
const STATES_V1 = ['CA', 'TX', 'FL', 'NY', 'AZ', 'IL', 'NJ', 'GA'];

export function Home() {
  const { t } = useLang();

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {t('tagline')}
      </h1>

      <h2 className="mt-8 text-lg font-semibold text-slate-700">
        {t('selectState')}
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATES_V1.map((code) => (
          <li key={code}>
            <Link
              to={`/${code.toLowerCase()}`}
              className="block rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-xl font-bold text-slate-900 hover:border-slate-400 hover:shadow-sm"
            >
              {code}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
