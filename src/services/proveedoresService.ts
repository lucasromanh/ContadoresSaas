type Proveedor = {
  id: string
  razon_social: string
  cuit?: string
  percepciones_iva?: string[]
  percepciones_iibb?: string[]
  retenciones?: string[]
  comprobantes?: Array<{ id: string; nombre: string }>
  notas?: string
}

let DB: Proveedor[] = [
  { id: 'p1', razon_social: 'Proveedor Demo S.R.L.', cuit: '30-87654321-0', percepciones_iva: ['IVA 5%'], percepciones_iibb: ['IIBB 3%'], retenciones: ['Ret 1%'], comprobantes: [] }
]

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

export const proveedoresService = {
  list: async () => {
    await delay()
    return DB
  },
  get: async (id: string) => {
    await delay()
    return DB.find((p) => p.id === id) || null
  },
  create: async (payload: Partial<Proveedor>) => {
    await delay()
    const id = String(Date.now())
    const nuevo: Proveedor = { id, razon_social: payload.razon_social || 'Sin nombre', cuit: payload.cuit, percepciones_iva: payload.percepciones_iva || [], percepciones_iibb: payload.percepciones_iibb || [], retenciones: payload.retenciones || [], comprobantes: payload.comprobantes || [], notas: payload.notas }
    DB = [nuevo, ...DB]
    return nuevo
  },
  update: async (id: string, payload: Partial<Proveedor>) => {
    await delay()
    DB = DB.map((p) => (p.id === id ? { ...p, ...payload } : p))
    return DB.find((p) => p.id === id) || null
  },
  remove: async (id: string) => {
    await delay()
    DB = DB.filter((p) => p.id !== id)
    return true
  }
}

export default proveedoresService
