import { Vencimiento } from '../services/vencimientosService'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }

const today = new Date()

function offsetDays(days: number){ const d = new Date(today); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10) }

const sample: Vencimiento[] = [
  { id: genId(), cliente: 'MASCULLINO ANDRES JUAN', cuit: '20-12345678-9', tipo: 'ARCA', descripcion: 'IVA mensual', fecha: offsetDays(3), organismo: 'AFIP/ARCA', provincia: 'CABA', estado: 'pendiente', criticidad: 'media' },
  { id: genId(), cliente: 'COMERCIAL SRL', cuit: '30-98765432-1', tipo: 'IIBB_LOCAL', descripcion: 'IIBB mensual', fecha: offsetDays(7), organismo: 'Rentas PBA', provincia: 'Buenos Aires', estado: 'pendiente', criticidad: 'baja' },
  { id: genId(), cliente: 'MASCULLINO ANDRES JUAN', cuit: '20-12345678-9', tipo: 'MONOTRIBUTO', descripcion: 'Monotributo mensual', fecha: offsetDays(-1), organismo: 'AFIP', provincia: 'CABA', estado: 'vencido', criticidad: 'alta' },
  { id: genId(), cliente: 'INDUSTRIA SA', cuit: '30-11122333-5', tipo: 'MUNICIPAL', descripcion: 'TGI', fecha: offsetDays(10), organismo: 'Municipalidad', provincia: 'CABA', estado: 'pendiente', criticidad: 'baja' },
  { id: genId(), cliente: 'FARMACIA ABC', cuit: '27-55544433-2', tipo: 'SUSS', descripcion: 'SUSS cuota', fecha: offsetDays(0), organismo: 'ANSES', provincia: 'CABA', estado: 'pendiente', criticidad: 'media' },
  { id: genId(), cliente: 'TRANSPORTES SRL', cuit: '30-22233344-6', tipo: 'RETENCIONES', descripcion: 'Retención IVA', fecha: offsetDays(2), organismo: 'AFIP', provincia: 'Cordoba', estado: 'pendiente', criticidad: 'media' },
  { id: genId(), cliente: 'ALIMENTOS S.A.', cuit: '30-33344455-7', tipo: 'ESPECIAL', descripcion: 'Vencimiento Cámara', fecha: offsetDays(5), organismo: 'Camara', provincia: 'Santa Fe', estado: 'pendiente', criticidad: 'media' },
  { id: genId(), cliente: 'AUTONOMO P', cuit: '20-99988877-6', tipo: 'AUTONOMOS', descripcion: 'Aporte Autónomos', fecha: offsetDays(15), organismo: 'AFIP', provincia: 'Mendoza', estado: 'pendiente', criticidad: 'baja' }
]

export default sample
