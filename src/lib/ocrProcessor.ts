// OCR processor with optional Tesseract.js integration.
// If `tesseract.js` is installed, it will be loaded dynamically and used.
// Otherwise we fallback to a best-effort text extraction (filename or plain read) as before.
export async function processFileOCR(file: File): Promise<{ text: string; pages?: string[] }>{
  // Try dynamic import of tesseract.js
  try{
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const t = await import('tesseract.js')
    // prefer createWorker if available (recognize may be a top-level helper); check for createWorker
    if (t && (t as any).createWorker){
      // use tesseract to recognize image/pdf pages
      // If the file is an image, try a lightweight preprocessing step to improve OCR
      let dataUrl: string
      try{
        if (file.type && file.type.startsWith('image/') && typeof window !== 'undefined'){
          // dynamic import the image preprocess util to avoid bundling if unused
          const ip = await import('./imagePreprocess')
          dataUrl = await ip.preprocessImageFileToDataUrl(file as any)
        } else {
          dataUrl = await new Promise<string>((res, rej) => {
            const r = new FileReader()
            r.onload = ()=> res(String(r.result))
            r.onerror = rej
            r.readAsDataURL(file)
          })
        }
      }catch(e){
        // fallback to direct read
        dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader()
          r.onload = ()=> res(String(r.result))
          r.onerror = rej
          r.readAsDataURL(file)
        })
      }

      // Don't pass functions (like logger) to createWorker — they cannot be cloned
      const worker: any = await (t.createWorker as any)()
      // load and initialize languages (try spa then fall back to eng)
      await worker.load()
      await worker.loadLanguage('spa').catch(()=> worker.loadLanguage('eng'))
      await worker.initialize('spa').catch(()=> worker.initialize('eng'))

      // choose a PSM that is robust for documents
      try{ await worker.setParameters({ tessedit_pageseg_mode: '1' }) }catch(e){}

      // perform recognition and keep detailed data (words with bbox)
      const { data } = await worker.recognize(dataUrl)
      await worker.terminate()

      const text = (data && data.text) ? String(data.text) : String(file.name)
      const normalized = text.replace(/\s+/g, ' ').trim()

      // extract words with bbox if available
      const words: Array<any> = []
      try{
        if (data && Array.isArray(data.words)){
          for (const w of data.words){
            words.push({ text: String(w.text || ''), bbox: { x0: w.bbox?.x0 ?? w.x0 ?? 0, y0: w.bbox?.y0 ?? w.y0 ?? 0, x1: w.bbox?.x1 ?? w.x1 ?? 0, y1: w.bbox?.y1 ?? w.y1 ?? 0 } })
          }
        }
      }catch(e){}

      return { text: normalized, pages: [normalized], ...(words.length? { words } : {}) }
    }
  }catch(e){
    // dynamic import failed or recognition failed — fall back
    // console.warn('Tesseract not available, using fallback OCR', e)
  }

  // Fallback: try reading as text (useful for text PDFs) or return filename
  const readAsText = (): Promise<string> => new Promise((res) => {
    const r = new FileReader()
    r.onload = () => { res(String(r.result || `Contenido de ${file.name}`)) }
    r.onerror = () => { res(`Contenido de ${file.name}`) }
    try { r.readAsText(file) } catch(e) { res(`Contenido de ${file.name}`) }
  })

  const txt = await readAsText()
  const normalized = txt.replace(/\s+/g, ' ').trim()
  return { text: normalized, pages: [normalized] }
}

export default { processFileOCR }
