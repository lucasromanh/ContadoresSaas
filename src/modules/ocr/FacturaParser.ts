import { FacturaExtraida } from '../../types/factura'
import { ReciboSueldo } from '../../types/reciboSueldo'

// Minimal parser: from OCR text/words extract AFIP-like factura structure
export function parseFacturaFromOCR(ocr: { text: string; words?: Array<any> }, meta?: { filename?: string }): FacturaExtraida {
  const text = (ocr && ocr.text) ? String(ocr.text) : (meta?.filename || '')
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)

  const result: FacturaExtraida = {
    tipo: '',
    emisor: { razonSocial: '', cuit: '' },
    receptor: { },
    comprobante: {},
    items: [],
    totales: {}
  }

  // Tipo comprobante
  const tipoLine = lines.find(l=>/FACTURA\s*[A|B|C|M]|NOTA DE CR[IÍ]DITO|TICKET/i.test(l))
  if (tipoLine){
    if (/FACTURA\s*A/i.test(tipoLine)) result.tipo = 'A'
    else if (/FACTURA\s*B/i.test(tipoLine)) result.tipo = 'B'
    else if (/FACTURA\s*C/i.test(tipoLine)) result.tipo = 'C'
    else result.tipo = (tipoLine.match(/FACTURA\s*(\w+)/i)||['',''])[1]
  }

  // Punto de venta / numero
  const pv = text.match(/Punto\s*de\s*Venta[:\s]*([0-9]+)/i) || text.match(/P\.\s*de\s*Venta[:\s]*(\d+)/i)
  if (pv) result.comprobante.puntoVenta = pv[1]
  const num = text.match(/(Comp(?:\.||\b)\s*Nro\.?[:\s]*)([0-9\-]+)/i) || text.match(/Nro\.?[:\s]*([0-9\-]+)/i)
  if (num) result.comprobante.numero = (num[2] || num[1]).replace(/Comp\.?\s*Nro\.?[:\s]*/i,'')

  // Fecha
  const fecha = text.match(/(Fecha[:\s]*)(\d{2}\/\d{2}\/\d{4})/) || text.match(/(\d{2}\/\d{2}\/\d{4})/)
  if (fecha) result.comprobante.fechaEmision = fecha[2] || fecha[1]

  // CAE
  const cae = text.match(/CAE[:\s]*([0-9A-Z]+)/i)
  if (cae) result.comprobante.cae = cae[1]
  const caeV = text.match(/Venc(?:.|imiento)*\s*CAE[:\s]*(\d{2}\/\d{2}\/\d{4})/i)
  if (caeV) result.comprobante.caeVencimiento = caeV[1]

  // Emisor: razon social and CUIT
  const emRazon = lines.find(l=>/Raz[oó]n\s+Social/i.test(l)) || lines.find(l=>/Nombre\s+Proveedor|Emisor/i.test(l))
  if (emRazon) result.emisor.razonSocial = emRazon.replace(/Raz[oó]n\s+Social[:\s]*/i,'').trim()
  const emCuit = text.match(/CUIT[:\s]*([0-9\-]+)/i)
  if (emCuit) result.emisor.cuit = emCuit[1].trim()

  // Receptor
  const recRazon = lines.find(l=>/Destinatario|Receptor|Cliente|Señor|Nombre[:\s]/i.test(l))
  if (recRazon) result.receptor.razonSocial = recRazon.replace(/(Receptor|Destinatario|Cliente|Nombre)[:\s]*/i,'').trim()
  const recCuit = text.match(/(C.U.I.T|CUIT|Cuit|DNI)[:\s]*([0-9\-]+)/i)
  if (recCuit) result.receptor.cuit = recCuit[2] || recCuit[1]

  // Items: try to find table header index
  const headerIdx = lines.findIndex(l=>/Cant\.|Cantidad|Descripcion|P\.Unit\.|P\. Unit\.|Subtotal|Importe/i.test(l))
  if (headerIdx >=0){
    for (let i = headerIdx+1; i < Math.min(lines.length, headerIdx+60); i++){
      const ln = lines[i]
      // naive parse: split by multiple spaces
      const parts = ln.split(/\s{2,}/).map(p=>p.trim()).filter(Boolean)
      if (parts.length >= 3){
        const descripcion = parts.slice(0, parts.length-3+1).join(' ')
        const cantidad = Number((parts[parts.length-3]||'0').replace(/[^0-9\,\.\-]/g,'')) || 0
        const punit = Number((parts[parts.length-2]||'0').replace(/[^0-9\,\.\-]/g,'')) || 0
        const subtotal = Number((parts[parts.length-1]||'0').replace(/[^0-9\,\.\-]/g,'')) || 0
        result.items.push({ descripcion, cantidad, precioUnitario: punit, subtotal })
      }
    }
  }

  // Totales
  const totLine = lines.find(l=>/Total\s*Factura|Importe\s*Total|Total\s*a\s*pagar|Total\s*:\s*/i.test(l))
  if (totLine){
    const m = totLine.match(/(\d{1,3}(?:[\.\s]\d{3})*(?:,\d{2}))/)
    if (m) result.totales.total = Number(m[1].replace(/\./g,'').replace(',','.'))
  }

  result.archivoOriginalUrl = meta?.filename || ''
  result.origen = 'ocr'

  return result
}
