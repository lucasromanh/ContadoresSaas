import { normalizeFactura } from './NormalizadorFactura'

const STORAGE_KEY = 'facturas_v1'

function loadAll(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]') }catch(e){ return [] }
}

function saveAll(list:any[]){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function saveFactura(f:any){
  const all = loadAll()
  const id = Date.now().toString(36)
  f.id = id
  f.fechaCarga = new Date().toISOString()
  const normalized = normalizeFactura(f)
  all.push(normalized)
  saveAll(all)
  return normalized
}

export function listFacturas(){
  return loadAll()
}

export default { saveFactura, listFacturas }
