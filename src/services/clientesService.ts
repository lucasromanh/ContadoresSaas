type Cliente = {
  id: string
  razon_social: string
  cuit?: string
  email?: string
  telefono?: string
  actividad?: string
  categoria?: string
  estado?: 'activo' | 'inactivo' | 'suspendido'
  ultimo_pago?: string
  deuda_actual?: string
  notas?: string
  fecha_alta?: string
  archivos?: Array<{ id: string; nombre: string; url?: string }>
  historial?: Array<{ fecha: string; cambio: string }>
}

let DB: Cliente[] = [
  {
    id: '1',
    razon_social: 'Cliente Demo S.A.',
    cuit: '30-12345678-9',
    email: 'demo@cliente.com',
    telefono: '+54 9 11 1234 5678',
    actividad: 'Comercio',
    categoria: 'A',
    estado: 'activo',
    ultimo_pago: '2025-10-15',
    deuda_actual: '$ 0',
    notas: 'Cliente de prueba',
    fecha_alta: '2020-01-01',
    archivos: [],
    historial: [{ fecha: new Date().toISOString(), cambio: 'Cuenta creada' }]
  }
]

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

export const clientesService = {
  list: async () => {
    await delay()
    return DB
  },
  get: async (id: string) => {
    await delay()
    return DB.find((c) => c.id === id) || null
  },
  create: async (payload: Partial<Cliente>) => {
    await delay()
    const id = String(Date.now())
    const nuevo: Cliente = {
      id,
      razon_social: payload.razon_social || 'Sin nombre',
      cuit: payload.cuit,
      email: payload.email,
      telefono: payload.telefono,
      actividad: payload.actividad,
      categoria: payload.categoria,
      estado: (payload.estado as any) || 'activo',
      ultimo_pago: payload.ultimo_pago,
      deuda_actual: payload.deuda_actual,
      notas: payload.notas,
      fecha_alta: new Date().toISOString(),
      archivos: payload.archivos || [],
      historial: [{ fecha: new Date().toISOString(), cambio: 'Cuenta creada' }]
    }
    DB = [nuevo, ...DB]
    return nuevo
  },
  update: async (id: string, payload: Partial<Cliente>) => {
    await delay()
    DB = DB.map((c) => {
      if (c.id !== id) return c
      const updated = { ...c, ...payload }
      updated.historial = [...(c.historial || []), { fecha: new Date().toISOString(), cambio: 'Registro actualizado' }]
      return updated
    })
    return DB.find((c) => c.id === id) || null
  },
  remove: async (id: string) => {
    await delay()
    DB = DB.filter((c) => c.id !== id)
    return true
  },
  uploadFile: async (id: string, file: File) => {
    await delay()
    const cliente = DB.find((c) => c.id === id)
    if (!cliente) throw new Error('Cliente no encontrado')
    const fileMeta = { id: String(Date.now()), nombre: file.name, url: undefined }
    cliente.archivos = [...(cliente.archivos || []), fileMeta]
    cliente.historial = [...(cliente.historial || []), { fecha: new Date().toISOString(), cambio: `Archivo subido: ${file.name}` }]
    return fileMeta
  },
  getHistory: async (id: string) => {
    await delay()
    const cliente = DB.find((c) => c.id === id)
    return cliente?.historial ?? []
  },
  addNote: async (id: string, note: string) => {
    await delay()
    DB = DB.map((c) => {
      if (c.id !== id) return c
      const copy = { ...c }
      copy.notas = `${copy.notas ? copy.notas + '\n' : ''}${note}`
      copy.historial = [...(copy.historial || []), { fecha: new Date().toISOString(), cambio: `Nota: ${note}` }]
      return copy
    })
    return DB.find((c) => c.id === id) || null
  }
}

export default clientesService
