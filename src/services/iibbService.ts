
export type IIBBEntry = {
  id: string
  fecha: string
  tipo: string
  emisorCuit?: string
  receptorCuit?: string
  total: number
  origen?: string
}

let store: IIBBEntry[] = []

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export function addEntry(e: Omit<IIBBEntry, 'id'>) {
  const entry: IIBBEntry = { id: generateId(), ...e }
  store = [entry, ...store]
  try { localStorage.setItem('iibb.entries', JSON.stringify(store)) } catch (e) {}
  return entry
}

export function getEntries() {
  try {
    const s = localStorage.getItem('iibb.entries')
    if (s) store = JSON.parse(s)
  } catch (e) {}
  return store
}

export function clearEntries() {
  store = []
  try { localStorage.removeItem('iibb.entries') } catch (e) {}
}

export default { addEntry, getEntries, clearEntries }
