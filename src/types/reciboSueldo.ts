export interface ReciboSueldo {
  id: string
  empleado: {
    nombre: string
    apellido?: string
    cuil: string
    categoria?: string
    fechaIngreso?: string
  }
  empleador: {
    razonSocial: string
    cuit: string
    direccion?: string
    actividad?: string
  }
  periodo: {
    mes: string
    año: number
  }
  conceptos: Array<{
    codigo?: string
    descripcion: string
    haberes: number
    deducciones: number
    noRemunerativo?: number
  }>
  totales: {
    totalHaberes: number
    totalDeducciones: number
    totalNoRemunerativo: number
    neto: number
  }
  archivoOriginalUrl?: string
  observaciones?: string[]
  fechaCarga: string
  origen: 'manual' | 'ocr'
}

export type SueldoSummary = {
  id: string
  empleado: string
  cuil?: string
  periodoMes: string
  periodoAño: number
  totalHaberes: number
  totalDeducciones: number
  neto: number
  fechaCarga: string
}

export default ReciboSueldo
