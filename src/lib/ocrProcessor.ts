// ------------------------------------------------------
// OCR Processor compatible con Vite + TS + pdf.js 3.x + Tesseract.js v5
// ------------------------------------------------------

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import { preprocessImageFileToDataUrl } from "./imagePreprocess";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export type OCRResult = {
  text: string;
  pages?: string[];
  words?: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
};

// ----------------------------
// Helpers
// ----------------------------
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
// 1) PDF OCR mediante extracción real pdf.js
// ------------------------------------------------------
async function extractTextFromPdf(file: File): Promise<OCRResult> {
  const buffer = await readFileAsArrayBuffer(file);

  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let full = "";
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((it: any) => it.str || it.text || "")
      .join(" ");

    pages.push(pageText);
    full += pageText + "\n";
  }

  const normalized = full.replace(/\s+/g, " ").trim();
  return { text: normalized, pages };
}

// ------------------------------------------------------
// 2) Tesseract OCR para imágenes
// ------------------------------------------------------
async function ocrImage(file: File): Promise<OCRResult> {
  const t = await import("tesseract.js");

  let dataUrl = await readFileAsDataURL(file);

  // Preprocesado OpenCV-lite
  try {
    if (file.type.startsWith("image/")) {
      dataUrl = await preprocessImageFileToDataUrl(file);
    }
  } catch {}

  // Worker casteado a any para evitar errores TS
  const worker: any = await t.createWorker();

  await worker.load();
  await worker.loadLanguage("spa").catch(() => worker.loadLanguage("eng"));
  await worker.initialize("spa").catch(() => worker.initialize("eng"));

  await worker.setParameters({ tessedit_pageseg_mode: 1 });

  const { data } = await worker.recognize(dataUrl);
  await worker.terminate();

  const text = (data?.text || "").replace(/\s+/g, " ").trim();

  const d: any = data;
  const words: any[] = [];

  if (Array.isArray(d?.words)) {
    for (const w of d.words) {
      words.push({
        text: w.text || "",
        bbox: {
          x0: w.bbox?.x0 ?? 0,
          y0: w.bbox?.y0 ?? 0,
          x1: w.bbox?.x1 ?? 0,
          y1: w.bbox?.y1 ?? 0
        }
      });
    }
  }

  return { text, pages: [text], ...(words.length ? { words } : {}) };
}

// ------------------------------------------------------
// 3) Fallback
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
      const pdf = await extractTextFromPdf(file);
      if (pdf.text && pdf.text.length > 20) {
        return pdf;
      }
    } catch (e) {
      console.error("Error PDF:", e);
    }
  }

  if (file.type.startsWith("image/")) {
    try {
      return await ocrImage(file);
    } catch (e) {
      console.error("Error OCR Imagen:", e);
    }
  }

  return await fallbackText(file);
}

export default { processFileOCR };
