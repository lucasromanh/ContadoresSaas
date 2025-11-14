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
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-100">
          <tr>
            <th className="px-2 py-1 text-left">Fecha</th>
            <th className="px-2 py-1 text-left">Tipo</th>
            <th className="px-2 py-1 text-left">PV</th>
            <th className="px-2 py-1 text-left">Numero</th>
            <th className="px-2 py-1 text-left">CUIT</th>
            <th className="px-2 py-1 text-left">Razon</th>
            <th className="px-2 py-1 text-right">Total</th>
            <th className="px-2 py-1 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr onClick={()=>onRowClick && onRowClick(r)} key={r.id} className={(r.duplicado ? 'bg-red-50' : r.inconsistente ? 'bg-yellow-50' : '') + ' cursor-pointer'}>
              <td className="px-2 py-1">{r.fecha}</td>
              <td className="px-2 py-1">{r.tipo}</td>
              <td className="px-2 py-1">{r.puntoVenta}</td>
              <td className="px-2 py-1">{r.numero}</td>
              <td className="px-2 py-1">{r.cuit}</td>
              <td className="px-2 py-1">{r.razonSocial}</td>
              <td className="px-2 py-1 text-right">{r.total}</td>
              <td className="px-2 py-1">{r.duplicado ? 'Duplicado' : r.inconsistente ? 'Inconsistente' : 'OK'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
