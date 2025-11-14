// Simple placeholder OCR processor. In production replace with Tesseract or an external OCR service.
export async function processFileOCR(file: File): Promise<{ text: string; pages?: string[] }>{
  // Try to read file name and return a dummy text including the filename
  const readAsText = (): Promise<string> => new Promise((res) => {
    const r = new FileReader()
    r.onload = () => { res(String(r.result || `Contenido de ${file.name}`)) }
    r.onerror = () => { res(`Contenido de ${file.name}`) }
    // for images we'll return the filename; for PDFs try to read as text (may be binary)
    try { r.readAsText(file) } catch(e) { res(`Contenido de ${file.name}`) }
  })

  const txt = await readAsText()
  // Basic normalization: collapse whitespace
  const normalized = txt.replace(/\s+/g, ' ').trim()
  // Return array of pages stub
  return { text: normalized, pages: [normalized] }
}

export default { processFileOCR }
