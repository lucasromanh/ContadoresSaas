import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import SmartTable from '../../components/ui/SmartTable'
import { useClientes } from '../../hooks/useClientes'

export const DocumentosPage: React.FC = () => {
  const { data: clientes } = useClientes()
  const [files, setFiles] = useState<FileList | null>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
    // Here you would send files to the backend / storage
  }

  return (
    <div className="space-y-4">
      <Card title="Documentos por cliente">
        <div className="space-y-2">
          <div>
            <input type="file" multiple onChange={handleUpload} />
          </div>
          <div className="text-sm text-slate-500">Sube PDF, XML o CSV y asocia al cliente.</div>
        </div>
      </Card>

      <Card title="Lista de documentos">
        <SmartTable columns={[{ key: 'id', label: 'ID' }, { key: 'cliente', label: 'Cliente' }, { key: 'nombre', label: 'Archivo' }]} data={[]} />
      </Card>
    </div>
  )
}

export default DocumentosPage
