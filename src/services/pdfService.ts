// Minimal pdf text extractor wrapper. Uses pdfjs-dist if available; otherwise returns empty string.
// For production install pdfjs-dist and implement properly. Here we provide a mock-friendly API.

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // If pdfjs is installed we could use it here. For now, fallback to returning empty string
    // and consumer should fallback to OCR or mock.
    return await Promise.resolve('')
  } catch (e) {
    return ''
  }
}

export default { extractTextFromPdf }
