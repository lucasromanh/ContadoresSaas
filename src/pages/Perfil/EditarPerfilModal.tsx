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
      <div className="flex flex-col md:flex-row gap-4">
        {/* Tabs - Horizontal en móvil, vertical en desktop */}
        <div className="w-full md:w-56">
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1 md:space-y-1 pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0">
            <button className={`flex-shrink-0 text-left px-3 md:px-2 py-2 rounded text-sm whitespace-nowrap ${tab===0? 'bg-slate-100 dark:bg-slate-700 font-medium':'text-slate-600 dark:text-slate-400'}`} onClick={()=>setTab(0)}>📋 Personales</button>
            <button className={`flex-shrink-0 text-left px-3 md:px-2 py-2 rounded text-sm whitespace-nowrap ${tab===1? 'bg-slate-100 dark:bg-slate-700 font-medium':'text-slate-600 dark:text-slate-400'}`} onClick={()=>setTab(1)}>👔 Profesionales</button>
            <button className={`flex-shrink-0 text-left px-3 md:px-2 py-2 rounded text-sm whitespace-nowrap ${tab===2? 'bg-slate-100 dark:bg-slate-700 font-medium':'text-slate-600 dark:text-slate-400'}`} onClick={()=>setTab(2)}>🏢 Estudio</button>
            <button className={`flex-shrink-0 text-left px-3 md:px-2 py-2 rounded text-sm whitespace-nowrap ${tab===3? 'bg-slate-100 dark:bg-slate-700 font-medium':'text-slate-600 dark:text-slate-400'}`} onClick={()=>setTab(3)}>💼 Fiscales</button>
            <button className={`flex-shrink-0 text-left px-3 md:px-2 py-2 rounded text-sm whitespace-nowrap ${tab===4? 'bg-slate-100 dark:bg-slate-700 font-medium':'text-slate-600 dark:text-slate-400'}`} onClick={()=>setTab(4)}>🔔 Alertas</button>
            <button className={`flex-shrink-0 text-left px-3 md:px-2 py-2 rounded text-sm whitespace-nowrap ${tab===5? 'bg-slate-100 dark:bg-slate-700 font-medium':'text-slate-600 dark:text-slate-400'}`} onClick={()=>setTab(5)}>🔒 Seguridad</button>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <form onSubmit={form.handleSubmit(save)} className="space-y-3">
            {tab===0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1">Nombre completo *</label>
                  <Input {...form.register('nombreCompleto' as any)} className="w-full" />
                  {form.formState.errors.nombreCompleto && <div className="text-xs text-red-600 mt-1">{(form.formState.errors.nombreCompleto as any).message}</div>}
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">DNI</label>
                  <Input {...form.register('dni' as any)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">CUIT</label>
                  <Input {...form.register('cuit' as any)} className="w-full" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1">Email personal</label>
                  <Input {...form.register('contacto.emailPersonal' as any)} type="email" className="w-full" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1">Teléfono personal</label>
                  <Input {...form.register('contacto.telefonoPersonal' as any)} type="tel" className="w-full" placeholder="+54 9 11 1234 5678" />
                  <div className="text-xs text-slate-500 mt-1">Formato: +54 9 área número (sin espacios)</div>
                  {(form.formState.errors as any).contacto?.telefonoPersonal && <div className="text-xs text-red-600 mt-1">{(form.formState.errors as any).contacto.telefonoPersonal.message}</div>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1">Recibir notificaciones en</label>
                  <select {...form.register('contacto.recibirNotificacionesEn' as any)} className="w-full border px-3 py-2 rounded bg-white dark:bg-slate-800 text-sm">
                    <option value="email">📧 Email</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="sms">📱 SMS</option>
                    <option value="app">📲 App</option>
                  </select>
                </div>
              </div>
            )}

            {tab===1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1">Matrícula número</label>
                  <Input {...form.register('matricula.numero' as any)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Entidad / Consejo</label>
                  <Input {...form.register('matricula.entidad' as any)} className="w-full" placeholder="Ej: CPCE Salta" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1">Descripción profesional</label>
                  <textarea 
                    {...form.register('descripcionProfesional' as any)} 
                    className="w-full border px-3 py-2 rounded bg-white dark:bg-slate-800 text-sm min-h-[100px]"
                    placeholder="Describe tu experiencia y especialidades..."
                  />
                </div>
              </div>
            )}

            {tab===2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1">Nombre del estudio</label>
                  <Input {...form.register('estudio.nombre' as any)} className="w-full" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1">Dirección</label>
                  <Input {...form.register('estudio.direccion' as any)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Teléfono estudio</label>
                  <Input {...form.register('estudio.telefonoEstudio' as any)} type="tel" className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Email estudio</label>
                  <Input {...form.register('estudio.emailEstudio' as any)} type="email" className="w-full" />
                </div>
              </div>
            )}

            {tab===3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1">Condición frente al IVA</label>
                  <select {...form.register('datosFiscales.condicionIVA' as any)} className="w-full border px-3 py-2 rounded bg-white dark:bg-slate-800 text-sm">
                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                    <option value="Monotributista">Monotributista</option>
                    <option value="Exento">Exento</option>
                    <option value="Consumidor Final">Consumidor Final</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium block mb-1">Actividad principal</label>
                  <Input {...form.register('datosFiscales.actividadPrincipal' as any)} className="w-full" placeholder="Ej: Servicios contables" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Ingresos Brutos</label>
                  <Input {...form.register('datosFiscales.ingresosBrutosNumero' as any)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Inicio actividad</label>
                  <Input type="date" {...form.register('datosFiscales.inicioActividad' as any)} className="w-full" />
                </div>
              </div>
            )}

            {tab===4 && (
              <div className="space-y-3">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Selecciona qué notificaciones deseas recibir:
                </div>
                <div className="flex items-center gap-3 p-3 border rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input 
                    type="checkbox" 
                    {...form.register('notificaciones.alertas' as any)} 
                    className="w-4 h-4"
                    id="notif-alertas"
                  />
                  <label htmlFor="notif-alertas" className="text-sm flex-1 cursor-pointer">
                    <div className="font-medium">Alertas</div>
                    <div className="text-xs text-slate-500">Alertas importantes del sistema</div>
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input 
                    type="checkbox" 
                    {...form.register('notificaciones.vencimientos' as any)} 
                    className="w-4 h-4"
                    id="notif-vencimientos"
                  />
                  <label htmlFor="notif-vencimientos" className="text-sm flex-1 cursor-pointer">
                    <div className="font-medium">Vencimientos</div>
                    <div className="text-xs text-slate-500">Recordatorios de fechas de vencimiento</div>
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input 
                    type="checkbox" 
                    {...form.register('notificaciones.riesgoFiscal' as any)} 
                    className="w-4 h-4"
                    id="notif-riesgo"
                  />
                  <label htmlFor="notif-riesgo" className="text-sm flex-1 cursor-pointer">
                    <div className="font-medium">Riesgo fiscal</div>
                    <div className="text-xs text-slate-500">Alertas de riesgo fiscal detectado</div>
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input 
                    type="checkbox" 
                    {...form.register('notificaciones.clientes' as any)} 
                    className="w-4 h-4"
                    id="notif-clientes"
                  />
                  <label htmlFor="notif-clientes" className="text-sm flex-1 cursor-pointer">
                    <div className="font-medium">Clientes</div>
                    <div className="text-xs text-slate-500">Actualizaciones de clientes</div>
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input 
                    type="checkbox" 
                    {...form.register('notificaciones.proveedores' as any)} 
                    className="w-4 h-4"
                    id="notif-proveedores"
                  />
                  <label htmlFor="notif-proveedores" className="text-sm flex-1 cursor-pointer">
                    <div className="font-medium">Proveedores</div>
                    <div className="text-xs text-slate-500">Actualizaciones de proveedores</div>
                  </label>
                </div>
              </div>
            )}

            {tab===5 && (
              <div className="space-y-3">
                <div className="p-4 border rounded bg-slate-50 dark:bg-slate-800">
                  <h4 className="text-sm font-medium mb-2">Autenticación de dos factores</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Agrega una capa extra de seguridad a tu cuenta
                  </p>
                  <Button onClick={()=> toastSuccess('2FA simulado activado')} className="w-full sm:w-auto">
                    Habilitar 2FA
                  </Button>
                </div>
                <div className="p-4 border rounded bg-slate-50 dark:bg-slate-800">
                  <h4 className="text-sm font-medium mb-2">Contraseña</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Actualiza tu contraseña regularmente
                  </p>
                  <Button variant="outline" onClick={()=> toastInfo('Cambiar contraseña (placeholder)')} className="w-full sm:w-auto">
                    Cambiar contraseña
                  </Button>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-4 mt-6 border-t flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={onClose} type="button" className="w-full sm:w-auto">Cancelar</Button>
              <Button type="submit" className="w-full sm:w-auto">Guardar cambios</Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
