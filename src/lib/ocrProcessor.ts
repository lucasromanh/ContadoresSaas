// OCR processor with optional Tesseract.js integration.
// Si tesseract.js está disponible, se usa. Si no, se hace un fallback seguro SIN basura binaria.
import { pdfToImages } from './pdfToImages';

export async function processFileOCR(file: File): Promise<{ text: string; pages?: string[]; words?: any[] }> {
  // Construimos array de páginas (dataURLs). Si es PDF, convertimos cada página a imagen.
  let pages: string[] = [];

  try {
    if (file.type === 'application/pdf') {
      try {
        pages = await pdfToImages(file);
      } catch (err) {
        return { text: '', pages: [], error: 'No se pudo leer el PDF' } as any;
      }
    } else if (file.type && file.type.startsWith('image/') && typeof window !== 'undefined') {
      try {
        const ip = await import('./imagePreprocess');
        const dataUrl = await ip.preprocessImageFileToDataUrl(file as any);
        pages = [dataUrl];
      } catch (e) {
        const dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result));
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        pages = [dataUrl];
      }
    } else {
      // Otros tipos: intentamos leer como dataURL (puede ser un PNG/JPEG sin MIME) o fallback
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        try {
          r.readAsDataURL(file);
        } catch (e) {
          rej(e);
        }
      });
      pages = [dataUrl];
    }
  } catch (e) {
    // si algo falla al obtener páginas, hacemos fallback
    const fallback = `OCR_FALLBACK ${file.name}`;
    return { text: fallback, pages: [fallback] } as any;
  }

  // Intentamos usar Tesseract si está disponible
  try {
    const t = await import('tesseract.js');

    if (t && (t as any).createWorker) {
      const worker: any = await (t.createWorker as any)();

      await worker.load();
      await worker.loadLanguage('spa').catch(() => worker.loadLanguage('eng'));
      await worker.initialize('spa').catch(() => worker.initialize('eng'));

      try {
        await worker.setParameters({ tessedit_pageseg_mode: '1' });
      } catch (e) {}

      let fullText = '';
      const allWords: any[] = [];

      for (const pageImg of pages) {
        try {
          const { data } = await worker.recognize(pageImg);
          fullText += '\n' + (data && data.text ? String(data.text) : '');

          if (data && Array.isArray(data.words)) {
            for (const w of data.words) {
              allWords.push({
                text: String(w.text || ''),
                bbox: {
                  x0: w.bbox?.x0 ?? w.x0 ?? 0,
                  y0: w.bbox?.y0 ?? w.y0 ?? 0,
                  x1: w.bbox?.x1 ?? w.x1 ?? 0,
                  y1: w.bbox?.y1 ?? w.y1 ?? 0,
                },
              });
            }
          }
        } catch (e) {
          // si una página falla, seguimos con la siguiente
        }
      }

      await worker.terminate();

      const normalized = cleanOcrText(fullText);

      return { text: normalized, pages, ...(allWords.length ? { words: allWords } : {}) };
    }
  } catch (e) {
    // tesseract no disponible -> pasamos al fallback
  }

  // Fallback seguro: si el archivo parece texto, lo leemos como texto
  const isProbablyText = !file.type || /^text\//.test(file.type) || /application\/(json|xml)/.test(file.type);

  if (isProbablyText) {
    const readAsText = (): Promise<string> =>
      new Promise((res) => {
        const r = new FileReader();
        r.onload = () => {
          res(String(r.result || `Contenido de ${file.name}`));
        };
        r.onerror = () => {
          res(`Contenido de ${file.name}`);
        };
        try {
          r.readAsText(file);
        } catch (e) {
          res(`Contenido de ${file.name}`);
        }
      });

    const txt = await readAsText();
    const normalized = cleanOcrText(txt);
    return { text: normalized, pages: [normalized] };
  }

  // Si es imagen/PDF y no hay OCR real disponible, NO devolvemos basura binaria.
  const fallback = `OCR_FALLBACK ${file.name}`;
  return { text: fallback, pages: [fallback] };
}

// 🔹 Utilidad: limpiar texto corrupto (líneas con demasiados símbolos raros)
function cleanOcrText(text: string): string {
  const lines = (text || '').split(/\r?\n/);

  const isCorruptLine = (l: string) => {
    const cleaned = l.replace(/\s/g, '');
    if (!cleaned) return true;
    // permitimos letras, números, acentos, puntuación básica
    const allowed = cleaned.replace(/[\wÁÉÍÓÚÑáéíóúñ.,;:$\-\/]/g, '');
    const ratio = allowed.length / cleaned.length;
    // si más del 40% son caracteres raros, consideramos que la línea está corrupta
    return ratio > 0.4;
  };

  const filtered = lines.map((l) => l.trim()).filter((l) => l && !isCorruptLine(l));

  return filtered.join('\n').replace(/\s+$/g, '').trim();
}

export default { processFileOCR };
