type Sueldo = {
  id: string
  empleado: string
  cuil?: string
  categoria?: string
  bruto?: number
  neto?: number
  cargas_sociales?: number
  recibos_pdf?: Array<{ id: string; nombre: string }>
  fecha?: string
}

let DB: Sueldo[] = [
  { id: 's1', empleado: 'Juan Pérez', cuil: '20-12345678-1', categoria: 'A', bruto: 150000, neto: 120000, cargas_sociales: 30000, recibos_pdf: [], fecha: '2025-11-01' }
]

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

export const sueldosService = {
  list: async () => { await delay(); return DB },
  get: async (id: string) => { await delay(); return DB.find((s) => s.id === id) || null },
  create: async (payload: Partial<Sueldo>) => {
    await delay()
    const id = String(Date.now())
    const bruto = payload.bruto || 0
    const cargas = Math.round(bruto * 0.2)
    const neto = bruto - cargas
    const nuevo: Sueldo = { id, empleado: payload.empleado || 'Empleado', cuil: payload.cuil, categoria: payload.categoria, bruto, cargas_sociales: cargas, neto, recibos_pdf: [], fecha: payload.fecha || new Date().toISOString() }
    DB = [nuevo, ...DB]
    return nuevo
  },
  update: async (id: string, payload: Partial<Sueldo>) => {
    await delay()
    DB = DB.map((s) => {
      if (s.id !== id) return s
      const bruto = payload.bruto ?? s.bruto
      const cargas = Math.round((bruto || 0) * 0.2)
      const neto = (bruto || 0) - cargas
      return { ...s, ...payload, bruto, cargas_sociales: cargas, neto }
    })
    return DB.find((s) => s.id === id) || null
  },
  remove: async (id: string) => { await delay(); DB = DB.filter((s) => s.id !== id); return true },
  uploadReceipt: async (id: string, file: File) => {
    await delay()
    const s = DB.find((x) => x.id === id)
    if (!s) throw new Error('Sueldo no encontrado')
    const meta = { id: String(Date.now()), nombre: file.name }
    s.recibos_pdf = [...(s.recibos_pdf || []), meta]
    return meta
  }
}

export default sueldosService
