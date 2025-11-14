export interface PerfilContador {
  id: string
  nombreCompleto: string
  dni: string
  cuit: string
  matricula: {
    numero: string
    entidad: string
    provincia: string
  }
  estudio: {
    nombre: string
    direccion: string
    telefonoEstudio: string
    emailEstudio: string
  }
  datosFiscales: {
    condicionIVA: 'Responsable Inscripto' | 'Monotributista' | 'Exento' | 'Consumidor Final'
    actividadPrincipal: string
    ingresosBrutosNumero: string
    inicioActividad: string
  }
  contacto: {
    emailPersonal: string
    telefonoPersonal: string
    recibirNotificacionesEn: string
  }
  avatarUrl?: string
  firmaDigitalUrl?: string
  descripcionProfesional?: string
  notificaciones: {
    vencimientos: boolean
    riesgoFiscal: boolean
    alertas: boolean
    clientes: boolean
    proveedores: boolean
  }
}

export {}
