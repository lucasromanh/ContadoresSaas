const USE_MOCK = true

const mock = {
  obtenerComprobantes: async (cuit: string, periodo: string) => {
    return [
      { id: 'F001-0001', fecha: periodo, monto: 1200, cuit },
      { id: 'F001-0002', fecha: periodo, monto: 5500, cuit }
    ]
  },
  obtenerDeuda: async (cuit: string) => {
    return { total: 0, items: [] }
  },
  obtenerCategoriaMonotributo: async (cuit: string) => {
    return { categoria: 'A', ingresos_anuales: 350000 }
  },
  obtenerConstanciaInscripcion: async (cuit: string) => {
    return { inscripto: true, fecha: '2020-01-01' }
  },
  obtenerRetenciones: async (cuit: string) => {
    return []
  },
  obtenerPercepciones: async (cuit: string) => {
    return []
  }
}

export const arcaService = {
  obtenerComprobantes: async (cuit: string, periodo: string) => {
    if (USE_MOCK) return mock.obtenerComprobantes(cuit, periodo)
    const url = `https://api.arca.gob.ar/comprobantes?cuit=${cuit}&periodo=${periodo}`
    const res = await fetch(url)
    return res.json()
  },
  obtenerDeuda: async (cuit: string) => {
    if (USE_MOCK) return mock.obtenerDeuda(cuit)
    const url = `https://api.arca.gob.ar/deuda?cuit=${cuit}`
    const res = await fetch(url)
    return res.json()
  },
  obtenerCategoriaMonotributo: async (cuit: string) => {
    if (USE_MOCK) return mock.obtenerCategoriaMonotributo(cuit)
    const url = `https://api.arca.gob.ar/monotributo/categoria?cuit=${cuit}`
    const res = await fetch(url)
    return res.json()
  },
  obtenerConstanciaInscripcion: async (cuit: string) => {
    if (USE_MOCK) return mock.obtenerConstanciaInscripcion(cuit)
    const url = `https://api.arca.gob.ar/constancia?cuit=${cuit}`
    const res = await fetch(url)
    return res.json()
  },
  obtenerRetenciones: async (cuit: string) => {
    if (USE_MOCK) return mock.obtenerRetenciones(cuit)
    const url = `https://api.arca.gob.ar/retenciones?cuit=${cuit}`
    const res = await fetch(url)
    return res.json()
  },
  obtenerPercepciones: async (cuit: string) => {
    if (USE_MOCK) return mock.obtenerPercepciones(cuit)
    const url = `https://api.arca.gob.ar/percepciones?cuit=${cuit}`
    const res = await fetch(url)
    return res.json()
  }
}

export default arcaService
