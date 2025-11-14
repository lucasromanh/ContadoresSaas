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
      // line width should be in CSS pixels; multiply by 1 for clarity
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#000'
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // pointer-based drawing (works for mouse & touch)
  const getPos = (e: PointerEvent | React.PointerEvent) => {
    const c = canvasRef.current
    if (!c) return { x: 0, y: 0 }
    const rect = c.getBoundingClientRect()
    // use CSS pixels — context is scaled by DPR already
    return { x: (e as any).clientX - rect.left, y: (e as any).clientY - rect.top }
  }

  useEffect(()=>{
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    let isDown = false

    const onPointerDown = (ev: PointerEvent) => {
      isDown = true
      const p = getPos(ev as any)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      setDrawing(true)
      // capture pointer to continue receiving events
      try{ (ev.target as Element).setPointerCapture(ev.pointerId) }catch(e){}
    }
    const onPointerMove = (ev: PointerEvent) => {
      if (!isDown) return
      const p = getPos(ev as any)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
    const onPointerUp = (ev: PointerEvent) => {
      if (!isDown) return
      isDown = false
      setDrawing(false)
      try{ (ev.target as Element).releasePointerCapture(ev.pointerId) }catch(e){}
      // export
      const data = c.toDataURL('image/png')
      setPreview(data)
      onChange(data)
    }

    c.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      try{ c.removeEventListener('pointerdown', onPointerDown) }catch(e){}
      try{ window.removeEventListener('pointermove', onPointerMove) }catch(e){}
      try{ window.removeEventListener('pointerup', onPointerUp) }catch(e){}
    }
  }, [])

  const clear = ()=>{
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    // clear using CSS size (context is scaled)
    const rect = c.getBoundingClientRect()
    ctx.clearRect(0,0,rect.width, rect.height)
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
        <canvas ref={canvasRef} className="w-full h-48 bg-white" />
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
