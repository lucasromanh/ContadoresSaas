import React from 'react'
import { FacturaExtraida } from '../../types/factura'
import { Button } from '../../components/ui/Button'

export const ExtractionResult: React.FC<{ factura: FacturaExtraida | null; onEdit: () => void; onSave: () => void }> = ({ factura, onEdit, onSave }) => {
  if (!factura) return <div className="text-sm text-slate-500">Sin datos extraídos</div>
  return (
    <div className="space-y-3 p-3 border rounded bg-white dark:bg-slate-800">
      <div className="text-lg font-semibold">{factura.emisor?.razonSocial}</div>
      <div className="text-sm">CUIT: {factura.emisor?.cuit}</div>
      <div className="text-sm">Tipo: {factura.tipo}</div>
      <div className="text-sm">PtoVenta: {factura.comprobante?.puntoVenta} - Nº: {factura.comprobante?.numero}</div>
      <div className="text-sm">Fecha: {factura.comprobante?.fechaEmision}</div>
      <div className="text-sm">Total: {factura.totales?.total ?? '-'}</div>

      <div className="flex gap-2">
        <Button onClick={onEdit}>Editar</Button>
        <Button onClick={onSave}>Guardar en el sistema</Button>
      </div>
    </div>
  )
}

export default ExtractionResult
