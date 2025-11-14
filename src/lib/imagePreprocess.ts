// Simple image preprocessing utilities to improve OCR results
export async function preprocessImageFileToDataUrl(file: File, maxWidth = 2000): Promise<string> {
  // Load image
  const img = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / img.width)
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  // draw with some smoothing disabled to keep sharpness
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(img, 0, 0, w, h)

  // Basic contrast/brightness adjustment: increase contrast a bit
  try{
    const id = ctx.getImageData(0,0,w,h)
    const data = id.data
    const contrast = 1.15 // 15% contrast
    const intercept = 128 * (1 - contrast)
    for (let i = 0; i < data.length; i += 4){
      for (let c = 0; c < 3; c++){
        let v = data[i + c]
        v = v * contrast + intercept
        data[i + c] = Math.max(0, Math.min(255, v))
      }
    }
    ctx.putImageData(id, 0, 0)
  }catch(e){ /* ignore if cross-origin or not available */ }

  // return data URL
  return canvas.toDataURL('image/png')
}

export default { preprocessImageFileToDataUrl }
