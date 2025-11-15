import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toastSuccess, toastError } from '../ui';
import whatsappService from '../../services/whatsappService';
import { Send, FileText, Bell } from 'lucide-react';

interface EnviarWhatsAppModalProps {
  open: boolean;
  onClose: () => void;
  tipo?: 'recibo' | 'alerta' | 'custom';
  destinatario?: {
    nombre: string;
    telefono: string;
  };
  datos?: {
    periodo?: string;
    concepto?: string;
    fecha?: string;
    monto?: number;
    pdfUrl?: string;
  };
}

export default function EnviarWhatsAppModal({
  open,
  onClose,
  tipo = 'custom',
  destinatario,
  datos,
}: EnviarWhatsAppModalProps) {
  const [telefono, setTelefono] = useState(destinatario?.telefono || '');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  React.useEffect(() => {
    if (destinatario) {
      setTelefono(destinatario.telefono);
    }

    // Generar mensaje predeterminado según el tipo
    if (tipo === 'recibo' && datos?.periodo) {
      setMensaje(
        `📄 *Recibo de Sueldo*\n\nHola ${destinatario?.nombre || ''},\n\nTu recibo de sueldo de ${datos.periodo} está disponible.\n\nSaludos,\nEquipo de COntadoresIA`
      );
    } else if (tipo === 'alerta' && datos?.concepto) {
      const montoStr = datos.monto ? `\n💰 Monto: $${datos.monto.toLocaleString('es-AR')}` : '';
      setMensaje(
        `⚠️ *Recordatorio de Vencimiento*\n\n📋 ${datos.concepto}\n📅 Fecha: ${datos.fecha}${montoStr}\n\nNo olvides realizar el pago a tiempo.`
      );
    }
  }, [tipo, destinatario, datos]);

  const handleEnviar = async () => {
    if (!telefono.trim()) {
      toastError('Ingresa un número de teléfono');
      return;
    }

    if (!mensaje.trim() && tipo === 'custom') {
      toastError('Ingresa un mensaje');
      return;
    }

    setEnviando(true);

    try {
      if (tipo === 'recibo') {
        await whatsappService.enviarReciboSueldo(
          telefono,
          destinatario?.nombre || '',
          datos?.periodo || '',
          datos?.pdfUrl
        );
      } else if (tipo === 'alerta') {
        await whatsappService.enviarAlertaVencimiento(
          telefono,
          datos?.concepto || '',
          datos?.fecha || '',
          datos?.monto
        );
      } else {
        await whatsappService.sendTextMessage(telefono, mensaje);
      }

      toastSuccess('Mensaje enviado por WhatsApp ✅');
      onClose();
    } catch (error: any) {
      console.error('Error enviando WhatsApp:', error);
      toastError(error.message || 'Error al enviar mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const getTitulo = () => {
    switch (tipo) {
      case 'recibo':
        return 'Enviar Recibo por WhatsApp';
      case 'alerta':
        return 'Enviar Alerta por WhatsApp';
      default:
        return 'Enviar Mensaje por WhatsApp';
    }
  };

  const getIcono = () => {
    switch (tipo) {
      case 'recibo':
        return <FileText className="w-5 h-5" />;
      case 'alerta':
        return <Bell className="w-5 h-5" />;
      default:
        return <Send className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()} title={getTitulo()}>
      <div className="space-y-4">
        {/* Destinatario */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Número de WhatsApp
          </label>
          <Input
            type="tel"
            placeholder="Ej: 5493874404472"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            disabled={!!destinatario}
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Formato: código país + código área + número (sin espacios ni guiones)
          </p>
        </div>

        {/* Nombre del destinatario */}
        {destinatario && (
          <div>
            <label className="block text-sm font-medium mb-1">Destinatario</label>
            <Input 
              value={destinatario.nombre} 
              disabled 
              className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* Mensaje */}
        <div>
          <label className="block text-sm font-medium mb-1">Mensaje</label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] font-mono text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            disabled={tipo !== 'custom'}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Usa *negrita*, _cursiva_, ~tachado~ para dar formato
          </p>
        </div>

        {/* Info adicional */}
        {datos?.pdfUrl && tipo === 'recibo' && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              📎 Se enviará el archivo PDF adjunto después del mensaje
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={handleEnviar} disabled={enviando}>
            {enviando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                {getIcono()}
                <span className="ml-2">Enviar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
