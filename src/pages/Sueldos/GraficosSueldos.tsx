import React from 'react'

export default function GraficosSueldos({ data }:{ data?: any }){
  // Placeholders: in a real app use Recharts or Chart.js
  return (
    <div className="p-3 border rounded bg-white dark:bg-slate-800">
      <h3 className="font-semibold">Gráficos</h3>
      <div className="mt-3 text-sm">(Gráficos de neto, deducciones y haberes - placeholder)</div>
    </div>
  )
}
