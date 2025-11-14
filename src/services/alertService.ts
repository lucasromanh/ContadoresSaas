const USE_MOCK = true

const mockAlerts = [
  { id: 'a1', text: 'AFIP vencido para cliente X', reviewed: false },
  { id: 'a2', text: 'Documento faltante — proveedor Y', reviewed: false }
]

export const alertService = {
  getAlerts: async () => {
    if (USE_MOCK) return mockAlerts
    const res = await fetch('/api/alerts')
    return res.json()
  },
  getUnreadCount: async () => {
    const alerts = await alertService.getAlerts()
    return alerts.filter((a: any) => !a.reviewed).length
  },
  markReviewed: async (id: string) => {
    if (USE_MOCK) {
      const idx = mockAlerts.findIndex((m) => m.id === id)
      if (idx >= 0) mockAlerts[idx].reviewed = true
      return mockAlerts[idx]
    }
    const res = await fetch(`/api/alerts/${id}/review`, { method: 'POST' })
    return res.json()
  }
}

export default alertService
