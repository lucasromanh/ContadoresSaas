import ocrProcessor from '../../lib/ocrProcessor'

export async function ocrFile(file: File){
  // uses existing ocrProcessor which exports processFileOCR
  const res = await ocrProcessor.processFileOCR(file)
  return res
}

export default { ocrFile }
