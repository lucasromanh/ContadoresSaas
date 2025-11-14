import React, { useState } from 'react'
import ivaService from './services/ivaService'

const TablaIVA: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) return null
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          {Object.keys(data[0]).map((k) => (
            <th key={k} className="text-left px-2 py-1">{k}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {Object.keys(row).map((k) => (
              <td key={k} className="px-2 py-1">{String((row as any)[k] ?? '')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type Props = {
  onProcessed?: (items: any[]) => void
}

export default function UploadIVA({ onProcessed }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any[]>([])

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    setFiles(Array.from(e.target.files))
  }

  async function processAll() {
    if (!files.length) return
    setProcessing(true)
    const allResults: any[] = []
    for (const f of files) {
      try {
        const parsed = await ivaService.processFile(f)
        allResults.push(...parsed)
      } catch (e) {
        console.error('Error procesando', f.name, e)
      }
    }
    setResults((r)=>[...r, ...allResults])
    setProcessing(false)
    if (onProcessed) onProcessed(allResults)
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const dt = e.dataTransfer
    if (!dt) return
    const list = Array.from(dt.files)
    setFiles((prev)=>[...prev, ...list])
  }

  return (
    <div>
      <div onDragOver={(e)=>e.preventDefault()} onDrop={handleDrop} className="p-4 border border-dashed rounded mb-4">
        <p className="text-sm text-neutral-500">Arrastra archivos aquí o usa el selector</p>
        <input type="file" multiple onChange={handleFilesChange} className="mt-2" />
        <div className="mt-2">
          <button disabled={processing || files.length===0} onClick={processAll} className="btn-primary px-3 py-1">
            {processing ? 'Procesando...' : `Procesar ${files.length} archivo(s)`}
          </button>
        </div>
        {files.length>0 && (
          <ul className="mt-2 text-sm">
            {files.map((f,i)=>(<li key={i}>{f.name} — {f.size} bytes</li>))}
          </ul>
        )}
      </div>

      {results.length>0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Resultados parseados</h3>
          <TablaIVA data={results} />
        </div>
      )}
    </div>
  )
}
