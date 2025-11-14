Lector Inteligente de Facturas AFIP / ARCA

Uso rápido:

- Ruta: /lector-facturas
- Permite subir PDF, XML, JPG, PNG.
- El módulo intentará extraer texto usando pdfjs (PDF) o Tesseract (OCR) y luego parseará los datos con heurísticas.

Limitaciones actuales:

- OCR y PDF funcionan en el navegador usando tesseract.js y pdfjs-dist; pueden ser lentos en el cliente.
- El parser es heurístico (regex) y puede requerir ajustes según variaciones de formato.

Siguientes pasos:

- Mejorar el parser para XML AFIP reales.
- Reusar worker de Tesseract para rendimiento.
- Añadir tests unitarios para `facturaParser`.
- Integrar guardado en backend real para Documentos, Libros IVA, IIBB y Riesgo Fiscal.
