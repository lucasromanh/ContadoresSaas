import React from 'react'

export const FilePreview: React.FC<{ file?: File }> = ({ file }) => {
  if (!file) return <div className="text-sm text-slate-500">No hay archivo seleccionado</div>
  return (
    <div className="p-2 border rounded bg-white dark:bg-slate-800">
      <div className="font-medium">{file.name}</div>
      <div className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
    </div>
  )
}

export default FilePreview
