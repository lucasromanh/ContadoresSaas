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
    // Simple, confiable: preprocess image for OCR using canvas and optional OpenCV.

    declare global {
      interface Window {
        cv?: any;
      }
    }

    export async function preprocessImageFileToDataUrl(file: File, maxWidth = 2000): Promise<string> {
      const dataUrl = await readFileAsDataUrl(file);
      const img = await loadImage(dataUrl);

      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return dataUrl;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, w, h);

      // If OpenCV is available, try a richer pipeline, otherwise small canvas ops
      if (typeof window !== 'undefined' && (window as any).cv && (window as any).cv.Mat) {
        const cv = (window as any).cv;
        let src: any;
        try {
          src = cv.imread(canvas);
          const gray = new cv.Mat();
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
          // small blur + unsharp approximation
          const blur = new cv.Mat();
          cv.GaussianBlur(gray, blur, new cv.Size(3, 3), 0);
          const sharp = new cv.Mat();
          cv.addWeighted(gray, 1.3, blur, -0.3, 0, sharp);
          blur.delete();
          // try adaptive threshold
          const dst = new cv.Mat();
          try {
            cv.adaptiveThreshold(sharp, dst, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 25, 15);
            cv.imshow(canvas, dst);
          } catch (e) {
            // fallback: show sharp
            try { cv.imshow(canvas, sharp); } catch (_) {}
          }
          // cleanup
          try { src.delete(); } catch(_){}
          try { gray.delete(); } catch(_){}
          try { sharp.delete(); } catch(_){}
          try { dst.delete(); } catch(_){}
        } catch (e) {
          console.warn('OpenCV preprocess failed, using canvas fallback', e);
          try { if (src) src.delete(); } catch(_){}
        }
      } else {
        // Canvas fallback: grayscale + small contrast
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const v = 0.299 * r + 0.587 * g + 0.114 * b;
          d[i] = d[i + 1] = d[i + 2] = v;
        }
        ctx.putImageData(imageData, 0, 0);
        // slight contrast
        try {
          const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = id.data;
          const contrast = 1.12;
          const intercept = 128 * (1 - contrast);
          for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
              let v = data[i + c];
              v = v * contrast + intercept;
              data[i + c] = Math.max(0, Math.min(255, v));
            }
          }
          ctx.putImageData(id, 0, 0);
        } catch {}
      }

      return canvas.toDataURL('image/png');
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
              cv.ADAPTIVE_THRESH_MEAN_C,
              cv.THRESH_BINARY,
              25,
              15
            );
          } catch {}

          // upscale slightly
          try {
            const resized = new cv.Mat();
            cv.resize(binary, resized, new cv.Size(0, 0), 1.5, 1.5, cv.INTER_CUBIC);
            cv.imshow(canvas, resized);
            resized.delete();
          } catch {}

          // cleanup
          try { src.delete(); } catch(_){}
          try { gray.delete(); } catch(_){}
          try { sharp.delete(); } catch(_){}
          try { denoised.delete(); } catch(_){}
          try { claheDst.delete(); } catch(_){}
          try { binary.delete(); } catch(_){}
        } catch (e) {
          console.warn('Error en pipeline OpenCV, usando canvas básico', e);
          try { if (src) src.delete(); } catch(_){}
        }
      } else {
        // Fallback: canvas basic grayscale + slight contrast
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const v = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = data[i + 1] = data[i + 2] = v;
        }
        ctx.putImageData(imageData, 0, 0);

        // small contrast boost
        try {
          const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = id.data;
          const contrast = 1.15;
          const intercept = 128 * (1 - contrast);
          for (let i = 0; i < d.length; i += 4) {
            for (let c = 0; c < 3; c++) {
              let v = d[i + c];
              v = v * contrast + intercept;
              d[i + c] = Math.max(0, Math.min(255, v));
            }
          }
          ctx.putImageData(id, 0, 0);
        } catch (e) {
          // ignore if cross-origin or not available
        }
      }

      return canvas.toDataURL('image/png');
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
