import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { StateHub } from './pages/StateHub';
import { Practice } from './pages/Practice';
import { SmartStudy } from './pages/SmartStudy';
import { Mock } from './pages/Mock';
import { Signs } from './pages/Signs';
import { Repaso } from './pages/Repaso';
import { Precios } from './pages/Precios';
import { Login } from './pages/Login';
import { Terminos, Privacidad, Reembolsos } from './pages/Legal';
import { Placeholder } from './pages/Placeholder';

// Rutas del SPEC §4. Las páginas marcadas como Placeholder se implementan
// en fases posteriores; el árbol de rutas ya refleja la estructura final.
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/repaso" element={<Repaso />} />

        {/* Estado y sus módulos */}
        <Route path="/:state" element={<StateHub />} />
        <Route path="/:state/practica/:topic" element={<Practice />} />
        <Route path="/:state/smart" element={<SmartStudy />} />
        <Route path="/:state/simulacro" element={<Mock />} />
        <Route path="/:state/senales" element={<Signs />} />

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
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/reembolsos" element={<Reembolsos />} />

        <Route path="*" element={<Placeholder title="Página no encontrada (404)" />} />
      </Route>
    </Routes>
  );
}
