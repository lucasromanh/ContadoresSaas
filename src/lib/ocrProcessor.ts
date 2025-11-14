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
      // For simplicity, read file as data URL and pass to recognize
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = ()=> res(String(r.result))
        r.onerror = rej
        r.readAsDataURL(file)
      })
  // Don't pass functions (like logger) to createWorker — they cannot be cloned
  // across to the worker and cause DataCloneError when postMessage is used.
  // createWorker may return a promise in some builds — await to get the actual worker
  const worker: any = await (t.createWorker as any)()
      await worker.load()
      await worker.loadLanguage('spa').catch(()=> worker.loadLanguage('eng'))
      await worker.initialize('spa').catch(()=> worker.initialize('eng'))
      const { data } = await worker.recognize(dataUrl)
      await worker.terminate()
      const text = (data && data.text) ? String(data.text) : String(file.name)
      const normalized = text.replace(/\s+/g, ' ').trim()
      return { text: normalized, pages: [normalized] }
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
