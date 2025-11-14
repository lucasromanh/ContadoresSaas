import { ReciboSueldo } from '../types/reciboSueldo'

function parseAmount(s: string){
  if (!s) return 0
  // Accept formats like 1.234.567,89 or 1234567.89 or 1234567
  const cleaned = String(s).replace(/[^0-9-,.]/g, '').replace(/\./g, '').replace(',', '.')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

// Very simple parser: tries to extract CUIL, Neto, Totales and a few lines as conceptos
export function parseReciboFromText(text: string, meta?: { filename?: string }): ReciboSueldo {
  const now = new Date().toISOString()
  // heuristics
  const cuilMatch = text.match(/(CUIL[:\s]*|CUIT[:\s]*)([0-9\-]+)/i)
  const cuil = cuilMatch ? cuilMatch[2].trim() : '20-00000000-0'
  const netoMatch = text.match(/(Neto a Percibir[:\s]*|Neto[:\s]*|Neto a cobrar[:\s]*)([0-9\.,\-]+)/i)
  const neto = netoMatch ? parseAmount(netoMatch[2]) : 0
  const haberesMatch = text.match(/(Total Remunerativo[:\s]*|Total Haberes[:\s]*)([0-9\.,\-]+)/i)
  const totalHaberes = haberesMatch ? parseAmount(haberesMatch[2]) : neto
  const dedMatch = text.match(/(Total Deducciones[:\s]*)([0-9\.,\-]+)/i)
  const totalDeducciones = dedMatch ? parseAmount(dedMatch[2]) : Math.max(0, totalHaberes - neto)

  // build a minimal recibo with placeholder conceptos when parser can't find detailed lines
  const conceptos = [
    { descripcion: 'Sueldo básico (parser)', haberes: totalHaberes, deducciones: 0 },
  ]

  const periodoMatch = text.match(/(Periodo[:\s]*)([A-Za-z]+)\s*(\d{4})/i)
  const mes = periodoMatch ? periodoMatch[2] : (meta?.filename || 'Noviembre')
  const año = periodoMatch ? Number(periodoMatch[3]) : (new Date()).getFullYear()

  const recibo: ReciboSueldo = {
    id: 'r_' + Math.random().toString(36).slice(2,9),
    empleado: { nombre: (meta?.filename || 'Empleado'), cuil },
    empleador: { razonSocial: 'Empleador (parser)', cuit: cuil },
    periodo: { mes, año },
    conceptos,
    totales: { totalHaberes, totalDeducciones, totalNoRemunerativo: 0, neto },
    archivoOriginalUrl: '',
    observaciones: [],
    fechaCarga: now,
    origen: 'ocr'
  }

  // basic validations/observations
  if (Math.abs(recibo.totales.totalHaberes - (recibo.totales.neto + recibo.totales.totalDeducciones)) > 1) {
    recibo.observaciones = recibo.observaciones || []
    recibo.observaciones.push('Diferencia entre haberes y neto/deducciones detectada')
  }

  return recibo
}

export default { parseReciboFromText }
