import { FacturaExtraida } from '../types/factura'

// Regex-based parser implementing the patterns requested. This is best-effort and may need tuning.
export function parseFacturaFromText(text: string): FacturaExtraida {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const joined = lines.join('\n')

  const tipoMatch = joined.match(/FACTURA\s+(A|B|C)/i)
  const tipo = tipoMatch ? tipoMatch[1].toUpperCase() : 'A'

  const cuitRegex = /CUIT[: ]*([0-9]{2}-[0-9]{8}-[0-9])/i
  const cuitMatch = joined.match(cuitRegex)
  const emisorCuit = cuitMatch ? cuitMatch[1] : ''

  const razonRegex = /Raz[oó]n Social[: ]+(.+)/i
  const razonMatch = joined.match(razonRegex)
  const emisorRazon = razonMatch ? razonMatch[1].trim() : extractByHeuristic(lines, ['MASCULLINO', 'RAZON'])

  const pvMatch = joined.match(/Punto de Venta[: ]*(\d+)\s*\|?\s*Comp\.?\s*Nro\.?[: ]*(\d+)/i)
  const puntoVenta = pvMatch ? pvMatch[1] : undefined
  const numero = pvMatch ? pvMatch[2] : undefined

  const fechaMatch = joined.match(/Fecha(?: de emisi[oó]n|)[: ]*(\d{2}\/\d{2}\/\d{4})/i) || joined.match(/Fecha[: ]*(\d{2}\/\d{2}\/\d{4})/i)
  const fecha = fechaMatch ? fechaMatch[1] : undefined

  const caeMatch = joined.match(/CAE[: ]*([0-9]{14})/i)
  const cae = caeMatch ? caeMatch[1] : undefined
  const caeVtoMatch = joined.match(/Fecha de Vencimiento[: ]*(\d{2}\/\d{2}\/\d{4})/i)
  const caeVenc = caeVtoMatch ? caeVtoMatch[1] : undefined

  // Totales
  const iva21Match = joined.match(/IVA\s*21%[: ]*([0-9.,]+)/i)
  const iva21 = iva21Match ? parseNumber(iva21Match[1]) : undefined
  const totalMatch = joined.match(/Total[: ]*\$?\s*([0-9.,]+)/i)
  const total = totalMatch ? parseNumber(totalMatch[1]) : undefined
  const subtotalMatch = joined.match(/Subtotal[: ]*\$?\s*([0-9.,]+)/i)
  const subtotal = subtotalMatch ? parseNumber(subtotalMatch[1]) : undefined

  // Items detection (simple heuristic: lines with number and amount)
  const items: FacturaExtraida['items'] = []
  for (const l of lines) {
    // pattern: cantidad (optional) description ... precio
    const itemMatch = l.match(/^(\d+(?:[.,]\d+)?)[\s\t]+(.+?)[\s\t]+([0-9]+[.,][0-9]{2})$/)
    if (itemMatch) {
      const cantidad = Number(itemMatch[1].replace(',', '.'))
      const descripcion = itemMatch[2].trim()
      const precioUnitario = parseNumber(itemMatch[3])
      if (precioUnitario === undefined) continue
      items.push({ descripcion, cantidad, precioUnitario, subtotal: Number((cantidad * precioUnitario).toFixed(2)) })
    }
  }

  // If no items found, try to find any line with amount that might represent a single item
  if (items.length === 0) {
    for (const l of lines.reverse()) {
      const m = l.match(/([0-9]+[.,][0-9]{2})$/)
      if (m) {
        const precioUnitario = parseNumber(m[1])
        if (precioUnitario === undefined) continue
        items.push({ descripcion: 'Item detectado', cantidad: 1, precioUnitario, subtotal: precioUnitario })
        break
      }
    }
  }

  const result: FacturaExtraida = {
    tipo,
    emisor: {
      razonSocial: emisorRazon || 'Desconocido',
      cuit: emisorCuit || ''
    },
    receptor: {
      razonSocial: '',
      cuit: ''
    },
    comprobante: {
      puntoVenta,
      numero,
      fechaEmision: fecha,
      cae,
      caeVencimiento: caeVenc
    },
    items,
    totales: {
      subtotal,
      iva21,
      total
    }
  }

  return result
}

function parseNumber(v: string | undefined): number | undefined {
  if (!v) return undefined
  const n = Number(String(v).replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? undefined : n
}

function extractByHeuristic(lines: string[], hints: string[]) {
  for (const l of lines) {
    for (const h of hints) {
      if (l.toUpperCase().includes(h)) return l
    }
  }
  return ''
}
