import React, { useState } from 'react'

export default function FiltrosVencimientos({ onApply, onSendReminder }: { onApply: (f:any)=>void; onSendReminder?: ()=>void }){
  const [cliente, setCliente] = useState('')
  const [cuit, setCuit] = useState('')
  const [tipo, setTipo] = useState('')
  const [estado, setEstado] = useState('')
  const [provincia, setProvincia] = useState('')

  function apply(){ onApply({ cliente, cuit, tipo, estado, provincia }) }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="text-xs text-slate-500">Cliente</label>
        <input className="block border px-2 py-1 rounded bg-white dark:bg-slate-700 dark:text-slate-100" value={cliente} onChange={(e)=>setCliente(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-slate-500">CUIT</label>
        <input className="block border px-2 py-1 rounded bg-white dark:bg-slate-700 dark:text-slate-100" value={cuit} onChange={(e)=>setCuit(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-slate-500">Tipo</label>
        <select className="block border px-2 py-1 rounded bg-white dark:bg-slate-700 dark:text-slate-100" value={tipo} onChange={(e)=>setTipo(e.target.value)}>
          <option value="">Todos</option>
          <option value="ARCA">ARCA</option>
          <option value="RENTAS">RENTAS</option>
          <option value="MUNICIPAL">MUNICIPAL</option>
          <option value="MONOTRIBUTO">MONOTRIBUTO</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500">Estado</label>
        <select className="block border px-2 py-1 rounded bg-white dark:bg-slate-700 dark:text-slate-100" value={estado} onChange={(e)=>setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="pendiente">pendiente</option>
          <option value="presentado">presentado</option>
          <option value="pagado">pagado</option>
          <option value="vencido">vencido</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500">Provincia</label>
        <input className="block border px-2 py-1 rounded bg-white dark:bg-slate-700 dark:text-slate-100" value={provincia} onChange={(e)=>setProvincia(e.target.value)} />
      </div>
      <div>
        <button onClick={apply} className="btn-primary px-3 py-1">Aplicar</button>
      </div>
      <div>
        <button onClick={() => onSendReminder && onSendReminder()} className="px-3 py-1 border rounded">Enviar recordatorio</button>
      </div>
    </div>
  )
}
