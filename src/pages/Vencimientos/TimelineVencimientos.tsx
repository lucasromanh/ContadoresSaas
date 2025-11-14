import React from 'react'
import { Vencimiento } from './services/vencimientosService'

export default function TimelineVencimientos({ items }: { items: Vencimiento[] }){
  // compute current week (Mon-Sun)
  const now = new Date()
  const dayOfWeek = (now.getDay() + 6) % 7 // 0 = Monday
  const monday = new Date(now); monday.setDate(now.getDate() - dayOfWeek)
  const days = Array.from({length:7}, (_,i)=>{ const d = new Date(monday); d.setDate(monday.getDate()+i); return d })

  function keyOf(d: Date){ return d.toISOString().slice(0,10) }

  return (
    <div className="mt-4 border rounded p-2">
      <div className="grid grid-cols-7 gap-2">
        {days.map((d)=>{
          const key = keyOf(d)
          const dayItems = items.filter(it => it.fecha === key)
          return (
            <div key={key} className="p-2 border rounded min-h-[120px] bg-white/5 dark:bg-slate-900">
              <div className="text-sm font-semibold text-slate-200 dark:text-slate-100">{d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</div>
              <div className="mt-2 space-y-2">
                {dayItems.map(it => {
                  const dotClass = it.criticidad==='alta'?'bg-red-500': it.criticidad==='media'?'bg-amber-400':'bg-emerald-400'
                  const descClass = it.estado === 'pagado' ? 'text-emerald-400 dark:text-emerald-300 line-through opacity-90' : it.estado === 'presentado' ? 'text-slate-400 dark:text-slate-300' : it.estado === 'vencido' ? 'text-red-400 dark:text-red-300' : 'text-slate-900 dark:text-slate-100'
                  return (
                    <div key={it.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
                        <div className="truncate max-w-[120px] min-w-0 overflow-hidden text-slate-900 dark:text-slate-100">{it.descripcion}</div>
                      </div>
                      <div className={`text-xs ${descClass}`}>{it.estado}</div>
                    </div>
                  )
                })}
                {dayItems.length===0 && <div className="text-xs text-slate-400">Sin eventos</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
