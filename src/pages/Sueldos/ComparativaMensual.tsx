import React from 'react'

export default function ComparativaMensual({ data }:{ data?: any }){
  // Placeholder: simple textual comparativa
  if (!data || data.length === 0) return <div>No hay datos para comparativa</div>
  return (
    <div className="p-3 border rounded bg-white dark:bg-slate-800">
      <h3 className="font-semibold">Comparativa mensual (últimos 6 meses)</h3>
      <div className="mt-2 text-sm">
        {data.slice(0,6).map((m:any,i:number)=> (
          <div key={i} className="flex justify-between"><div>{m.label}</div><div className="font-medium">${m.neto}</div></div>
        ))}
      </div>
    </div>
  )
}
