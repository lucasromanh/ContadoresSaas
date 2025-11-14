import mockData from '../mocks/vencimientosMock'
import riesgoService from '../../RiesgoFiscal/services/riesgoService'

export type VencimientoTipo =
  | 'ARCA' | 'RENTAS' | 'MUNICIPAL' | 'SUSS' | 'SICORE' | 'AUTONOMOS' | 'MONOTRIBUTO' | 'IIBB_LOCAL' | 'PERCEPCIONES' | 'RETENCIONES' | 'ESPECIAL' | 'PERSONALIZADO'

export type Vencimiento = {
  id: string
  cliente?: string
  cuit?: string
  tipo: VencimientoTipo
  descripcion: string
  fecha: string
  organismo: string
  provincia?: string
  estado: 'pendiente' | 'presentado' | 'pagado' | 'vencido'
  criticidad: 'alta' | 'media' | 'baja'
  relacionadoCon?: { comprobantes?: string[]; percepciones?: string[]; clienteId?: string }
}

let store: Vencimiento[] = []

function generateId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8) }

export async function loadMock(){
  store = [...mockData]
  return store
}

export function getAll(){ return store }

export function getByMonthYear(month: number, year: number){
  return store.filter(s => { const d = new Date(s.fecha); return d.getMonth()+1===month && d.getFullYear()===year })
}

export function addVencimiento(v: Omit<Vencimiento,'id'>){
  const item: Vencimiento = { id: generateId(), ...v }
  store = [item, ...store]
  return item
}

export function markAs(id: string, estado: Vencimiento['estado']){
  const it = store.find(s=>s.id===id)
  if (it) it.estado = estado
}

export function checkAndAlertOverdue(){
  const now = new Date().toISOString().slice(0,10)
  store.forEach((s)=>{
    if (s.estado === 'pendiente' && s.fecha < now){
      s.estado = 'vencido'
      // create alert in riesgo service
      riesgoService.addAlerta({ tipo: 'sin_documentacion', cuit: s.cuit || '', cliente: s.cliente || '', descripcion: `Vencimiento ${s.descripcion} vencido el ${s.fecha}`, criticidad: 'alta', fecha: new Date().toISOString().slice(0,10), estado: 'pendiente' })
    }
  })
}

export default { loadMock, getAll, getByMonthYear, addVencimiento, markAs, checkAndAlertOverdue }
