import sampleData, { ComprobanteIVA } from './ivaMock'
import riesgoService from '../../RiesgoFiscal/services/riesgoService'
import iibbService from '../../../services/iibbService'
import documentosService from '../../../services/documentosService'

export type LibroEntry = ComprobanteIVA

let store: LibroEntry[] = []

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }

function detectDuplicates(list: LibroEntry[]) {
  const map = new Map<string, LibroEntry[]>()
  list.forEach((c) => {
    const key = `${c.cuit}|${c.puntoVenta}|${c.numero}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(c)
  })
  map.forEach((arr) => {
    if (arr.length > 1) arr.forEach((a)=> a.duplicado = true)
  })
  // CAE duplicates
  const caeMap = new Map<string, LibroEntry[]>()
  list.forEach((c)=> { if (c.cae) { if(!caeMap.has(c.cae)) caeMap.set(c.cae, []); caeMap.get(c.cae)!.push(c) } })
  caeMap.forEach((arr)=> { if (arr.length>1) arr.forEach((a)=> a.duplicado=true) })
}

function detectInconsistencies(list: LibroEntry[]) {
  list.forEach((c)=>{
    const issues: string[] = []
    const expected = Math.round((c.neto || 0) + (c.iva21 || 0) + (c.iva105 || 0) + (c.percepciones || 0))
    if (Math.abs((c.total||0) - expected) > 1) issues.push('Total no coincide con neto + impuestos')
    if (c.tipo === 'C' && (c.iva21 || c.iva105)) issues.push('Factura C con IVA')
    if ((c.tipo === 'A' || c.tipo === 'B') && !(c.iva21 || c.iva105)) issues.push('Factura A/B sin IVA')
    if (issues.length) { c.inconsistente = true; c.inconsistencias = issues }
  })
}

function parseAFIPText(txt: string, origen?: string): LibroEntry[] {
  const lines = txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
  if (!lines.length) return []
  // try header detection
  const header = lines[0].includes(',') || lines[0].includes('|') || lines[0].includes(';') ? lines[0].split(/[,|;]/).map(h=>h.trim().toLowerCase()) : null
  const rows = header ? lines.slice(1) : lines
  const out: LibroEntry[] = rows.map((r)=>{
    const parts = header ? r.split(/[,|;]/).map(p=>p.trim()) : r.split(/\s+/)
    const fecha = parts[0] || new Date().toISOString()
    const tipo = parts[1] || 'X'
    const puntoVenta = parts[2] || parts[1] || '0001'
    const numero = parts[3] || parts[2] || String(Math.floor(Math.random()*100000))
    const cuit = parts[4] || ''
    const razonSocial = parts[5] || ''
    const neto = Number(parts[6] || 0)
    const iva21 = Number(parts[7] || 0)
    const iva105 = Number(parts[8] || 0)
    const percepciones = Number(parts[9] || 0)
    const total = Number(parts[10] || neto + iva21 + iva105 + percepciones)
    const cae = parts[11] || undefined
    const caeVencimiento = parts[12] || undefined
    const entry: LibroEntry = { id: genId(), fecha, tipo, puntoVenta, numero, cuit, razonSocial, neto, iva21, iva105, percepciones, total, cae, caeVencimiento, origen }
    return entry
  })
  return out
}

function parseXmlToLibro(xmlText: string, origen?: string): LibroEntry[] {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'application/xml')
    const comprobantes: LibroEntry[] = []
    const comps = doc.querySelectorAll('Comprobante, comprobante, Factura, factura')
    if (comps && comps.length) {
      comps.forEach((c)=>{
        const fecha = c.querySelector('Fecha')?.textContent || c.querySelector('fecha')?.textContent || new Date().toISOString()
        const tipo = c.querySelector('Tipo')?.textContent || c.querySelector('tipo')?.textContent || 'X'
        const puntoVenta = c.querySelector('PuntoVenta')?.textContent || c.querySelector('puntoVenta')?.textContent || '0001'
        const numero = c.querySelector('Numero')?.textContent || c.querySelector('numero')?.textContent || String(Math.floor(Math.random()*100000))
        const cuit = c.querySelector('CUIT')?.textContent || c.querySelector('cuit')?.textContent || ''
        const razonSocial = c.querySelector('RazonSocial')?.textContent || c.querySelector('razonSocial')?.textContent || ''
        const neto = Number(c.querySelector('Neto')?.textContent || c.querySelector('neto')?.textContent || 0)
        const iva21 = Number(c.querySelector('IVA21')?.textContent || c.querySelector('iva21')?.textContent || 0)
        const iva105 = Number(c.querySelector('IVA105')?.textContent || c.querySelector('iva105')?.textContent || 0)
        const percepciones = Number(c.querySelector('Percepciones')?.textContent || c.querySelector('percepciones')?.textContent || 0)
        const total = Number(c.querySelector('Total')?.textContent || c.querySelector('total')?.textContent || (neto + iva21 + iva105 + percepciones))
        const cae = c.querySelector('CAE')?.textContent || c.querySelector('Cae')?.textContent || undefined
        const caeVencimiento = c.querySelector('CAEVencimiento')?.textContent || undefined
        comprobantes.push({ id: genId(), fecha, tipo, puntoVenta, numero, cuit, razonSocial, neto, iva21, iva105, percepciones, total, cae, caeVencimiento, origen })
      })
      return comprobantes
    }
  } catch (e) {
    // ignore and fallback
  }
  // fallback: return empty
  return []
}

export async function loadMock() {
  store = [...sampleData]
  detectDuplicates(store)
  detectInconsistencies(store)
  return store
}

export async function processFile(file: File) {
  // basic routing by extension
  const name = file.name.toLowerCase()
  let parsed: LibroEntry[] = []
  if (name.endsWith('.txt') || name.endsWith('.csv')) {
    const txt = await file.text()
    parsed = parseAFIPText(txt, file.name)
  } else if (name.endsWith('.xml')) {
    const txt = await file.text()
    parsed = parseXmlToLibro(txt, file.name)
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    // for now, treat as not implemented: fallback to mock
    parsed = [...sampleData]
  } else if (name.endsWith('.pdf') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) {
    // use documentosService to save and lectorService to extract? For now, save as document and fallback
    const saved = await documentosService.saveDocument(file, { origen: 'libros-iva-upload' })
    parsed = [...sampleData].map(s=> ({...s, origen: file.name}))
  }
  // perform detection
  detectDuplicates(parsed)
  detectInconsistencies(parsed)

  // persist to store (append)
  store = [...parsed, ...store]

  // create risk alerts for duplicates/inconsistencies
  parsed.forEach((c)=>{
    if (c.duplicado) {
      riesgoService.addAlerta({ tipo: 'factura_duplicada', cuit: c.cuit, cliente: c.razonSocial, descripcion: `Comprobante duplicado ${c.puntoVenta}-${c.numero}`, criticidad: 'alta', fecha: c.fecha, estado: 'pendiente' })
    }
    if (c.inconsistente) {
      riesgoService.addAlerta({ tipo: 'iva_inconsistente', cuit: c.cuit, cliente: c.razonSocial, descripcion: `Inconsistencias: ${c.inconsistencias?.join(', ')}`, criticidad: 'media', fecha: c.fecha, estado: 'pendiente' })
    }
  })

  return parsed
}

export function getAll() { return store }

export function getByMonthYear(month: number, year: number) {
  return store.filter((s)=>{ const d = new Date(s.fecha); return d.getMonth()+1===month && d.getFullYear()===year })
}

export function markReviewed(id: string) {
  const it = store.find((s)=>s.id===id)
  if (it) it.revisado = true
}

export async function exportCSV(list: LibroEntry[]) {
  const header = ['fecha','tipo','puntoVenta','numero','cuit','razonSocial','neto','iva21','iva105','percepciones','total','cae','origen']
  const rows = list.map(l => header.map(h => String((l as any)[h] ?? '')).join(','))
  return [header.join(','), ...rows].join('\n')
}

export default { loadMock, processFile, getAll, getByMonthYear, markReviewed, exportCSV }
