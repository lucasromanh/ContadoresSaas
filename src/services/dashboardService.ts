// Simple in-memory dashboard service to accumulate totals (mock)
let ingresos = 0
let costos = 0

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

export default { getTotals, addIngreso, addCosto }
