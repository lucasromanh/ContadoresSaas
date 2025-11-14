import React, { useMemo, useState, useRef } from 'react'
import { exportToCsv, importCsv } from '../../lib/csv'
import Input from './Input'

type Column<T> = { key: keyof T; label: string; sortable?: boolean }

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  pageSize?: number
  onAction?: (action: string, row: T) => void
  searchKeys?: (keyof T)[]
  stateKey?: keyof T // optional key used to color rows (e.g., estado)
}

export function SmartTable<T extends { id?: string }>({ columns, data, loading = false, pageSize = 10, onAction, searchKeys = [], stateKey }: Props<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [pageSizeState, setPageSizeState] = useState(pageSize)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const filtered = useMemo(() => {
    let items = data || []
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase()
      items = items.filter((it) => searchKeys.some((k) => String((it as any)[k] ?? '').toLowerCase().includes(q)))
    }
    if (sortKey) {
      items = [...items].sort((a: any, b: any) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (av == null) return 1
        if (bv == null) return -1
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    }
    return items
  }, [data, search, sortKey, sortDir, searchKeys])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSizeState))
  const paged = useMemo(() => filtered.slice((page - 1) * pageSizeState, page * pageSizeState), [filtered, page, pageSizeState])

  const colorByState = (s: any) => {
    if (!s) return ''
    const st = String(s).toLowerCase()
    if (st.includes('activo')) return 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100'
    if (st.includes('inactivo')) return 'bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-100'
    if (st.includes('suspend')) return 'bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
    return ''
  }

  if (loading) return <div className="p-4">Cargando tabla...</div>

  const handleExport = () => exportToCsv(filtered, 'export.csv')
  const handleImportClick = () => fileRef.current?.click()
  const handleImport = async (f?: FileList | null) => {
    if (!f || f.length === 0) return
    const rows = await importCsv(f[0])
    // callback to parent to handle imported rows
    // For now, fire a custom event via onAction if provided
    onAction?.('import', (rows as any) as T)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar..." className="w-56" />
        <button onClick={handleExport} className="px-2 py-1 border rounded text-sm">Exportar CSV</button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleImport(e.target.files)} />
          <button onClick={handleImportClick} className="px-2 py-1 border rounded text-sm">Importar CSV</button>
        </div>
        <div className="text-sm text-slate-500">{total} resultados</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className="text-left p-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>{c.label}</span>
                    {c.sortable && (
                      <button onClick={() => {
                        if (sortKey === String(c.key)) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                        else { setSortKey(String(c.key)); setSortDir('asc') }
                      }} className="text-xs text-slate-400 dark:text-slate-400">⇅</button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-2 text-sm text-slate-600 dark:text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={(row.id as string) ?? Math.random()} className={`border-t dark:border-slate-700 ${stateKey ? colorByState((row as any)[stateKey]) : ''}`}>
                {columns.map((c) => (
                  <td key={String(c.key)} className="p-2 text-sm text-slate-700 dark:text-slate-200">
                    {String((row as any)[c.key] ?? '-')}
                  </td>
                ))}
                <td className="p-2 text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => onAction?.('view', row)} className="text-blue-600 dark:text-blue-300 hover:underline">Ver</button>
                    <button onClick={() => onAction?.('edit', row)} className="text-amber-600 dark:text-amber-300 hover:underline">Editar</button>
                    <button onClick={() => onAction?.('delete', row)} className="text-red-600 dark:text-red-300 hover:underline">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded">Anterior</button>
          <div>Página {page} / {pages}</div>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} className="px-2 py-1 border rounded">Siguiente</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm">Mostrar</div>
          <select value={pageSizeState} onChange={(e) => { setPage(1); setPageSizeState(Number(e.target.value)) }} className="border rounded p-1 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default SmartTable
