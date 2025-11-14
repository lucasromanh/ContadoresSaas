import React, { useEffect, useState } from 'react'
import perfilService from '../../services/perfilService'
import { PerfilContador } from '../../types/perfil'
import AvatarUploader from './AvatarUploader'
import FirmaUploader from './FirmaUploader'
import { Button } from '../../components/ui/Button'

export default function PerfilView({ onEdit }:{ onEdit?: ()=>void }){
  const [perfil, setPerfil] = useState<PerfilContador|null>(null)

  useEffect(()=>{ perfilService.getFresh().then(p=> setPerfil(p)) }, [])

  if (!perfil) return <div>Cargando perfil...</div>

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-6">
        <div className="w-48">
          <AvatarUploader value={perfil.avatarUrl} onChange={async (d)=>{ await perfilService.saveAvatar(d); setPerfil(await perfilService.getFresh()) }} />
          <div className="mt-4">
            <div className="text-xs text-slate-500">Firma digital</div>
            <FirmaUploader value={perfil.firmaDigitalUrl} onChange={async (d)=>{ await perfilService.saveFirma(d); setPerfil(await perfilService.getFresh()) }} />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{perfil.nombreCompleto}</h2>
          <div className="text-sm text-slate-600">Matrícula: {perfil.matricula.numero} — {perfil.matricula.entidad}</div>
          <div className="mt-3 space-y-2">
            <div><strong>Actividad:</strong> {perfil.datosFiscales.actividadPrincipal}</div>
            <div><strong>Condición IVA:</strong> {perfil.datosFiscales.condicionIVA}</div>
            <div><strong>Inicio de actividades:</strong> {perfil.datosFiscales.inicioActividad}</div>
            <div><strong>Estudio:</strong> {perfil.estudio.nombre} — {perfil.estudio.direccion} — {perfil.estudio.telefonoEstudio}</div>
            <div><strong>Contacto:</strong> {perfil.contacto.emailPersonal} • {perfil.contacto.telefonoPersonal}</div>
          </div>
          <div className="mt-4">
            <Button onClick={onEdit}>Editar perfil</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
