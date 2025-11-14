import React, { useEffect, useState } from 'react'
import { RiskSummary } from './components/RiskSummary'
import { RiskStats } from './components/RiskStats'
import { RiskCard } from './components/RiskCard'
import { RiskTable } from './components/RiskTable'
import { RiskDetailDrawer } from './components/RiskDetailDrawer'
import riesgoService from './services/riesgoService'
import { AlertaFiscal } from './services/riesgoService'
import { Card } from '../../components/ui/Card'
import { AlertTriangle, FileText, ShieldAlert, ClipboardList } from 'lucide-react'

/**
 * Local fallback RiskFilters component because ./components/RiskFilters was missing.
 * Props: onFilter(f: any)
 */
const RiskFilters: React.FC<{ onFilter: (f: any) => void }> = ({ onFilter }) => {
  const [query, setQuery] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilter(query ? { q: query } : {})
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar..."
        className="border rounded px-2 py-1 flex-1"
      />
      <button type="submit" className="px-3 py-1 bg-sky-500 text-white rounded">Filtrar</button>
    </form>
  )
}

export const RiesgoFiscalPage: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaFiscal[]>([])
  const [selected, setSelected] = useState<AlertaFiscal | null>(null)
  const [filters, setFilters] = useState<any>({})

  useEffect(() => {
    async function load() {
      const data = await riesgoService.getAlertas()
      setAlertas(data)
    }
    load()
  }, [])

  const onFilter = (f: any) => {
    setFilters(f)
  }

  const filtered = riesgoService.applyFilters(alertas, filters)

  const countsByType = riesgoService.countsByTipo(filtered)

  return (
    <div className="space-y-4">
      <RiskSummary alertas={filtered} />
      <div className="mt-4">
        <RiskStats alertas={filtered} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <RiskCard icon={<AlertTriangle />} title="Crítico" color="red" count={countsByType.alta || 0} onClick={() => setFilters({ criticidad: 'alta' })} />
        <RiskCard icon={<ShieldAlert />} title="Moderado" color="yellow" count={countsByType.media || 0} onClick={() => setFilters({ criticidad: 'media' })} />
        <RiskCard icon={<FileText />} title="Info" color="blue" count={countsByType.baja || 0} onClick={() => setFilters({ criticidad: 'baja' })} />
        <RiskCard icon={<ClipboardList />} title="Todas" color="slate" count={filtered.length} onClick={() => setFilters({})} />
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <RiskFilters onFilter={onFilter} />
          </div>
          <div className="w-full md:w-1/3 text-right">
            {/* placeholder for actions */}
          </div>
        </div>

        <div className="mt-4">
          <RiskTable alertas={filtered} onViewDetail={(a) => setSelected(a)} />
        </div>
      </Card>

      <RiskDetailDrawer alerta={selected} onClose={() => setSelected(null)} onResolve={async (id) => {
        await riesgoService.resolverAlerta(id)
        const data = await riesgoService.getAlertas()
        setAlertas(data)
        setSelected(null)
      }} />
    </div>
  )
}

export default RiesgoFiscalPage
