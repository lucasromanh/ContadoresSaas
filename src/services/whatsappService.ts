import axios from './axios';

// Configuración de WhatsApp Business API
const PHONE_NUMBER_ID = '3874404472'; // Tu número de WhatsApp Business
const ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '';
const API_VERSION = 'v18.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

// Cliente axios específico para WhatsApp
const whatsappApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  recipient_type?: 'individual';
  to: string;
  type: 'text' | 'template' | 'image' | 'document' | 'audio' | 'video';
  text?: {
    preview_url?: boolean;
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  image?: {
    link?: string;
    id?: string;
    caption?: string;
  };
  document?: {
    link?: string;
    id?: string;
    caption?: string;
    filename?: string;
  };
}

export interface WhatsAppBusinessProfile {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  profile_picture_url?: string;
  websites?: string[];
  vertical?: string;
}

const whatsappService = {
  /**
   * Enviar mensaje de texto
   */
  sendTextMessage: async (to: string, message: string, previewUrl = false) => {
    try {
      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''), // Limpiar número (solo dígitos)
        type: 'text',
        text: {
          preview_url: previewUrl,
          body: message,
        },
      };

      const response = await whatsappApi.post(`/${PHONE_NUMBER_ID}/messages`, payload);
      return response.data;
    } catch (error: any) {
      console.error('Error enviando mensaje WhatsApp:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al enviar mensaje');
    }
  },

  /**
   * Enviar plantilla (template)
   */
  sendTemplate: async (to: string, templateName: string, languageCode = 'es', components?: any[]) => {
    try {
      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      };

      const response = await whatsappApi.post(`/${PHONE_NUMBER_ID}/messages`, payload);
      return response.data;
    } catch (error: any) {
      console.error('Error enviando template WhatsApp:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al enviar template');
    }
  },

  /**
   * Enviar documento/archivo
   */
  sendDocument: async (to: string, documentUrl: string, caption?: string, filename?: string) => {
    try {
      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'document',
        document: {
          link: documentUrl,
          caption,
          filename,
        },
      };

      const response = await whatsappApi.post(`/${PHONE_NUMBER_ID}/messages`, payload);
      return response.data;
    } catch (error: any) {
      console.error('Error enviando documento WhatsApp:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al enviar documento');
    }
  },

  /**
   * Subir media (imagen, documento, etc.)
   */
  uploadMedia: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', file.type);

      const response = await whatsappApi.post(`/${PHONE_NUMBER_ID}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data; // { id: 'MEDIA_ID' }
    } catch (error: any) {
      console.error('Error subiendo media WhatsApp:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al subir archivo');
    }
  },

  /**
   * Obtener información de media
   */
  getMediaInfo: async (mediaId: string) => {
    try {
      const response = await whatsappApi.get(`/${mediaId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo info de media:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al obtener media');
    }
  },

  /**
   * Descargar media
   */
  downloadMedia: async (mediaUrl: string) => {
    try {
      const response = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.error('Error descargando media:', error);
      throw new Error('Error al descargar archivo');
    }
  },

  /**
   * Obtener perfil de negocio
   */
  getBusinessProfile: async () => {
    try {
      const response = await whatsappApi.get(
        `/${PHONE_NUMBER_ID}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`
      );
      return response.data.data[0] as WhatsAppBusinessProfile;
    } catch (error: any) {
      console.error('Error obteniendo perfil:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al obtener perfil');
    }
  },

  /**
   * Actualizar perfil de negocio
   */
  updateBusinessProfile: async (profile: Partial<WhatsAppBusinessProfile>) => {
    try {
      const response = await whatsappApi.post(`/${PHONE_NUMBER_ID}/whatsapp_business_profile`, {
        messaging_product: 'whatsapp',
        ...profile,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando perfil:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al actualizar perfil');
    }
  },

  /**
   * Verificar número de teléfono
   */
  requestVerificationCode: async (codeMethod: 'SMS' | 'VOICE' = 'SMS', language = 'es') => {
    try {
      const response = await whatsappApi.post(`/${PHONE_NUMBER_ID}/request_code`, {
        code_method: codeMethod,
        language,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error solicitando código:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al solicitar código');
    }
  },

  /**
   * Verificar código
   */
  verifyCode: async (code: string) => {
    try {
      const response = await whatsappApi.post(`/${PHONE_NUMBER_ID}/verify_code`, {
        code,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error verificando código:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al verificar código');
    }
  },

  /**
   * Registrar número de teléfono
   */
  registerPhone: async (pin: string) => {
    try {
      const response = await whatsappApi.post(`/${PHONE_NUMBER_ID}/register`, {
        messaging_product: 'whatsapp',
        pin,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error registrando teléfono:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al registrar teléfono');
    }
  },

  /**
   * Dar de baja número de teléfono
   */
  deregisterPhone: async () => {
    try {
      const response = await whatsappApi.post(`/${PHONE_NUMBER_ID}/deregister`);
      return response.data;
    } catch (error: any) {
      console.error('Error dando de baja teléfono:', error.response?.data || error);
      throw new Error(error.response?.data?.error?.message || 'Error al dar de baja teléfono');
    }
  },

  /**
   * Enviar recibo de sueldo por WhatsApp
   */
  enviarReciboSueldo: async (to: string, empleado: string, periodo: string, pdfUrl?: string) => {
    try {
      const mensaje = `📄 *Recibo de Sueldo*\n\nHola ${empleado},\n\nTu recibo de sueldo de ${periodo} está disponible.\n\nSaludos,\nEquipo de RRHH`;

      // Primero enviar el mensaje
      await whatsappService.sendTextMessage(to, mensaje);

      // Si hay PDF, enviarlo
      if (pdfUrl) {
        await whatsappService.sendDocument(to, pdfUrl, `Recibo ${periodo}`, `recibo_${periodo}.pdf`);
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Enviar alerta de vencimiento
   */
  enviarAlertaVencimiento: async (to: string, concepto: string, fecha: string, monto?: number) => {
    try {
      const montoStr = monto ? `\n💰 Monto: $${monto.toLocaleString('es-AR')}` : '';
      const mensaje = `⚠️ *Recordatorio de Vencimiento*\n\n📋 ${concepto}\n📅 Fecha: ${fecha}${montoStr}\n\nNo olvides realizar el pago a tiempo.`;

      return await whatsappService.sendTextMessage(to, mensaje);
    } catch (error) {
      throw error;
    }
  },
};

export default whatsappService;
