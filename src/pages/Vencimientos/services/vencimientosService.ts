import mockData from '../mocks/vencimientosMock'
import riesgoService from '../../RiesgoFiscal/services/riesgoService'
import dashboardService from '../../../services/dashboardService'
import alertasService from '../../Alertas/services/alertasService'

const STORAGE_KEY = 'vencimientos_store_v1'

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
  // Try load from localStorage first (persistencia simple)
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw){
      store = JSON.parse(raw)
    } else {
      store = [...mockData]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }catch(e){
    store = [...mockData]
  }

  // Update dashboard upcoming list
  const upcoming = store.slice().sort((a,b)=> a.fecha.localeCompare(b.fecha)).slice(0,6)
  dashboardService.setProximos(upcoming)

  return store
}

export function getAll(){ return store }

export function getByMonthYear(month: number, year: number){
  return store.filter(s => { const d = new Date(s.fecha); return d.getMonth()+1===month && d.getFullYear()===year })
}

export function addVencimiento(v: Omit<Vencimiento,'id'>){
  const item: Vencimiento = { id: generateId(), ...v }
  store = [item, ...store]
  persist()
  // update dashboard
  dashboardService.addProximo(item)
  return item
}

export function markAs(id: string, estado: Vencimiento['estado']){
  const it = store.find(s=>s.id===id)
  if (it) it.estado = estado
  persist()
  // refresh dashboard list
  const upcoming = store.slice().sort((a,b)=> a.fecha.localeCompare(b.fecha)).slice(0,6)
  dashboardService.setProximos(upcoming)
}

export function checkAndAlertOverdue(){
  const now = new Date().toISOString().slice(0,10)
  store.forEach((s)=>{
    if (s.estado === 'pendiente' && s.fecha < now){
      s.estado = 'vencido'
      // create alert via riesgo service (it will mirror into alertasService)
      // ensure we don't duplicate alerts: check if any alerta already references this vencimiento
      const exists = alertasService.getAll().find(a => a.relacionadoCon?.vencimientoId === s.id && a.tipo === 'vencimiento')
      if (!exists) {
        riesgoService.addAlerta({ tipo: 'sin_documentacion', cuit: s.cuit || '', cliente: s.cliente || '', descripcion: `Vencimiento ${s.descripcion} vencido el ${s.fecha}`, criticidad: 'alta', fecha: new Date().toISOString().slice(0,10), estado: 'pendiente' })
      }
    }
  })
  // preventive alerts: if pendiente and within 3 days, create a preventive alerta
  const today = new Date().toISOString().slice(0,10)
  store.forEach(s=>{
    if (s.estado === 'pendiente'){
      const d = new Date(s.fecha)
      const nowDate = new Date(today)
      const diffDays = Math.ceil((d.getTime() - nowDate.getTime())/(1000*60*60*24))
      if (diffDays>0 && diffDays<=3){
        const exists = alertasService.getAll().find(a => a.relacionadoCon?.vencimientoId === s.id && a.tipo === 'vencimiento' && a.descripcion.includes('Quedan'))
        if (!exists) {
          alertasService.create({ titulo: `Vencimiento próximo: ${s.descripcion}`, descripcion: `Quedan ${diffDays} día(s) para el vencimiento ${s.descripcion} de ${s.cliente || s.cuit}`, tipo: 'vencimiento', fecha: new Date().toISOString(), estado: 'pendiente', criticidad: diffDays===1? 'alta':'media', cuit: s.cuit, cliente: s.cliente, relacionadoCon: { vencimientoId: s.id } })
        }
      }
    }
  })
  persist()
  // update dashboard
  const upcoming = store.slice().sort((a,b)=> a.fecha.localeCompare(b.fecha)).slice(0,6)
  dashboardService.setProximos(upcoming)
}

function persist(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(store)) }catch(e){ /* ignore storage errors */ }
}

export default { loadMock, getAll, getByMonthYear, addVencimiento, markAs, checkAndAlertOverdue }
