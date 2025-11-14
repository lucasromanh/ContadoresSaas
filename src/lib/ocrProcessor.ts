// OCR processor with optional Tesseract.js integration.
// Si tesseract.js está disponible, se usa. Si no, se hace un fallback seguro SIN basura binaria.
export async function processFileOCR(file: File): Promise<{ text: string; pages?: string[]; words?: any[] }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const t = await import('tesseract.js');

    if (t && (t as any).createWorker) {
      // 🔹 PREPROCESADO "tipo OpenCV" (en otro archivo)
      let dataUrl: string;
      try {
        if (file.type && file.type.startsWith('image/') && typeof window !== 'undefined') {
          const ip = await import('./imagePreprocess');
          // usa nuestro pipeline antes de mandar a Tesseract
          dataUrl = await ip.preprocessImageFileToDataUrl(file as any);
        } else {
          // si no es imagen, solo la leemos como dataURL normal (por ejemplo, PDF ya rasterizado)
          dataUrl = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(String(r.result));
            r.onerror = rej;
            r.readAsDataURL(file);
          });
        }
      } catch (e) {
        // fallback muy simple a dataURL
        dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result));
          r.onerror = rej;
          r.readAsDataURL(file);
        });
      }

      const worker: any = await (t.createWorker as any)();

      await worker.load();
      await worker.loadLanguage('spa').catch(() => worker.loadLanguage('eng'));
      await worker.initialize('spa').catch(() => worker.initialize('eng'));

      // modo de segmentación para documentos
      try {
        await worker.setParameters({ tessedit_pageseg_mode: '1' });
      } catch (e) {}

      const { data } = await worker.recognize(dataUrl);
      await worker.terminate();

      const rawText = (data && data.text) ? String(data.text) : String(file.name);

      // 🔹 normalizamos texto y limpiamos líneas obviamente corruptas
      const normalized = cleanOcrText(rawText);

      const words: Array<any> = [];
      try {
        if (data && Array.isArray(data.words)) {
          for (const w of data.words) {
            words.push({
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
      } catch (e) {}

      return { text: normalized, pages: [normalized], ...(words.length ? { words } : {}) };
    }
  } catch (e) {
    // tesseract no disponible -> pasamos al fallback
  }

  // 🔻 Fallback seguro (sin leer binario como texto)
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
