// Normalizador básico: normaliza números argentinos y rellena campos faltantes
export function parseArgNumber(s?: string | number){
  if (s === undefined || s === null) return 0
  const ss = String(s)
  const cleaned = ss.replace(/[^0-9,\.\-]/g,'').replace(/\.(?=\d{3}(?:\.|,|$))/g,'').replace(',','.')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function normalizeFactura(f: any){
  // normalize totals
  if (f.totales){
    f.totales.netoGravado = parseArgNumber(f.totales.netoGravado)
    f.totales.netoNoGravado = parseArgNumber(f.totales.netoNoGravado)
    f.totales.iva21 = parseArgNumber(f.totales.iva21)
    f.totales.iva105 = parseArgNumber(f.totales.iva105)
    f.totales.totalPercepcionesNacionales = parseArgNumber(f.totales.totalPercepcionesNacionales)
    f.totales.totalPercepcionesProvinciales = parseArgNumber(f.totales.totalPercepcionesProvinciales)
    f.totales.total = parseArgNumber(f.totales.total)
  }
  // items
  if (Array.isArray(f.conceptos)){
    f.conceptos = f.conceptos.map((it:any)=>({
      codigo: it.codigo || undefined,
      descripcion: (it.descripcion||'').trim(),
      cantidad: parseArgNumber(it.cantidad) || 0,
      precioUnitario: parseArgNumber(it.precioUnitario) || 0,
      subtotal: parseArgNumber(it.subtotal) || 0,
      alicuotaIVA: parseArgNumber(it.alicuotaIVA) || undefined,
      percepciones: it.percepciones || []
    }))
  }
  return f
}

export default { parseArgNumber, normalizeFactura }
