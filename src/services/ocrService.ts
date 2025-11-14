// OCR wrapper using tesseract.js. This will create a worker for recognition and terminate it
// after use. For better performance you can reuse a singleton worker.

import type TesseractType from 'tesseract.js'

let workerInstance: any | null = null
let workerInitializing: Promise<void> | null = null

async function ensureWorker() {
  if (workerInstance) return
  if (!workerInitializing) {
    workerInitializing = (async () => {
      try{
        // dynamic import to avoid bundling surprises
        const t: any = await import('tesseract.js')
        // createWorker may be sync or async depending on version
        let maybeWorker: any = t.createWorker ? t.createWorker() : (t as any)
        if (maybeWorker && typeof maybeWorker.then === 'function') {
          maybeWorker = await maybeWorker
        }

        // If worker exposes load(), follow classic init flow. Otherwise assume it's ready or has initialize.
        if (maybeWorker && typeof maybeWorker.load === 'function'){
          await maybeWorker.load()
          await maybeWorker.loadLanguage('spa').catch(()=> maybeWorker.loadLanguage('eng'))
          await maybeWorker.initialize('spa').catch(()=> maybeWorker.initialize('eng'))
        } else if (maybeWorker && typeof maybeWorker.initialize === 'function'){
          // some builds might only provide initialize
          try{ await maybeWorker.initialize('spa') }catch(e){ try{ await maybeWorker.initialize('eng') }catch(e){} }
        }

        workerInstance = maybeWorker
      }catch(e){
        console.warn('Failed to initialize tesseract worker', e)
        workerInstance = null
      }
    })()
  }
  return workerInitializing
}

export async function recognizeImage(file: File, onProgress?: (p: number) => void): Promise<string> {
  try {
    if (onProgress) onProgress(0.05)
    await ensureWorker()
    if (onProgress) onProgress(0.25)
    if (!workerInstance) return ''
    // best-effort progress simulation (tesseract worker logger would be ideal)
    if (onProgress) onProgress(0.5)
    // @ts-ignore - workerInstance is "any"
    const res = await workerInstance.recognize(file, 'spa')
    if (onProgress) onProgress(1)
    return res?.data?.text ?? ''
  } catch (e) {
    console.error('ocrService.recognizeImage error', e)
    return ''
  }
}

export async function terminateWorker() {
  if (workerInstance) {
    try { await workerInstance.terminate() } catch (e) {}
    workerInstance = null
    workerInitializing = null
  }
}

export default { recognizeImage, terminateWorker }
