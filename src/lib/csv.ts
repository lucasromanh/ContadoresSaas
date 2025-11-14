export function exportToCsv(rows: any[], filename = 'export.csv') {
  if (!rows || rows.length === 0) return
  const keys = Object.keys(rows[0])
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function importCsv(file: File) {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map((ln) => {
    // naive CSV parse: split by comma respecting quotes would be better
    const cols = ln.split(',').map((c) => c.replace(/^"|"$/g, ''))
    const obj: any = {}
    headers.forEach((h, i) => (obj[h] = cols[i] ?? ''))
    return obj
  })
  return rows
}

export default { exportToCsv, importCsv }
