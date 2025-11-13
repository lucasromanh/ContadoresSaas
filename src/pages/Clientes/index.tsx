import React from 'react'
import { Card } from '../../components/ui/Card'
import { useClientes } from '../../hooks/useClientes'

export const ClientesPage: React.FC = () => {
  const { data, isLoading, error } = useClientes()

  if (isLoading) return <div>Cargando clientes...</div>
  if (error) return <div>Error cargando clientes</div>

  const cliente = (data && data[0]) || { deudas: '$ 15.000', ultimosPagos: '10/2025 — $ 5.000', mensajes: '2 mensajes' }

  return (
    <div className="space-y-4">
      <Card title={`Cuentas claras - ${cliente?.nombre ?? 'Cliente X'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-slate-500">Deudas</div>
            <div className="font-semibold">{cliente.deudas ?? '$ 15.000'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Últimos pagos</div>
            <div className="font-semibold">{cliente.ultimosPagos ?? '10/2025 — $ 5.000'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Mensajes</div>
            <div className="font-semibold">{cliente.mensajes ?? '2 mensajes recientes'}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
