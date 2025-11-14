// Minimal OCR wrapper. For production, install tesseract.js and configure language 'spa'.
// For now this is a mock that returns an empty string so parser can try other heuristics.

export async function recognizeImage(file: File): Promise<string> {
  try {
    // If Tesseract is available, integrate here. For now return empty to let parser handle.
    return await Promise.resolve('')
  } catch (e) {
    return ''
  }
}

export default { recognizeImage }
