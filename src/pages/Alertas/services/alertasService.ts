import mockData from '../mocks/alertasMock'

export type AlertaTipo =
  | 'riesgo_fiscal' | 'vencimiento' | 'afip' | 'arca' | 'proveedor' | 'cliente' | 'factura' | 'documento' | 'iibb' | 'libros_iva' | 'sueldo' | 'ocr' | 'manual' | 'inteligente'

export type EstadoAlerta = 'pendiente' | 'resuelta' | 'leida' | 'urgente'
export type Criticidad = 'alta' | 'media' | 'baja'

export interface Alerta {
  id: string
  titulo: string
  descripcion: string
  tipo: AlertaTipo
  fecha: string // ISO
  estado: EstadoAlerta
  criticidad: Criticidad
  cuit?: string
  cliente?: string
  proveedor?: string
  relacionadoCon?: {
    facturaId?: string
    vencimientoId?: string
    documento?: string
  }
  historial?: Array<{ cuando: string; accion: string; nota?: string }>
}

const STORAGE = 'alertas_store_v1'

let store: Alerta[] = []

function persist(){
  try{ localStorage.setItem(STORAGE, JSON.stringify(store)) }catch(e){}
}

function nowISO(){ return new Date().toISOString() }

const alertasService = {
  loadMock: async () => {
    // load from storage, fallback to mock
    try{
      const raw = localStorage.getItem(STORAGE)
      if (raw){ store = JSON.parse(raw) as Alerta[]; return store }
    }catch(e){ }
    store = mockData()
    persist()
    return store
  },
  emitter: new EventTarget(),
  getCounts: () => ({ total: store.length, pendientes: store.filter(s=>s.estado==='pendiente').length, urgentes: store.filter(s=>s.estado==='urgente').length }),
  getAll: () => [...store],
  create: (a: Partial<Alerta>) => {
    const nueva: Alerta = {
      id: 'a_' + Math.random().toString(36).slice(2,9),
      titulo: a.titulo || 'Alerta',
      descripcion: a.descripcion || '',
      tipo: (a.tipo || 'manual') as AlertaTipo,
      fecha: a.fecha || nowISO(),
      estado: (a.estado || 'pendiente') as EstadoAlerta,
      criticidad: (a.criticidad || 'media') as Criticidad,
      cuit: a.cuit,
      cliente: a.cliente,
      proveedor: a.proveedor,
      relacionadoCon: a.relacionadoCon,
      historial: [{ cuando: nowISO(), accion: 'creada' }]
    }
    store = [nueva, ...store]
    persist()
    try{ alertasService.emitter.dispatchEvent(new CustomEvent('new-alert',{ detail: nueva })) }catch(e){}
    return nueva
  },
  markAs: (id: string, estado: EstadoAlerta, nota?: string) => {
    const it = store.find(s=>s.id===id)
    if (!it) return null
    it.estado = estado
    it.historial = it.historial || []
    it.historial.push({ cuando: nowISO(), accion: `estado:${estado}`, nota })
    persist()
    return it
  },
  markRead: (id:string) => {
    return alertasService.markAs(id, 'leida')
  },
  markAllRead: () => {
    store.forEach(s => { if (s.estado === 'pendiente') s.estado = 'leida' })
    persist()
    return { total: store.length, pendientes: store.filter(s=>s.estado==='pendiente').length }
  },
  remove: (id:string)=>{
    store = store.filter(s=>s.id!==id)
    persist()
  },
  findByCliente: (cuit?: string) => store.filter(s => s.cuit === cuit || s.cliente === cuit),
  // rules: run and generate automatic alerts
  runRules: () => {
    // example: if pendiente > 7 days -> urgente
    const now = new Date()
    store.forEach(a => {
      if (a.estado === 'pendiente'){
        const created = new Date(a.fecha)
        const diff = (now.getTime() - created.getTime()) / (1000*60*60*24)
        if (diff > 7){
          a.estado = 'urgente'
          a.historial = a.historial || []
          a.historial.push({ cuando: nowISO(), accion: 'auto:urgent' })
        }
      }
      // if related vencimiento exists and already past date => set criticidad alta
      if (a.relacionadoCon?.vencimientoId){
        // this is a simple heuristic; integration with vencimientosService is optional
        a.criticidad = 'alta'
      }
    })
    persist()
  }
}

export default alertasService
