import React from 'react'

type MonthData = { label: string; neto: number }

export default function ComparativaMensual({ data }:{ data?: MonthData[] }){
  if (!data || data.length === 0) return <div>No hay datos para comparativa</div>
  return (
    <div className="p-3 border rounded bg-white dark:bg-slate-800">
      <h3 className="font-semibold">Comparativa mensual (últimos {Math.min(6,data.length)} meses)</h3>
      <div className="mt-2 text-sm space-y-1">
        {data.slice(0,6).map((m, i) => (
          <div key={i} className="flex justify-between"><div>{m.label}</div><div className="font-medium">${Number(m.neto).toLocaleString()}</div></div>
        ))}
      </div>
    </div>
  )
}
