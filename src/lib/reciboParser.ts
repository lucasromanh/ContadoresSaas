import { ReciboSueldo } from "../types/reciboSueldo";

function parseAmount(s: string | number | undefined): number {
  if (!s) return 0;
  const cleaned = String(s)
    .replace(/[^0-9,\.\-]/g, "")
    .replace(/\.(?=\d{3}(?:\.|,|$))/g, "")
    .replace(",", ".");
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
  if (!ocr.words?.length)
    return (ocr.text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const linesMap: Array<{
    y: number;
    words: Array<{ text: string; x: number }>;
  }> = [];

  const clean = (s: string) =>
    s
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]+/g, " ")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  for (const w of ocr.words) {
    const cy = (w.bbox.y0 + w.bbox.y1) / 2;
    const text = clean(w.text);
    if (!text) continue;

    let group = linesMap.find((l) => Math.abs(l.y - cy) < 8);
    if (!group) {
      group = { y: cy, words: [] };
      linesMap.push(group);
    }
    group.words.push({ text, x: w.bbox.x0 });
  }

  return linesMap
    .sort((a, b) => a.y - b.y)
    .map((l) => l.words.sort((a, b) => a.x - b.x).map((w) => w.text).join(" "))
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
    text.match(/CUIL[:\s]*([\d\-]+)/i) || text.match(/(\d{2}-\d{8}-\d)/);
  const cuil = cuilMatch ? (cuilMatch[1] || cuilMatch[0]) : "";

  const cuilLineIdx = lines.findIndex((l) => /CUIL/i.test(l));
  const nombreLine =
    cuilLineIdx > 0 ? lines[cuilLineIdx - 1] : lines[0] || "";

  const partes = nombreLine.split(/\s+/);
  const apellido = partes[0] || "";
  const nombre = partes.slice(1).join(" ") || nombreLine;

  // -----------------------------------------
  // 2. FECHA INGRESO
  // -----------------------------------------
  const fechaIngresoMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);

  // -----------------------------------------
  // 3. PERIODO
  // -----------------------------------------
  const periodoMatch = text.match(
    /(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\s+\d{4}/i
  );

  const periodoMes = periodoMatch
    ? periodoMatch[1]
    : "Sin dato";

  const periodoAño = periodoMatch
    ? Number(periodoMatch[0].match(/\d{4}/)![0])
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

  for (const line of lines) {
    const montos = line.match(moneyRx);
    if (!montos) continue;

    const codigoMatch = line.match(/^\d{1,4}/);
    const codigo = codigoMatch ? codigoMatch[0] : "";

    const descripcion = line
      .replace(/^\d{1,4}\s*/, "")
      .replace(moneyRx, "")
      .trim();

    const importe = parseAmount(montos[montos.length - 1]);

    const esDeduccion =
      /(Aporte|Descuento|Retenc|IPS|Jubil|Sindicato)/i.test(descripcion);

    conceptos.push({
      codigo,
      descripcion,
      haberes: esDeduccion ? 0 : importe,
      deducciones: esDeduccion ? importe : 0,
      noRemunerativo: 0, // obligatorio en tu tipo
    });
  }

  // -----------------------------------------
  // 6. TOTALES TYPE-SAFE (sin nulls)
  // -----------------------------------------
  const totalHabLine = findLine(/Total\s+Haberes/i);
  const totalHaberes = totalHabLine
    ? parseAmount(totalHabLine.match(moneyRx)![0])
    : conceptos.reduce((s, c) => s + c.haberes, 0);

  const totalDedLine = findLine(/Total\s+Deducciones/i);
  const totalDeducciones = totalDedLine
    ? parseAmount(totalDedLine.match(moneyRx)![0])
    : conceptos.reduce((s, c) => s + c.deducciones, 0);

  const totalNoRemunerativo = conceptos.reduce(
    (s, c) => s + (c.noRemunerativo || 0),
    0
  );

  const neto = totalHaberes - totalDeducciones;

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
