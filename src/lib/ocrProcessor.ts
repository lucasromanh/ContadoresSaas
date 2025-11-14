// ------------------------------------------------------
// OCR Processor compatible con Vite + TS + pdf.js 4.x + Tesseract.js v5
// ------------------------------------------------------

import * as pdfjsLib from "pdfjs-dist";
import { preprocessImageFileToDataUrl } from "./imagePreprocess";

// 👇 NUEVO Worker compatible con Vite + pdf.js 4.x
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
// 1) OCR REAL PARA PDF → pdf.js extraction
// ------------------------------------------------------
async function extractTextFromPdf(file: File): Promise<OCRResult> {
  const buffer = await readFileAsArrayBuffer(file);

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

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

  return {
    text: full.replace(/\s+/g, " ").trim(),
    pages
  };
}

// ------------------------------------------------------
// 2) OCR PARA IMÁGENES → Tesseract.js
// ------------------------------------------------------
async function ocrImage(file: File): Promise<OCRResult> {
  const t = await import("tesseract.js");

  let dataUrl = await readFileAsDataURL(file);

  try {
    if (file.type.startsWith("image/")) {
      dataUrl = await preprocessImageFileToDataUrl(file);
    }
  } catch {}

  const worker: any = await t.createWorker();

  await worker.load();
  await worker.loadLanguage("spa").catch(() => worker.loadLanguage("eng"));
  await worker.initialize("spa").catch(() => worker.initialize("eng"));
  await worker.setParameters({ tessedit_pageseg_mode: 1 });

  const { data } = await worker.recognize(dataUrl);
  await worker.terminate();

  const text = (data?.text || "").replace(/\s+/g, " ").trim();

  const w = data as any;
  const words: any[] = [];

  if (Array.isArray(w?.words)) {
    for (const wr of w.words) {
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
  // PDF
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    try {
      const pdf = await extractTextFromPdf(file);
      if (pdf.text.length > 20) return pdf;
    } catch (e) {
      console.error("Error PDF:", e);
    }
  }

  // Imagen
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
