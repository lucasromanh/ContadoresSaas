import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { toastSuccess, toastError } from '../../components/ui'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/useUserStore'
import useAppStore from '../../store/useAppStore'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { CheckCircle, FileText, Users, BarChart, ShieldCheck, BookOpen, Folder, UserCheck, Smartphone } from 'lucide-react'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const login = useUserStore((s) => s.login)
  const setBackendOnline = useAppStore((s) => s.setBackendOnline)
  const [previewLoaded, setPreviewLoaded] = useState<boolean | null>(null)

  const handleDemo = () => {
    // Use mock mode and sign in as demo user
    setBackendOnline(false)
    login({ id: 'demo', name: 'Demo User', role: 'contador' })
    navigate('/')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <header className="w-full border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-semibold text-primary">Cont(iA)dor</div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/login')}>Iniciar sesión</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Cont(iA)dor <br /> asistente contable inteligente</h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">Automatiza la carga de comprobantes con OCR, gestiona libros IVA, procesa recibos de sueldo y visualiza reportes claros. Diseñado para contadores y pymes que quieren ahorrar tiempo y evitar errores.</p>

              <div className="flex gap-3 mb-6">
                <Button onClick={handleLogin}>Iniciar sesión real</Button>
                <Button variant="ghost" onClick={handleDemo}>Probar demo</Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="p-4 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <div>
                    <div className="font-semibold">Validación automática</div>
                    <div className="text-sm text-slate-500">Reglas y alertas para detectar inconsistencias y reducir errores contables.</div>
                  </div>
                </Card>

                <Card className="p-4 flex items-start gap-3">
                  <FileText className="w-6 h-6 text-sky-500" />
                  <div>
                    <div className="font-semibold">OCR de comprobantes</div>
                    <div className="text-sm text-slate-500">Extrae datos de facturas y recibos desde imágenes o PDFs con alta tolerancia a ruido.</div>
                  </div>
                </Card>

                <Card className="p-4 flex items-start gap-3">
                  <Users className="w-6 h-6 text-amber-500" />
                  <div>
                    <div className="font-semibold">Sueldos y liquidaciones</div>
                    <div className="text-sm text-slate-500">Procesa recibos, clasifica conceptos y prepara datos para guardar o exportar.</div>
                  </div>
                </Card>

                <Card className="p-4 flex items-start gap-3">
                  <BarChart className="w-6 h-6 text-violet-500" />
                  <div>
                    <div className="font-semibold">Dashboards y reportes</div>
                    <div className="text-sm text-slate-500">Visualizaciones y alertas para prioridades fiscales y de cobranza.</div>
                  </div>
                </Card>
              </div>
            </div>

            <div>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">Vista previa</div>
                  <div className="text-xs text-slate-500">Modo demo disponible</div>
                </div>
                <div className="mb-3 text-sm text-slate-600 dark:text-slate-300">Explora el dashboard con datos de ejemplo. Puedes exportar o probar procesos sin conectar tu API.</div>

                <div className="w-full h-56 bg-slate-50 dark:bg-slate-900 rounded-md overflow-hidden border dark:border-slate-800 flex items-center justify-center">
                  {/* Replace /assets/home-preview.png with the attached image file. If you want, drop the screenshot at public/assets/home-preview.png */}
                  <img
                    src="/assets/home-preview.png"
                    alt="Vista previa dashboard"
                    className="w-full h-full object-cover"
                    style={{ display: previewLoaded === false ? 'none' : undefined }}
                    onLoad={() => setPreviewLoaded(true)}
                    onError={() => setPreviewLoaded(false)}
                  />
                  {/* Fallback only when image failed to load */}
                  {previewLoaded === false && <FallbackPreview />}
                </div>

                <div className="mt-3 text-xs text-slate-500">Si no ves la imagen, añade el archivo <code>/public/assets/home-preview.png</code> con la captura del dashboard que proporcionaste.</div>
              </Card>
            </div>
          </div>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Cómo funciona</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4">
                <div className="font-semibold mb-2">1. Subí comprobantes</div>
                <div className="text-sm text-slate-500">Carga imágenes o PDFs en el lector de facturas o el módulo de sueldos.</div>
              </Card>
              <Card className="p-4">
                <div className="font-semibold mb-2">2. Revisión automática</div>
                <div className="text-sm text-slate-500">El sistema extrae, normaliza y valida datos, clasificando posibles errores.</div>
              </Card>
              <Card className="p-4">
                <div className="font-semibold mb-2">3. Guardá o exportá</div>
                <div className="text-sm text-slate-500">Confirmá y guardá en libros IVA o exportá datos a tu contabilidad.</div>
              </Card>
            </div>
          </section>

          <section className="mt-10">
            <Card className="p-4 bg-gradient-to-r from-violet-900 to-blue-900 text-white">
              <h3 className="text-lg font-semibold mb-2">Lanzamiento Beta — Acceso anticipado</h3>
              <p className="text-sm text-white/90 mb-4">Estamos armando un programa de acceso anticipado para contadores: sumate y ayudanos a prioritizar nuevas funcionalidades pensadas por y para profesionales contables.</p>

              <div className="border-t border-white/20 pt-4">
                <div className="mb-3 text-sm font-medium">Sumate a la lista de espera y contanos qué te gustaría que agreguemos</div>
                <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Nombre y apellido" id="wait_name" />
                    <Input placeholder="Email (ej: juan@ejemplo.com)" id="wait_email" />
                  </div>
                  <textarea id="wait_message" placeholder="Ejemplos: conciliación bancaria automática, conciliador de pagos con bancos, workflows de aprobación para recibos, plantillas de reportes PDF, auditoría y logs por usuario" className="w-full p-2 border rounded text-sm bg-white/90 text-black" rows={4} />
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="wait_join" />
                    <label htmlFor="wait_join" className="text-sm">Quiero unirme a la lista de espera</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => {
                      try{
                        const nameEl = document.getElementById('wait_name') as HTMLInputElement | null
                        const emailEl = document.getElementById('wait_email') as HTMLInputElement | null
                        const msgEl = document.getElementById('wait_message') as HTMLTextAreaElement | null
                        const joinEl = document.getElementById('wait_join') as HTMLInputElement | null
                        const name = nameEl?.value?.trim() || ''
                        const email = emailEl?.value?.trim() || ''
                        const message = msgEl?.value?.trim() || ''
                        const join = !!(joinEl && joinEl.checked)
                        // basic validation for email
                        const emailRx = /^\S+@\S+\.\S+$/
                        if (email && !emailRx.test(email)) return toastError('Ingresá un email válido')
                        if (!name && !email && !message) return toastError('Completá al menos un campo para sumarte o contarnos algo')
                        const item = { id: 'w_' + Date.now().toString(36), nombre: name, email, mensaje: message, join, createdAt: new Date().toISOString() }
                        const raw = localStorage.getItem('waitlist_v1')
                        const arr = raw ? JSON.parse(raw) : []
                        arr.push(item)
                        localStorage.setItem('waitlist_v1', JSON.stringify(arr))
                        // clear form
                        if (nameEl) nameEl.value = ''
                        if (emailEl) emailEl.value = ''
                        if (msgEl) msgEl.value = ''
                        if (joinEl) joinEl.checked = false
                        toastSuccess('Gracias — te agregamos a la lista de espera')
                      }catch(e){ console.error(e); toastError('No se pudo guardar la solicitud en este navegador') }
                    }}>Enviar</Button>
                    <Button variant="outline" onClick={() => { const raw = localStorage.getItem('waitlist_v1') || '[]'; try{ navigator.clipboard?.writeText(raw); toastSuccess('Contenido copiado al portapapeles') }catch(e){ toastError('No se pudo copiar') } }}>Copiar datos (dev)</Button>
                  </div>
                </form>
              </div>
            </Card>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Características avanzadas</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Módulos pensados para mitigar riesgos, mantener la trazabilidad documental y facilitar la comunicación entre contador y cliente.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="font-semibold">Riesgo fiscal y alertas</div>
                    <div className="text-sm text-slate-500">Alertas automáticas, indicadores de riesgo y recomendaciones para priorizar acciones fiscales.</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-6 h-6 text-emerald-500" />
                  <div>
                    <div className="font-semibold">Libros IVA automáticos</div>
                    <div className="text-sm text-slate-500">Generación y conciliación de libros IVA a partir de facturas validadas; exportables y revisables.</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Folder className="w-6 h-6 text-sky-500" />
                  <div>
                    <div className="font-semibold">Carpeta documental</div>
                    <div className="text-sm text-slate-500">Adjunta y organiza comprobantes por cliente, periodo y tipo; controla versiones y accesos.</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <UserCheck className="w-6 h-6 text-amber-500" />
                  <div>
                    <div className="font-semibold">Perfil del contador</div>
                    <div className="text-sm text-slate-500">Registra matrícula profesional, firma digital y permisos. Ideal para comprobantes oficiales y firmas de informes.</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="font-semibold">Notificaciones por WhatsApp</div>
                    <div className="text-sm text-slate-500">Envía avisos automáticos al cliente y al contador (nuevos comprobantes, vencimientos, alertas críticas).</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <BarChart className="w-6 h-6 text-violet-500" />
                  <div>
                    <div className="font-semibold">Integraciones y API</div>
                    <div className="text-sm text-slate-500">Conecta con sistemas de gestión, exporta datos y automatiza flujos mediante nuestra API (Acceso Limitado).</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
              <p className="mb-2">Casos de uso: gestión de percepciones y retenciones, conciliación automática de libros, envío de reportes periódicos a clientes y cumplimiento de obligaciones.</p>
              <p>Si querés, puedo configurar la notificación por WhatsApp y la firma digital para tu entorno; contactame en <a href="mailto:lucas@saltacoders.com" className="text-blue-600 hover:underline">lucas@saltacoders.com</a>.</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <div>© 2025 Lucas Roman — Software Developer, Salta, Argentina</div>
          <div className="mt-2 md:mt-0">Contacto: <a href="mailto:lucas@saltacoders.com" className="text-blue-600 hover:underline">lucas@saltacoders.com</a></div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

const FallbackPreview: React.FC = () => {
  return (
    <div className="p-4 text-center">
      <div className="text-sm font-semibold mb-2">Preview no disponible</div>
      <div className="text-xs text-slate-500 mb-3">Coloca <code>/public/assets/home-preview.png</code> para ver la captura aquí</div>
      <div className="inline-block rounded bg-slate-100 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-200">
        <svg width="160" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="90" rx="6" fill="#0f172a" />
          <circle cx="20" cy="22" r="6" fill="#06b6d4" />
          <rect x="36" y="18" width="90" height="6" rx="2" fill="#94a3b8" />
          <rect x="12" y="36" width="136" height="36" rx="3" fill="#0b1220" />
        </svg>
      </div>
    </div>
  )
}
