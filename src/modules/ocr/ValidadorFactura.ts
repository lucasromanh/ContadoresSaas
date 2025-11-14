export function validateFactura(f:any){
  const errors:string[] = []
  if (!f) { errors.push('Factura vacía'); return {ok:false,errors} }
  // CUIT validation
  const cuit = (f.emisor && (f.emisor.cuit || f.emisor.cuit_cuil)) || f.cuit || f.cuit_emisor
  if (!cuit || !/\d{11}/.test(String(cuit).replace(/[^0-9]/g,''))) errors.push('CUIT emisor no encontrado o inválido')
  // punto de venta y numero
  if (!f.puntoVenta || !f.numero) errors.push('Punto de venta o número ausente')
  // fecha
  if (!f.fecha && !f.fechaComprobante) errors.push('Fecha de comprobante no encontrada')
  // Totales coherence
  if (f.totales){
    const sumItems = (Array.isArray(f.conceptos)? f.conceptos.reduce((s:any,i:any)=>s + (Number(i.subtotal)||0),0) : 0)
    const total = Number(f.totales.total) || 0
    if (Math.abs(sumItems - total) > 1) errors.push('Suma de items difiere del total por más de $1')
  }
  return { ok: errors.length===0, errors }
}

export default validateFactura
