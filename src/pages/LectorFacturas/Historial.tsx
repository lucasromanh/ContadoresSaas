import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'

type HistItem = {
  at?: string
  file?: string
  data?: any
  saved?: boolean
}

export const Historial: React.FC<{ items?: HistItem[] }> = ({ items = [] }) => {
  if (items.length === 0) return <div className="text-sm text-slate-500">Sin historial</div>

  return (
    <div className="space-y-2">
      {items.map((h, i) => (
        <HistCard key={i} item={h} />
      ))}
    </div>
  )
}

const HistCard: React.FC<{ item: HistItem }> = ({ item }) => {
  const [view, setView] = useState<'none' | 'contador' | 'json'>('none')
  const d = item.at ? new Date(item.at).toLocaleString() : ''
  const raw = item as any
  // data may be directly in item.data or nested under data.data depending on how it was pushed
  const data = raw.data || raw?.data?.data || {}
  const tipo = data.tipo || '-'
  const emisor = data.emisor?.razonSocial || '-'
  const receptor = data.receptor?.razonSocial || ''
  const total = data.totales?.total ?? ''

  return (
    <div className="border rounded p-3 bg-white dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{d} • {item.file}</div>
          <div className="font-medium">{tipo} — {emisor} {receptor ? `→ ${receptor}` : ''}</div>
          <div className="text-sm text-slate-400">Total: {total}</div>
        </div>
        <div className="ml-4 flex-shrink-0 space-x-2">
          <Button variant={view === 'contador' ? 'default' : 'ghost'} size="sm" onClick={() => setView(view === 'contador' ? 'none' : 'contador')}>Vista CONTADOR</Button>
          <Button variant={view === 'json' ? 'default' : 'ghost'} size="sm" onClick={() => setView(view === 'json' ? 'none' : 'json')}>Ver JSON</Button>
        </div>
      </div>

      {view === 'contador' && (
        <div className="mt-3 text-sm space-y-2">
          <div><strong>Razón social:</strong> {emisor}</div>
          <div><strong>CUIT emisor:</strong> {data.emisor?.cuit || '-'}</div>
          {receptor && <div><strong>Receptor:</strong> {receptor}</div>}
          <div><strong>Tipo / Comprobante:</strong> {tipo} {data.comprobante?.puntoVenta ? `- PtoVenta ${data.comprobante.puntoVenta}` : ''} {data.comprobante?.numero ? `Nº ${data.comprobante.numero}` : ''}</div>
          <div><strong>Fecha:</strong> {data.comprobante?.fechaEmision || data.comprobante?.fecha || '-'}</div>
          <div><strong>Total:</strong> {total}</div>
          {Array.isArray(data.items) && data.items.length > 0 && (
            <div>
              <strong>Items:</strong>
              <ul className="list-disc list-inside mt-1">
                {data.items.map((it: any, idx: number) => (
                  <li key={idx}>{it.descripcion} — {it.subtotal ?? it.precioUnitario ?? ''}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {view === 'json' && (
        <pre className="mt-3 text-xs overflow-auto bg-slate-50 dark:bg-slate-900 p-2 rounded">{JSON.stringify(item, null, 2)}</pre>
      )}
    </div>
  )
}

export default Historial
