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
import LibrosIVAPage from './pages/LibrosIVA'
import VencimientosPage from './pages/Vencimientos'
import { LoginPage } from './pages/Login'
import { HomePage } from './pages/Home'
import { ProfilePage } from './pages/Profile'
import { ProtectedRoute } from './router/ProtectedRoute'
import DocumentosPage from './pages/Documentos'
import AlertasPage from './pages/Alertas'
import IngresosDetallePage from './pages/Ingresos/Detalle'
import CostosDetallePage from './pages/Costos/Detalle'
import MargenDetallePage from './pages/Margen/Detalle'
import { LectorFacturasPage } from './pages/LectorFacturas/LectorFacturas'

export default function App() {
  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
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
        <Route path="ingresos/detalle" element={<IngresosDetallePage />} />
        <Route path="costos/detalle" element={<CostosDetallePage />} />
        <Route path="margen/detalle" element={<MargenDetallePage />} />
  <Route path="lector-facturas" element={<LectorFacturasPage />} />
        <Route path="documentos" element={<DocumentosPage />} />
        <Route path="alertas" element={<AlertasPage />} />
      </Route>
    </Routes>
  )
}
