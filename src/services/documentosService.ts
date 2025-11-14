// Mock documentos service: store metadata in-memory and simulate saving files
const storage: any[] = []

export async function saveDocument(file: File, meta: any) {
  const item = { id: `${Date.now()}`, name: file.name, size: file.size, meta, createdAt: new Date().toISOString() }
  storage.push(item)
  // In a real implementation you would upload to backend or local storage
  return item
}

export async function listDocuments() {
  return storage
}

export default { saveDocument, listDocuments }
