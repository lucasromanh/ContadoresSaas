import React from 'react'
import TarjetaAlerta from './TarjetaAlerta'
import { Alerta } from './services/alertasService'

export default function ListadoAlertas({ items, onView, onMark, onSend }:{ items: Alerta[]; onView?: (a:Alerta)=>void; onMark?: (id:string, estado:any)=>void; onSend?: (cliente?:string)=>void }){
  return (
    <div className="space-y-3">
      {items.map(a=> (
        <TarjetaAlerta key={a.id} alerta={a} onView={onView} onMark={onMark} onSend={onSend} />
      ))}
    </div>
  )
}
