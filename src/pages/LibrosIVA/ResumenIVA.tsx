import React from 'react'

export default function ResumenIVA({ data }: { data: any[] }) {
  const totalNeto = data.reduce((s, r) => s + (Number(r.neto) || 0), 0)
  const totalIva = data.reduce((s, r) => s + (Number(r.iva21 || 0) + Number(r.iva105 || 0)), 0)
  const total = data.reduce((s, r) => s + (Number(r.total) || 0), 0)
  const duplicados = data.filter((d) => d.duplicado).length
  const inconsistentes = data.filter((d) => d.inconsistente).length

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="p-3 border rounded">
        <div className="text-xs text-neutral-500">Total Neto</div>
        <div className="text-lg font-semibold">${totalNeto}</div>
      </div>
      <div className="p-3 border rounded">
        <div className="text-xs text-neutral-500">Total IVA</div>
        <div className="text-lg font-semibold">${totalIva}</div>
      </div>
      <div className="p-3 border rounded">
        <div className="text-xs text-neutral-500">Total</div>
        <div className="text-lg font-semibold">${total}</div>
      </div>
      <div className="p-3 border rounded">
        <div className="text-xs text-neutral-500">Alertas</div>
        <div className="text-lg font-semibold">{duplicados} dup · {inconsistentes} inc</div>
      </div>
    </div>
  )
}
