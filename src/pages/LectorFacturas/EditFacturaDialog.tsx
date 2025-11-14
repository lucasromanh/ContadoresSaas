import React from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Form, FormField } from '../../components/ui/Form'
import Input from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { FacturaExtraida } from '../../types/factura'

export const EditFacturaDialog: React.FC<{ open: boolean; factura: FacturaExtraida | null; onClose: () => void; onSave: (f: FacturaExtraida) => void }> = ({ open, factura, onClose, onSave }) => {
  if (!factura) return null
  return (
    <Dialog open={open} onOpenChange={onClose} title="Editar factura">
      <Form defaultValues={factura} onSubmit={(data) => { onSave({ ...factura, ...data }) }}>
        <FormField>
          <label className="text-sm block mb-1">Razón social emisor</label>
          <Input {...{ name: 'emisor.razonSocial' }} />
        </FormField>
        <FormField>
          <label className="text-sm block mb-1">CUIT emisor</label>
          <Input {...{ name: 'emisor.cuit' }} />
        </FormField>
        <FormField>
          <label className="text-sm block mb-1">Total</label>
          <Input {...{ name: 'totales.total' }} />
        </FormField>
        <div className="flex gap-2 mt-3">
          <Button type="submit">Guardar</Button>
          <Button onClick={onClose}>Cancelar</Button>
        </div>
      </Form>
    </Dialog>
  )
}

export default EditFacturaDialog
