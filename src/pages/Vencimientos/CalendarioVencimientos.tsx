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

  // Monday-first calendar; compute leading blank days
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun..6=Sat
  const leading = (firstDay + 6) % 7 // convert to Monday=0..Sunday=6
  const totalCells = Math.ceil((leading + dim) / 7) * 7

  function cellKey(idx:number){
    // idx is 0..totalCells-1; day number = idx - leading + 1
    const dayNum = idx - leading + 1
    if (dayNum < 1 || dayNum > dim) return `empty-${idx}`
    const dd = new Date(year, month, dayNum)
    return dd.toISOString().slice(0,10)
  }

  function prev(){ setMonthOffset((m)=>m-1) }
  function next(){ setMonthOffset((m)=>m+1) }

  const weekdays = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

  return (
    <div className="border rounded p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{date.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="px-2 py-1 border rounded">◀</button>
          <button onClick={next} className="px-2 py-1 border rounded">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w)=> <div key={w} className="text-xs font-medium text-slate-500 dark:text-slate-300">{w}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-2">
        {Array.from({length: totalCells}, (_,i)=>i).map((idx)=>{
          const key = cellKey(idx)
          const isEmpty = key.startsWith('empty-')
          let dayNum: number | null = null
          if (!isEmpty) dayNum = new Date(key).getDate()
          const dayItems = !isEmpty ? items.filter(it => it.fecha === key) : []
          return (
            <div key={key} className={`min-h-[68px] p-2 border rounded ${isEmpty ? 'bg-transparent' : 'bg-white/5 dark:bg-slate-900'}`}>
              <div className="text-xs text-slate-400">{dayNum ?? ''}</div>
              {!isEmpty && (
                <div className="mt-1 space-y-1">
                  {dayItems.slice(0,3).map(it => (
                    <div key={it.id} onClick={()=> onEventClick && onEventClick(it)} title={`${it.descripcion} • ${it.cliente}`} className={`text-xs truncate ${it.criticidad==='alta'?'text-red-400': it.criticidad==='media'?'text-amber-300':'text-emerald-300'}`}>{it.tipo} • {it.cliente}</div>
                  ))}
                  {dayItems.length>3 && <div className="text-xs text-slate-400">+{dayItems.length-3} más</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
