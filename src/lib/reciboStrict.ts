// Normaliza la salida del parser a la estructura JSON estricta pedida por el frontend
export function toStrictRecibo(parsed: any){
  // parsed is expected to have fields: empleado, empleador, periodo, conceptos, totales, observaciones
  const empleado = parsed?.empleado || {}
  const empleador = parsed?.empleador || {}
  const periodo = parsed?.periodo || {}
  const conceptosRaw = Array.isArray(parsed?.conceptos) ? parsed.conceptos : []
  const conceptos = conceptosRaw.map((c:any) => ({
    codigo: c.codigo || '',
    descripcion: c.descripcion || '',
    haberes: c.haberes != null ? Number(c.haberes) : 0,
    deducciones: c.deducciones != null ? Number(c.deducciones) : 0
  }))

  const tot = parsed?.totales || {}
  const totalHaberes = tot?.totalHaberes != null ? Number(tot.totalHaberes) : 0
  const totalDeducciones = tot?.totalDeducciones != null ? Number(tot.totalDeducciones) : 0
  const neto = tot?.neto != null ? Number(tot.neto) : (totalHaberes - totalDeducciones)

  const observ = Array.isArray(parsed?.observaciones) ? parsed.observaciones.slice() : []

  // If parser returned an error flag, add observation
  if (parsed && parsed.error) {
    if (!observ.includes(String(parsed.error))) observ.push(String(parsed.error))
  }

  // If minimal data (no cuil/cuit and no amounts), add OCR insuficiente note
  const hasId = Boolean((empleador.cuit && String(empleador.cuit).trim()) || (empleado.cuil && String(empleado.cuil).trim()))
  const hasAmounts = totalHaberes !== 0 || totalDeducciones !== 0 || conceptos.some((c:any)=> (c.haberes || 0) !== 0 || (c.deducciones || 0) !== 0)
  if (!hasId && !hasAmounts && !observ.length){
    observ.push('OCR insuficiente para interpretar el recibo')
  }

  return {
    empleado: {
      nombre: empleado.nombre || '',
      apellido: empleado.apellido || '',
      cuil: empleado.cuil || ''
    },
    empleador: {
      razonSocial: empleador.razonSocial || '',
      cuit: empleador.cuit || '',
      domicilio: empleador.domicilio || ''
    },
    periodo: {
      mes: periodo?.mes || '',
      año: periodo?.año ? String(periodo.año) : (periodo?.a\u00f1o ? String(periodo['a\u00f1o']) : '')
    },
    conceptos: conceptos,
    totales: {
      totalHaberes: Number(totalHaberes || 0),
      totalDeducciones: Number(totalDeducciones || 0),
      neto: Number(neto || 0)
    },
    observaciones: observ
  }
}

export default { toStrictRecibo }
