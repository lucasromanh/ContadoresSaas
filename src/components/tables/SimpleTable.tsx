import React from 'react'

export const SimpleTable: React.FC<{ columns: string[]; data: string[][] }> = ({ columns, data }) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2 text-left border-b bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-transparent">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              {row.map((cell, i) => (
                <td key={i} className="px-4 py-2 border-b text-slate-700 dark:text-slate-200">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
