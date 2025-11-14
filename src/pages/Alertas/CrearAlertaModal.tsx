import React, { useState } from 'react'
import { Alerta } from './services/alertasService'

export default function CrearAlertaModal({ open, onClose, onCreate }:{ open: boolean; onClose: ()=>void; onCreate: (a: Partial<Alerta>)=>void }){
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState<Alerta['tipo']>('manual')
  const [criticidad, setCriticidad] = useState<Alerta['criticidad']>('media')
  const [cliente, setCliente] = useState('')

  if (!open) return null

  function crear(){
    onCreate({ titulo, descripcion, tipo, criticidad, cliente, fecha: new Date().toISOString() })
    onClose()
    setTitulo(''); setDescripcion(''); setCliente('')
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-[90%] max-w-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-slate-900 dark:text-slate-100">
        <h3 className="font-semibold mb-2">Crear alerta manual</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs">Título</label>
            <input className="block w-full border px-2 py-1 rounded bg-white dark:bg-slate-700" value={titulo} onChange={(e)=>setTitulo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs">Descripción</label>
            <textarea className="block w-full border px-2 py-1 rounded bg-white dark:bg-slate-700" value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div>
              <label className="text-xs">Tipo</label>
              <select value={tipo} onChange={(e)=>setTipo(e.target.value as any)} className="block border px-2 py-1 rounded bg-white dark:bg-slate-700">
                <option value="manual">Manual</option>
                <option value="vencimiento">Vencimiento</option>
                <option value="factura">Factura</option>
                <option value="proveedor">Proveedor</option>
              </select>
            </div>
            <div>
              <label className="text-xs">Criticidad</label>
              <select value={criticidad} onChange={(e)=>setCriticidad(e.target.value as any)} className="block border px-2 py-1 rounded bg-white dark:bg-slate-700">
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="text-xs">Cliente / CUIT</label>
              <input className="block border px-2 py-1 rounded bg-white dark:bg-slate-700" value={cliente} onChange={(e)=>setCliente(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancelar</button>
          <button onClick={crear} className="btn-primary px-3 py-1">Crear</button>
        </div>
      </div>
    </div>
  )
}
