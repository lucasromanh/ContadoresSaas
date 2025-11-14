import React, { useState } from 'react'

export default function GeneradorAlertas({ onClose }: { onClose: ()=>void }){
  const [canal, setCanal] = useState<'whatsapp'|'email'|'interna'>('whatsapp')
  const [mensaje, setMensaje] = useState('')

  function send(){
    // simulate sending
    alert(`Enviando (${canal}):\n\n${mensaje}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-4 rounded w-96 text-slate-800 dark:text-slate-200">
        <h3 className="font-semibold mb-2">Enviar recordatorio</h3>
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
