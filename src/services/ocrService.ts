// OCR wrapper using tesseract.js. This will create a worker for recognition and terminate it
// after use. For better performance you can reuse a singleton worker.

import { createWorker } from 'tesseract.js'

let workerInstance: any | null = null
let workerInitializing: Promise<void> | null = null

async function ensureWorker() {
  if (workerInstance) return
  if (!workerInitializing) {
    const w: any = createWorker()
    workerInitializing = (async () => {
      await w.load()
      await w.loadLanguage('spa')
      await w.initialize('spa')
      workerInstance = w
    })()
  }
  return workerInitializing
}

export async function recognizeImage(file: File, onProgress?: (p: number) => void): Promise<string> {
  try {
    await ensureWorker()
    if (!workerInstance) return ''
    // attach a temporary logger if onProgress provided
    const logger = (m: any) => {
      if (onProgress && typeof m === 'object' && m.status === 'recognizing text' && m.progress) {
        onProgress(m.progress)
      }
    }
    // @ts-ignore access workerInstance._worker (internal) is not ideal; use recognize with logger parameter
    const res = await workerInstance.recognize(file, 'spa')
    return res.data?.text ?? ''
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
