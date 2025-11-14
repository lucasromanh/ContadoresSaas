import { AlertaFiscal } from '../../RiesgoFiscal/services/riesgoService'

export type ComprobanteIVA = {
  id: string
  fecha: string
  tipo: string
  puntoVenta: string
  numero: string
  cuit: string
  razonSocial: string
  neto: number
  iva21: number
  iva105: number
  percepciones: number
  total: number
  cae?: string
  caeVencimiento?: string
  origen?: string
  duplicado?: boolean
  inconsistente?: boolean
  inconsistencias?: string[]
  revisado?: boolean
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8)
}

const sample: ComprobanteIVA[] = []
// generate 20 mock entries
;(function seed(){
  if (sample.length) return
  const cuit1 = '20-12345678-9'
  const cuit2 = '30-98765432-1'
  for (let i=0;i<20;i++){
    const tipo = i%5===0? 'A' : i%5===1? 'B' : 'C'
    const cuit = i%3===0? cuit1 : cuit2
    const neto = 1000 + i*50
    const iva21 = tipo==='C'? 0 : Math.round(neto*0.21)
    const total = neto + iva21
    sample.push({
      id: genId(), fecha: `2025-11-${String((i%28)+1).padStart(2,'0')}`, tipo, puntoVenta: '0001', numero: String(1000+i).padStart(8,'0'), cuit, razonSocial: tipo==='A'?'MASCULLINO ANDRES JUAN':'COMERCIAL SRL', neto, iva21, iva105:0, percepciones:0, total, cae: i%7===0? 'CAE'+(1000+i): undefined, caeVencimiento: i%7===0? `2025-12-${String((i%28)+1).padStart(2,'0')}`: undefined, origen: 'mock'
    })
  }
  // make two duplicates
  if (sample[2]){ sample[2].duplicado = true; sample[3].duplicado = true }
  // make some inconsistencies
  if (sample[5]){ sample[5].inconsistente = true; sample[5].inconsistencias = ['IVA aplicado incorrecto'] }
  if (sample[8]){ sample[8].inconsistente = true; sample[8].inconsistencias = ['Total no coincide'] }
})()

export default sample
