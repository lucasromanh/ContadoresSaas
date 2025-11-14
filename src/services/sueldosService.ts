import { ReciboSueldo, SueldoSummary } from '../types/reciboSueldo'
import sueldosMock from '../mocks/sueldosMock'
import { processFileOCR } from '../lib/ocrProcessor'
import { parseReciboFromOCR } from '../lib/reciboParser'
import alertasService from '../pages/Alertas/services/alertasService'

const STORAGE = 'sueldos_store_v2'

let store: ReciboSueldo[] = []

function persist(){ try{ localStorage.setItem(STORAGE, JSON.stringify(store)) }catch(e){} }

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

const sueldosService = {
  load: async () => {
    try{
      const raw = localStorage.getItem(STORAGE)
      if (raw){ store = JSON.parse(raw) as ReciboSueldo[]; return store }
    }catch(e){}
    store = sueldosMock
    persist()
    return store
  },
  list: async () => { if (!store.length) await sueldosService.load(); await delay(); return [...store] },
  get: async (id: string) => { if (!store.length) await sueldosService.load(); await delay(); return store.find(s=>s.id===id) || null },
  createManual: async (recibo: ReciboSueldo) => { await sueldosService.load(); store = [recibo, ...store]; persist(); return recibo },
  update: async (id: string, patch: Partial<ReciboSueldo>) => { await sueldosService.load(); store = store.map(s => s.id===id ? ({...s, ...patch}) : s); persist(); return store.find(s=>s.id===id) || null },
  remove: async (id: string) => { await sueldosService.load(); store = store.filter(s=>s.id!==id); persist(); return true },
  // process a file: run OCR then parser. Returns parsed recibo or { error }
  // Note: this method does NOT persist the recibo; caller should confirm and call createManual to save.
  processFile: async (file: File, options?: { asociadoA?: string }) => {
    await sueldosService.load()
    const ocr = await processFileOCR(file)
    const parsed = parseReciboFromOCR(ocr as any, { filename: file.name })
    if ((parsed as any).error) {
      return parsed as any
    }
    const recibo = parsed as any
    return recibo
  },

  // Save a parsed recibo (attach original file data url, fechaCarga and persist)
  saveParsedRecibo: async (recibo: any, file?: File) => {
    await sueldosService.load()
    // if passed an OCR-parsed "standard" object, map it to internal ReciboSueldo shape
    let internal: ReciboSueldo
    if (!recibo || (recibo && (recibo.empleado && recibo.empleado.nombre !== undefined && recibo.totales !== undefined && recibo.empleador))){
      // assume it's the standard parsed shape
      const parsed = recibo
      const conceptos = Array.isArray(parsed.conceptos) ? parsed.conceptos.map((c:any)=>({ codigo: c.codigo || '', descripcion: c.descripcion || '', haberes: Number(c.haberes || 0), deducciones: Number(c.deducciones || 0), noRemunerativo: 0 })) : []
      const sumHab = conceptos.reduce((s:any,c:any)=> s + (Number(c.haberes)||0), 0)
      const sumDed = conceptos.reduce((s:any,c:any)=> s + (Number(c.deducciones)||0), 0)
      const totalHab = parsed.totales?.totalHaberes != null ? Number(parsed.totales.totalHaberes) : (sumHab || 0)
      const totalDed = parsed.totales?.totalDeducciones != null ? Number(parsed.totales.totalDeducciones) : (sumDed || 0)
      const neto = parsed.totales?.neto != null ? Number(parsed.totales.neto) : Math.max(0, totalHab - totalDed)

      internal = {
        id: 'r_' + Math.random().toString(36).slice(2,9),
        empleado: { nombre: parsed.empleado?.nombre || 'No detectado', apellido: parsed.empleado?.apellido || '', cuil: parsed.empleado?.cuil || '' },
        empleador: { razonSocial: parsed.empleador?.razonSocial || '', cuit: parsed.empleador?.cuit || '', direccion: parsed.empleador?.domicilio || '' },
        periodo: { mes: parsed.periodo?.mes || 'Sin periodo', año: Number(parsed.periodo?.año || (new Date().getFullYear())) },
        conceptos,
        totales: { totalHaberes: Number(totalHab), totalDeducciones: Number(totalDed), totalNoRemunerativo: 0, neto: Number(neto) },
        archivoOriginalUrl: parsed.archivoOriginalUrl || undefined,
        observaciones: parsed.observaciones || [],
        metadata: { nombreArchivo: parsed.archivoOriginalUrl || '' },
        fechaCarga: new Date().toISOString(),
        origen: 'ocr'
      }
    } else {
      // assume it's already internal ReciboSueldo
      internal = recibo as ReciboSueldo
    }

    if (file){
      const read = new FileReader()
      const dataUrl: Promise<string> = new Promise((res)=>{ read.onload = ()=> res(String(read.result)); read.readAsDataURL(file) })
      internal.archivoOriginalUrl = await dataUrl
    }

    store = [internal, ...store]
    persist()
    if (internal.observaciones && internal.observaciones.length > 0){
      internal.observaciones.forEach((obs: string) => {
        alertasService.create({ titulo: 'Error en recibo OCR', descripcion: obs, tipo: 'ocr', cuit: (internal.empleado as any).cuil || '', criticidad: 'alta' })
      })
    }
    return internal
  },
  detectErrors: (recibo: ReciboSueldo) => {
    const issues: string[] = []
    const { totales } = recibo
    if (Math.abs(totales.totalHaberes - (totales.neto + totales.totalDeducciones)) > 1) issues.push('Neto no coincide con haberes - deducciones')
    if (totales.totalDeducciones > totales.totalHaberes * 0.6) issues.push('Deducciones > 60% del sueldo')
    // more rules can be added here
    return issues
  },
  exportExcel: async () => { /* placeholder: implement XLSX export */ await delay(); return true },
  summary: async (): Promise<SueldoSummary[]> => { await sueldosService.load(); return store.map(s => ({ id: s.id, empleado: `${s.empleado.nombre} ${s.empleado.apellido||''}`.trim(), cuil: s.empleado.cuil, periodoMes: s.periodo.mes, periodoAño: s.periodo.año, totalHaberes: s.totales.totalHaberes, totalDeducciones: s.totales.totalDeducciones, neto: s.totales.neto, fechaCarga: s.fechaCarga })) }
}

export default sueldosService
