import React, { useState } from 'react'

export default function FiltrosAlertas({ onApply }:{ onApply: (f:any)=>void }){
  const [tipo, setTipo] = useState('')
  const [criticidad, setCriticidad] = useState('')
  const [estado, setEstado] = useState('')
  const [q, setQ] = useState('')

  function aplicar(){ onApply({ tipo, criticidad, estado, q }) }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="text-xs text-slate-500">Tipo</label>
        <select className="block border px-2 py-1 rounded bg-slate-100" value={tipo} onChange={(e)=>setTipo(e.target.value)}>
          <option value="">Todos</option>
          <option value="riesgo_fiscal">Riesgo fiscal</option>
          <option value="vencimiento">Vencimiento</option>
          <option value="factura">Factura</option>
          <option value="proveedor">Proveedor</option>
          <option value="documento">Documento</option>
          <option value="manual">Manual</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500">Criticidad</label>
        <select className="block border px-2 py-1 rounded bg-slate-100" value={criticidad} onChange={(e)=>setCriticidad(e.target.value)}>
          <option value="">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500">Estado</label>
        <select className="block border px-2 py-1 rounded bg-slate-100" value={estado} onChange={(e)=>setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="resuelta">Resuelta</option>
          <option value="leida">Leída</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500">Cliente / CUIT / Proveedor</label>
        <input className="block border px-2 py-1 rounded bg-slate-100" value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>
      <div>
        <button onClick={aplicar} className="btn-primary px-3 py-1">Aplicar</button>
      </div>
    </div>
  )
}
