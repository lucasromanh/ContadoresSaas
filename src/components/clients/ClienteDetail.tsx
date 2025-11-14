import React, { useEffect, useState } from 'react'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import clientesService from '../../services/clientesService'

export const ClienteDetail: React.FC<{ id: string; open: boolean; onOpenChange: (v: boolean) => void }> = ({ id, open, onOpenChange }) => {
  const [cliente, setCliente] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')

  const fetch = async () => {
    setLoading(true)
    const c = await clientesService.get(id)
    setCliente(c)
    setLoading(false)
  }

  useEffect(() => {
    if (open) fetch()
  }, [open])

  const handleUpload = async () => {
    if (!file) return
    await clientesService.uploadFile(id, file)
    setFile(null)
    fetch()
  }

  const handleAddNote = async () => {
    if (!note) return
    await clientesService.addNote(id, note)
    setNote('')
    fetch()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={cliente ? cliente.razon_social : 'Detalle cliente'}>
      {loading && <div>Cargando...</div>}
      {!loading && cliente && (
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-500">CUIT</div>
            <div className="font-medium">{cliente.cuit}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Estado</div>
            <div className="font-medium">{cliente.estado}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Archivos</div>
            <ul className="space-y-1">
              {(cliente.archivos || []).map((a: any) => (
                <li key={a.id} className="text-sm">
                  {a.nombre}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            <div className="flex gap-2 mt-2">
              <Button onClick={handleUpload}>Subir</Button>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Agregar nota interna</div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded p-2 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700" />
            <div className="mt-2">
              <Button onClick={handleAddNote}>Agregar nota</Button>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Historial</div>
            <ul className="space-y-1 text-sm">
              {(cliente.historial || []).map((h: any, i: number) => (
                <li key={i}>[{new Date(h.fecha).toLocaleString()}] {h.cambio}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Sheet>
  )
}

export default ClienteDetail
