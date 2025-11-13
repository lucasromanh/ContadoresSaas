import React from 'react'

export const SimpleTable: React.FC<{ columns: string[]; data: string[][] }> = ({ columns, data }) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2 text-left border-b">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              {row.map((cell, i) => (
                <td key={i} className="px-4 py-2 border-b">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
