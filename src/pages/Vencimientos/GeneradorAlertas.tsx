import React, { useEffect, useState } from 'react'
import { useClientes } from '../../hooks/useClientes'

export default function GeneradorAlertas({ onClose, initialCliente }: { onClose: ()=>void; initialCliente?: string }){
  const [canal, setCanal] = useState<'whatsapp'|'email'|'interna'>('whatsapp')
  const [mensaje, setMensaje] = useState('')
  const { data: clientes } = useClientes()
  const [destino, setDestino] = useState<string>(initialCliente || '')

  useEffect(()=>{
    if (initialCliente) setDestino(initialCliente)
  },[initialCliente])

  function send(){
    // simulate sending to selected client
    const target = (clientes || []).find((c:any)=> (c.razon_social || c.nombre) === destino)
    const targetLabel = target ? `${target.razon_social || target.nombre} (${target.cuit || '-'})` : destino || 'Sin destinatario'
    alert(`Enviando a: ${targetLabel}\nCanal: ${canal}\n\n${mensaje}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-4 rounded w-96 text-slate-800 dark:text-slate-200">
        <h3 className="font-semibold mb-2">Enviar recordatorio</h3>
        <div className="mb-2">
          <label className="text-xs">Destinatario (cliente)</label>
          <select value={destino} onChange={(e)=>setDestino(e.target.value)} className="block w-full border px-2 py-1 rounded bg-white dark:bg-slate-700 dark:text-slate-100">
            <option value="">-- Seleccionar cliente --</option>
            {(clientes || []).map((c:any)=> (
              <option key={c.id || c.nombre} value={c.razon_social || c.nombre}>{c.razon_social || c.nombre} {c.cuit ? `(${c.cuit})` : ''}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="text-xs">Canal</label>
          <select value={canal} onChange={(e)=>setCanal(e.target.value as any)} className="block w-full border px-2 py-1 rounded bg-white dark:bg-slate-700 dark:text-slate-100">
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="interna">Notificación interna</option>
          </select>
        </div>
        <div>
          <label className="text-xs">Mensaje</label>
          <textarea value={mensaje} onChange={(e)=>setMensaje(e.target.value)} className="block w-full border px-2 py-1 rounded bg-white dark:bg-slate-700 dark:text-slate-100" rows={5} placeholder="Hola {cliente}, te recordamos que..." />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancelar</button>
          <button onClick={send} className="btn-primary px-3 py-1">Enviar</button>
        </div>
      </div>
    </div>
  )
}
