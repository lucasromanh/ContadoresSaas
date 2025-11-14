// Mock servicio para Riesgo Fiscal
import { FacturaExtraida } from '../../../types/factura'

export type Criticidad = 'alta' | 'media' | 'baja'

export type AlertaFiscal = {
  id: string
  tipo: 'sin_documentacion' | 'deuda_afip' | 'multa_proyectada' | 'pasa_categoria' | 'percepcion_no_declarada' | 'factura_duplicada' | 'iva_inconsistente' | 'iibb_inconsistente'
  cuit: string
  cliente: string
  descripcion: string
  criticidad: Criticidad
  fecha: string
  relacionadaCon?: {
    facturas?: string[]
    iibb?: string[]
    iva?: string[]
    documentos?: string[]
  }
  estado: 'pendiente' | 'en_proceso' | 'resuelta'
}

let store: AlertaFiscal[] = []

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function seedIfEmpty() {
  if (store.length) return
  const now = new Date()
  store = [
    {
      id: generateId(),
      tipo: 'sin_documentacion',
      cuit: '20-12345678-9',
      cliente: 'MASCULLINO ANDRES JUAN',
      descripcion: 'Falta documentación soporte para gastos del período 09/2025',
      criticidad: 'media',
      fecha: '2025-11-01',
      relacionadaCon: { documentos: ['factura_00083.jpg'] },
      estado: 'pendiente'
    },
    {
      id: generateId(),
      tipo: 'factura_duplicada',
      cuit: '20-12345678-9',
      cliente: 'MASCULLINO ANDRES JUAN',
      descripcion: 'CAE duplicado detectado en dos comprobantes',
      criticidad: 'alta',
      fecha: '2025-11-10',
      relacionadaCon: { facturas: ['00000083', '00000123'] },
      estado: 'pendiente'
    },
    {
      id: generateId(),
      tipo: 'iva_inconsistente',
      cuit: '30-98765432-1',
      cliente: 'COMERCIAL SRL',
      descripcion: 'Inconsistencia en alícuota IVA aplicada vs. items detectados',
      criticidad: 'media',
      fecha: '2025-10-21',
      relacionadaCon: { iva: ['comp_2025_10_01'] },
      estado: 'en_proceso'
    }
  ]
}

export async function getAlertas(): Promise<AlertaFiscal[]> {
  seedIfEmpty()
  // simulate async
  return new Promise((res) => setTimeout(() => res([...store]), 150))
}

export async function getAlertasPorTipo(tipo: AlertaFiscal['tipo']): Promise<AlertaFiscal[]> {
  seedIfEmpty()
  return new Promise((res) => setTimeout(() => res(store.filter((s) => s.tipo === tipo)), 120))
}

export async function getAlertasCliente(cuit: string): Promise<AlertaFiscal[]> {
  seedIfEmpty()
  return new Promise((res) => setTimeout(() => res(store.filter((s) => s.cuit === cuit)), 120))
}

export async function resolverAlerta(id: string) {
  const idx = store.findIndex((s) => s.id === id)
  if (idx >= 0) store[idx].estado = 'resuelta'
  return new Promise((res) => setTimeout(() => res(true), 100))
}

export function addAlerta(a: Omit<AlertaFiscal, 'id'>) {
  const alerta: AlertaFiscal = { id: generateId(), ...a }
  store = [alerta, ...store]
  try{
    // mirror to global alertasService for UI visibility (dynamic import to avoid circular deps)
    import('../../Alertas/services/alertasService').then((m)=>{
      try{ m.default.create({ titulo: alerta.descripcion, descripcion: alerta.descripcion, tipo: 'riesgo_fiscal', fecha: alerta.fecha, estado: 'pendiente', criticidad: alerta.criticidad, cuit: alerta.cuit, cliente: alerta.cliente }) }catch(e){}
    })
  }catch(e){}
  return alerta
}

export function countsByCriticidad(list: AlertaFiscal[]) {
  return list.reduce((acc: any, cur) => {
    acc[cur.criticidad] = (acc[cur.criticidad] || 0) + 1
    return acc
  }, {})
}

export function countsByTipo(list: AlertaFiscal[]) {
  return list.reduce((acc: any, cur) => {
    acc[cur.criticidad] = (acc[cur.criticidad] || 0) + 1
    return acc
  }, {})
}

export function applyFilters(list: AlertaFiscal[], filters: any) {
  if (!filters || Object.keys(filters).length === 0) return list
  return list.filter((a) => {
    if (filters.mes) {
      const m = new Date(a.fecha).getMonth() + 1
      if (Number(filters.mes) !== m) return false
    }
    if (filters.year) {
      const y = new Date(a.fecha).getFullYear()
      if (Number(filters.year) !== y) return false
    }
    if (filters.tipo && filters.tipo !== '') if (a.tipo !== filters.tipo) return false
    if (filters.cuit && filters.cuit !== '') if (!a.cuit.includes(filters.cuit)) return false
    if (filters.criticidad && filters.criticidad !== '') if (a.criticidad !== filters.criticidad) return false
    return true
  })
}

export default { getAlertas, getAlertasPorTipo, getAlertasCliente, resolverAlerta, addAlerta, countsByCriticidad, countsByTipo, applyFilters }
