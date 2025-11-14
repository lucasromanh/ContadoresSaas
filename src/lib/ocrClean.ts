// Limpieza básica del texto OCR: elimina bytes/binarios, JFIF/EXIF y caracteres no imprimibles
export function cleanOCRText(raw?: string): string{
  if (!raw) return ''
  let s = String(raw)
  // remove common binary markers and JFIF/Exif tags
  s = s.replace(/JFIF\x00|Exif\x00|\x00/g, ' ')
  // remove non-printable control characters except line breaks and tabs
  s = s.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
  // replace long sequences of strange symbols with a single space
  s = s.replace(/[\uFFFD\u0000-\u001F\u007F-\u00A0]+/g, ' ')
  // remove unusual punctuation repeated
  s = s.replace(/[\*\^~`]{2,}/g, ' ')
  // collapse multiple spaces but preserve newlines
  s = s.split('\n').map(line => line.replace(/\s{2,}/g,' ').trim()).filter(Boolean).join('\n')
  return s.trim()
}

export default cleanOCRText
