import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { StateHub } from './pages/StateHub';
import { Study } from './pages/Study';
import { Practice } from './pages/Practice';
import { SmartStudy } from './pages/SmartStudy';
import { Mock } from './pages/Mock';
import { Signs } from './pages/Signs';
import { Progress } from './pages/Progress';
import { Repaso } from './pages/Repaso';
import { Precios } from './pages/Precios';
import { Login } from './pages/Login';
import { Perfil } from './pages/Perfil';
import { Terminos, Privacidad, Reembolsos } from './pages/Legal';
import { Placeholder } from './pages/Placeholder';
import { ProtoDashboard } from './proto/ProtoDashboard';

// Rutas del SPEC §4. La experiencia dentro de un estado vive bajo AppShell
// (barra lateral + navegación inferior); las páginas globales/SEO usan Layout.
export function App() {
  return (
    <Routes>
      {/* Referencia de fidelidad al prototipo (mock aislado). */}
      <Route path="/proto" element={<ProtoDashboard />} />

      {/* ── Experiencia dentro del estado (con shell de app) ── */}
      <Route path="/:state" element={<AppShell />}>
        <Route index element={<StateHub />} />
        <Route path="estudiar" element={<Study />} />
        <Route path="practica/:topic" element={<Practice />} />
        <Route path="smart" element={<SmartStudy />} />
        <Route path="simulacro" element={<Mock />} />
        <Route path="senales" element={<Signs />} />
        <Route path="progreso" element={<Progress />} />
      </Route>

      {/* ── Páginas globales y SEO (con layout web) ── */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/repaso" element={<Repaso />} />

        {/* SEO (SSG) — SPEC §4.8 */}
        <Route path="/:state/examen-de-manejo-espanol" element={<Placeholder title="Examen de manejo (SEO)" spec="SPEC §4.8" />} />
        <Route path="/:state/preguntas/:topic" element={<Placeholder title="Preguntas por tema (SEO)" spec="SPEC §4.8" />} />
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
