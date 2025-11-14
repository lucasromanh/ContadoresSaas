import React, { useEffect, useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { toastSuccess, toastInfo } from '../../components/ui'
import perfilService from '../../services/perfilService'
import { PerfilContador } from '../../types/perfil'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const telefonoDigits = (s:string) => (s || '').replace(/[^0-9]/g,'').length

const perfilSchema = z.object({
  id: z.string(),
  nombreCompleto: z.string().min(3, 'Requerido'),
  dni: z.string().optional(),
  cuit: z.string().optional(),
  matricula: z.object({ numero: z.string().optional(), entidad: z.string().optional(), provincia: z.string().optional() }),
  estudio: z.object({ nombre: z.string().optional(), direccion: z.string().optional(), telefonoEstudio: z.string().optional(), emailEstudio: z.string().optional() }),
  datosFiscales: z.object({ condicionIVA: z.string(), actividadPrincipal: z.string().optional(), ingresosBrutosNumero: z.string().optional(), inicioActividad: z.string().optional() }),
  contacto: z.object({ emailPersonal: z.string().email().optional(), telefonoPersonal: z.string().optional(), recibirNotificacionesEn: z.enum(['email','whatsapp','sms','app']) }),
  avatarUrl: z.string().optional(),
  firmaDigitalUrl: z.string().optional(),
  descripcionProfesional: z.string().optional(),
  notificaciones: z.object({ vencimientos: z.boolean(), riesgoFiscal: z.boolean(), alertas: z.boolean(), clientes: z.boolean(), proveedores: z.boolean() })
})

type PerfilForm = z.infer<typeof perfilSchema>

export default function EditarPerfilModal({ open, onClose, onSaved }:{ open: boolean; onClose: ()=>void; onSaved?: (p:PerfilContador)=>void }){
  const [perfil, setPerfil] = useState<PerfilContador|null>(null)
  const [tab, setTab] = useState(0)

  const form = useForm<PerfilForm>({ resolver: zodResolver(perfilSchema), defaultValues: undefined as any })

  useEffect(()=>{ if (open) perfilService.getFresh().then(p=>{ setPerfil(p); form.reset(p as any) }) }, [open])

  const save = async (values: PerfilForm) => {
    // validate teléfono argentino minimal: digits between 10 and 13 (allow +54, country code etc.)
    const tel = values.contacto.telefonoPersonal || ''
    const digits = telefonoDigits(tel)
    if (values.contacto.telefonoPersonal && (digits < 10 || digits > 13)) {
      form.setError('contacto.telefonoPersonal' as any, { type: 'manual', message: 'Número inválido. Debe incluir código de país (opcional) y tener entre 10 y 13 dígitos.' } as any)
      return
    }
    const updated = await perfilService.update(values as any)
    if (onSaved && updated) onSaved(updated)
    onClose()
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={(v)=> !v && onClose()} title="Editar perfil">
      <div className="flex gap-4">
        <div className="w-56">
          <div className="space-y-1">
            <button className={`text-left px-2 py-2 rounded w-full ${tab===0? 'bg-slate-100 dark:bg-slate-700':''}`} onClick={()=>setTab(0)}>Datos personales</button>
            <button className={`text-left px-2 py-2 rounded w-full ${tab===1? 'bg-slate-100 dark:bg-slate-700':''}`} onClick={()=>setTab(1)}>Datos profesionales</button>
            <button className={`text-left px-2 py-2 rounded w-full ${tab===2? 'bg-slate-100 dark:bg-slate-700':''}`} onClick={()=>setTab(2)}>Estudio contable</button>
            <button className={`text-left px-2 py-2 rounded w-full ${tab===3? 'bg-slate-100 dark:bg-slate-700':''}`} onClick={()=>setTab(3)}>Datos fiscales</button>
            <button className={`text-left px-2 py-2 rounded w-full ${tab===4? 'bg-slate-100 dark:bg-slate-700':''}`} onClick={()=>setTab(4)}>Notificaciones</button>
            <button className={`text-left px-2 py-2 rounded w-full ${tab===5? 'bg-slate-100 dark:bg-slate-700':''}`} onClick={()=>setTab(5)}>Seguridad</button>
          </div>
        </div>
        <div className="flex-1">
          <form onSubmit={form.handleSubmit(save)} className="space-y-3">
            {tab===0 && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Nombre completo</label>
                  <Input {...form.register('nombreCompleto' as any)} />
                  {form.formState.errors.nombreCompleto && <div className="text-xs text-red-600">{(form.formState.errors.nombreCompleto as any).message}</div>}
                </div>
                <div>
                  <label className="text-xs">DNI</label>
                  <Input {...form.register('dni' as any)} />
                </div>
                <div>
                  <label className="text-xs">CUIT</label>
                  <Input {...form.register('cuit' as any)} />
                </div>
                <div>
                  <label className="text-xs">Email personal</label>
                  <Input {...form.register('contacto.emailPersonal' as any)} />
                </div>
                <div>
                  <label className="text-xs">Teléfono personal</label>
                  <Input {...form.register('contacto.telefonoPersonal' as any)} />
                  <div className="text-xs text-slate-500">Formato aceptado: +54 9 11 1234 5678 o 3811234567 (sin espacios). Dejar vacío si no desea recibir SMS/WhatsApp.</div>
                  {(form.formState.errors as any).contacto?.telefonoPersonal && <div className="text-xs text-red-600">{(form.formState.errors as any).contacto.telefonoPersonal.message}</div>}
                </div>
                <div>
                  <label className="text-xs">Recibir notificaciones en</label>
                  <select {...form.register('contacto.recibirNotificacionesEn' as any)} className="block border px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="app">App</option>
                  </select>
                </div>
              </div>
            )}

            {tab===1 && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Matrícula número</label>
                  <Input {...form.register('matricula.numero' as any)} />
                </div>
                <div>
                  <label className="text-xs">Entidad / Consejo</label>
                  <Input {...form.register('matricula.entidad' as any)} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs">Descripción profesional</label>
                  <textarea {...form.register('descripcionProfesional' as any)} className="block w-full border px-2 py-1 rounded bg-slate-100 dark:bg-slate-700" />
                </div>
              </div>
            )}

            {tab===2 && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Nombre del estudio</label>
                  <Input {...form.register('estudio.nombre' as any)} />
                </div>
                <div>
                  <label className="text-xs">Dirección</label>
                  <Input {...form.register('estudio.direccion' as any)} />
                </div>
                <div>
                  <label className="text-xs">Teléfono estudio</label>
                  <Input {...form.register('estudio.telefonoEstudio' as any)} />
                </div>
                <div>
                  <label className="text-xs">Email estudio</label>
                  <Input {...form.register('estudio.emailEstudio' as any)} />
                </div>
              </div>
            )}

            {tab===3 && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Condición frente al IVA</label>
                  <select {...form.register('datosFiscales.condicionIVA' as any)} className="block border px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">
                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                    <option value="Monotributista">Monotributista</option>
                    <option value="Exento">Exento</option>
                    <option value="Consumidor Final">Consumidor Final</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs">Actividad principal</label>
                  <Input {...form.register('datosFiscales.actividadPrincipal' as any)} />
                </div>
                <div>
                  <label className="text-xs">Ingresos Brutos</label>
                  <Input {...form.register('datosFiscales.ingresosBrutosNumero' as any)} />
                </div>
                <div>
                  <label className="text-xs">Inicio actividad</label>
                  <Input type="date" {...form.register('datosFiscales.inicioActividad' as any)} />
                </div>
              </div>
            )}

            {tab===4 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <label className="text-xs">Alertas</label>
                    <input type="checkbox" {...form.register('notificaciones.alertas' as any)} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs">Vencimientos</label>
                    <input type="checkbox" {...form.register('notificaciones.vencimientos' as any)} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs">Riesgo fiscal</label>
                    <input type="checkbox" {...form.register('notificaciones.riesgoFiscal' as any)} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs">Clientes</label>
                    <input type="checkbox" {...form.register('notificaciones.clientes' as any)} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs">Proveedores</label>
                    <input type="checkbox" {...form.register('notificaciones.proveedores' as any)} />
                  </div>
                </div>
              </div>
            )}

            {tab===5 && (
              <div className="space-y-2">
                <Button onClick={()=> toastSuccess('2FA simulado activado')}>Habilitar 2FA (simulado)</Button>
                <Button variant="ghost" onClick={()=> toastInfo('Cambiar contraseña (placeholder)')}>Cambiar contraseña</Button>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
