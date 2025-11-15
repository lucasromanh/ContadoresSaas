import { ReciboSueldo } from "../types/reciboSueldo";

function parseAmount(s: string | number | undefined): number {
  if (!s) return 0;
  const str = String(s).replace(/[^0-9,\.\-]/g, "");
  
  // Detectar formato basándose en el último separador
  // Formato argentino: 31.007,24 (punto=miles, coma=decimal)
  // Formato OCR mixto: 31,007.24 (coma=miles, punto=decimal)
  // Formato simple: 31007.24 o 31007,24
  
  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');
  
  let cleaned: string;
  
  if (lastComma > lastDot) {
    // La coma está después del punto → formato argentino 31.007,24
    cleaned = str.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // El punto está después de la coma → formato OCR 31,007.24
    cleaned = str.replace(/,/g, '');
  } else {
    // Solo hay uno o ninguno
    cleaned = str.replace(',', '.');
  }
  
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

type OCRResult = {
  text: string;
  words?: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
};

// --------------------------
// Agrupar líneas por Y
// --------------------------
function buildLines(ocr: OCRResult): string[] {
  if (!ocr.words?.length) {
    return (ocr.text || "")
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
  }

  const words = [...ocr.words]
    .sort((a,b) => (a.bbox.y0 + a.bbox.y1)/2 - (b.bbox.y0 + b.bbox.y1)/2);

  const linesMap: Array<{ y: number; words: Array<{ text: string; x: number }> }> = [];

  const clean = (s: string) =>
    s
      .replace(/[^\p{L}\p{N}\.,:\/\-\(\)áéíóúÁÉÍÓÚñÑ ]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  for (const w of words) {
    const cy = (w.bbox.y0 + w.bbox.y1) / 2;
    const text = clean(w.text);
    if (!text) continue;

    let group = linesMap.find(l => Math.abs(l.y - cy) < 18);
    if (!group) {
      group = { y: cy, words: [] };
      linesMap.push(group);
    }

    group.words.push({ text, x: w.bbox.x0 });
  }

  return linesMap
    .sort((a,b)=>a.y - b.y)
    .map(l =>
      l.words
        .sort((a,b)=>a.x - b.x)
        .map(w => w.text)
        .join(" ")
    )
    .filter(Boolean);
}



// ==================================================
// PARSER PRINCIPAL type-safe
// ==================================================
export function parseReciboFromOCR(
  ocr: OCRResult,
  meta?: { filename?: string }
): ReciboSueldo | { error: string } {
  const lines = buildLines(ocr);
  const text = ocr.text || "";

  const moneyRx = /\d{1,3}(?:\.\d{3})*,\d{2}/g;
  const findLine = (rx: RegExp) => lines.find((l) => rx.test(l));

  // -----------------------------------------
  // 1. EMPLEADO: Nombre + Apellido + CUIL
  // -----------------------------------------
  const cuilMatch =
    text.match(/C\.?U\.?I\.?L\.?\s*:?\s*([\d\-]+)/i) || 
    text.match(/(\d{2}-\d{8}-\d)/);
  const cuil = cuilMatch ? (cuilMatch[1] || cuilMatch[0]).trim() : "";

  // Buscar nombre completo - específico para formato Municipalidad
  let apellido = "";
  let nombre = "";

  // Patrón: buscar entre "Nombre" o después y antes de CUIL
  const nombreMatch1 = text.match(/(?:Nombre|y\s+Nombre)\s+([A-ZÑÁÉÍÓÚ]+(?:\s+[A-ZÑÁÉÍÓÚ]+)*)\s+(\d{2}-\d{8}-\d)/);
  if (nombreMatch1) {
    const nombreCompleto = nombreMatch1[1].trim();
    const partes = nombreCompleto.split(/\s+/);
    apellido = partes[0] || "";
    nombre = partes.slice(1).join(" ") || "";
  } else {
    // Segundo intento: buscar patrón apellido-nombres antes de CUIL
    const nombreMatch2 = text.match(/([A-ZÑÁÉÍÓÚ]+)\s+([A-ZÑÁÉÍÓÚ\s]+?)\s+\d{2}-\d{8}-\d/);
    if (nombreMatch2) {
      apellido = nombreMatch2[1].trim();
      nombre = nombreMatch2[2].trim();
    } else {
      // Fallback: usar líneas
      const cuilLineIdx = lines.findIndex((l) => /\d{2}-\d{8}-\d/.test(l));
      if (cuilLineIdx >= 0) {
        const nombreLine = lines[cuilLineIdx];
        const match = nombreLine.match(/([A-ZÑÁÉÍÓÚ]+)\s+([A-ZÑÁÉÍÓÚ\s]+?)\s+\d{2}-\d{8}-\d/);
        if (match) {
          apellido = match[1];
          nombre = match[2].trim();
        }
      }
    }
  }

  // -----------------------------------------
  // 2. FECHA INGRESO
  // -----------------------------------------
  const fechaIngresoMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);

  // -----------------------------------------
  // 3. PERIODO
  // -----------------------------------------
  const periodoMatch = text.match(
    /(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\s+(\d{4})/i
  );

  const periodoMes = periodoMatch
    ? periodoMatch[1].charAt(0).toUpperCase() + periodoMatch[1].slice(1).toLowerCase()
    : "Sin dato";

  const periodoAño = periodoMatch
    ? Number(periodoMatch[2])
    : new Date().getFullYear();

  // -----------------------------------------
  // 4. EMPLEADOR (primer línea institucional)
  // -----------------------------------------
  const orgLine =
    findLine(/Secretar|Ministerio|Municipalidad|Gobierno|Direcci/i) ||
    meta?.filename ||
    "Sin identificar";

  // -----------------------------------------
  // 5. CONCEPTOS
  // -----------------------------------------
  const conceptos: ReciboSueldo["conceptos"] = [];

  // Buscar conceptos - Tesseract a veces lee comas como puntos
  // Aceptar ambos formatos: 31.007,24 o 31.007.24 o 31,007.24
  const conceptoRegex = /(\d{2,3})\s+([A-ZÁÉÍÓÚÑa-zñáéíóú][A-ZÁÉÍÓÚÑa-zñáéíóú\s\(\)\.\/\-\%]{4,}?)\s+([\d]{1,3}(?:[,\.][\d]{3})*[,\.][\d]{2})/g;
  let match;
  
  console.log("Buscando conceptos en texto OCR...");
  
  while ((match = conceptoRegex.exec(text)) !== null) {
    const codigo = match[1];
    let descripcion = match[2].trim();
    const montoStr = match[3];
    
    // Filtrar falsos positivos
    if (/^\d{4}$/.test(descripcion) || descripcion.length < 4) continue;
    if (/^(Totales?|Neto|Hoja|Folio)$/i.test(descripcion)) continue;
    
    // Limpiar descripción
    descripcion = descripcion
      .replace(/\s+/g, " ")
      .replace(/^[\(\)]+|[\(\)]+$/g, "")
      .trim();
    
    const importe = parseAmount(montoStr);
    
    console.log(`Concepto encontrado: ${codigo} - ${descripcion} - ${montoStr} = ${importe}`);
    
    if (importe > 0 && descripcion.length >= 4) {
      const esDeduccion =
        /(Aporte|Descuento|Retenc|IPS|Jubil|Sindicato|Familiar\s+a\s+Cargo|Previsional)/i.test(descripcion);
      
      const esNoRemun = /SAC\s+s\/ap|No\s+Remun/i.test(descripcion);

      conceptos.push({
        codigo,
        descripcion,
        haberes: esDeduccion ? 0 : (esNoRemun ? 0 : importe),
        deducciones: esDeduccion ? importe : 0,
        noRemunerativo: esNoRemun ? importe : 0,
      });
    }
  }

  console.log(`Total conceptos extraídos: ${conceptos.length}`);

  // Fallback: buscar en líneas si no encontramos conceptos con regex
  if (conceptos.length < 2) {
    for (const line of lines) {
      const montos = line.match(moneyRx);
      if (!montos || montos.length === 0) continue;

      const codigoMatch = line.match(/^(\d{2,4})\s/);
      if (!codigoMatch) continue;
      
      const codigo = codigoMatch[1];

      const descripcion = line
        .replace(/^\d{1,4}\s*/, "")
        .replace(moneyRx, "")
        .trim();

      if (descripcion.length < 4) continue;

      const importe = parseAmount(montos[montos.length - 1]);

      const esDeduccion =
        /(Aporte|Descuento|Retenc|IPS|Jubil|Sindicato|Familiar\s+a\s+Cargo|Previsional)/i.test(descripcion);
      
      const esNoRemun = /SAC\s+s\/ap|No\s+Remun/i.test(descripcion);

      conceptos.push({
        codigo,
        descripcion,
        haberes: esDeduccion ? 0 : (esNoRemun ? 0 : importe),
        deducciones: esDeduccion ? importe : 0,
        noRemunerativo: esNoRemun ? importe : 0,
      });
    }
  }

  // -----------------------------------------
  // 6. TOTALES TYPE-SAFE (sin nulls)
  // -----------------------------------------
  const totalHabLine = findLine(/Total(?:es)?\s*[:\s]*([\d\.,]+)\s*([\d\.,]+)?/i);
  const netoLine = findLine(/Neto\s+a\s+Percibir[:\s]*([\d\.,]+)/i);
  
  let totalHaberes = 0;
  let totalDeducciones = 0;
  let totalNoRemunerativo = 0;
  let neto = 0;

  // Buscar "Totales" - aceptar tanto coma como punto en decimales
  const totalesMatch = text.match(/Totales?\s+([\d]{1,3}(?:[,\.][\d]{3})*[,\.][\d]{2})\s+([\d]{1,3}(?:[,\.][\d]{3})*[,\.][\d]{2})\s+([\d]{1,3}(?:[,\.][\d]{3})*[,\.][\d]{2})/i);
  if (totalesMatch) {
    totalHaberes = parseAmount(totalesMatch[1]);
    totalNoRemunerativo = parseAmount(totalesMatch[2]);
    totalDeducciones = parseAmount(totalesMatch[3]);
    console.log(`Totales encontrados - Haberes: ${totalHaberes}, NoRemun: ${totalNoRemunerativo}, Deducciones: ${totalDeducciones}`);
  } else {
    totalHaberes = conceptos.reduce((s, c) => s + c.haberes, 0);
    totalDeducciones = conceptos.reduce((s, c) => s + c.deducciones, 0);
    totalNoRemunerativo = conceptos.reduce((s, c) => s + (c.noRemunerativo || 0), 0);
  }

  // Buscar "Neto a Percibir"
  const netoMatch = text.match(/Neto\s+a\s+Percibir\s+([\d]{1,3}(?:[,\.][\d]{3})*[,\.][\d]{2})/i);
  if (netoMatch) {
    neto = parseAmount(netoMatch[1]);
    console.log(`Neto a Percibir encontrado: ${neto}`);
  } else {
    neto = totalHaberes + totalNoRemunerativo - totalDeducciones;
  }

  // -----------------------------------------
  // 7. OBJETO FINAL TYPE-SAFE
  // -----------------------------------------
  const recibo: ReciboSueldo = {
    id: crypto.randomUUID(),
    empleado: {
      nombre,
      apellido,
      cuil,
      categoria: "",
      fechaIngreso: fechaIngresoMatch ? fechaIngresoMatch[0] : "",
    },
    empleador: {
      razonSocial: orgLine,
      cuit: "",
      direccion: "",
      actividad: "",
    },
    periodo: {
      mes: periodoMes,
      año: periodoAño,
    },
    conceptos,
    totales: {
      totalHaberes,
      totalDeducciones,
      totalNoRemunerativo,
      neto,
    },
    archivoOriginalUrl: meta?.filename || "",
    observaciones: [],
    metadata: {
      nombreArchivo: meta?.filename || "",
      deteccionAutomatica: "OCR",
    },
    fechaCarga: new Date().toISOString(),
    origen: "ocr",
  };

  return recibo;
}

export default { parseReciboFromOCR };
