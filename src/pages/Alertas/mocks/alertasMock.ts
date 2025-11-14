import { Alerta } from '../services/alertasService'

export default function alertasMock(): Alerta[] {
  const now = new Date()
  const iso = (d: Date) => d.toISOString()
  const plus = (days:number) => { const d = new Date(); d.setDate(d.getDate()+days); return d }

  return [
    {
      id: 'a_1', titulo: 'ARCA - Deuda detectada', descripcion: 'Deuda registrada en ARCA para MASCULINO ANDRES JUAN', tipo: 'arca', fecha: iso(plus(-10)), estado: 'pendiente', criticidad: 'alta', cliente: 'MASCULINO ANDRES JUAN', cuit: '20-12345678-9', relacionadoCon: { vencimientoId: 'v_101' }, historial: []
    },
    {
      id: 'a_2', titulo: 'Monotributo vence mañana', descripcion: 'Vencimiento de Monotributo para FARMACIA ABC', tipo: 'vencimiento', fecha: iso(plus(1)), estado: 'pendiente', criticidad: 'media', cliente: 'FARMACIA ABC', cuit: '27-55544433-2', relacionadoCon: { vencimientoId: 'v_202' }, historial: []
    },
    {
      id: 'a_3', titulo: 'Factura A con CUIT inválido', descripcion: 'Factura detectada con CUIT que no coincide', tipo: 'factura', fecha: iso(plus(-3)), estado: 'pendiente', criticidad: 'alta', proveedor: 'PROVEEDOR X', historial: []
    },
    {
      id: 'a_4', titulo: 'Documento faltante - Proveedor Y', descripcion: 'Falta presentación de documentación solicitada', tipo: 'documento', fecha: iso(plus(-1)), estado: 'pendiente', criticidad: 'media', proveedor: 'PROVEEDOR Y', historial: []
    },
    {
      id: 'a_5', titulo: 'IIBB - Percepción fuera de rango', descripcion: 'Percepción IIBB aplicada en comprobante fuera de rango esperado', tipo: 'iibb', fecha: iso(plus(-4)), estado: 'pendiente', criticidad: 'media', historial: []
    },
    {
      id: 'a_6', titulo: 'Libro IVA - duplicados detectados', descripcion: 'Posible duplicado en Libros IVA', tipo: 'libros_iva', fecha: iso(plus(-2)), estado: 'pendiente', criticidad: 'media', cliente: 'COMERCIAL SRL', historial: []
    },
    {
      id: 'a_7', titulo: 'Alerta manual: Revisar sueldos', descripcion: 'Recordatorio interno: verificar cargas sociales', tipo: 'manual', fecha: iso(plus(0)), estado: 'pendiente', criticidad: 'baja', historial: []
    }
  ]
}
