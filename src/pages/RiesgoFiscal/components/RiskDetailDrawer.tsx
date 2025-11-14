import React, { useEffect, useState } from 'react'
import Sheet from '../../../components/ui/Sheet'
import { AlertaFiscal } from '../services/riesgoService'
import { Button } from '../../../components/ui/Button'
import iibbService from '../../../services/iibbService'
import documentosService from '../../../services/documentosService'
import { Link, useNavigate } from 'react-router-dom'

export const RiskDetailDrawer: React.FC<{ alerta: AlertaFiscal | null; onClose: () => void; onResolve?: (id: string) => Promise<void> }> = ({ alerta, onClose, onResolve }) => {
  const [iibb, setIibb] = useState<any[]>([])
  const [docs, setDocs] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!alerta) return
    const all = iibbService.getEntries()
    const related = all.filter((e) => (e.emisorCuit && e.emisorCuit === alerta.cuit) || (e.receptorCuit && e.receptorCuit === alerta.cuit))
    setIibb(related)

    documentosService.listDocuments().then((list: any[]) => {
      const matched = list.filter((d) => (d.meta?.emisor?.cuit === alerta.cuit) || (d.meta?.receptor?.cuit === alerta.cuit) || (d.meta?.cliente?.cuit === alerta.cuit))
      setDocs(matched)
    }).catch(() => setDocs([]))
  }, [alerta])

  if (!alerta) return null
  return (
    <Sheet open={!!alerta} onOpenChange={(v) => !v && onClose()} title={`Alerta: ${alerta.tipo}`} description={alerta.descripcion}>
      <div className="space-y-3">
        <div>
          <div className="text-sm text-slate-500">Cliente</div>
          <div className="font-semibold">{alerta.cliente} — {alerta.cuit}</div>
        </div>

        <div>
          <div className="text-sm text-slate-500">Motivo</div>
          <div>{alerta.descripcion}</div>
        </div>

        <div>
          <div className="text-sm text-slate-500">Facturas / Documentos relacionados</div>
          <div className="text-sm mt-1 space-y-1">
            {alerta.relacionadaCon?.facturas && <div><strong>Facturas:</strong> {alerta.relacionadaCon.facturas.join(', ')}</div>}
            {docs.length > 0 && (
              <div>
                <strong>Documentos guardados:</strong>
                <ul className="list-disc list-inside">
                  {docs.map((d) => (
                    <li key={d.id}><a href="#" onClick={(e)=>{ e.preventDefault(); try { navigate(`/documentos?clientCuit=${encodeURIComponent(alerta.cuit)}&clientName=${encodeURIComponent(alerta.cliente)}`) } catch (err) { window.open('/documentos', '_blank') } }} className="text-primary">{d.name}</a> • {new Date(d.createdAt).toLocaleString()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-500">IIBB relacionados</div>
          <div className="text-sm mt-1">
            {iibb.length === 0 && <div className="text-slate-400">No se encontraron registros IIBB para este CUIT</div>}
            {iibb.length > 0 && (
              <ul className="list-disc list-inside">
                {iibb.map((it) => (
                  <li key={it.id}>{it.fecha} — {it.total} — {it.origen}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DetailActions alerta={alerta} onResolve={onResolve} onClose={onClose} />
      </div>
    </Sheet>
  )
}

const DetailActions: React.FC<{ alerta: AlertaFiscal; onResolve?: (id: string) => Promise<void>; onClose: () => void }> = ({ alerta, onResolve, onClose }) => {
  const navigate = useNavigate()

  const openDocumentFolder = () => {
    // navigate in-app so we keep in-memory auth state
    try {
      navigate(`/documentos?clientCuit=${encodeURIComponent(alerta.cuit)}&clientName=${encodeURIComponent(alerta.cliente)}`)
    } catch (e) {
      // fallback to full open
      window.open('/documentos', '_blank')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="default" onClick={() => onResolve && onResolve(alerta.id)}>Marcar como resuelta</Button>
      <Button variant="ghost" onClick={() => { window.open(`https://wa.me/549${alerta.cuit.replace(/[^0-9]/g, '')}`, '_blank') }}>Contactar (WhatsApp)</Button>
      <Button variant="outline" onClick={openDocumentFolder}>Abrir carpeta documental</Button>
    </div>
  )
}

export default RiskDetailDrawer
