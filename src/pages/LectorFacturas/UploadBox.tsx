import React from 'react'

export const UploadBox: React.FC<{ onFile: (f: File) => void }> = ({ onFile }) => {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFile(f)
  }

  return (
    <div className="p-4 border rounded bg-white dark:bg-slate-800">
      <div className="mb-2">Arrastra o selecciona un archivo (PDF / XML / JPG / PNG)</div>
      <input type="file" accept=".pdf,.xml,.jpg,.jpeg,.png" onChange={handle} />
    </div>
  )
}

export default UploadBox
