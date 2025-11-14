import React, { useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'

const readFileAsDataURL = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader()
  r.onload = ()=> res(String(r.result))
  r.onerror = rej
  r.readAsDataURL(f)
})

export default function AvatarUploader({ value, onChange }:{ value?: string; onChange: (dataUrl:string)=>void }){
  const ref = useRef<HTMLInputElement|null>(null)
  const [preview, setPreview] = useState<string|undefined>(value)

  const pick = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const f = e.target.files?.[0]
    if (!f) return
    const data = await readFileAsDataURL(f)
    setPreview(data)
    onChange(data)
  }

  return (
    <div className="space-y-2">
      <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
        {preview ? <img src={preview} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-sm text-slate-500">Sin foto</div>}
      </div>
      <div className="flex gap-2">
        <input ref={ref} type="file" accept="image/*" onChange={pick} className="hidden" />
        <Button onClick={()=>ref.current?.click()} size="sm">Subir foto</Button>
        <Button variant="ghost" size="sm" onClick={()=>{ setPreview(undefined); onChange('') }}>Borrar</Button>
      </div>
    </div>
  )
}
