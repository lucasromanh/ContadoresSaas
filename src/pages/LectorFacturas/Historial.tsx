import React from 'react'

export const Historial: React.FC<{ items?: any[] }> = ({ items = [] }) => {
  if (items.length === 0) return <div className="text-sm text-slate-500">Sin historial</div>
  return (
    <div className="space-y-2">
      {items.map((h, i) => (
        <div key={i} className="text-sm border rounded p-2 bg-white dark:bg-slate-800">{h}</div>
      ))}
    </div>
  )
}

export default Historial
