import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { StateHub } from './pages/StateHub';
import { Practice } from './pages/Practice';
import { Placeholder } from './pages/Placeholder';

// Rutas del SPEC §4. Las páginas marcadas como Placeholder se implementan
// en fases posteriores; el árbol de rutas ya refleja la estructura final.
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/precios" element={<Placeholder title="Precios" spec="SPEC §4.7" />} />
        <Route path="/repaso" element={<Placeholder title="Repaso de falladas" spec="SPEC §4.6" />} />

        {/* Estado y sus módulos */}
        <Route path="/:state" element={<StateHub />} />
        <Route path="/:state/practica/:topic" element={<Practice />} />
        <Route path="/:state/simulacro" element={<Placeholder title="Simulacro" spec="SPEC §4.4" />} />
        <Route path="/:state/senales" element={<Placeholder title="Señales" spec="SPEC §4.5" />} />

        {/* SEO (SSG) — SPEC §4.8 */}
        <Route
          path="/:state/examen-de-manejo-espanol"
          element={<Placeholder title="Examen de manejo (SEO)" spec="SPEC §4.8" />}
        />
        <Route
          path="/:state/preguntas/:topic"
          element={<Placeholder title="Preguntas por tema (SEO)" spec="SPEC §4.8" />}
        />
        <Route path="/:state/faq/:slug" element={<Placeholder title="FAQ (SEO)" spec="SPEC §4.8" />} />

        {/* Legal — SPEC §4.9 */}
        <Route path="/terminos" element={<Placeholder title="Términos" spec="SPEC §4.9" />} />
        <Route path="/privacidad" element={<Placeholder title="Privacidad" spec="SPEC §4.9" />} />
        <Route path="/reembolsos" element={<Placeholder title="Reembolsos" spec="SPEC §4.9" />} />

        <Route path="*" element={<Placeholder title="Página no encontrada (404)" />} />
      </Route>
    </Routes>
  );
}
