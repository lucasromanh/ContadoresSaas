import React, { useState } from 'react'
import { Vencimiento } from './services/vencimientosService'

function startOfMonth(year:number, month:number){ return new Date(year, month, 1) }
function daysInMonth(year:number, month:number){ return new Date(year, month+1, 0).getDate() }

export default function CalendarioVencimientos({ items, onEventClick }: { items: Vencimiento[]; onEventClick?: (v:Vencimiento)=>void }){
  const now = new Date()
  const [monthOffset, setMonthOffset] = useState(0)
  const date = new Date(now.getFullYear(), now.getMonth()+monthOffset, 1)
  const year = date.getFullYear()
  const month = date.getMonth()
  const dim = daysInMonth(year, month)

  function dayKey(d:number){ const dd = new Date(year, month, d); return dd.toISOString().slice(0,10) }

  function prev(){ setMonthOffset((m)=>m-1) }
  function next(){ setMonthOffset((m)=>m+1) }

  return (
    <div className="border rounded p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{date.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="px-2 py-1 border rounded">◀</button>
          <button onClick={next} className="px-2 py-1 border rounded">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({length:dim}, (_,i)=>i+1).map((d)=>{
          const key = dayKey(d)
          const dayItems = items.filter(it => it.fecha === key)
          return (
            <div key={key} className="min-h-[68px] p-2 border rounded bg-white/5 dark:bg-slate-900">
              <div className="text-xs text-slate-400">{d}</div>
              <div className="mt-1 space-y-1">
                {dayItems.slice(0,3).map(it => (
                  <div key={it.id} onClick={()=> onEventClick && onEventClick(it)} title={`${it.descripcion} • ${it.cliente}`} className={`text-xs truncate ${it.criticidad==='alta'?'text-red-400': it.criticidad==='media'?'text-amber-300':'text-emerald-300'}`}>{it.tipo} • {it.cliente}</div>
                ))}
                {dayItems.length>3 && <div className="text-xs text-slate-400">+{dayItems.length-3} más</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
