import { FacturaExtraida } from '../../types/factura'
import { parseArgNumber } from './NormalizadorFactura'

// Improved parser: if OCR returns words with bbox, reconstruct lines from bboxes
export function parseFacturaFromOCR(ocr: { text: string; words?: Array<any> }, meta?: { filename?: string }): FacturaExtraida {
  const words = Array.isArray(ocr?.words) ? ocr!.words : null
  let lines: string[] = []

  if (words && words.length){
    // group by approximate y-center
    const mapped = words.map(w=>{
      const x0 = Number(w.bbox?.x0 ?? w.x0 ?? 0)
      const x1 = Number(w.bbox?.x1 ?? w.x1 ?? 0)
      const y0 = Number(w.bbox?.y0 ?? w.y0 ?? 0)
      const y1 = Number(w.bbox?.y1 ?? w.y1 ?? 0)
      return { text: String(w.text||''), x0, x1, y0, y1, cy: (y0+y1)/2 }
    }).sort((a,b)=> a.cy - b.cy || a.x0 - b.x0)

    const groups: Array<Array<any>> = []
    for (const w of mapped){
      const last = groups[groups.length-1]
      if (!last) { groups.push([w]); continue }
      const prevCy = last[last.length-1].cy
      if (Math.abs(w.cy - prevCy) <= Math.max(4, prevCy*0.01)) last.push(w)
      else groups.push([w])
    }

    lines = groups.map(g=> g.sort((a:any,b:any)=> a.x0 - b.x0).map((c:any)=>c.text).join(' ').replace(/\s+/g,' ').trim()).filter(Boolean)
  } else {
    const text = String(ocr?.text || meta?.filename || '')
    lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
  }

  const fullText = lines.join('\n')

  const result: FacturaExtraida = {
    tipo: '',
    emisor: { razonSocial: '', cuit: '' },
    receptor: {},
    comprobante: {},
    items: [],
    totales: {}
  }

  // Tipo comprobante
  const tipoLine = lines.find(l=>/FACTURA\s*[A-CM]|NOTA DE CR[IÍ]DITO|TICKET/i.test(l))
  if (tipoLine){
    if (/FACTURA\s*A/i.test(tipoLine)) result.tipo = 'A'
    else if (/FACTURA\s*B/i.test(tipoLine)) result.tipo = 'B'
    else if (/FACTURA\s*C/i.test(tipoLine)) result.tipo = 'C'
    else result.tipo = (tipoLine.match(/FACTURA\s*(\w+)/i)||['',''])[1]
  }

  // Punto de venta / numero - more robust: look for PV and Nro combos
  const pv = fullText.match(/Punto\s*de\s*Venta[:\s]*([0-9]{1,5})/i) || fullText.match(/Punto\.?\s*Venta[:\s]*([0-9]{1,5})/i)
  if (pv) result.comprobante.puntoVenta = pv[1]
  const num = fullText.match(/Nro\.?[:\s]*([0-9\-]+)/i) || fullText.match(/Num\.?[:\s]*([0-9\-]+)/i)
  if (num) result.comprobante.numero = num[1]

  // Fecha
  const fecha = fullText.match(/(\d{2}\/\d{2}\/\d{4})/) || fullText.match(/Fecha[:\s]*(\d{2}\/\d{2}\/\d{4})/i)
  if (fecha) result.comprobante.fechaEmision = fecha[1]

  // CAE
  const cae = fullText.match(/CAE[:\s]*([0-9A-Z\-]+)/i) || fullText.match(/Codigo\s*CAE[:\s]*([0-9A-Z\-]+)/i)
  if (cae) result.comprobante.cae = cae[1]
  const caeV = fullText.match(/Venc(?:imiento)?\s*CAE[:\s]*(\d{2}\/\d{2}\/\d{4})/i)
  if (caeV) result.comprobante.caeVencimiento = caeV[1]

  // Emisor razon social and CUIT
  const emRazon = lines.find(l=>/Raz[oó]n\s+Social|Denominaci[oó]n/i.test(l)) || lines.find(l=>/Nombre\s+Proveedor|Emisor/i.test(l))
  if (emRazon) result.emisor.razonSocial = emRazon.replace(/Raz[oó]n\s+Social[:\s]*/i,'').trim()
  const emCuit = fullText.match(/(CUIT|C\.U\.I\.T|Cuit)[:\s]*([0-9\-]{10,13})/i) || fullText.match(/(\d{2}-?\d{8}-?\d)/)
  if (emCuit) result.emisor.cuit = (emCuit[2]||emCuit[1]||'').toString().replace(/[^0-9]/g,'')

  // Receptor
  const recRazon = lines.find(l=>/Destinatario|Receptor|Cliente|Señor|Apellido|Nombre[:\s]/i)
  if (recRazon) result.receptor.razonSocial = recRazon.replace(/(Receptor|Destinatario|Cliente|Nombre)[:\s]*/i,'').trim()
  const recCuit = fullText.match(/(Cliente\s*CUIT|CUIT\s*Cliente|Cuit|DNI)[:\s]*([0-9\-]{6,13})/i)
  if (recCuit) result.receptor.cuit = (recCuit[2]||'').toString().replace(/[^0-9]/g,'')

  // Items: find header and parse subsequent lines. Use bbox-based lines if available, else fallback to splitting by large gaps.
  const headerIdx = lines.findIndex(l=>/Cant\.|Cantidad|Descripcion|P\.?\s*Unit|Precio|Subtotal|Importe/i.test(l))
  if (headerIdx >= 0){
    for (let i = headerIdx+1; i < Math.min(lines.length, headerIdx+80); i++){
      const ln = lines[i]
      if (!ln || /TOTAL|SUBTOTAL|IVA|IMPORTE TOTAL|NETO GRAVADO/i.test(ln)) break
      const parts = ln.split(/\s{2,}|\t/).map(p=>p.trim()).filter(Boolean)
      if (parts.length >= 3){
        const descripcion = parts.slice(0, parts.length-3+1).join(' ')
        const cantidad = parseArgNumber(parts[parts.length-3]) || 0
        const punit = parseArgNumber(parts[parts.length-2]) || 0
        const subtotal = parseArgNumber(parts[parts.length-1]) || (cantidad * punit)
        result.items.push({ descripcion, cantidad, precioUnitario: punit, subtotal })
      } else {
        // try to capture lines ending with a number (subtotal)
        const m = ln.match(/(.+?)\s+(\d+[\.\,]?\d*)$/)
        if (m){
          const descripcion = m[1].trim()
          const subtotal = parseArgNumber(m[2])
          result.items.push({ descripcion, cantidad: 1, precioUnitario: subtotal, subtotal })
        }
      }
    }
  } else {
    // try a loose scan for lines with amounts
    for (const ln of lines){
      const m = ln.match(/(.+?)\s+(\d{1,3}(?:[\.\s]\d{3})*(?:,\d{2})?)$/)
      if (m && !/FACTURA|CUIT|CAE|TOTAL|VTO|SUBTOTAL|IVA/i.test(m[1])){
        const descripcion = m[1].trim()
        const subtotal = parseArgNumber(m[2])
        result.items.push({ descripcion, cantidad: 1, precioUnitario: subtotal, subtotal })
      }
    }
  }

  // Totales: find lines containing Total and parse last currency-like number
  const totLine = lines.reverse().find(l=>/Importe\s*Total|Total\s*Factura|TOTAL|TOTAL\s*A?\s*PAGAR|Importe\s*Total/i.test(l))
  if (totLine){
    const m = totLine.match(/(\d{1,3}(?:[\.\s]\d{3})*(?:,\d{2}))/)
    if (m) result.totales.total = parseArgNumber(m[1])
  } else {
    // fallback: last numeric-looking value in document
    for (let i = lines.length-1; i >=0; i--){
      const ln = lines[i]
      const m = ln.match(/(\d{1,3}(?:[\.\s]\d{3})*(?:,\d{2}))/)
      if (m){ result.totales.total = parseArgNumber(m[1]); break }
    }
  }

  result.archivoOriginalUrl = meta?.filename || ''
  result.origen = 'ocr'

  return result
}
