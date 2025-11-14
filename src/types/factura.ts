export type FacturaTipo = 'A' | 'B' | 'C'

export interface FacturaExtraida {
  tipo: FacturaTipo | string
  emisor: {
    razonSocial: string
    cuit: string
    domicilio?: string
    condicionIVA?: string
    ingresosBrutos?: string
    inicioActividades?: string
  }
  receptor: {
    razonSocial?: string
    cuit?: string
    domicilio?: string
    condicionIVA?: string
  }
  comprobante: {
    puntoVenta?: string
    numero?: string
    fechaEmision?: string
    cae?: string
    caeVencimiento?: string
  }
  items: {
    descripcion: string
    cantidad: number
    precioUnitario: number
    subtotal: number
  }[]
  totales: {
    subtotal?: number
    iva21?: number
    iva105?: number
    exento?: number
    total?: number
  }
}
