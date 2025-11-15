import React, { useEffect, useState } from 'react'
import perfilService from '../../services/perfilService'
import { PerfilContador } from '../../types/perfil'
import AvatarUploader from './AvatarUploader'
import FirmaUploader from './FirmaUploader'
import { Button } from '../../components/ui/Button'

export default function PerfilView({ onEdit }:{ onEdit?: ()=>void }){
  const [perfil, setPerfil] = useState<PerfilContador|null>(null)

  const loadPerfil = async () => {
    const p = await perfilService.getFresh()
    setPerfil(p)
  }

  useEffect(()=>{ 
    loadPerfil()
    const handler = () => loadPerfil()
    try { perfilService.emitter.addEventListener('change', handler) } catch(e) {}
    return () => {
      try { perfilService.emitter.removeEventListener('change', handler) } catch(e) {}
    }
  }, [])

  if (!perfil) return <div>Cargando perfil...</div>

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-48">
          <AvatarUploader 
            value={perfil.avatarUrl} 
            onChange={async (d)=> { 
              await perfilService.saveAvatar(d)
            }} 
          />
          <div className="mt-4">
            <div className="text-xs text-slate-500 mb-2">Firma digital</div>
            <FirmaUploader 
              value={perfil.firmaDigitalUrl} 
              onChange={async (d)=> { 
                await perfilService.saveFirma(d)
              }} 
            />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold break-words">{perfil.nombreCompleto}</h2>
          <div className="text-sm text-slate-600 break-words">Matrícula: {perfil.matricula.numero} — {perfil.matricula.entidad}</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="break-words"><strong>Actividad:</strong> {perfil.datosFiscales.actividadPrincipal}</div>
            <div className="break-words"><strong>Condición IVA:</strong> {perfil.datosFiscales.condicionIVA}</div>
            <div className="break-words"><strong>Inicio de actividades:</strong> {perfil.datosFiscales.inicioActividad}</div>
            <div className="break-words"><strong>Estudio:</strong> {perfil.estudio.nombre} — {perfil.estudio.direccion} — {perfil.estudio.telefonoEstudio}</div>
            <div className="break-words"><strong>Contacto:</strong> {perfil.contacto.emailPersonal} • {perfil.contacto.telefonoPersonal}</div>
          </div>
          <div className="mt-4">
            <Button onClick={onEdit}>Editar perfil</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
