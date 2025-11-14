// Minimal ambient module declarations for pdfjs-dist to satisfy TypeScript
declare module 'pdfjs-dist/legacy/build/pdf' {
  const value: any
  export = value
}

declare module 'pdfjs-dist/build/pdf.worker.entry' {
  const value: any
  export = value
}
