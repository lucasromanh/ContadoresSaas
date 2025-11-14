import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import SmartTable from '../../components/ui/SmartTable'
import { useClientes } from '../../hooks/useClientes'
import documentosService from '../../services/documentosService'
import { useLocation } from 'react-router-dom'

export const DocumentosPage: React.FC = () => {
  const { data: clientes } = useClientes()
  const [files, setFiles] = useState<FileList | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<string>('')
  const [documentos, setDocumentos] = useState<any[]>([])
  const location = useLocation()
  const [filterClient, setFilterClient] = useState<{ id?: string; cuit?: string; name?: string } | null>(null)
  

  useEffect(()=>{
    const load = async () => {
      const list = await documentosService.listDocuments()
      // apply filter if we have one
      if (filterClient) {
        const filtered = list.filter((d:any) => {
          const mc = d.meta?.cliente || {}
          if (filterClient.id && mc.id) return mc.id === filterClient.id
          if (filterClient.cuit && mc.cuit) return mc.cuit === filterClient.cuit
          if (filterClient.name) return (mc.nombre || '') === filterClient.name
          return false
        })
        setDocumentos(filtered)
      } else {
        setDocumentos(list)
      }
    }
    load().catch(()=> setDocumentos([]))
  },[filterClient])

  // read query params for pre-filtering (client folder links)
  useEffect(()=>{
    const params = new URLSearchParams(location.search)
    const clientId = params.get('clientId')
    const clientCuit = params.get('clientCuit')
    const clientName = params.get('clientName')
    if (clientId || clientCuit || clientName) {
      setFilterClient({ id: clientId || undefined, cuit: clientCuit || undefined, name: clientName || undefined })
      // try to pre-select client name in the upload select
      if (clientId) {
        const found = (clientes || []).find((c:any)=>c.id === clientId)
        if (found) setSelectedCliente(found.razon_social || found.nombre)
      } else if (clientName) {
        setSelectedCliente(clientName)
      }
    }
  }, [location.search, clientes])

  // view / edit / delete handlers
  const handleView = async (id: string) => {
    const doc = (documentos || []).find(d=>d.id===id)
    if (!doc) return alert('Documento no encontrado')
    setViewDoc(doc)
    setShowView(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar documento?')) return
    await documentosService.removeDocument(id)
    const list = await documentosService.listDocuments()
    setDocumentos(list)
  }

  const handleEdit = async (id: string) => {
    const doc = (documentos || []).find(d=>d.id===id)
    if (!doc) return alert('Documento no encontrado')
    setEditDoc(doc)
    setShowEdit(true)
  }

  const saveEdit = async (payload: any) => {
    if (!editDoc) return
    await documentosService.updateDocument(editDoc.id, payload)
    const list = await documentosService.listDocuments()
    setDocumentos(list)
    setShowEdit(false)
    setEditDoc(null)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    setFiles(f)
    if (!f || f.length === 0) return
    // Save each file to documentosService and associate with selected client if provided
    for (let i = 0; i < f.length; i++) {
      const file = f[i]
      const meta: any = { origen: 'upload' }
      if (selectedCliente) {
        const clienteObj = (clientes || []).find((c:any)=> (c.razon_social || c.nombre) === selectedCliente)
        meta.cliente = clienteObj ? { id: clienteObj.id, nombre: clienteObj.razon_social || clienteObj.nombre, cuit: clienteObj.cuit } : { nombre: selectedCliente }
      }
      try {
        await documentosService.saveDocument(file, meta)
      } catch (err) {
        console.warn('Error guardando documento', err)
      }
    }
  // reload list
  setDocumentos(await documentosService.listDocuments());
  // clear input
  (e.target as HTMLInputElement).value = ''
  }

  // local modal states
  const [showView, setShowView] = useState(false)
  const [viewDoc, setViewDoc] = useState<any|null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editDoc, setEditDoc] = useState<any|null>(null)

  // close view modal on Escape
  useEffect(()=>{
    if (!showView) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setShowView(false); setViewDoc(null) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showView])

  return (
    <div className="space-y-4">
      <Card title="Documentos por cliente">
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <select className="border rounded px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700" value={selectedCliente} onChange={(e)=>setSelectedCliente(e.target.value)}>
              <option value="">-- Sin cliente (opcional) --</option>
              {(clientes || []).map((c:any)=>(<option key={c.id} value={c.razon_social || c.nombre}>{c.razon_social || c.nombre} {c.cuit?`(${c.cuit})`:''}</option>))}
            </select>
            <input type="file" multiple onChange={handleUpload} />
          </div>
          <div className="text-sm text-slate-500">Sube PDF, XML o CSV y asocia al cliente (opcional).</div>
        </div>
      </Card>

      <Card title="Lista de documentos">
        <SmartTable columns={[{ key: 'id', label: 'ID' }, { key: 'cliente', label: 'Cliente' }, { key: 'name', label: 'Archivo' }, { key: 'createdAt', label: 'Fecha' }]} data={documentos.map(d=>({ id: d.id, cliente: d.meta?.cliente?.nombre || '-', name: d.name, createdAt: d.createdAt }))} onAction={(action,row)=>{ const id = (row as any).id as string; if (action==='view') handleView(id); if (action==='edit') handleEdit(id); if (action==='delete') handleDelete(id); }} />
      </Card>

      {/* View modal */}
      {showView && viewDoc && (
        <div onClick={(e)=>{ if (e.target === e.currentTarget) { setShowView(false); setViewDoc(null) } }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-4 rounded w-11/12 max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-2 sticky top-0 bg-white/0">
              <div className="font-semibold">{viewDoc.name}</div>
              <button onClick={()=>{ setShowView(false); setViewDoc(null) }} className="text-sm border px-2 py-1 rounded">Cerrar</button>
            </div>
            <div>
              {viewDoc.content && viewDoc.content.startsWith('data:image') ? (
                <img src={viewDoc.content} alt={viewDoc.name} className="mx-auto object-contain max-h-[80vh] w-auto" />
              ) : viewDoc.content && viewDoc.content.startsWith('data:application/pdf') ? (
                <iframe src={viewDoc.content} className="w-full h-[75vh]" />
              ) : (
                <div>
                  <a className="text-blue-600" href={viewDoc.content || '#'} target="_blank" rel="noreferrer">Descargar / Abrir archivo</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && editDoc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-4 rounded w-96">
            <h3 className="font-semibold mb-2">Editar documento</h3>
            <div className="mb-2">
              <label className="text-xs">Nombre</label>
              <input className="block w-full border px-2 py-1 rounded bg-slate-100 dark:bg-slate-700" defaultValue={editDoc.name} id="edit-name" />
            </div>
            <div className="mb-2">
              <label className="text-xs">Cliente</label>
              <select id="edit-cliente" className="block w-full border px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">
                <option value="">-- Ninguno --</option>
                {(clientes || []).map((c:any)=>(<option key={c.id} value={c.razon_social || c.nombre} selected={(editDoc.meta?.cliente?.nombre || '') === (c.razon_social || c.nombre)}>{c.razon_social || c.nombre}</option>))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>{ setShowEdit(false); setEditDoc(null) }} className="px-3 py-1 border rounded">Cancelar</button>
              <button onClick={async ()=>{ const newName = (document.getElementById('edit-name') as HTMLInputElement).value; const newCliente = (document.getElementById('edit-cliente') as HTMLSelectElement).value; const meta: any = editDoc.meta || {}; if (newCliente) meta.cliente = { nombre: newCliente }; else delete meta.cliente; await saveEdit({ name: newName, meta }); }} className="btn-primary px-3 py-1">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentosPage
