import * as pdfjsLib from "pdfjs-dist";

// NECESARIO para que funcione dentro de Vite/Webpack
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function pdfToImages(file: File): Promise<string[]> {
  const arrayBuf = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;

  const images: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const viewport = page.getViewport({ scale: 2 }); // mejora OCR

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // 🔥 FIX OBLIGATORIO — pdf.js exige { canvas, canvasContext, viewport }
    await page.render({
      canvasContext: ctx,
      viewport,
      canvas,  // <- ESTE ES EL QUE FALTABA Y CAUSABA EL ERROR
    }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    images.push(dataUrl);
  }

  return images;
}

export default pdfToImages;
