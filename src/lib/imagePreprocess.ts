// src/lib/imagePreprocess.ts

// Este helper intenta aplicar un pipeline "tipo OpenCV" si cv.js está disponible.
// Si no, al menos hace un preprocesado básico con <canvas> (grises + contraste).
// Devuelve SIEMPRE un dataURL listo para pasar a Tesseract.

declare global {
  interface Window {
    cv?: any; // OpenCV.js global si lo cargás con <script src="opencv.js">
  }
}

export async function preprocessImageFileToDataUrl(file: File): Promise<string> {
  // 1) Leemos la imagen como dataURL
  const dataUrl = await readFileAsDataUrl(file);
  // 2) La cargamos en un <img> para dibujarla en un canvas
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // Si tenemos OpenCV.js en window.cv, usamos pipeline completo
  if (typeof window !== 'undefined' && (window as any).cv && (window as any).cv.Mat) {
    const cv = (window as any).cv;

    // Convertimos el canvas a Mat
    let src = cv.imread(canvas);
    let gray = new cv.Mat();
    let sharp = new cv.Mat();
    let denoised = new cv.Mat();
    let claheDst = new cv.Mat();
    let binary = new cv.Mat();

    try {
      // 2) Escala de grises
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // 3) Sharpen (unsharp mask simple)
      const blur = new cv.Mat();
      cv.GaussianBlur(gray, blur, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
      cv.addWeighted(gray, 1.5, blur, -0.5, 0, sharp);
      blur.delete();

      // 4) Reducción de ruido
      cv.fastNlMeansDenoising(sharp, denoised, 30, 7, 21);

      // 5) Aumento de contraste (CLAHE)
      const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
      clahe.apply(denoised, claheDst);
      clahe.delete();

      // 6) Binarización adaptativa
      cv.adaptiveThreshold(
        claheDst,
        binary,
        255,
        cv.ADAPTIVE_THRESH_MEAN_C,
        cv.THRESH_BINARY,
        25,
        15
      );

      // 7) “Aumento de DPI”: reescalamos 1.5x
      const resized = new cv.Mat();
      cv.resize(
        binary,
        resized,
        new cv.Size(0, 0),
        1.5,
        1.5,
        cv.INTER_CUBIC
      );

      // Pintamos el resultado final en el canvas
      cv.imshow(canvas, resized);
      resized.delete();
    } catch (e) {
      // Si algo falla, al menos dejamos el canvas original dibujado
      console.warn('Error en pipeline OpenCV, usando imagen original', e);
    } finally {
      try { src.delete(); } catch(_){}
      try { gray.delete(); } catch(_){}
      try { sharp.delete(); } catch(_){}
      try { denoised.delete(); } catch(_){}
      try { claheDst.delete(); } catch(_){}
      try { binary.delete(); } catch(_){}
    }
  } else {
    // 🔸 Fallback sin OpenCV: mínimo preprocesado en canvas
    // Pasamos a grises
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // luminosidad
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = data[i + 1] = data[i + 2] = v;
    }

    ctx.putImageData(imageData, 0, 0);

    // Pequeño aumento de contraste global
    const contrast = 1.2;
    const brightness = 0;
    const imgData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d2 = imgData2.data;
    for (let i = 0; i < d2.length; i += 4) {
      d2[i] = clamp(d2[i] * contrast + brightness);
      d2[i + 1] = clamp(d2[i + 1] * contrast + brightness);
      d2[i + 2] = clamp(d2[i + 2] * contrast + brightness);
    }
    ctx.putImageData(imgData2, 0, 0);
  }

  // Devolvemos SIEMPRE PNG binarizado / mejorado
  return canvas.toDataURL('image/png');
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, v));
}

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
// Simple image preprocessing utilities to improve OCR results
export async function preprocessImageFileToDataUrl(file: File, maxWidth = 2000): Promise<string> {
  // Load image
  const img = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / img.width)
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  // draw with some smoothing disabled to keep sharpness
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(img, 0, 0, w, h)

  // Basic contrast/brightness adjustment: increase contrast a bit
  try{
    const id = ctx.getImageData(0,0,w,h)
    const data = id.data
    const contrast = 1.15 // 15% contrast
    const intercept = 128 * (1 - contrast)
    for (let i = 0; i < data.length; i += 4){
      for (let c = 0; c < 3; c++){
        let v = data[i + c]
        v = v * contrast + intercept
        data[i + c] = Math.max(0, Math.min(255, v))
      }
    }
    ctx.putImageData(id, 0, 0)
  }catch(e){ /* ignore if cross-origin or not available */ }

  // return data URL
  return canvas.toDataURL('image/png')
}

export default { preprocessImageFileToDataUrl }
