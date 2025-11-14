import React from 'react'

// Simple bar chart using divs. Expects array of { label, neto }
export default function GraficosSueldos({ data }:{ data?: { label:string; neto:number }[] }){
  if (!data || data.length === 0) return (
    <div className="p-3 border rounded bg-white dark:bg-slate-800">
      <h3 className="font-semibold">Gráficos</h3>
      <div className="mt-3 text-sm">No hay datos para graficar</div>
    </div>
  )

  const max = Math.max(...data.map(d=>d.neto), 1)

  return (
    <div className="p-3 border rounded bg-white dark:bg-slate-800">
      <h3 className="font-semibold">Gráficos</h3>
      <div className="mt-3 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-24 text-sm text-slate-600">{d.label}</div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-4 rounded overflow-hidden">
              <div style={{ width: `${(d.neto/max)*100}%` }} className="h-4 bg-blue-500"></div>
            </div>
            <div className="w-24 text-right text-sm">${Number(d.neto).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
