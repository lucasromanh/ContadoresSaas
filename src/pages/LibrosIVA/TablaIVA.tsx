import React from 'react'

type Row = {
  id: string
  fecha: string
  tipo: string
  puntoVenta: string
  numero: string
  cuit: string
  razonSocial: string
  neto: number
  iva21: number
  iva105: number
  percepciones: number
  total: number
  cae?: string
  duplicado?: boolean
  inconsistente?: boolean
}

export default function TablaIVA({ data, onRowClick }: { data: Row[], onRowClick?: (r: Row)=>void }) {
  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm text-slate-700 dark:text-slate-200">
        <thead className="bg-neutral-100 dark:bg-slate-800">
          <tr>
            <th className="px-2 py-1 text-left text-slate-600 dark:text-slate-300">Fecha</th>
            <th className="px-2 py-1 text-left text-slate-600 dark:text-slate-300">Tipo</th>
            <th className="px-2 py-1 text-left text-slate-600 dark:text-slate-300">PV</th>
            <th className="px-2 py-1 text-left text-slate-600 dark:text-slate-300">Numero</th>
            <th className="px-2 py-1 text-left text-slate-600 dark:text-slate-300">CUIT</th>
            <th className="px-2 py-1 text-left text-slate-600 dark:text-slate-300">Razon</th>
            <th className="px-2 py-1 text-right text-slate-600 dark:text-slate-300">Total</th>
            <th className="px-2 py-1 text-left text-slate-600 dark:text-slate-300">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => {
            const base = idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'
            const statusBg = r.duplicado ? 'bg-red-50 dark:bg-red-900/40' : r.inconsistente ? 'bg-yellow-50 dark:bg-amber-900/30' : ''
            return (
              <tr
                onClick={() => onRowClick && onRowClick(r)}
                key={r.id}
                className={`${base} ${statusBg} cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800`}
              >
                <td className="px-2 py-1 text-slate-700 dark:text-slate-200">{r.fecha}</td>
                <td className="px-2 py-1 text-slate-700 dark:text-slate-200">{r.tipo}</td>
                <td className="px-2 py-1 text-slate-700 dark:text-slate-200">{r.puntoVenta}</td>
                <td className="px-2 py-1 text-slate-700 dark:text-slate-200">{r.numero}</td>
                <td className="px-2 py-1 text-slate-700 dark:text-slate-200">{r.cuit}</td>
                <td className="px-2 py-1 text-slate-700 dark:text-slate-200">{r.razonSocial}</td>
                <td className="px-2 py-1 text-right text-slate-700 dark:text-slate-200">{r.total}</td>
                <td className="px-2 py-1 text-slate-700 dark:text-slate-200">{r.duplicado ? 'Duplicado' : r.inconsistente ? 'Inconsistente' : 'OK'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
