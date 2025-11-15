// ------------------------------------------------------
// OCR Processor – pdf.js 4.x + Tesseract.js v5 (API correcta)
// ------------------------------------------------------

import * as pdfjsLib from "pdfjs-dist";
import { preprocessImageFileToDataUrl } from "./imagePreprocess";

import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export type OCRResult = {
  text: string;
  pages?: string[];
  words?: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
};

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as ArrayBuffer);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}

// ------------------------------------------------------
// OCR PARA PDF → Renderizar página y pasarla por Tesseract
// ------------------------------------------------------
async function extractTextFromPdf(file: File): Promise<OCRResult> {
  const buffer = await readFileAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pagesText: string[] = [];
  const allWords: any[] = [];

  // Tesseract v5
  const { createWorker } = await import("tesseract.js");

  // OEM = 1 (LSTM_ONLY)
  const worker: any = await createWorker("spa", 1);

  await worker.setParameters({
    preserve_interword_spaces: "1",
    tessedit_pageseg_mode: "6",
    tessedit_char_blacklist: "|•—–=“”¡!•<>[]{}",
    tessedit_char_whitelist:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.,:/()áéíóúÁÉÍÓÚñÑ %"
  });

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    // Aumentar escala a 3 para mejor calidad de OCR
    const viewport = page.getViewport({ scale: 3 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d")!;
    // Fondo blanco para mejor contraste
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport,
      canvas
    }).promise;

    const dataUrl = canvas.toDataURL("image/png");

    console.log(`Procesando página ${i} del PDF con Tesseract...`);
    const { data } = await worker.recognize(dataUrl);

    const text = (data.text || "").replace(/\s+/g, " ").trim();
    pagesText.push(text);

    if (Array.isArray((data as any)?.words)) {
      for (const wr of (data as any).words) {
        allWords.push({
          text: wr.text || "",
          bbox: {
            x0: wr.bbox.x0,
            y0: wr.bbox.y0,
            x1: wr.bbox.x1,
            y1: wr.bbox.y1
          }
        });
      }
    }
  }

  await worker.terminate();

  return {
    text: pagesText.join("\n").trim(),
    pages: pagesText,
    words: allWords
  };
}

// ------------------------------------------------------
// OCR PARA IMAGEN
// ------------------------------------------------------
async function ocrImage(file: File): Promise<OCRResult> {
  const { createWorker } = await import("tesseract.js");

  // Leer imagen
  let dataUrl = await readFileAsDataURL(file);

  try {
    if (file.type.startsWith("image/")) {
      dataUrl = await preprocessImageFileToDataUrl(file);
    }
  } catch {}

  // Crear worker correctamente (sin configs extra)
  const worker: any = await createWorker("spa", 1);

  // Parámetros recomendados
  await worker.setParameters({
    preserve_interword_spaces: "1",
    tessedit_pageseg_mode: "6",
    tessedit_char_blacklist: "|•—–=“”¡!•<>[]{}",
    tessedit_char_whitelist:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.,:/()áéíóúÁÉÍÓÚñÑ %"
  });

  // Ejecutar OCR
  const { data } = await worker.recognize(dataUrl);

  await worker.terminate();

  // Texto limpio
  const text = (data.text || "").replace(/\s+/g, " ").trim();

  // Words con bounding boxes
  const words: any[] = [];

  if (Array.isArray((data as any)?.words)) {
    for (const wr of (data as any).words) {
      words.push({
        text: wr.text || "",
        bbox: {
          x0: wr.bbox?.x0 ?? 0,
          y0: wr.bbox?.y0 ?? 0,
          x1: wr.bbox?.x1 ?? 0,
          y1: wr.bbox?.y1 ?? 0
        }
      });
    }
  }

  return {
    text,
    pages: [text],
    ...(words.length ? { words } : {})
  };
}


// ------------------------------------------------------
// Fallback
// ------------------------------------------------------
async function fallbackText(file: File): Promise<OCRResult> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const txt = String(r.result || "");
      res({
        text: txt.replace(/\s+/g, " ").trim(),
        pages: [txt]
      });
    };
    r.onerror = () => res({ text: "", pages: [] });
    r.readAsText(file);
  });
}

// ------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ------------------------------------------------------
export async function processFileOCR(file: File): Promise<OCRResult> {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    try {
      console.log("Procesando PDF con OCR (Tesseract)...");
      const pdf = await extractTextFromPdf(file);
      console.log(`PDF procesado: ${pdf.text.length} caracteres extraídos`);
      if (pdf.text.length > 50) return pdf;
      console.warn("PDF con poco texto extraído, puede ser escaneado");
    } catch (e) {
      console.error("Error procesando PDF:", e);
    }
  }

  if (file.type.startsWith("image/")) {
    try {
      return await ocrImage(file);
    } catch (e) {
      console.error("OCR Imagen:", e);
    }
  }

  return await fallbackText(file);
}

export default { processFileOCR };
