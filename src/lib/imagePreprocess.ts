// src/lib/imagePreprocess.ts
// Preprocesado simple + opcional OpenCV.js si está disponible

declare global {
  interface Window {
    cv?: any; // soporte opcional OpenCV.js
  }
}

export async function preprocessImageFileToDataUrl(
  file: File,
  maxWidth = 2000
): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  // Resize para mejorar OCR
  const scale = Math.min(1, maxWidth / img.width);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  canvas.width = w;
  canvas.height = h;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, w, h);

  // ------------------------------------------------------
  // OPEN-CV PIPELINE (solo si window.cv existe)
  // ------------------------------------------------------
  if (window.cv?.Mat) {
    try {
      const cv = window.cv;
      const src = cv.imread(canvas);

      // escala de grises
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // unsharp mask
      const blur = new cv.Mat();
      cv.GaussianBlur(gray, blur, new cv.Size(3, 3), 0);
      const sharp = new cv.Mat();
      cv.addWeighted(gray, 1.3, blur, -0.3, 0, sharp);

      blur.delete();

      // binarización
      const binary = new cv.Mat();
      cv.adaptiveThreshold(
        sharp,
        binary,
        255,
        cv.ADAPTIVE_THRESH_MEAN_C,
        cv.THRESH_BINARY,
        25,
        15
      );

      // upscale
      const resized = new cv.Mat();
      cv.resize(
        binary,
        resized,
        new cv.Size(0, 0),
        1.3,
        1.3,
        cv.INTER_CUBIC
      );

      cv.imshow(canvas, resized);

      // cleanup
      src.delete();
      gray.delete();
      sharp.delete();
      binary.delete();
      resized.delete();

      return canvas.toDataURL("image/png");
    } catch (err) {
      console.warn("OpenCV falló, usando fallback:", err);
    }
  }

  // ------------------------------------------------------
  // FALLBACK CANVAS: grises + contraste
  // ------------------------------------------------------
  try {
    const id = ctx.getImageData(0, 0, w, h);
    const data = id.data;

    // grayscale
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
    ctx.putImageData(id, 0, 0);

    // contraste
    const id2 = ctx.getImageData(0, 0, w, h);
    const d2 = id2.data;
    const contrast = 1.15;
    const intercept = 128 * (1 - contrast);

    for (let i = 0; i < d2.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        let v = d2[i + c];
        v = v * contrast + intercept;
        d2[i + c] = Math.max(0, Math.min(255, v));
      }
    }

    ctx.putImageData(id2, 0, 0);
  } catch (err) {
    console.warn("Canvas preprocess fallback error:", err);
  }

  return canvas.toDataURL("image/png");
}

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = dataUrl;
  });
}

export default { preprocessImageFileToDataUrl };
