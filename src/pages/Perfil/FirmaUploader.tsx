import React, { useRef, useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'

export default function FirmaUploader({ value, onChange }:{ value?: string; onChange: (dataUrl:string)=>void }){
  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const [drawing, setDrawing] = useState(false)
  const [preview, setPreview] = useState<string|undefined>(value)

  useEffect(()=>{ setPreview(value) }, [value])

  // Resize canvas to match CSS size and devicePixelRatio for crisp drawing
  useEffect(()=>{
    const resize = () => {
      const c = canvasRef.current
      if (!c) return
      const rect = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      c.width = Math.round(rect.width * dpr)
      c.height = Math.round(rect.height * dpr)
      const ctx = c.getContext('2d')
      if (!ctx) return
      // reset transform then scale for DPR
      ctx.setTransform(1,0,0,1,0,0)
      ctx.scale(dpr, dpr)
      ctx.clearRect(0,0,rect.width, rect.height)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#000'
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
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
    if (!drawing) { setDrawing(false); return }
    setDrawing(false)
    const c = canvasRef.current; if (!c) return
    // export as PNG at device pixel ratio for quality
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
        <canvas ref={canvasRef} onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={()=> end()} className="w-full h-48 bg-white" />
      </div>
      <div className="flex gap-2">
        <input type="file" accept="image/*" onChange={uploadFile} />
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
