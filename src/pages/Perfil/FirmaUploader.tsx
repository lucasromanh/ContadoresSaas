import React, { useRef, useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'

export default function FirmaUploader({ value, onChange }:{ value?: string; onChange: (dataUrl:string)=>void }){
  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const [drawing, setDrawing] = useState(false)
  const [preview, setPreview] = useState<string|undefined>(value)

  useEffect(()=>{ setPreview(value) }, [value])

  useEffect(()=>{
    const c = canvasRef.current
    if (!c) return
    c.width = 600
    c.height = 200
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = 'transparent'
    ctx.clearRect(0,0,c.width,c.height)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'
  }, [])

  const start = (e: React.MouseEvent) => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    const rect = c.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setDrawing(true)
  }
  const move = (e: React.MouseEvent) => {
    if (!drawing) return
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    const rect = c.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }
  const end = async () => {
    setDrawing(false)
    const c = canvasRef.current; if (!c) return
    const data = c.toDataURL('image/png')
    setPreview(data)
    onChange(data)
  }

  const clear = ()=>{
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    ctx.clearRect(0,0,c.width,c.height)
    setPreview(undefined)
    onChange('')
  }

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader(); r.onload = ()=>{ const d = String(r.result); setPreview(d); onChange(d) }; r.readAsDataURL(f)
  }

  return (
    <div className="space-y-2">
      <div className="border rounded p-2">
        <canvas ref={canvasRef} onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={()=> setDrawing(false)} className="w-full max-w-full h-40 bg-white" />
      </div>
      <div className="flex gap-2">
        <input type="file" accept="image/png" onChange={uploadFile} />
        <Button size="sm" onClick={clear}>Borrar</Button>
      </div>
      {preview && (
        <div className="mt-2">
          <div className="text-xs text-slate-500">Vista previa</div>
          <img src={preview} alt="firma" className="mt-1 border" style={{ maxHeight: 120 }} />
        </div>
      )}
    </div>
  )
}
