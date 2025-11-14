// PDF text extractor using pdfjs-dist (legacy build). This implementation runs in the browser
// and extracts text content page by page. It is a best-effort extraction—layout/line breaks
// may need post-processing.

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'

// If pdfjs worker is not set up, fallback to CDN worker path. For Vite apps you may want to
// configure worker separately.
try {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`
} catch (e) {
  // ignore
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const strings = content.items.map((it: any) => (it.str || '') )
      fullText += strings.join(' ') + '\n'
    }
    return fullText
  } catch (e) {
    console.error('pdfService.extractTextFromPdf error', e)
    return ''
  }
}

export default { extractTextFromPdf }
