import { ReciboSueldo } from '../types/reciboSueldo'

export const sueldosMock: ReciboSueldo[] = [
  {
    id: 'r_1',
    empleado: { nombre: 'Juan', apellido: 'Pérez', cuil: '20-12345678-1', categoria: 'A', fechaIngreso: '2020-03-01' },
    empleador: { razonSocial: 'Empresa Demo SRL', cuit: '30-87654321-0', direccion: 'Gral Güemes 100', actividad: 'Servicios' },
    periodo: { mes: 'Noviembre', año: 2025 },
    conceptos: [
      { codigo: '001', descripcion: 'Básico', haberes: 100000, deducciones: 0 },
      { codigo: '101', descripcion: 'Antigüedad', haberes: 5000, deducciones: 0 },
      { codigo: '900', descripcion: 'Jubilación', haberes: 0, deducciones: 11000 }
    ],
    totales: { totalHaberes: 105000, totalDeducciones: 11000, totalNoRemunerativo: 0, neto: 94000 },
    archivoOriginalUrl: '',
    observaciones: [],
    fechaCarga: new Date().toISOString(),
    origen: 'manual'
  }
]

export default sueldosMock
