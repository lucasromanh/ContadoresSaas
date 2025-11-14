// Simple in-memory dashboard service to accumulate totals (mock)
let ingresos = 0
let costos = 0
let proximosVencimientos: Array<any> = []

export function getTotals() {
  return { ingresos, costos }
}

export async function addIngreso(amount: number) {
  ingresos += Number(amount || 0)
  return getTotals()
}

export async function addCosto(amount: number) {
  costos += Number(amount || 0)
  return getTotals()
}

export function getProximos() {
  return proximosVencimientos
}

export function setProximos(items: Array<any>) {
  proximosVencimientos = items.slice(0, 10)
  return proximosVencimientos
}

export function addProximo(item: any) {
  proximosVencimientos = [item, ...proximosVencimientos].slice(0, 10)
  return proximosVencimientos
}

export default { getTotals, addIngreso, addCosto, getProximos, setProximos, addProximo }
