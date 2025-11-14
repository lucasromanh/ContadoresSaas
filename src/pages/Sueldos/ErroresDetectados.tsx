import React from 'react'
import alertasService from '../../pages/Alertas/services/alertasService'

export default function ErroresDetectados({ recibos }:{ recibos?: any[] }){
  if (!recibos || recibos.length === 0) return <div>No hay recibos procesados</div>
  const issues = recibos.flatMap(r => (r.observaciones || []).map((o:string)=> ({ id: r.id, texto: o })))
  if (issues.length === 0) return <div>No se detectaron errores automáticos</div>
  return (
    <div className="p-2 border rounded bg-rose-50 dark:bg-rose-900">
      <h4 className="font-semibold">Errores detectados</h4>
      <ul className="list-disc ml-5 mt-2">
        {issues.map((i,idx)=> (
          <li key={idx} className="text-sm">{i.texto} — recibo {i.id} <button className="ml-2 text-xs text-blue-600" onClick={()=> alertasService.create({ titulo: 'Error en recibo', descripcion: i.texto, tipo: 'sueldo', criticidad: 'alta' })}>Crear alerta</button></li>
        ))}
      </ul>
    </div>
  )
}
