# Configuración de WhatsApp Business API

Este proyecto incluye integración con WhatsApp Business Platform para enviar mensajes y documentos.

## Configuración

### 1. Crear una App de Facebook

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva app o usa una existente
3. Agrega el producto **WhatsApp Business Platform**

### 2. Obtener el Access Token

1. En tu app de Facebook, ve a **WhatsApp > Getting Started**
2. Copia tu **Access Token** (temporal de 24 horas) o genera uno permanente
3. Copia tu **Phone Number ID**

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_WHATSAPP_ACCESS_TOKEN=tu_access_token_aqui
```

### 4. Verificar el número de teléfono

El número `3874404472` ya está configurado en el servicio. Asegúrate de que:

- Esté registrado en tu cuenta de WhatsApp Business
- Tenga el estado "Connected" en el panel de Facebook
- Esté verificado con el código de 2FA

## Uso

### Enviar recibo de sueldo por WhatsApp

```typescript
import whatsappService from "./services/whatsappService";

// Enviar mensaje de texto
await whatsappService.sendTextMessage(
  "5493874404472",
  "Hola, este es un mensaje de prueba"
);

// Enviar recibo completo
await whatsappService.enviarReciboSueldo(
  "5493874404472",
  "Juan Pérez",
  "Diciembre 2024",
  "https://ejemplo.com/recibo.pdf"
);

// Enviar alerta de vencimiento
await whatsappService.enviarAlertaVencimiento(
  "5493874404472",
  "Pago de IIBB",
  "15/12/2024",
  50000
);
```

### Componente Modal

El componente `EnviarWhatsAppModal` ya está integrado en:

- **Sueldos**: Botón "Enviar por WhatsApp" en el detalle del recibo
- Puede integrarse en **Vencimientos** y **Alertas**

```tsx
<EnviarWhatsAppModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  tipo="recibo" // o "alerta" o "custom"
  destinatario={{
    nombre: "Juan Pérez",
    telefono: "5493874404472",
  }}
  datos={{
    periodo: "Diciembre 2024",
    pdfUrl: "data:application/pdf;base64,...",
  }}
/>
```

## Formatos de número

Los números deben estar en formato internacional sin espacios ni guiones:

- ✅ Correcto: `5493874404472`
- ❌ Incorrecto: `+54 9 387 440-4472`
- ❌ Incorrecto: `3874404472` (falta código de país)

El formato es: `[código país][código área sin 0][número]`

Ejemplo para Argentina:

- Código país: `54`
- Código móvil: `9`
- Código área Salta: `387`
- Número: `4404472`
- Final: `5493874404472`

## API Endpoints disponibles

- ✅ Enviar mensajes de texto
- ✅ Enviar documentos (PDF, etc.)
- ✅ Enviar imágenes
- ✅ Subir media
- ✅ Obtener perfil de negocio
- ✅ Actualizar perfil de negocio
- ✅ Verificar número de teléfono
- ✅ Registrar/dar de baja número

## Límites y costos

- **Mensajes gratuitos**: 1000 conversaciones/mes
- **Mensajes de plantilla**: Requieren aprobación previa
- **Sesión de 24h**: Puedes responder gratis durante 24h después de que el usuario te escriba

## Troubleshooting

### Error: "Invalid access token"

- Verifica que el token en `.env` sea correcto
- Los tokens temporales expiran en 24h, genera uno permanente

### Error: "Phone number not registered"

- Verifica el número en Facebook Developers
- Registra el número usando `whatsappService.registerPhone()`

### Error: "Message not sent"

- Verifica que el número destinatario tenga WhatsApp
- Verifica el formato del número (sin espacios ni caracteres especiales)
- Revisa los logs de la API en Facebook Developers

## Más información

- [WhatsApp Business Platform Docs](https://developers.facebook.com/docs/whatsapp)
- [Cloud API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
