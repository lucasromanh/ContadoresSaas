import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/useUserStore'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/Dashboard'
import { RiesgoFiscalPage } from './pages/RiesgoFiscal'
import { ClientesPage } from './pages/Clientes'
import { ProveedoresPage } from './pages/Proveedores'
import { SueldosPage } from './pages/Sueldos'
import { IIBBPage } from './pages/IIBB'
import { LibrosIVAPage } from './pages/LibrosIVA'
import { VencimientosPage } from './pages/Vencimientos'
import { LoginPage } from './pages/Login'
import { ProfilePage } from './pages/Profile'

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const user = useUserStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="riesgo-fiscal" element={<RiesgoFiscalPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="proveedores" element={<ProveedoresPage />} />
  <Route path="profile" element={<ProfilePage />} />
        <Route path="sueldos" element={<SueldosPage />} />
        <Route path="iibb" element={<IIBBPage />} />
        <Route path="libros-iva" element={<LibrosIVAPage />} />
        <Route path="vencimientos" element={<VencimientosPage />} />
      </Route>
    </Routes>
  )
}
