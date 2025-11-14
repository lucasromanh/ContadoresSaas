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
