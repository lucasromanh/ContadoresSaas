import { PerfilContador } from '../../../types/perfil'

export const perfilMock: PerfilContador = {
  id: '1',
  nombreCompleto: 'Rodolfo Martínez',
  dni: '30.234.123',
  cuit: '20-30234123-5',
  matricula: {
    numero: 'CPCE-5843',
    entidad: 'Consejo Profesional de Ciencias Económicas',
    provincia: 'Salta'
  },
  estudio: {
    nombre: 'Estudio Contable Martínez & Asociados',
    direccion: 'Gral. Güemes 450 - Salta Capital',
    telefonoEstudio: '387-421-2210',
    emailEstudio: 'contacto@estudiomartinez.com'
  },
  datosFiscales: {
    condicionIVA: 'Responsable Inscripto',
    actividadPrincipal: 'Servicios de contabilidad, auditoría y asesoría fiscal',
    ingresosBrutosNumero: '12345-6',
    inicioActividad: '2012-05-01'
  },
  contacto: {
    emailPersonal: 'r.martinez@gmail.com',
    telefonoPersonal: '+54 9 387 512 2334',
    recibirNotificacionesEn: 'whatsapp'
  },
  avatarUrl: '',
  firmaDigitalUrl: '',
  descripcionProfesional: 'Contador público con más de 12 años de experiencia...',
  notificaciones: {
    vencimientos: true,
    riesgoFiscal: true,
    alertas: true,
    clientes: true,
    proveedores: false
  }
}

export default perfilMock
