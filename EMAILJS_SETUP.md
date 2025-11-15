# 📧 Integración de EmailJS - Lista de Espera

## Resumen

Se ha implementado un sistema completo de emails para la lista de espera usando **EmailJS**.

### ✨ Funcionalidades

1. **Email al usuario** - Confirmación de registro con diseño profesional
2. **Email al admin** - Notificación a `lucasromanh@gmail.com` con los datos del registro
3. **HTML personalizado** - Templates responsive con gradientes y branding

---

## 🚀 Configuración (Paso a paso)

### 1️⃣ Crear cuenta en EmailJS

Visitá https://www.emailjs.com/ y registrate (plan gratuito: 200 emails/mes)

### 2️⃣ Configurar Email Service

1. En el dashboard, andá a **"Email Services"**
2. Click en **"Add New Service"**
3. Seleccioná **Gmail** (recomendado)
4. Conectá tu cuenta de Gmail
5. Copiá el **SERVICE_ID** generado (ej: `service_abc123`)

### 3️⃣ Crear Template para USUARIO

1. Andá a **"Email Templates"**
2. Click **"Create New Template"**
3. Configurá:
   - **Template Name:** `Confirmacion Lista Espera Usuario`
   - **Subject:** `¡Bienvenido a la lista de espera de Cont(iA)dor! 🎉`
4. En la pestaña **"Settings"**:

   - **To Email:** `{{to_email}}`
   - **From Name:** `Cont(iA)dor`
   - **Reply To:** `{{reply_to}}`

5. En la pestaña **"Content"**, cambiá a modo **HTML** y pegá:

```html
{{{html_content}}}
```

6. Guardá y copiá el **TEMPLATE_ID** (ej: `template_user123`)

### 4️⃣ Crear Template para ADMIN

1. Repetí el proceso anterior
2. Configurá:
   - **Template Name:** `Notificacion Admin Nuevo Registro`
   - **Subject:** `🔔 Nuevo registro en lista de espera`
3. En **Settings**:

   - **To Email:** `lucasromanh@gmail.com`
   - **From Name:** `Sistema Cont(iA)dor`

4. En **Content** (HTML):

```html
{{{html_content}}}
```

5. Guardá y copiá el **TEMPLATE_ID** (ej: `template_admin456`)

### 5️⃣ Obtener Public Key

1. Andá a **"Account"** > **"General"**
2. Copiá tu **"Public Key"** (ej: `AbCdEfGhIjKlMnOp`)

### 6️⃣ Configurar variables de entorno

1. Creá un archivo `.env` en la raíz del proyecto (si no existe)
2. Agregá estas líneas con tus credenciales reales:

```bash
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_USER=template_user123
VITE_EMAILJS_TEMPLATE_ADMIN=template_admin456
VITE_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOp
```

3. Guardá el archivo

### 7️⃣ Reiniciar servidor

```bash
npm run dev
```

---

## 🧪 Probar la integración

1. Abrí tu app en el navegador
2. Navegá a la página Home
3. Buscá la sección **"Lanzamiento Beta — Acceso anticipado"**
4. Llenó el formulario:
   - Nombre: Tu nombre
   - Email: Tu email real
   - Mensaje: (opcional) Sugerencias
   - ✅ Marcá "Quiero unirme a la lista de espera"
5. Click en **"Enviar"**

### ✅ Resultados esperados:

- Toast: "Enviando confirmación..."
- Toast: "¡Gracias! Revisa tu email para confirmar tu registro"
- **Email 1:** Confirmación al usuario con diseño profesional
- **Email 2:** Notificación a `lucasromanh@gmail.com` con los datos

---

## 📧 Diseño de los Emails

### Email al Usuario (Confirmación)

- **Header:** Gradiente violeta con logo
- **Título:** "¡Bienvenido a Cont(iA)dor! 🎉"
- **Contenido:**
  - Saludo personalizado con nombre
  - Explicación de qué es Cont(iA)dor
  - Si dejó mensaje, se muestra en un box amarillo
  - Lista de beneficios (acceso prioritario, precio especial, etc)
  - CTA button para explorar la app
- **Footer:** Links de contacto y copyright

### Email al Admin (Notificación)

- **Header:** Gradiente oscuro profesional
- **Título:** "🔔 Nuevo registro - Lista de espera"
- **Contenido:**
  - Tabla con datos del usuario (nombre, email, fecha)
  - Mensaje del usuario (si lo dejó)
  - Sugerencia de acción
- **Footer:** Nota de email automático

---

## 🎨 Características del HTML

- ✅ Responsive design
- ✅ Soporte dark mode en clientes de email
- ✅ Gradientes CSS modernos
- ✅ Emojis para mejor engagement
- ✅ Botones con hover effects
- ✅ Compatible con Gmail, Outlook, Apple Mail

---

## 🔧 Troubleshooting

### "Error al enviar email"

1. Verificá que las variables de entorno estén bien configuradas
2. Reiniciá el servidor (`npm run dev`)
3. Verificá en la consola del navegador si hay errores
4. Chequeá que los templates en EmailJS tengan `{{{html_content}}}`

### "Email no llega al usuario"

1. Revisá la carpeta de spam
2. Verificá que el **To Email** del template sea `{{to_email}}`
3. Chequeá que el Service esté conectado correctamente en EmailJS

### "Email no llega al admin"

1. Verificá que pusiste `lucasromanh@gmail.com` en el template de admin
2. Chequeá el límite de emails (200/mes en plan gratuito)
3. Revisá spam

---

## 📊 Límites del plan gratuito

- **200 emails/mes** gratis
- Si necesitás más: https://www.emailjs.com/pricing

---

## 🔐 Seguridad

- ✅ El `.env` está en `.gitignore` (no se sube a Git)
- ✅ Las credenciales están en variables de entorno
- ✅ EmailJS maneja la autenticación de forma segura

---

## 📝 Archivos modificados

1. **`src/services/emailService.ts`** - Servicio de emails
2. **`src/pages/Home/index.tsx`** - Integración en el formulario
3. **`.env.example`** - Template de configuración
4. **`package.json`** - Dependencia `@emailjs/browser`

---

## 💡 Próximos pasos

- [ ] Configurar EmailJS con tus credenciales
- [ ] Probar el envío de emails
- [ ] Personalizar los templates en EmailJS si querés
- [ ] Opcional: Agregar más campos al formulario
- [ ] Opcional: Integrar con un CRM (HubSpot, Mailchimp, etc)

---

¡Listo! 🎉 Ahora tenés un sistema completo de lista de espera con emails profesionales.
