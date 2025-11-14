import React, { useState } from 'react'
import UploadBox from './UploadBox'
import FilePreview from './FilePreview'
import ExtractionResult from './ExtractionResult'
import EditFacturaDialog from './EditFacturaDialog'
import Historial from './Historial'
import lectorService from '../../services/lectorService'
import { FacturaExtraida } from '../../types/factura'
import { toastSuccess, toastError } from '../../components/ui/Toaster'
import toast from 'react-hot-toast'

export const LectorFacturasPage: React.FC = () => {
  const [file, setFile] = useState<File | undefined>(undefined)
  const [factura, setFactura] = useState<FacturaExtraida | null>(null)
  const [editing, setEditing] = useState(false)
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number>(0)

  const handleFile = async (f: File) => {
    setFile(f)
    setLoading(true)
    setProgress(0)
    const toastId = toast.loading('Extrayendo comprobante...')
    try {
      const res = await lectorService.extractFromFile(f, (p) => setProgress(p))
      setFactura(res)
      setHistorial((h) => [{ at: new Date().toISOString(), file: f.name, data: res }, ...h])
      toast.dismiss(toastId)
      toastSuccess('Extracción completada')
    } catch (e) {
      toast.dismiss()
      console.error(e)
      toastError('Error extrayendo el comprobante')
    } finally { setLoading(false) }
  }

  const handleEditSave = async (f: FacturaExtraida) => {
    setFactura(f)
    setEditing(false)
  }

  const handleSaveSystem = async () => {
    if (!factura) return
    try {
      await lectorService.saveExtractedFactura(factura, file)
      setHistorial((h) => [{ at: new Date().toISOString(), saved: true, data: factura }, ...h])
      toastSuccess('Factura guardada en el sistema (mock)')
    } catch (e) {
      toastError('No se pudo guardar la factura')
    }
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
          {loading ? (
            <div>
              <div className="mb-2">Extrayendo... {Math.round(progress * 100)}%</div>
              <div className="w-full bg-slate-700 h-2 rounded overflow-hidden">
                <div className="h-2 bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </div>
          ) : (
            <ExtractionResult factura={factura} onEdit={() => setEditing(true)} onSave={handleSaveSystem} />
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold">Historial</h3>
        <Historial items={historial} />
      </div>

      <EditFacturaDialog open={editing} factura={factura} onClose={() => setEditing(false)} onSave={handleEditSave} />
    </div>
  )
}

export default LectorFacturasPage
