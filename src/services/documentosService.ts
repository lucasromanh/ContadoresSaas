// Mock documentos service: store metadata in-memory and simulate saving files
const storage: any[] = []

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(String(fr.result || ''))
    fr.onerror = (e) => rej(e)
    fr.readAsDataURL(file)
  })
}

export async function saveDocument(file: File, meta: any) {
  const content = await readFileAsDataURL(file).catch(()=>undefined)
  const item = { id: `${Date.now()}`, name: file.name, size: file.size, meta, createdAt: new Date().toISOString(), content }
  storage.push(item)
  // In a real implementation you would upload to backend or local storage
  return item
}

export async function listDocuments() {
  // return a shallow copy
  return [...storage]
}

export async function getDocument(id: string) {
  return storage.find((s) => s.id === id) || null
}

export async function removeDocument(id: string) {
  const idx = storage.findIndex((s) => s.id === id)
  if (idx >= 0) storage.splice(idx, 1)
  return true
}

export async function updateDocument(id: string, payload: Partial<any>) {
  const it = storage.find((s) => s.id === id)
  if (!it) return null
  Object.assign(it, payload)
  return it
}

export default { saveDocument, listDocuments, getDocument, removeDocument, updateDocument }
