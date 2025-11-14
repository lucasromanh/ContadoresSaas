import { ReciboSueldo } from '../types/reciboSueldo'

function parseAmount(s: string | number | undefined){
  if (s === undefined || s === null) return 0
  const ss = String(s)
  // Accept formats like 1.234.567,89 or 1234567.89 or 1234567
  const cleaned = ss.replace(/[^0-9,\.\-]/g, '').replace(/\.(?=\d{3}(?:\.|,|$))/g, '').replace(',', '.')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

type OCRResult = { text: string; pages?: string[]; words?: Array<{ text: string; bbox: { x0:number; y0:number; x1:number; y1:number } }> }

// Build lines grouped by y center from words (if provided), otherwise fallback to raw text lines
function buildLines(ocr: OCRResult){
  if (ocr.words && ocr.words.length){
    // group words by approximate y center
    const linesMap: Array<{ y:number; words: Array<{text:string,x:number,x1:number}> }> = []
    for (const w of ocr.words){
      const cy = (w.bbox.y0 + w.bbox.y1) / 2
      let found = false
      for (const l of linesMap){
        if (Math.abs(l.y - cy) < 8){ // 8px tolerance
          l.words.push({ text: w.text, x: w.bbox.x0, x1: w.bbox.x1 })
          found = true; break
        }
      }
      if (!found) linesMap.push({ y: cy, words: [{ text: w.text, x: w.bbox.x0, x1: w.bbox.x1 }] })
    }
    // sort lines by y and words by x
    linesMap.sort((a,b)=> a.y - b.y)
    return linesMap.map(l => l.words.sort((a,b)=>a.x - b.x).map(w=>w.text).join(' '))
  }
  // fallback: split text into lines
  return (ocr.text || '').split(/\r?\n/).map(s=>s.trim()).filter(Boolean)
}

// Heuristic parser that tries to extract the required JSON structure.
export function parseReciboFromOCR(ocr: OCRResult, meta?: { filename?: string }){
  const lines = buildLines(ocr)
  const text = ocr.text || lines.join('\n')
  const now = new Date().toISOString()

  // helpers
  const findLine = (rx: RegExp) => lines.find(l => rx.test(l))
  const findAll = (rx: RegExp) => lines.filter(l => rx.test(l))

  // Employer
  const empleador: any = { nombre: '', cuit: '', domicilio: '', actividad: '' }
  const empLine = findLine(/(Empleador|Empleador:|Raz[oó]n Social|Ministerio|Gobierno|Ministerio de Educaci[oó]n)/i)
  if (empLine) empleador.nombre = empLine.replace(/^(Empleador[:\s-]*)/i,'').trim()
  const cuitMatch = text.match(/(CUIT|Cuit|cuit)[:\s]*([0-9\-]{11,15})/i) || text.match(/(\d{2}-\d{8}-\d)/)
  if (cuitMatch) empleador.cuit = (cuitMatch[2] || cuitMatch[0]).trim()

  // Employee
  const empleado: any = { nombre: '', apellido: '', cuil: '', categoria: '', fechaIngreso: '', periodoLiquidacion: '' }
  const cuilMatch = text.match(/(CUIL|Cuil|cuil)[:\s]*([0-9\-]{11,15})/i)
  if (cuilMatch) empleado.cuil = (cuilMatch[2] || cuilMatch[0]).trim()
  const nombreEmpLine = findLine(/(Empleado|Apellido y Nombre|Nombre[:\s])/i) || findLine(/^[A-ZÁÉÍÓÚÑ][\w\s\-]+\s[A-ZÁÉÍÓÚÑ][\w\s\-]+$/)
  if (nombreEmpLine) empleado.nombre = nombreEmpLine.replace(/^(Empleado[:\s-]*|Apellido y Nombre[:\s-]*|Nombre[:\s-]*)/i,'').trim()

  // Periodo
  const periodoLine = findLine(/(Periodo|Per[ií]odo|Mes[:\s])/i)
  if (periodoLine){
    empleado.periodoLiquidacion = periodoLine.replace(/^(Periodo[:\s-]*)/i,'').trim()
  } else {
    // try to find month + year
    const p2 = text.match(/(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\s+\d{4}/i)
    if (p2) empleado.periodoLiquidacion = p2[0]
  }

  // Build candidate rows for amounts: lines that contain argent-style numbers
  const moneyRx = /\d{1,3}(?:[\.\s]\d{3})*(?:,\d{2})?/g
  const rows: Array<{ raw:string; amounts: number[] }> = []
  for (const l of lines){
    const m = l.match(moneyRx)
    if (m && m.length){
      rows.push({ raw: l, amounts: m.map(a=>parseAmount(a)) })
    }
  }

  // classify sections: look for headings
  const haberes: Array<{ codigo: string | null; descripcion: string; importe: number | null }> = []
  const deducciones: Array<{ codigo: string | null; descripcion: string; importe: number | null }> = []

  // Find common headings indices
  const idxHab = lines.findIndex(l => /HABERES|CONCEPTOS REMUNERATIVOS|REMUNERATIVOS/i.test(l))
  const idxDed = lines.findIndex(l => /DEDUCCIONES|RETENCIONES|APORTES|DESCUENTOS/i.test(l))

  // Helper to extract code/desc/amount from a raw row
  const parseRow = (raw: string) => {
    // try to capture code at start
    const codeMatch = raw.match(/^\s*(\d{1,4})\b/)
    const codigo = codeMatch ? codeMatch[1] : null
    // last money is amount
    const money = raw.match(moneyRx)
  const importe = money ? parseAmount(money[money.length-1]) : null
    // description is raw without the amount(s)
    const desc = raw.replace(moneyRx, '').replace(/^\s*\d{1,4}\s*/,'').trim()
    return { codigo, descripcion: desc || raw, importe }
  }

  // If we have headings, classify rows between them
  if (idxHab >=0 && idxDed >=0){
    const startH = idxHab + 1
    const endH = idxDed
    for (let i = startH; i < endH; i++){
      const r = rows.find(rr => rr.raw === lines[i])
      if (r) haberes.push(parseRow(r.raw))
    }
    for (let i = idxDed+1; i < lines.length; i++){
      const r = rows.find(rr => rr.raw === lines[i])
      if (r) deducciones.push(parseRow(r.raw))
    }
  } else if (rows.length){
    // fallback: distribute rows by heuristics: assume first half are haberes until a large negative or keyword
    let split = Math.floor(rows.length * 0.6)
    // try to find 'TOTAL DEDUCCIONES' line
    const tDedIdx = lines.findIndex(l => /TOTAL\s+DEDUCCIONES|TOTAL DEDUCCIONES/i.test(l))
    if (tDedIdx >=0){
      // include rows before this as haberes, after as deducciones
      const tRowIdx = rows.findIndex(r=> lines.indexOf(r.raw) >= tDedIdx)
      if (tRowIdx >=0) split = tRowIdx
    }
    for (let i=0;i<rows.length;i++){
      const parsed = parseRow(rows[i].raw)
      if (i < split) haberes.push(parsed)
      else deducciones.push(parsed)
    }
  }

  // Totals: try to find explicit total lines
  const totalHabLine = findLine(/Total\s+Haberes|TOTAL REMUNERATIVO|TOTAL HABERES/i)
  const totalDedLine = findLine(/Total\s+Deducciones|TOTAL DEDUCCIONES/i)
  const netoLine = findLine(/Neto a Cobrar|Total a Cobrar|Neto a Percibir|Neto/i)

  const totals: any = { totalHaberes: null as number | null, totalDeducciones: null as number | null, neto: null as number | null, netoEnLetras: '' }
  if (totalHabLine){
    const m = totalHabLine.match(moneyRx)
    if (m) totals.totalHaberes = parseAmount(m[m.length-1])
  }
  if (totalDedLine){
    const m = totalDedLine.match(moneyRx)
    if (m) totals.totalDeducciones = parseAmount(m[m.length-1])
  }
  if (netoLine){
    const m = netoLine.match(moneyRx)
    if (m) totals.neto = parseAmount(m[m.length-1])
    // try to capture neto en letras (near neto line)
    const idx = lines.indexOf(netoLine)
    if (idx>=0 && lines[idx+1]) totals.netoEnLetras = lines[idx+1].slice(0,200)
  }

  // If totals not found, compute from items
  const sumHab = haberes.reduce((s,h)=> s + (Number(h.importe) || 0), 0)
  const sumDed = deducciones.reduce((s,d)=> s + (Number(d.importe) || 0), 0)
  if (totals.totalHaberes === null && sumHab > 0) totals.totalHaberes = sumHab
  if (totals.totalDeducciones === null && sumDed > 0) totals.totalDeducciones = sumDed
  if (totals.neto === null && (totals.totalHaberes !== null || totals.totalDeducciones !== null)){
    const th = totals.totalHaberes || 0
    const td = totals.totalDeducciones || 0
    totals.neto = Math.max(0, th - td)
  }

  // validations
  const inconsistencias: string[] = []
  if (totals.totalHaberes !== null && Math.abs(sumHab - totals.totalHaberes) > 1) inconsistencias.push('El total de haberes no coincide con la sumatoria de ítems')
  if (totals.totalDeducciones !== null && Math.abs(sumDed - totals.totalDeducciones) > 1) inconsistencias.push('El total de deducciones no coincide con la sumatoria de ítems')

  // Map haberes/deducciones into conceptos to match ReciboSueldo type
  const conceptos: Array<any> = []
  for (const h of haberes) conceptos.push({ codigo: h.codigo || '', descripcion: h.descripcion, haberes: h.importe !== null ? Number(h.importe) : null, deducciones: null })
  for (const d of deducciones) conceptos.push({ codigo: d.codigo || '', descripcion: d.descripcion, haberes: null, deducciones: d.importe !== null ? Number(d.importe) : null })

  const periodoMes = (() => {
    if (empleado.periodoLiquidacion){
      const m = empleado.periodoLiquidacion.match(/(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)/i)
      const y = empleado.periodoLiquidacion.match(/(\d{4})/)
      return { mes: m ? m[0] : (empleado.periodoLiquidacion||''), año: y ? Number(y[0]) : new Date().getFullYear() }
    }
    return { mes: (meta?.filename||'').split('_')[0] || 'Sin periodo', año: new Date().getFullYear() }
  })()

  // Build standardized structure required by frontend (always include keys)
  const standard = {
    empleado: {
      nombre: empleado.nombre || 'No detectado',
      apellido: empleado.apellido || '',
      cuil: empleado.cuil || ''
    },
    empleador: {
      razonSocial: empleador.nombre || (meta?.filename||'') || 'No detectado',
      cuit: empleador.cuit || '',
      domicilio: empleador.domicilio || ''
    },
    periodo: {
      mes: periodoMes.mes || 'Sin periodo',
      año: String(periodoMes.año || new Date().getFullYear())
    },
    conceptos: conceptos.map((c:any)=>({ codigo: c.codigo || '', descripcion: c.descripcion || '', haberes: c.haberes !== null ? Number(c.haberes) : null, deducciones: c.deducciones !== null ? Number(c.deducciones) : null })),
    totales: {
      totalHaberes: totals.totalHaberes !== null ? Number(totals.totalHaberes) : null,
      totalDeducciones: totals.totalDeducciones !== null ? Number(totals.totalDeducciones) : null,
      neto: totals.neto !== null ? Number(totals.neto) : null
    },
    observaciones: inconsistencias.length ? inconsistencias : [],
    archivoOriginalUrl: meta?.filename || ''
  }

  // final sanity: if we have no conceptos and neto is zero -> failed parse
  // Decide if parse is meaningful: require either a cuil/cuit or at least one amount
  const hasId = Boolean(empleador.cuit || empleado.cuil)
  const hasAmounts = (standard.conceptos && standard.conceptos.length > 0) || (standard.totales.totalHaberes !== null) || (standard.totales.totalDeducciones !== null) || (standard.totales.neto !== null)

  if (!hasId && !hasAmounts){
    return { error: 'No se pudo interpretar el recibo' }
  }

  return standard
}

export default { parseReciboFromOCR }
