import { FacturaExtraida } from '../types/factura'
import pdfService from './pdfService'
import ocrService from './ocrService'
import xmlService from './xmlService'
import { parseFacturaFromText } from './facturaParser'
import clientesService from './clientesService'
import proveedoresService from './proveedoresService'
import alertasService from '../pages/Alertas/services/alertasService'
import dashboardService from './dashboardService'
import documentosService from './documentosService'
import iibbService from './iibbService'

// Orchestrator service that decides how to extract based on file type.
export async function extractFromFile(file: File, onProgress?: (p: number) => void): Promise<FacturaExtraida> {
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
      // fallback to OCR (pass progress callback)
      text = await ocrService.recognizeImage(file, onProgress)
    }
  } else if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) {
    text = await ocrService.recognizeImage(file, onProgress)
  }

  // If still empty, use mock fallback for demo (based on example invoice)
  if (!text || text.trim().length < 10) {
    text = getMockFacturaText()
  }

  const factura = parseFacturaFromText(text)
  return factura
}

export async function saveExtractedFactura(f: FacturaExtraida, file?: File) {
  // Before saving, run quick checks to detect duplicates and CUIT inconsistencies
  try {
    const docs = await documentosService.listDocuments()

    // Duplicate detection: match by CAE or by puntoVenta+numero+emisor.cuit
    const duplicate = docs.find((d: any) => {
      const m = d.meta?.comprobante || {}
      try {
        if (f.comprobante?.cae && m?.cae && f.comprobante.cae === m.cae) return true
        if (f.comprobante?.puntoVenta && f.comprobante?.numero && m?.puntoVenta && m?.numero && f.emisor?.cuit && m?.emisor?.cuit) {
          if (f.comprobante.puntoVenta === m.puntoVenta && f.comprobante.numero === m.numero && f.emisor.cuit === m.emisor.cuit) return true
        }
      } catch (e) {}
      return false
    })

    if (duplicate) {
      // avoid creating duplicated alerts for same document
      const existing = alertasService.getAll().find(a => a.relacionadoCon?.documento === duplicate.id && a.tipo === 'factura')
      if (!existing) {
        alertasService.create({
          titulo: 'Factura duplicada detectada',
          descripcion: `Se detectó una factura que parece duplicada (archivo existente: ${duplicate.name}). Revise CAE/numero/punto de venta.`,
          tipo: 'factura',
          criticidad: 'alta',
          cuit: f.emisor?.cuit || f.receptor?.cuit,
          relacionadoCon: { documento: duplicate.id }
        })
      }
    }

    // CUIT inconsistency: compare parsed receptor/emisor CUIT with known records
    try {
      const clientes = await clientesService.list()
      const proveedores = await proveedoresService.list()

      if (f.receptor?.razonSocial && f.receptor?.cuit) {
        const match = clientes.find(c => c.razon_social?.toLowerCase?.() === f.receptor.razonSocial?.toLowerCase?.())
        if (match && match.cuit && match.cuit !== f.receptor.cuit) {
          const already = alertasService.getAll().find(a => a.tipo === 'factura' && a.descripcion?.includes('CUIT receptor') && a.cuit === f.receptor.cuit)
          if (!already) {
            alertasService.create({
              titulo: 'CUIT inconsistente (receptor)',
              descripcion: `La factura indica CUIT ${f.receptor.cuit} para "${f.receptor.razonSocial}", que difiere del registro del cliente (${match.cuit}).`,
              tipo: 'factura',
              criticidad: 'alta',
              cuit: f.receptor.cuit,
              cliente: match.razon_social
            })
          }
        }
      }

      if (f.emisor?.razonSocial && f.emisor?.cuit) {
        const matchP = proveedores.find(p => p.razon_social?.toLowerCase?.() === f.emisor.razonSocial?.toLowerCase?.())
        if (matchP && matchP.cuit && matchP.cuit !== f.emisor.cuit) {
          const already = alertasService.getAll().find(a => a.tipo === 'factura' && a.descripcion?.includes('CUIT emisor') && a.cuit === f.emisor.cuit)
          if (!already) {
            alertasService.create({
              titulo: 'CUIT inconsistente (emisor)',
              descripcion: `La factura indica CUIT ${f.emisor.cuit} para "${f.emisor.razonSocial}", que difiere del registro del proveedor (${matchP.cuit}).`,
              tipo: 'factura',
              criticidad: 'media',
              cuit: f.emisor.cuit,
              proveedor: matchP.razon_social
            })
          }
        }
      }
    } catch (e) {
      // ignore client/provider check errors
    }
  } catch (e) {
    // ignore document listing errors
  }

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

  // Add a line to IIBB mock so the IIBB page can display detected amounts
  try {
    iibbService.addEntry({
      fecha: f.comprobante?.fechaEmision || new Date().toISOString(),
      tipo: f.tipo || 'N/A',
      emisorCuit: f.emisor?.cuit,
      receptorCuit: f.receptor?.cuit,
      total: total,
      origen: file?.name || 'manual'
    })
  } catch (e) { /* ignore */ }

  // TODO: integrate Libros IVA, IIBB, RiesgoFiscal
  return true
}

function getMockFacturaText() {
  return `ORIGINAL\nFACTURA A\nPunto de Venta: 0001 | Comp. Nro.: 00000083\nFecha de emisión: 20/07/2017\nRazón Social: MASCULLINO ANDRES JUAN\nCUIT: 20-12345678-9\nCondición IVA: RESPONSABLE INSCRIPTO\n\nItems:\n1 Servicio Profesional Período 09/2023  4860.00\n\nSubtotal: 4860.00\nIVA 21%: 1020.60\nTotal: 5880.60\n\nCOMPROBANTE AUTORIZADO\nCAE: 68193157051449\nFecha de Vencimiento: 20/07/2017`}

export default { extractFromFile, saveExtractedFactura }
