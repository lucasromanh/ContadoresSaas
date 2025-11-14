import { FacturaExtraida } from '../types/factura'
import pdfService from './pdfService'
import ocrService from './ocrService'
import xmlService from './xmlService'
import { parseFacturaFromText } from './facturaParser'
import clientesService from './clientesService'
import proveedoresService from './proveedoresService'
import dashboardService from './dashboardService'
import documentosService from './documentosService'

// Orchestrator service that decides how to extract based on file type.
export async function extractFromFile(file: File): Promise<FacturaExtraida> {
  const name = file.name.toLowerCase()
  let text = ''
  if (name.endsWith('.xml')) {
    const txt = await file.text()
    const xmlObj = xmlService.parseXmlString(txt)
    // For now try to extract textual nodes
    text = JSON.stringify(xmlObj)
  } else if (name.endsWith('.pdf')) {
    text = await pdfService.extractTextFromPdf(file)
    if (!text) {
      // fallback to OCR
      text = await ocrService.recognizeImage(file)
    }
  } else if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) {
    text = await ocrService.recognizeImage(file)
  }

  // If still empty, use mock fallback for demo (based on example invoice)
  if (!text || text.trim().length < 10) {
    text = getMockFacturaText()
  }

  const factura = parseFacturaFromText(text)
  return factura
}

export async function saveExtractedFactura(f: FacturaExtraida, file?: File) {
  // Save original file in documentosService (mock)
  if (file) {
    await documentosService.saveDocument(file, f)
  }

  // Decide emitter/receptor
  const emisorCuit = f.emisor?.cuit
  const receptorCuit = f.receptor?.cuit

  // If emitter looks like our contador (heuristic: cuit empty or matches store?) -> create cliente
  if (emisorCuit && emisorCuit.startsWith('20')) {
    // register as proveedor
    await proveedoresService.create({ razon_social: f.emisor.razonSocial, cuit: f.emisor.cuit })
  }

  // If receptor has name, create client
  if (f.receptor?.razonSocial) {
    await clientesService.create({ razon_social: f.receptor.razonSocial, cuit: f.receptor?.cuit || '' })
  }

  // Update dashboard: add to ingresos or costos depending on who is emitter/receptor
  const total = f.totales?.total || 0
  // For demo, treat as ingreso
  await dashboardService.addIngreso(total)

  // TODO: integrate Libros IVA, IIBB, RiesgoFiscal
  return true
}

function getMockFacturaText() {
  return `ORIGINAL\nFACTURA A\nPunto de Venta: 0001 | Comp. Nro.: 00000083\nFecha de emisión: 20/07/2017\nRazón Social: MASCULLINO ANDRES JUAN\nCUIT: 20-12345678-9\nCondición IVA: RESPONSABLE INSCRIPTO\n\nItems:\n1 Servicio Profesional Período 09/2023  4860.00\n\nSubtotal: 4860.00\nIVA 21%: 1020.60\nTotal: 5880.60\n\nCOMPROBANTE AUTORIZADO\nCAE: 68193157051449\nFecha de Vencimiento: 20/07/2017`}

export default { extractFromFile, saveExtractedFactura }
