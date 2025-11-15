import emailjs from '@emailjs/browser'

// Configuración de EmailJS
// Public Key: ZLVVgCsKO48IA_gZF (con I mayúscula)
// Private Key: icJjuhWf-flpbg88jMl-3
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_d8fgn9m'
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_3tslb2i'
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'ZLVVgCsKO48IA_gZF'
const EMAILJS_PRIVATE_KEY = import.meta.env.VITE_EMAILJS_PRIVATE_KEY || 'icJjuhWf-flpbg88jMl-3'

// Inicializar EmailJS con la Public Key según la documentación oficial
emailjs.init({
  publicKey: EMAILJS_PUBLIC_KEY,
  blockHeadless: true,
  limitRate: {
    id: 'app',
    throttle: 10000, // 1 request cada 10 segundos
  },
})

interface WaitlistData {
  nombre: string
  email: string
  mensaje?: string
}

/**
 * Envía email de confirmación al usuario con CC a lucasromanh@gmail.com
 */
export const enviarEmailListaEspera = async (data: WaitlistData): Promise<boolean> => {
  try {
    console.log('📧 Enviando email con:', {
      service: EMAILJS_SERVICE_ID,
      template: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY,
      hasPrivateKey: !!EMAILJS_PRIVATE_KEY
    })

    const templateParams: any = {
      // Datos del destinatario
      to_email: data.email,
      to_name: data.nombre,
      
      // CC siempre a Lucas
      cc_email: 'lucasromanh@gmail.com',
      
      // Datos del remitente
      from_name: 'Cont(iA)dor',
      reply_to: 'lucasromanh@gmail.com',
      
      // Contenido
      user_name: data.nombre,
      user_email: data.email,
      user_message: data.mensaje || 'Sin mensaje adicional',
      registered_date: new Date().toLocaleString('es-AR', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      }),
      
      // HTML personalizado
      html_content: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f7; }
              .container { max-width: 600px; margin: 0 auto; background: white; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
              .content { padding: 40px 30px; }
              .welcome-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
              .feature-list { list-style: none; padding: 0; margin: 20px 0; }
              .feature-list li { padding: 12px 0; padding-left: 30px; position: relative; }
              .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 18px; }
              .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #e9ecef; }
              .message-box { background: #fff9e6; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 ¡Bienvenido a Cont(iA)dor!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Tu asistente contable inteligente</p>
              </div>
              
              <div class="content">
                <h2 style="color: #667eea; margin-top: 0;">¡Hola ${data.nombre}! 👋</h2>
                
                <p style="font-size: 16px; line-height: 1.8;">
                  Muchas gracias por unirte a nuestra <strong>lista de espera</strong>. Estamos muy emocionados de tenerte con nosotros en esta etapa tan importante.
                </p>

                <div class="welcome-box">
                  <h3 style="margin-top: 0; color: #667eea;">✨ ¿Qué es Cont(iA)dor?</h3>
                  <p style="margin-bottom: 0;">
                    Es la primera plataforma contable potenciada con Inteligencia Artificial diseñada específicamente para contadores argentinos. 
                    Automatizamos tareas repetitivas para que puedas enfocarte en lo que realmente importa: asesorar a tus clientes.
                  </p>
                </div>

                ${data.mensaje ? `
                  <div class="message-box">
                    <h4 style="margin-top: 0; color: #f57c00;">📝 Tu mensaje:</h4>
                    <p style="font-style: italic; margin-bottom: 0;">"${data.mensaje}"</p>
                    <p style="font-size: 14px; color: #666; margin-top: 10px; margin-bottom: 0;">
                      ¡Tomamos nota! Tus ideas nos ayudan a construir la mejor herramienta para vos.
                    </p>
                  </div>
                ` : ''}

                <h3 style="color: #667eea;">🚀 Próximos pasos:</h3>
                <ul class="feature-list">
                  <li><strong>Acceso prioritario:</strong> Serás de los primeros en probar nuevas funcionalidades</li>
                  <li><strong>Precio especial:</strong> Descuentos exclusivos para early adopters</li>
                  <li><strong>Tu voz cuenta:</strong> Influí directamente en las próximas features</li>
                  <li><strong>Soporte dedicado:</strong> Ayuda personalizada durante el beta</li>
                </ul>

                <p style="font-size: 16px; margin-top: 30px;">
                  Te mantendremos al tanto de nuestro progreso y te avisaremos apenas tengamos novedades.
                </p>

                <div style="text-align: center; margin: 40px 0;">
                  <p style="color: #667eea; font-weight: 600; margin: 0;">¡Nos vemos pronto! 🚀</p>
                </div>
              </div>

              <div class="footer">
                <p style="margin: 10px 0; font-weight: 600; color: #333;">Cont(iA)dor</p>
                <p style="margin: 5px 0;">Tu asistente contable con inteligencia artificial</p>
                
                <div style="margin: 20px 0;">
                  <a href="mailto:lucasromanh@gmail.com" style="color: #667eea; text-decoration: none;">✉️ Contacto</a>
                </div>

                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  © ${new Date().getFullYear()} Cont(iA)dor. Todos los derechos reservados.
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 10px;">
                  Recibiste este email porque te registraste en nuestra lista de espera.<br>
                  Si no fuiste vos, simplemente ignorá este mensaje.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    }

    // Agregar accessToken (Private Key) si está disponible
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { ...templateParams, accessToken: EMAILJS_PRIVATE_KEY }
    )

    console.log('✅ Email enviado exitosamente:', response)
    return true
  } catch (error: any) {
    console.error('❌ Error enviando email:', error)
    console.error('Detalles del error:', {
      status: error?.status,
      text: error?.text,
      message: error?.message
    })
    return false
  }
}

export default {
  enviarEmailListaEspera
}
