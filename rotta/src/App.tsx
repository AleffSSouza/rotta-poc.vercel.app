import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext'
import type { UserRole } from './types/promoter'
import ManagerLayout from './layouts/ManagerLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RoutePage from './pages/RoutePage'
import PromotersPage from './pages/PromotersPage'
import OccurrencesPage from './pages/OccurrencesPage'
import PrioritizationPage from './pages/PrioritizationPage'
import RegistryPage from './pages/RegistryPage'
import SettingsPage from './pages/SettingsPage'
import PromoterAppPage from './pages/PromoterAppPage'

const homeFor = (role: UserRole) => (role === 'gestor' ? '/gestor' : '/promotor')

function RequireRole({ role, children }: { role: UserRole; children: ReactElement }) {
  const { state } = useApp()
  if (!state.session) return <Navigate to="/login" replace />
  if (state.session.role !== role) return <Navigate to={homeFor(state.session.role)} replace />
  return children
}

function Landing() {
  const { state } = useApp()
  return <Navigate to={state.session ? homeFor(state.session.role) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/gestor"
        element={
          <RequireRole role="gestor">
            <ManagerLayout />
          </RequireRole>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="rota" element={<RoutePage />} />
        <Route path="promotores" element={<PromotersPage />} />
        <Route path="ocorrencias" element={<OccurrencesPage />} />
        <Route path="perfis" element={<PrioritizationPage />} />
        <Route path="cadastros" element={<RegistryPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>
      <Route
        path="/promotor"
        element={
          <RequireRole role="promotor">
            <PromoterAppPage />
          </RequireRole>
        }
      />
      <Route path="*" element={<Landing />} />
    </Routes>
  )
}
