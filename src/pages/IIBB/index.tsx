import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import iibbService, { IIBBEntry } from '../../services/iibbService'
import { SimpleTable } from '../../components/tables/SimpleTable'

export const IIBBPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card title="Módulo IIBB / SIRCREB">
        <div className="text-sm">Carga de archivos CSV/XML, detección automática del monto sujeto y exportación (placeholder)</div>
        <div className="mt-4">
          <Link to="/lector-facturas">
            <Button variant="default">Abrir Lector de Facturas</Button>
          </Link>
        </div>
      </Card>

      <Card title="Estado">
        <div className="text-sm mb-3">Entradas detectadas (mock) — se llenan al guardar desde el Lector de Facturas.</div>
        <IIBBList />
      </Card>
    </div>
  )
}

const IIBBList: React.FC = () => {
  const [items, setItems] = useState<IIBBEntry[]>([])
  useEffect(() => {
    setItems(iibbService.getEntries())
    const onFocus = () => setItems(iibbService.getEntries())
    window.addEventListener('storage', onFocus)
    return () => window.removeEventListener('storage', onFocus)
  }, [])

  if (!items.length) return <div className="text-sm text-slate-400">Sin registros</div>

  const columns = ['Fecha', 'Tipo', 'Emisor CUIT', 'Receptor CUIT', 'Total', 'Origen']
  const data = items.map((it) => [it.fecha, it.tipo, it.emisorCuit || '', it.receptorCuit || '', it.total?.toString() || '0', it.origen || ''])
  return <SimpleTable columns={columns} data={data} />
}
