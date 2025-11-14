import React, { useState } from 'react'
import UploadBox from './UploadBox'
import FilePreview from './FilePreview'
import ExtractionResult from './ExtractionResult'
import EditFacturaDialog from './EditFacturaDialog'
import Historial from './Historial'
import lectorService from '../../services/lectorService'
import { FacturaExtraida } from '../../types/factura'

export const LectorFacturasPage: React.FC = () => {
  const [file, setFile] = useState<File | undefined>(undefined)
  const [factura, setFactura] = useState<FacturaExtraida | null>(null)
  const [editing, setEditing] = useState(false)
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleFile = async (f: File) => {
    setFile(f)
    setLoading(true)
    try {
      const res = await lectorService.extractFromFile(f)
      setFactura(res)
      setHistorial((h) => [{ at: new Date().toISOString(), file: f.name, data: res }, ...h])
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  const handleEditSave = async (f: FacturaExtraida) => {
    setFactura(f)
    setEditing(false)
  }

  const handleSaveSystem = async () => {
    if (!factura) return
    await lectorService.saveExtractedFactura(factura, file)
    // feedback minimal
    setHistorial((h) => [{ at: new Date().toISOString(), saved: true, data: factura }, ...h])
    alert('Factura guardada (mock)')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Lector Inteligente de Facturas AFIP / ARCA</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <UploadBox onFile={handleFile} />
          <div className="mt-3"><FilePreview file={file} /></div>
        </div>
        <div className="md:col-span-2">
          {loading ? <div>Cargando extracción...</div> : <ExtractionResult factura={factura} onEdit={() => setEditing(true)} onSave={handleSaveSystem} />}
        </div>
      </div>

      <div>
        <h3 className="font-semibold">Historial</h3>
        <Historial items={historial.map(h=> JSON.stringify(h).slice(0,200))} />
      </div>

      <EditFacturaDialog open={editing} factura={factura} onClose={() => setEditing(false)} onSave={handleEditSave} />
    </div>
  )
}

export default LectorFacturasPage
