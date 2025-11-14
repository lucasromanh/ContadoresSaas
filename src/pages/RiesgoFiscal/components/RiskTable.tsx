import React, { useMemo, useState } from 'react'
import { AlertaFiscal } from '../services/riesgoService'
import { Button } from '../../../components/ui/Button'

export const RiskTable: React.FC<{ alertas: AlertaFiscal[]; onViewDetail?: (a: AlertaFiscal) => void }> = ({ alertas, onViewDetail }) => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [sortBy, setSortBy] = useState<'fecha' | 'criticidad'>('fecha')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    const copy = [...alertas]
    copy.sort((a, b) => {
      if (sortBy === 'fecha') {
        const da = new Date(a.fecha).getTime()
        const db = new Date(b.fecha).getTime()
        return sortDir === 'asc' ? da - db : db - da
      }
      if (sortBy === 'criticidad') {
        const ranks: any = { alta: 3, media: 2, baja: 1 }
        return sortDir === 'asc' ? ranks[a.criticidad] - ranks[b.criticidad] : ranks[b.criticidad] - ranks[a.criticidad]
      }
      return 0
    })
    return copy
  }, [alertas, sortBy, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize)

  if (!alertas || alertas.length === 0) {
    // simple skeleton rows
    return (
      <div>
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-slate-700/10 dark:bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-slate-500">Mostrando {sorted.length} alertas</div>
        <div className="flex items-center space-x-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-2 py-1 bg-white dark:bg-slate-800 border rounded">
            <option value="fecha">Ordenar por Fecha</option>
            <option value="criticidad">Ordenar por Criticidad</option>
          </select>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value as any)} className="px-2 py-1 bg-white dark:bg-slate-800 border rounded">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-slate-500">
              <th className="px-3 py-2">CUIT</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Criticidad</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 align-top text-sm text-slate-700 dark:text-slate-200">{r.cuit}</td>
                <td className="px-3 py-2 align-top text-sm">{r.cliente}</td>
                <td className="px-3 py-2 align-top text-sm">{r.descripcion}</td>
                <td className="px-3 py-2 align-top text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs ${r.criticidad === 'alta' ? 'bg-red-600 text-white' : r.criticidad === 'media' ? 'bg-amber-400 text-black' : 'bg-sky-500 text-white'}`}>{r.criticidad}</span>
                </td>
                <td className="px-3 py-2 align-top text-sm">{new Date(r.fecha).toLocaleDateString()}</td>
                <td className="px-3 py-2 align-top text-sm">{r.estado}</td>
                <td className="px-3 py-2 align-top text-sm">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onViewDetail && onViewDetail(r)}>Ver detalle</Button>
                    <Button variant="outline" size="sm" onClick={() => {}}>Contactar</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-500">Página {page + 1} de {pageCount}</div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Anterior</Button>
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}>Siguiente</Button>
        </div>
      </div>
    </div>
  )
}

export default RiskTable
