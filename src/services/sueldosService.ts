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
  saveParsedRecibo: async (recibo: ReciboSueldo, file?: File) => {
    await sueldosService.load()
    if (file){
      const read = new FileReader()
      const dataUrl: Promise<string> = new Promise((res)=>{ read.onload = ()=> res(String(read.result)); read.readAsDataURL(file) })
      recibo.archivoOriginalUrl = await dataUrl
    }
    recibo.fechaCarga = new Date().toISOString()
    recibo.origen = 'ocr'
    store = [recibo, ...store]
    persist()
    if (recibo.observaciones && recibo.observaciones.length > 0){
      recibo.observaciones.forEach((obs: string) => {
        alertasService.create({ titulo: 'Error en recibo OCR', descripcion: obs, tipo: 'ocr', cuit: (recibo.empleado as any).cuil || '', criticidad: 'alta' })
      })
    }
    return recibo
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
