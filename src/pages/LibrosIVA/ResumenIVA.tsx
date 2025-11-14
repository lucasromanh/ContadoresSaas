import React from 'react'

export default function ResumenIVA({ data }: { data: any[] }) {
  const totalNeto = data.reduce((s, r) => s + (Number(r.neto) || 0), 0)
  const totalIva = data.reduce((s, r) => s + (Number(r.iva21 || 0) + Number(r.iva105 || 0)), 0)
  const total = data.reduce((s, r) => s + (Number(r.total) || 0), 0)
  const duplicados = data.filter((d) => d.duplicado).length
  const inconsistentes = data.filter((d) => d.inconsistente).length

  return (
    <div className="grid grid-cols-4 gap-3 text-slate-700 dark:text-slate-200">
      <div className="p-3 border rounded bg-white/5 dark:bg-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-300">Total Neto</div>
        <div className="text-lg font-semibold">${totalNeto}</div>
      </div>
      <div className="p-3 border rounded bg-white/5 dark:bg-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-300">Total IVA</div>
        <div className="text-lg font-semibold">${totalIva}</div>
      </div>
      <div className="p-3 border rounded bg-white/5 dark:bg-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-300">Total</div>
        <div className="text-lg font-semibold">${total}</div>
      </div>
      <div className="p-3 border rounded bg-white/5 dark:bg-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-300">Alertas</div>
        <div className="text-lg font-semibold">{duplicados} dup · {inconsistentes} inc</div>
      </div>
    </div>
  )
}
