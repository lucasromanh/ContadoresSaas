import React, { useEffect, useState } from 'react'

const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString(undefined, { month: 'long' }) }))
const years = [2025, 2024, 2023]

export const RiskFilters: React.FC<{ onFilter: (f: any) => void }> = ({ onFilter }) => {
  const [mes, setMes] = useState<string>('')
  const [year, setYear] = useState<string>('')
  const [tipo, setTipo] = useState<string>('')
  const [criticidad, setCriticidad] = useState<string>('')
  const [q, setQ] = useState<string>('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilter({ mes, year, tipo, criticidad, cuit: q })
    }, 250)
    return () => clearTimeout(timeout)
  }, [mes, year, tipo, criticidad, q])

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2">
      <select value={mes} onChange={(e) => setMes(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800 border rounded">
        <option value="">Mes</option>
        {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <select value={year} onChange={(e) => setYear(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800 border rounded">
        <option value="">Año</option>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800 border rounded">
        <option value="">Tipo alerta</option>
        <option value="sin_documentacion">Falta documentación</option>
        <option value="deuda_afip">Deuda AFIP</option>
        <option value="factura_duplicada">Factura duplicada</option>
        <option value="iva_inconsistente">IVA inconsistente</option>
      </select>
      <select value={criticidad} onChange={(e) => setCriticidad(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800 border rounded">
        <option value="">Criticidad</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="CUIT o nombre" className="px-3 py-2 bg-white dark:bg-slate-800 border rounded flex-1" />
    </div>
  )
}

export default RiskFilters
